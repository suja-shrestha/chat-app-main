function Sidebar({ username }) {
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

      {/* Rooms section */}
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

      {/* Spacer pushes username to bottom */}
      <div style={{ flex: 1 }} />

      {/* Logged in user at bottom */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px',
        background: '#1E1B3A',
        borderRadius: '8px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#534AB7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '12px'
        }}>
          {/* Show first 2 letters of username as avatar */}
          {username.slice(0, 2).toUpperCase()}
        </div>
        <p style={{ fontSize: '13px' }}>{username}</p>
      </div>
    </div>
  );
}

export default Sidebar;