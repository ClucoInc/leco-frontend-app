import React, { useState, useEffect } from 'react';
import './App.css';
import * as api from './services/api';
import CasesDashboard from './CasesDashboard';
import CreateRequisition from './CreateRequisition';

export default function Auth() {
  const [mode, setMode] = useState('signin'); // signin | signup
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appView, setAppView] = useState('dashboard'); // 'dashboard' | 'create'
  const [currentUser, setCurrentUser] = useState(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [forgotStep, setForgotStep] = useState(0); // 0 = enter email, 1 = reset password

  // Sign in state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign up state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [lawFirm, setLawFirm] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [resetTokenInput, setResetTokenInput] = useState('');

  // Validation functions
  function validateGmailEmail(email) {
    if (!email) return 'Email is required.';
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return 'Email must end with @gmail.com';
    }
    return null;
  }

  function validatePassword(password) {
    if (!password) return 'Password is required.';
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number.';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return 'Password must contain at least one symbol.';
    }
    return null;
  }

  async function handleSignIn(e) {
    e.preventDefault();
    setMessage('');
    if (!email || !password) {
      setMessage('Please enter email and password.');
      return;
    }
    const emailError = validateGmailEmail(email);
    if (emailError) {
      setMessage(emailError);
      return;
    }
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      const token = res && res.token ? res.token : res;
      if (!token) throw new Error('No token returned');
      api.setToken(token);
      const me = await api.getMe();
      setCurrentUser(me);
      setIsAuthenticated(true);
      setMessage('Signed in');
    } catch (err) {
      setMessage(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setMessage('');
    if (!firstName || !lastName || !signupEmail || !signupPassword || !confirmPassword) {
      setMessage('Please fill all fields.');
      return;
    }
    const emailError = validateGmailEmail(signupEmail);
    if (emailError) {
      setMessage(emailError);
      return;
    }
    const passwordError = validatePassword(signupPassword);
    if (passwordError) {
      setMessage(passwordError);
      return;
    }
    if (signupPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    if (!captchaChecked) {
      setMessage('Please verify the CAPTCHA.');
      return;
    }

    setLoading(true);
    try {
      // For demo we send a simple captcha token
      const captchaToken = 'demo';
      const payload = { firstName, lastName, email: signupEmail, password: signupPassword, lawFirm, captchaToken, role: 'attorney' };
      await api.register(payload);

      // Ensure we do NOT keep any token from register until email is verified
      api.setToken(null);

      // Show info and send user to Sign In screen
      setMessage('Account created. Please check your email to verify, then sign in.');
      setMode('signin');

      // clear some fields
      setFirstName('');
      setLastName('');
      setSignupPassword('');
      setConfirmPassword('');
      setCaptchaChecked(false);
    } catch (err) {
      setMessage(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function restore() {
      const token = api.getToken();
      if (!token) return;
      setLoading(true);
      try {
        const me = await api.getMe(token);
        setCurrentUser(me);
        setIsAuthenticated(true);
      } catch (err) {
        api.setToken(null);
      } finally {
        setLoading(false);
      }
    }
    restore();
  }, []);

  // Handle email verification links like /verify-email?token=...
  useEffect(() => {
    const path = window.location.pathname;
    if (path !== '/verify-email') return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) return;

    (async () => {
      setLoading(true);
      setMessage('Verifying your email...');
      try {
        await api.verifyEmail(token);
        setMessage('Email verified successfully. You can now sign in.');
        setMode('signin');
        // Optionally clear the token from the URL (no reload)
        window.history.replaceState({}, document.title, '/');
      } catch (err) {
        setMessage(err.message || 'Email verification failed or link expired.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleSignOut() {
    api.setToken(null);
    // keep mock_user so user can sign up once and sign in again; remove if you prefer
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMode('signin');
    setMessage('Signed out.');
  }

  function renderSignIn() {
    return (
      <div className="auth-card">
        <div className="auth-icon">📄</div>
        <h2 className="auth-title">Sign In</h2>
        <p className="auth-sub">Enter your credentials to access your account</p>
        <form onSubmit={handleSignIn} className="auth-form">
          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@gmail.com"
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=""
          />

          <button className="auth-button primary" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="auth-links">
            <button type="button" className="link-button" onClick={() => { setMode('forgot'); setMessage(''); setForgotStep(0); }}>
              Forgot password?
            </button>
          </div>

          <div className="auth-footer">
            Don't have an account? <button className="link-button" onClick={() => { setMode('signup'); setMessage(''); }}>Sign up</button>
          </div>
        </form>
        {message && <div className="auth-message">{message}</div>}
      </div>
    );
  }

  function renderSignUp() {
    return (
      <div className="auth-card">
        <div className="auth-icon">📄</div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-sub">Sign up to start creating professional demand letters</p>
        <form onSubmit={handleSignUp} className="auth-form">
          <div className="row two">
            <div>
              <label className="auth-label">First Name</label>
              <input className="auth-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="auth-label">Last Name</label>
              <input className="auth-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            type="email"
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
            placeholder="user@gmail.com"
          />

          <label className="auth-label">Law Firm Name</label>
          <input className="auth-input" value={lawFirm} onChange={(e) => setLawFirm(e.target.value)} />

          <label className="auth-label">Password</label>
          <input className="auth-input" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />

          <label className="auth-label">Confirm Password</label>
          <input className="auth-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

          <div className="captcha-row">
            <label className="captcha-check">
              <input type="checkbox" checked={captchaChecked} onChange={(e) => setCaptchaChecked(e.target.checked)} /> I'm not a robot
            </label>
          </div>

          <button className="auth-button primary" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>

          <div className="auth-footer">
            Already have an account? <button className="link-button" onClick={() => { setMode('signin'); setMessage(''); }}>Sign in</button>
          </div>
        </form>
        {message && <div className="auth-message">{message}</div>}
      </div>
    );
  }

    async function handleForgotSubmit(e) {
      e && e.preventDefault();
      setMessage('');
      if (!forgotEmail) {
        setMessage('Please enter your email.');
        return;
      }
      const emailError = validateGmailEmail(forgotEmail);
      if (emailError) {
        setMessage(emailError);
        return;
      }
      setLoading(true);
      try {
        await api.requestReset(forgotEmail);
        setForgotStep(1);
        setMessage('If that email exists, a reset token was sent (check mailbox). Paste token here to continue.');
      } catch (err) {
        setMessage(err.message || 'Request reset failed');
      } finally {
        setLoading(false);
      }
    }

    async function handleResetPassword(e) {
      e && e.preventDefault();
      setMessage('');
      if (!resetTokenInput) {
        setMessage('Please paste the reset token sent to your email.');
        return;
      }
      if (!resetPassword || !resetConfirm) {
        setMessage('Please provide and confirm your new password.');
        return;
      }
      const passwordError = validatePassword(resetPassword);
      if (passwordError) {
        setMessage(passwordError);
        return;
      }
      if (resetPassword !== resetConfirm) {
        setMessage('Passwords do not match.');
        return;
      }
      setLoading(true);
      try {
        await api.resetPassword(resetTokenInput, resetPassword);
        setMessage('Password updated. You may sign in now.');
        setForgotEmail('');
        setResetPassword('');
        setResetConfirm('');
        setResetTokenInput('');
        setForgotStep(0);
        setMode('signin');
      } catch (err) {
        setMessage(err.message || 'Failed updating password.');
      } finally {
        setLoading(false);
      }
    }

    function renderForgot() {
      return (
        <div className="auth-card">
          <div className="auth-icon">🔒</div>
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-sub">Enter your account email to reset your password</p>
          <form onSubmit={forgotStep === 0 ? handleForgotSubmit : handleResetPassword} className="auth-form">
            {forgotStep === 0 ? (
              <>
                <label className="auth-label">Email</label>
                <input className="auth-input" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="user@gmail.com" />
                <button className="auth-button primary" type="submit" disabled={loading}>{loading ? 'Checking...' : 'Send Reset'}</button>
              </>
            ) : (
              <>
                <label className="auth-label">Reset Token</label>
                <input className="auth-input" value={resetTokenInput} onChange={(e) => setResetTokenInput(e.target.value)} placeholder="paste reset token" />
                <label className="auth-label">New Password</label>
                <input className="auth-input" type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} />
                <label className="auth-label">Confirm Password</label>
                <input className="auth-input" type="password" value={resetConfirm} onChange={(e) => setResetConfirm(e.target.value)} />
                <button className="auth-button primary" type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
              </>
            )}

            <div className="auth-footer">
              <button type="button" className="link-button" onClick={() => { setMode('signin'); setMessage(''); }}>Back to Login</button>
            </div>
          </form>
          {message && <div className="auth-message">{message}</div>}
        </div>
      );
    }

  function renderWelcome() {
    // Always show dashboard, and show CreateRequisition as a modal overlay when appView === 'create'
    return (
      <>
        <CasesDashboard onSignOut={handleSignOut} onCreateNew={() => setAppView('create')} />
        {appView === 'create' && (
          <div className="modal-overlay" onClick={() => setAppView('dashboard')}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <CreateRequisition onCancel={() => setAppView('dashboard')} />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="auth-page">
      {isAuthenticated ? renderWelcome() : (mode === 'signin' ? renderSignIn() : mode === 'signup' ? renderSignUp() : renderForgot())}
    </div>
  );
}
