import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

export default function Chat({ meetingId, userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef();

  useEffect(() => {
    let isMounted = true;
    // Fetch chat history
    axios.get(`http://localhost:5000/api/meetings/${meetingId}/chat`).then(res => {
      if (isMounted) setMessages(res.data);
    }).catch((err) => {
      // Suppress 404 error on initial chat open
      if (err.response && err.response.status === 404) {
        if (isMounted) setMessages([]);
      } else {
        // Optionally handle other errors (network, 500, etc)
        if (isMounted) setMessages([]);
      }
    });
    // Connect to socket.io
    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('joinMeeting', { meetingId });
    socketRef.current.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      isMounted = false;
      socketRef.current.disconnect();
    };
  }, [meetingId]);

  const sendMessage = () => {
    if (input.trim()) {
      socketRef.current.emit('sendMessage', {
        meetingId,
        senderId: userId,
        message: input
      });
      setInput('');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, maxWidth: 400, margin: '1em auto' }}>
      <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 8 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ margin: '0.5em 0', textAlign: msg.sender_id === userId ? 'right' : 'left' }}>
            <span style={{ fontWeight: msg.sender_id === userId ? 'bold' : 'normal' }}>{msg.message}</span>
            <div style={{ fontSize: 10, color: '#888' }}>{new Date(msg.sent_at).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} style={{ flex: 1 }} onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
