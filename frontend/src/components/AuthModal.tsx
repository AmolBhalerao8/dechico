/**
 * AuthModal Component
 * Handles login and signup with real Firebase authentication
 */

import { useState } from 'react';
import {
  validateCsuChicoEmail,
  sendVerificationCode,
  verifyCode,
  createAccount,
  loginUser,
} from '../services/authService';

type AuthMode = 'login' | 'signup' | null;

type AuthModalProps = {
  mode: AuthMode;
  onClose: () => void;
  onSuccess: () => void;
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
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeStatus, setCodeStatus] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!mode) return null;
  const isSignup = mode === 'signup';

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('Enter your Chico State email first.');
      return;
    }

    if (!validateCsuChicoEmail(email)) {
      setError('Only @csuchico.edu email addresses are allowed.');
      return;
    }

    setIsSendingCode(true);
    setError('');

    try {
      const code = await sendVerificationCode(email);
      setGeneratedCode(code);
      setCodeStatus(`Code sent to ${email}. Check your inbox! (Demo: ${code})`);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isSignup) {
        // Signup flow
        if (!name.trim()) {
          throw new Error('Please enter your name');
        }

        if (!generatedCode) {
          throw new Error('Send the verification code to your email first.');
        }

        // Verify code
        const isValid = await verifyCode(email, verificationCodeInput.trim());
        if (!isValid) {
          throw new Error('Verification code is incorrect.');
        }

        // Create account
        await createAccount(email, password, name);
        
        // Success!
        onSuccess();
        resetForm();
      } else {
        // Login flow
        await loginUser(email, password);
        
        // Success!
        onSuccess();
        resetForm();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setVerificationCodeInput('');
    setGeneratedCode(null);
    setCodeStatus('');
    setError('');
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

        <form className="space-y-3 text-sm" onSubmit={handleSubmit}>
          {isSignup && (
            <div>
              <label className="text-xs text-dchico-muted block mb-1">Name</label>
              <input
                className="w-full rounded-xl bg-white border border-dchico-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dchico-accent/60"
                placeholder="Sterling Jinwoo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="text-xs text-dchico-muted block mb-1">
              Chico State email (@csuchico.edu)
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                className="flex-1 rounded-xl bg-white border border-dchico-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dchico-accent/60"
                placeholder="you@csuchico.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {isSignup && (
                <button
                  type="button"
                  onClick={handleSendCode}
                  className="rounded-xl border border-dchico-border px-3 py-2 text-xs font-semibold hover:border-dchico-accent transition disabled:opacity-50"
                  disabled={isSendingCode}
                >
                  {isSendingCode ? 'Sending...' : generatedCode ? 'Resend code' : 'Send code'}
                </button>
              )}
            </div>
            {isSignup && (
              <p className="text-[11px] text-dchico-muted mt-1">
                {codeStatus || "We'll email you a 6-digit code to verify you're a Wildcat."}
              </p>
            )}
          </div>

          {isSignup && (
            <div>
              <label className="text-xs text-dchico-muted block mb-1">Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                className="w-full rounded-xl bg-white border border-dchico-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dchico-accent/60 tracking-[0.3em] text-center"
                placeholder="123456"
                value={verificationCodeInput}
                onChange={(e) => setVerificationCodeInput(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          )}

          <div>
            <label className="text-xs text-dchico-muted block mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full rounded-xl bg-white border border-dchico-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dchico-accent/60"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 rounded-xl bg-gradient-to-r from-dchico-accent to-dchico-accent-secondary py-2 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}
          </button>
        </form>

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
