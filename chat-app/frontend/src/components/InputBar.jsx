// useState lets us track what the user is typing
import { useState } from 'react';

function InputBar({ onSend }) {
  // text = current value of input field
  // setText = function to update it
  const [text, setText] = useState('');

  // This runs when user clicks Send
  const handleSend = () => {
    // Don't send empty messages
    if (!text.trim()) return;

    // Call onSend from parent with the message text
    onSend(text);

    // Clear the input after sending
    setText('');
  };

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      padding: '16px',
      background: 'white',
      borderTop: '1px solid #eee'
    }}>
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        // Every keypress updates our text state
        onChange={(e) => setText(e.target.value)}
        // Send message when user presses Enter key
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        style={{
          flex: 1,
          padding: '10px 14px',
          borderRadius: '20px',
          border: '1px solid #ddd',
          fontSize: '14px',
          outline: 'none'
        }}
      />
      <button
        onClick={handleSend}
        style={{
          background: '#534AB7',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          padding: '10px 20px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Send
      </button>
    </div>
  );
}

export default InputBar;