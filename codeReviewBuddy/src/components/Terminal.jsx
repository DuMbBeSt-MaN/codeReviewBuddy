import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const Terminal = () => {
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const outputRef = useRef(null);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('create-terminal');
    });

    socket.on('terminal-output', (data) => {
      setOutput(prev => prev + data);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('terminal-input', input);
        setInput('');
      }
    }
  };

  const clearTerminal = () => {
    setOutput('');
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <span>Terminal</span>
        <div className="terminal-controls">
          <button onClick={clearTerminal} className="clear-btn">Clear</button>
          <span className={`status ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? '●' : '○'}
          </span>
        </div>
      </div>
      <div className="terminal-output" ref={outputRef}>
        <pre>{output}</pre>
      </div>
      <div className="terminal-input-container">
        <span className="prompt">$ </span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="terminal-input"
          placeholder="Type command and press Enter..."
          disabled={!connected}
        />
      </div>
    </div>
  );
};

export default Terminal;