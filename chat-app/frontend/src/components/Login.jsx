import { useState } from 'react';

function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  // modes: 'login' | 'register' | 'forgot' | 'reset'

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Handle Login ──────────────────────────────────────────────
  const handleLogin = async () => {
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error); setLoading(false); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  // ── Handle Register ───────────────────────────────────────────
  const handleRegister = async () => {
    setError(''); setSuccess('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error); setLoading(false); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  // ── Handle Forgot Password ────────────────────────────────────
  const handleForgotPassword = async () => {
    setError(''); setSuccess('');
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error); setLoading(false); return; }

      // Show success — tell user to check email
      setSuccess('Reset link sent! Check your email inbox.');

    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  // ── Handle Reset Password ─────────────────────────────────────
  const handleResetPassword = async () => {
    setError(''); setSuccess('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: resetToken, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error); setLoading(false); return; }

      setSuccess('Password reset! You can now login with your new password.');
      setTimeout(() => {
        setMode('login');
        setSuccess('');
      }, 2000);

    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#f0f0f0',
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ fontSize: '40px' }}><img src="/logo.png" alt="ChatApp Logo" /></p>
          <h1 style={{ fontSize: '24px', color: '#534AB7' }}>ChatApp</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>
            {mode === 'login'   && 'Welcome back!'}
            {mode === 'register'&& 'Create your account'}
            {mode === 'forgot'  && 'Reset your password'}
            {mode === 'reset'   && 'Enter new password'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fff0f0', color: '#e53e3e',
            padding: '10px 14px', borderRadius: '8px',
            fontSize: '14px', marginBottom: '16px',
            border: '1px solid #fed7d7',
          }}>
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{
            background: '#f0fff4', color: '#38a169',
            padding: '10px 14px', borderRadius: '8px',
            fontSize: '14px', marginBottom: '16px',
            border: '1px solid #c6f6d5',
          }}>
            {success}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <>
            <input type="email" placeholder="Email address"
              value={email} onChange={(e) => setEmail(e.target.value)}
              style={inputStyle} />
            <input type="password" placeholder="Password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={inputStyle} />
            <button onClick={handleLogin} disabled={loading} style={btnPrimary}>
              {loading ? 'Please wait...' : 'Login'}
            </button>
            <div style={{ textAlign: 'center', fontSize: '14px', color: '#888', marginTop: '16px' }}>
              <p>
                Don't have an account?{' '}
                <span onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                  style={linkStyle}>Sign up</span>
              </p>
              <p style={{ marginTop: '8px' }}>
                <span onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                  style={linkStyle}>Forgot password?</span>
              </p>
            </div>
          </>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <>
            <input type="text" placeholder="Username"
              value={username} onChange={(e) => setUsername(e.target.value)}
              style={inputStyle} />
            <input type="email" placeholder="Email address"
              value={email} onChange={(e) => setEmail(e.target.value)}
              style={inputStyle} />
            <input type="password" placeholder="Password (min 6 characters)"
              value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              style={inputStyle} />
            <button onClick={handleRegister} disabled={loading} style={btnPrimary}>
              {loading ? 'Please wait...' : 'Create Account'}
            </button>
            <div style={{ textAlign: 'center', fontSize: '14px', color: '#888', marginTop: '16px' }}>
              <p>Already have an account?{' '}
                <span onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                  style={linkStyle}>Login</span>
              </p>
            </div>
          </>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '16px' }}>
              Enter your email and we'll send you a reset link.
            </p>
            <input type="email" placeholder="Email address"
              value={email} onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
              style={inputStyle} />
            <button onClick={handleForgotPassword} disabled={loading} style={btnPrimary}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            {/* After sending, show option to enter token manually */}
            {success && (
              <button onClick={() => setMode('reset')}
                style={{ ...btnPrimary, background: 'white', color: '#534AB7',
                  border: '1px solid #534AB7', marginTop: '8px' }}>
                I have the reset token →
              </button>
            )}

            <div style={{ textAlign: 'center', fontSize: '14px', color: '#888', marginTop: '16px' }}>
              <span onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                style={linkStyle}>← Back to login</span>
            </div>
          </>
        )}

        {/* RESET PASSWORD FORM */}
        {mode === 'reset' && (
          <>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '16px' }}>
              Enter the token from your email and your new password.
            </p>
            <input type="email" placeholder="Your email address"
              value={email} onChange={(e) => setEmail(e.target.value)}
              style={inputStyle} />
            <input type="text" placeholder="Paste reset token from email"
              value={resetToken} onChange={(e) => setResetToken(e.target.value)}
              style={inputStyle} />
            <input type="password" placeholder="New password (min 6 characters)"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
              style={inputStyle} />
            <button onClick={handleResetPassword} disabled={loading} style={btnPrimary}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <div style={{ textAlign: 'center', fontSize: '14px', color: '#888', marginTop: '16px' }}>
              <span onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                style={linkStyle}>← Back to login</span>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 16px',
  borderRadius: '8px', border: '1px solid #ddd',
  fontSize: '15px', marginBottom: '12px',
  outline: 'none', boxSizing: 'border-box',
};

const btnPrimary = {
  width: '100%', padding: '12px',
  borderRadius: '8px', border: 'none',
  fontSize: '15px', fontWeight: '500',
  cursor: 'pointer', background: '#534AB7',
  color: 'white', marginBottom: '8px',
};

const linkStyle = {
  color: '#534AB7',
  cursor: 'pointer',
  fontWeight: '500',
};

export default Login;