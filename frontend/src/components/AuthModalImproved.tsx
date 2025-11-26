/**
 * Improved AuthModal Component
 * Better UI flow: verify code before showing password field
 * Connected to backend API
 */

import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { getFirebaseAuth } from '../config/firebase';

const API_URL = 'http://localhost:3001/api';

type AuthMode = 'login' | 'signup' | null;

type AuthModalProps = {
  mode: AuthMode;
  onClose: () => void;
  onSuccess: (isNewUser?: boolean) => void;
};

type DeChicoWordmarkProps = {
  className?: string;
};

const DeChicoWordmark = ({ className = '' }: DeChicoWordmarkProps) => (
  <span className={`dechico-wordmark whitespace-nowrap ${className}`.trim()}>
    <span>De</span>
    <span>Chico</span>
  </span>
);

export const AuthModal = ({ mode, onClose, onSuccess }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Step tracking for signup
  const [signupStep, setSignupStep] = useState<'email' | 'verify' | 'password'>('email');
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);

  if (!mode) return null;
  const isSignup = mode === 'signup';
  
  // Debug: Log current signup step
  console.log('🔄 Current signup step:', signupStep, '| Mode:', mode);

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('Enter your Chico State email first.');
      return;
    }

    if (!email.toLowerCase().endsWith('@csuchico.edu')) {
      setError('Only @csuchico.edu email addresses are allowed.');
      return;
    }

    if (isSignup && !name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/send-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setCodeSent(true);
      setSignupStep('verify');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔍 Verifying code for email:', email);
      const response = await fetch(`${API_URL}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      console.log('✅ Code verified! Moving to password step...');
      setCodeVerified(true);
      setSignupStep('password');
      console.log('📍 Signup step set to: password');
      setError('');
    } catch (err: any) {
      console.error('❌ Verification error:', err);
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create Firebase Auth account
      const auth = getFirebaseAuth();
      await createUserWithEmailAndPassword(auth, email, password);

      // Call onSuccess with true to indicate this is a new user (signup)
      onSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please login instead.');
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);

      // Call onSuccess with false to indicate this is login (not signup)
      onSuccess(false);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur">
      <div className="w-full max-w-md rounded-3xl bg-white border border-dchico-border p-6 shadow-2xl text-dchico-text">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              {isSignup ? (
                <>
                  Join <DeChicoWordmark className="text-lg" />
                </>
              ) : (
                'Welcome back'
              )}
            </h2>
            <p className="text-xs text-dchico-muted mt-1">
              Use your <span className="font-mono">@csuchico.edu</span> email. Exclusive Chico State only.
            </p>
          </div>
          <button onClick={onClose} className="text-xl text-dchico-muted hover:text-dchico-accent">
            ×
          </button>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {isSignup ? (
          // SIGNUP FLOW
          <form onSubmit={handleSignup} className="space-y-3 text-sm">
            {/* Step 1: Email & Name */}
            {signupStep === 'email' && (
              <>
                <div>
                  <label className="text-xs text-dchico-muted block mb-1">Name</label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    className="w-full rounded-xl bg-white border border-dchico-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dchico-accent/60"
                    placeholder="Sterling Jinwoo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs text-dchico-muted block mb-1">
                    Chico State email (@csuchico.edu)
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full rounded-xl bg-white border border-dchico-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dchico-accent/60"
                    placeholder="you@csuchico.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isLoading}
                  className="w-full mt-2 rounded-xl bg-gradient-to-r from-dchico-accent to-dchico-accent-secondary py-2 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition disabled:opacity-50"
                >
                  {isLoading ? 'Sending code...' : 'Send verification code'}
                </button>
              </>
            )}

            {/* Step 2: Verify Code */}
            {signupStep === 'verify' && (
              <>
                <div className="text-xs text-dchico-muted mb-3">
                  We sent a 6-digit code to <strong>{email}</strong>
                </div>

                <div>
                  <label className="text-xs text-dchico-muted block mb-1">Verification code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    className="w-full rounded-xl bg-white border border-dchico-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dchico-accent/60 tracking-[0.3em] text-center text-lg"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep('email')}
                    className="flex-1 rounded-xl border border-dchico-border px-3 py-2 text-xs hover:border-dchico-accent transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="flex-1 rounded-xl bg-gradient-to-r from-dchico-accent to-dchico-accent-secondary py-2 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Verify code'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSendCode}
                  className="w-full text-xs text-dchico-accent hover:underline"
                >
                  Resend code
                </button>
              </>
            )}

            {/* Step 3: Password */}
            {signupStep === 'password' && (
              <>
                <div className="text-xs text-green-600 mb-3 p-2 bg-green-50 rounded-lg">
                  ✓ Email verified! Now set your password.
                </div>

                <div>
                  <label className="text-xs text-dchico-muted block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-xl bg-white border border-dchico-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dchico-accent/60"
                    placeholder="Create a password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-xs text-dchico-muted mt-1">
                    {password.length > 0 && password.length < 6 
                      ? `${6 - password.length} more characters needed` 
                      : 'At least 6 characters'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 rounded-xl bg-gradient-to-r from-dchico-accent to-dchico-accent-secondary py-2 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition disabled:opacity-50"
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>
              </>
            )}
          </form>
        ) : (
          // LOGIN FLOW
          <form onSubmit={handleLogin} className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-dchico-muted block mb-1">
                Chico State email (@csuchico.edu)
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-xl bg-white border border-dchico-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dchico-accent/60"
                placeholder="you@csuchico.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-dchico-muted block mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                className="w-full rounded-xl bg-white border border-dchico-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dchico-accent/60"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 rounded-xl bg-gradient-to-r from-dchico-accent to-dchico-accent-secondary py-2 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        )}

        <p className="mt-3 text-[11px] text-dchico-muted">
          By continuing you confirm you&apos;re a current Chico State student and agree to the{' '}
          <a
            href="/tersofuse.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dchico-accent underline hover:text-dchico-accent-secondary"
          >
            Terms of Use
          </a>
          .
        </p>
      </div>
    </div>
  );
};
