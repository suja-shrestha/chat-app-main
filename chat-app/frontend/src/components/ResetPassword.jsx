import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function ResetPassword() {
  // useSearchParams reads the URL query params
  // URL: /reset-password?token=abc123&email=user@gmail.com
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get token and email directly from the URL
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setSuccess('Password reset successfully! Redirecting to login...');

      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/'), 2000);

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
          <p style={{ fontSize: '40px' }}></p>
          <h1 style={{ fontSize: '24px', color: '#534AB7' }}>Reset Password</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>Enter your new password</p>
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

        {/* Show form only if token exists */}
        {!token || !email ? (
          <div style={{ textAlign: 'center', color: '#e53e3e' }}>
            <p>Invalid reset link.</p>
            <span
              onClick={() => navigate('/')}
              style={{ color: '#534AB7', cursor: 'pointer' }}
            >
              Go back to login
            </span>
          </div>
        ) : (
          <>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReset()}
              style={inputStyle}
            />
            <button
              onClick={handleReset}
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                borderRadius: '8px', border: 'none',
                fontSize: '15px', fontWeight: '500',
                cursor: 'pointer', background: '#534AB7',
                color: 'white', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
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

export default ResetPassword;