import { useState, useEffect } from 'react';
import Message from './Message';
import InputBar from './InputBar';
import socket from '../socket';

function ChatWindow({ username }) {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState('');

  useEffect(() => {
    // Load existing messages from backend
    fetch('http://localhost:5000/messages')
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.log('Fetch error:', err));

    // Listen for new messages via Socket.io
    socket.on('receiveMessage', (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    // Listen for typing indicator
    socket.on('typing', (username) => {
      setTyping(username);
      setTimeout(() => setTyping(''), 2000);
    });

    // Cleanup when component unmounts
    return () => {
      socket.off('receiveMessage');
      socket.off('typing');
    };
  }, []);

  // Uses Socket.io NOT fetch anymore
  const handleSend = (text) => {
    socket.emit('sendMessage', {
      username,
      text,
    });
  };

  const handleTyping = () => {
    socket.emit('typing', username);
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        background: '#534AB7',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        # general
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.map((msg, index) => (
          <Message
            key={msg._id || index}
            username={msg.username}
            text={msg.text}
            time={msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString()
              : msg.time}
          />
        ))}

        {/* Typing indicator */}
        {typing && (
          <p style={{
            fontSize: '13px',
            color: '#888',
            fontStyle: 'italic',
            padding: '4px 8px'
          }}>
            {typing} is typing...
          </p>
        )}
      </div>

      {/* Input */}
      <InputBar
        onSend={handleSend}
        onTyping={handleTyping}
      />
    </div>
  );
}

export default ChatWindow;