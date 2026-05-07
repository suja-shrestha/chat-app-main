import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Login from './components/Login';
import Settings from './components/Settings';
import ResetPassword from './components/ResetPassword';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Controls whether settings panel is open
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Called when user saves settings
  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', height: '100vh',
        fontSize: '18px', color: '#534AB7'
      }}>
        Loading... 
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={
          user ? (
            <div style={{ display: 'flex' }}>
              <Sidebar
                username={user.username}
                photo={user.photo}
                onLogout={handleLogout}
                onSettingsOpen={() => setShowSettings(true)}
              />
              <ChatWindow username={user.username} />
            </div>
          ) : (
            <Login onLogin={setUser} />
          )
        } />
      </Routes>

      {/* Settings panel — shown on top of everything */}
      {showSettings && user && (
        <Settings
          user={user}
          onClose={() => setShowSettings(false)}
          onUpdate={handleUserUpdate}
        />
      )}
    </>
  );
}

export default App;