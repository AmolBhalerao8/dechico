/**
 * Express API Server
 * Connects frontend to backend authentication services
 */

import express, { Request, Response } from 'express';
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

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'DeChico API is running' });
});

// Auth endpoints
app.post('/api/auth/check-email', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await AuthController.initiateAuth(email);
    res.json(result);
  } catch (error: any) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/auth/send-verification-code', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate CSU Chico email
    if (!EmailVerification.validateCsuChicoEmail(email)) {
      return res.status(400).json({ 
        error: 'Only @csuchico.edu email addresses are allowed' 
      });
    }

    // Send verification code
    const result = await SignupController.sendVerificationCode(email);
    
    res.json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (error: any) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ error: error.message || 'Failed to send verification code' });
  }
});

app.post('/api/auth/verify-code', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    const result = await SignupController.verifyEmailCode(email, code);
    
    if (result.verified) {
      res.json({ success: true, message: 'Code verified successfully' });
    } else {
      res.status(400).json({ error: 'Invalid or expired verification code' });
    }
  } catch (error: any) {
    console.error('Error verifying code:', error);
    res.status(500).json({ error: error.message || 'Verification failed' });
  }
});

app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const result = await SignupController.completeSignup(email, '', password);
    
    res.json({
      success: true,
      message: 'Account created successfully',
      user: result.user ? {
        uid: result.user.uid,
        email: result.user.email
      } : undefined
    });
  } catch (error: any) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: error.message || 'Failed to create account' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await LoginController.loginUser(email, password);
    
    res.json({
      success: true,
      message: 'Login successful',
      user: result.user ? {
        uid: result.user.uid,
        email: result.user.email,
        profileComplete: result.user.profileComplete
      } : undefined
    });
  } catch (error: any) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Chat endpoints
app.post('/api/chat/send', async (req: Request, res: Response) => {
  try {
    const { userId, email, alias, message } = req.body;
    
    if (!userId || !email || !alias || !message) {
      return res.status(400).json({ error: 'User ID, email, alias, and message are required' });
    }

    const result = await GlobalChatService.sendGlobalMessage(userId, email, alias, message);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error: any) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ error: error.message || 'Failed to send message' });
  }
});

app.get('/api/chat/messages', async (req: Request, res: Response) => {
  try {
    const result = await GlobalChatService.getRecentMessages();
    
    if (result.success) {
      res.json({ messages: result.messages });
    } else {
      res.status(500).json({ error: result.error || 'Failed to get messages' });
    }
  } catch (error: any) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({ error: error.message || 'Failed to get messages' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DeChico API server running on http://localhost:${PORT}`);
  console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
});

export default app;
