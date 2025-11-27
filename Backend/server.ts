/**
 * Express API Server
 * Connects frontend to backend authentication services
 */

import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'config', '.env') });

// Import controllers
import * as AuthController from './auth/authController';
import * as SignupController from './auth/signupController';
import * as LoginController from './auth/loginController';
import { EmailVerification } from './auth/emailVerification';
import { GlobalChatService } from './chat/globalChatService';
import { UserService } from './user/userService';
import { RankPollService } from './ranking/rankPollService';
import { adminAuth } from './config/firebaseAdmin';

const app = express();
const PORT = process.env.PORT || 3001;

type AuthedRequest = Request & {
  user?: {
    uid: string;
    email: string;
  };
};

const authenticateRequest = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const uid =
    (req.headers['x-user-id'] as string | undefined) ||
    (typeof req.body?.userId === 'string' ? req.body.userId : undefined);
  const emailHeader =
    (req.headers['x-user-email'] as string | undefined) ||
    (typeof req.body?.userEmail === 'string' ? req.body.userEmail : undefined) ||
    (typeof req.body?.email === 'string' ? req.body.email : undefined);

  if (!uid || !emailHeader) {
    return res.status(401).json({
      error:
        'Authentication required. Include x-user-id and x-user-email headers (temporary until Firebase ID tokens are wired).',
    });
  }

  req.user = {
    uid,
    email: emailHeader.toLowerCase(),
  };

  return next();
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Seed default ranking polls
RankPollService.ensureDefaultPolls().catch((error) => {
  console.error('Failed to ensure rank polls:', error);
});
// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'DeChico API is running' });
});

// Auth endpoints
app.post('/api/auth/check-email', async (req: Request, res: Response) => {
  try {
    const { email } = req.body ?? {};

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await AuthController.initiateAuth(email);
    return res.json(result);
  } catch (error: any) {
    console.error('auth check error', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/auth/send-verification-code', async (req: Request, res: Response) => {
  try {
    const { email } = req.body ?? {};

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!EmailVerification.validateCsuChicoEmail(email)) {
      return res
        .status(400)
        .json({ error: 'Only @csuchico.edu email addresses are allowed' });
    }

    await SignupController.sendVerificationCode(email);

    return res.json({
      success: true,
      message: 'Verification code sent to your email',
    });
  } catch (error: any) {
    console.error('send verification error', error);
    return res
      .status(500)
      .json({ error: error.message || 'Failed to send verification code' });
  }
});

app.post('/api/auth/verify-code', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body ?? {};

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    const verifyResult = await SignupController.verifyEmailCode(email, code);

    if (!verifyResult.verified) {
      return res.status(400).json({ error: verifyResult.message });
    }

    return res.json({ success: true, message: 'Code verified successfully' });
  } catch (error: any) {
    console.error('verify code error', error);
    return res.status(500).json({ error: error.message || 'Verification failed' });
  }
});

app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, verificationCode } = req.body ?? {};

    if (!email || !password || !verificationCode) {
      return res
        .status(400)
        .json({ error: 'email, password, and verificationCode are required' });
    }

    const signupResult = await SignupController.completeSignup(
      email,
      verificationCode,
      password,
    );

    if (!signupResult.success || !signupResult.user) {
      return res.status(400).json({ error: signupResult.message });
    }

    return res.json({
      success: true,
      message: signupResult.message,
      user: signupResult.user,
    });
  } catch (error: any) {
    console.error('signup error', error);
    return res.status(500).json({ error: error.message || 'Failed to create account' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await LoginController.loginUser(email, password);

    if (!result.success || !result.user) {
      return res.status(400).json({ error: result.message });
    }

    return res.json({
      success: true,
      message: result.message,
      user: result.user,
    });
  } catch (error: any) {
    console.error('login error', error);
    return res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Profile endpoints
app.get('/api/profile/me', authenticateRequest, async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const profile = await UserService.getUserProfile(req.user.uid);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.json({ profile });
  } catch (error: any) {
    console.error('get profile error', error);
    return res.status(500).json({ error: error.message || 'Failed to load profile' });
  }
});

app.patch(
  '/api/profile/me',
  authenticateRequest,
  async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const allowedFields = [
        'firstName',
        'lastName',
        'alias',
        'bio',
        'age',
        'ethnicity',
        'interests',
        'gender',
        'genderPreference',
        'avatarUrl',
        'photos',
        'profileComplete',
      ];
      const updates: Record<string, unknown> = {};

      Object.entries(req.body ?? {}).forEach(([key, value]) => {
        if (allowedFields.includes(key)) {
          updates[key] = value;
        }
      });

      if (!Object.keys(updates).length) {
        return res.status(400).json({ error: 'No valid updates provided' });
      }

      await UserService.updateUserProfile(req.user.uid, updates);
      const profile = await UserService.getUserProfile(req.user.uid);

      return res.json({
        success: true,
        profile,
      });
    } catch (error: any) {
      console.error('update profile error', error);
      return res
        .status(500)
        .json({ error: error.message || 'Failed to update profile' });
    }
  },
);

app.post(
  '/api/profile/me/photos',
  authenticateRequest,
  async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { photos } = req.body ?? {};

      if (!Array.isArray(photos) || photos.length === 0) {
        return res.status(400).json({ error: 'photos must be a non-empty array' });
      }

      const cleanedPhotos = photos
        .filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
        .map((url) => url.trim());

      if (!cleanedPhotos.length) {
        return res.status(400).json({ error: 'Photo URLs must be non-empty strings' });
      }

      const profile = await UserService.appendPhotos(req.user.uid, cleanedPhotos);

      return res.json({
        success: true,
        profile,
      });
    } catch (error: any) {
      console.error('append photos error', error);
      return res
        .status(500)
        .json({ error: error.message || 'Failed to append photos' });
    }
  },
);

// Chat endpoints (polling-friendly REST)
app.post(
  '/api/chat/send',
  authenticateRequest,
  async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { alias, message } = req.body ?? {};

      if (!alias || !message) {
        return res.status(400).json({ error: 'alias and message are required' });
      }

      const result = await GlobalChatService.sendGlobalMessage(
        req.user.uid,
        req.user.email,
        alias,
        message,
      );

      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      return res.json(result);
    } catch (error: any) {
      console.error('send chat error', error);
      return res.status(500).json({ error: error.message || 'Failed to send message' });
    }
  },
);

app.get('/api/chat/messages', async (_req: Request, res: Response) => {
  try {
    const result = await GlobalChatService.getRecentMessages();

    if (!result.success) {
      return res.status(500).json({ error: result.error || 'Failed to get messages' });
    }

    return res.json({ messages: result.messages });
  } catch (error: any) {
    console.error('get chat error', error);
    return res.status(500).json({ error: error.message || 'Failed to get messages' });
  }
});

// Ranking routes
app.get('/api/rank/polls', async (_req: Request, res: Response) => {
  try {
    const polls = await RankPollService.getAllRankPolls();
    const withPercentages = polls.map((poll) => {
      const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
      const options = poll.options.map((option) => {
        const percentage =
          totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
        return { ...option, percentage };
      });

      return { ...poll, options };
    });

    return res.json({ polls: withPercentages });
  } catch (error) {
    console.error('get rank polls error', error);
    return res.status(500).json({ error: 'Failed to load polls' });
  }
});

app.post('/api/rank/vote', authenticateRequest, async (req: AuthedRequest, res: Response) => {
  try {
    const { pollId, optionId } = req.body ?? {};
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!pollId || !optionId) {
      return res.status(400).json({ error: 'pollId and optionId are required' });
    }

    const poll = await RankPollService.voteOnPoll(pollId, optionId, req.user.uid);

    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
    const options = poll.options.map((option) => {
      const percentage =
        totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
      return { ...option, percentage };
    });

    return res.json({ poll: { ...poll, options } });
  } catch (error) {
    console.error('vote rank poll error', error);
    if (error instanceof Error && error.message === 'already_voted') {
      return res.status(400).json({ error: 'You already voted on this poll.' });
    }
    return res.status(500).json({ error: 'Failed to record vote' });
  }
});

app.delete('/api/profile/me', authenticateRequest, async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await UserService.deleteUserAccount(req.user.uid);

    try {
      await adminAuth.deleteUser(req.user.uid);
    } catch (error: any) {
      if (error?.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    return res.json({ success: true });
  } catch (error: any) {
    console.error('delete profile error', error);
    return res.status(500).json({ error: error.message || 'Failed to delete account' });
  }
});

// TODO: Dating & ranking features – coming in a later milestone.
// The previous swipe/match endpoints have been intentionally disabled to keep launch scope tight.

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DeChico API server running on http://localhost:${PORT}`);
  console.log(
    `📧 Email service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`,
  );
});

export default app;
