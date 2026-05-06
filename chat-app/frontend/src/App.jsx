import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user was already logged in
    // localStorage keeps data even after browser closes
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      // User was logged in before → auto login
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  const handleLogout = () => {
    // Remove token and user from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#534AB7'
      }}>
        Loading... 💬
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar username={user.username} onLogout={handleLogout} />
      <ChatWindow username={user.username} />
    </div>
  );
}

export default App;