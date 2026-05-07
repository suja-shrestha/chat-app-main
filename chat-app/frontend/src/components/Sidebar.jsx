function Sidebar({ username, photo, onLogout, onSettingsOpen }) {
  return (
    <div style={{
      width: '220px',
      background: '#2D2A55',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      height: '100vh'
    }}>
      {/* App title */}
      <h2 style={{ fontSize: '18px', marginBottom: '24px' }}>
        💬 ChatApp
      </h2>

      {/* Rooms */}
      <p style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>
        ROOMS
      </p>
      <p style={{
        padding: '8px 10px',
        background: '#534AB7',
        borderRadius: '8px',
        marginBottom: '4px',
        fontSize: '14px'
      }}>
        # general
      </p>

      <div style={{ flex: 1 }} />

      {/* Bottom user section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px',
        background: '#1E1B3A',
        borderRadius: '8px',
      }}>

        {/* Avatar — shows photo if exists, initials if not */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#534AB7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '12px',
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          {photo ? (
            <img
              src={photo}
              alt="avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            username.slice(0, 2).toUpperCase()
          )}
        </div>

        <p style={{ fontSize: '13px', flex: 1 }}>{username}</p>

        {/* Settings button */}
        <button
          onClick={onSettingsOpen}
          title="Settings"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#aaa',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0',
          }}
        >
          ⚙️
        </button>

        {/* Logout button */}
        <button
          onClick={onLogout}
          title="Logout"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#aaa',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0',
          }}
        >
          ⏻
        </button>
      </div>
    </div>
  );
}

export default Sidebar;