import { useState, useRef } from 'react';

function Settings({ user, onClose, onUpdate }) {
  const [tab, setTab] = useState('profile');
  const [username, setUsername] = useState(user.username);
  const [photoUrl, setPhotoUrl] = useState(user.photo || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user.photo || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // ref points directly to the hidden file input element
  const fileInputRef = useRef(null);

  // ── When user picks a photo from gallery ──────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size — max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo too large. Maximum size is 5MB');
      return;
    }

    // Save file for uploading later
    setSelectedFile(file);

    // Show instant preview using local URL
    // This shows the image immediately without uploading yet
    // Exactly like how Instagram shows preview before posting
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setError('');
  };

  // ── Save Profile ──────────────────────────────────────────────
  const handleUpdateProfile = async () => {
    setError(''); setSuccess('');
    if (!username.trim()) { setError('Username cannot be empty'); return; }
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      let finalPhotoUrl = photoUrl;

      // If user picked a file from gallery — upload it first
      if (selectedFile) {
        // FormData is how you send files to a server
        // Like packing a box before shipping
        const formData = new FormData();

        // 'photo' is the field name — must match upload.single('photo') in backend
        formData.append('photo', selectedFile);

        const uploadRes = await fetch('http://localhost:5000/auth/upload-photo', {
          method: 'POST',
          headers: {
            // DO NOT set Content-Type here for FormData
            // Browser sets it automatically
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) { setError(uploadData.error); setLoading(false); return; }

        // Get permanent Cloudinary URL
        finalPhotoUrl = uploadData.photoUrl;
      }

      // Update username and photo URL in MongoDB
      const response = await fetch('http://localhost:5000/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username, photo: finalPhotoUrl }),
      });

      const data = await response.json();
      if (!response.ok) { setError(data.error); setLoading(false); return; }

      // Update localStorage and App state
      const updatedUser = { ...user, username, photo: finalPhotoUrl };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onUpdate(updatedUser);
      setSuccess('Profile updated! ✅');
      setSelectedFile(null);

    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  // ── Change Password ───────────────────────────────────────────
  const handleChangePassword = async () => {
    setError(''); setSuccess('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required'); return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match'); return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    if (currentPassword === newPassword) {
      setError('New password must be different'); return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error); setLoading(false); return; }
      setSuccess('Password changed! ✅');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setError('Something went wrong.');
    }
    setLoading(false);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: '16px',
          width: '100%', maxWidth: '460px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px', background: '#534AB7',
          color: 'white', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '500' }}>⚙️ Settings</h2>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none',
            color: 'white', fontSize: '20px', cursor: 'pointer',
          }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
          {['profile', 'password'].map((t) => (
            <button key={t}
              onClick={() => { setTab(t); setError(''); setSuccess(''); }}
              style={{
                flex: 1, padding: '14px', border: 'none',
                background: 'transparent', fontSize: '14px',
                fontWeight: '500', cursor: 'pointer',
                color: tab === t ? '#534AB7' : '#888',
                borderBottom: tab === t ? '2px solid #534AB7' : '2px solid transparent',
              }}
            >
              {t === 'profile' ? 'Profile' : 'Password'}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px' }}>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fff0f0', color: '#e53e3e',
              padding: '10px 14px', borderRadius: '8px',
              fontSize: '14px', marginBottom: '16px',
              border: '1px solid #fed7d7',
            }}>{error}</div>
          )}

          {/* Success */}
          {success && (
            <div style={{
              background: '#f0fff4', color: '#38a169',
              padding: '10px 14px', borderRadius: '8px',
              fontSize: '14px', marginBottom: '16px',
              border: '1px solid #c6f6d5',
            }}>{success}</div>
          )}

          {/* ── PROFILE TAB ── */}
          {tab === 'profile' && (
            <>
              {/* Avatar preview + upload button */}
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', marginBottom: '24px',
              }}>
                {/* Avatar circle */}
                <div style={{
                  width: '90px', height: '90px',
                  borderRadius: '50%', background: '#534AB7',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '32px',
                  fontWeight: 'bold', color: 'white',
                  overflow: 'hidden', marginBottom: '12px',
                  border: '3px solid #eee',
                }}>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    username.slice(0, 2).toUpperCase()
                  )}
                </div>

                {/* Hidden file input — opens gallery on click */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                {/* This button opens the gallery */}
                <button
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    border: '1px solid #534AB7',
                    background: 'white',
                    color: '#534AB7',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  📷 Choose from Gallery
                </button>

                {/* Show selected file name */}
                {selectedFile && (
                  <p style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              {/* OR divider */}
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: '10px', marginBottom: '16px',
              }}>
                <div style={{ flex: 1, height: '1px', background: '#eee' }} />
                <p style={{ color: '#aaa', fontSize: '12px' }}>or paste image URL</p>
                <div style={{ flex: 1, height: '1px', background: '#eee' }} />
              </div>

              {/* Photo URL input */}
              <label style={labelStyle}>Photo URL</label>
              <input
                type="text"
                placeholder="https://example.com/photo.jpg"
                value={photoUrl}
                onChange={(e) => {
                  setPhotoUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                  setSelectedFile(null); // clear file if URL typed
                }}
                style={inputStyle}
              />

              {/* Username */}
              <label style={labelStyle}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
              />

              {/* Email (read only) */}
              <div style={{
                background: '#f8f8f8', borderRadius: '8px',
                padding: '12px 16px', marginBottom: '16px',
              }}>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                  Email (cannot be changed)
                </p>
                <p style={{ fontSize: '14px', color: '#333' }}>{user.email}</p>
              </div>

              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                style={btnPrimary}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}

          {/* ── PASSWORD TAB ── */}
          {tab === 'password' && (
            <>
              <label style={labelStyle}>Current Password</label>
              <input type="password" placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={inputStyle} />

              <label style={labelStyle}>New Password</label>
              <input type="password" placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle} />

              <label style={labelStyle}>Confirm New Password</label>
              <input type="password" placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
                style={inputStyle} />

              <button
                onClick={handleChangePassword}
                disabled={loading}
                style={btnPrimary}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 14px',
  borderRadius: '8px', border: '1px solid #ddd',
  fontSize: '14px', marginBottom: '16px',
  outline: 'none', boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block', fontSize: '13px',
  fontWeight: '500', color: '#555', marginBottom: '6px',
};

const btnPrimary = {
  width: '100%', padding: '12px',
  borderRadius: '8px', border: 'none',
  fontSize: '15px', fontWeight: '500',
  cursor: 'pointer', background: '#534AB7',
  color: 'white',
};

export default Settings;