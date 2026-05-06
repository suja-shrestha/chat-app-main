function Message({ username, text, time }) {
  return (
    <div style={{
      background: 'white',
      padding: '10px 14px',
      borderRadius: '12px',
      marginBottom: '10px',
      maxWidth: '70%',
    }}>
      <p style={{
        fontWeight: 'bold',
        fontSize: '13px',
        color: '#534AB7'
      }}>
        {username}
      </p>
      <p style={{
        fontSize: '15px',
        margin: '4px 0'
      }}>
        {text}
      </p>
      <p style={{
        fontSize: '11px',
        color: '#888'
      }}>
        {time}
      </p>
    </div>
  );
}

export default Message;