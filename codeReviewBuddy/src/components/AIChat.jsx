import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaCode } from 'react-icons/fa';
import axios from 'axios';

const AIChat = ({ activeFile, onApplyFix }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/ai/chat', {
        message: inputMessage,
        codeContext: activeFile ? {
          code: activeFile.content,
          language: activeFile.language,
          fileName: activeFile.name
        } : null
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.response,
        timestamp: response.data.timestamp
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setLoading(false);
  };

  const reviewCurrentFile = async () => {
    if (!activeFile) return;

    setLoading(true);
    try {
      console.log('Sending review request for:', activeFile.name);
      
      const response = await axios.post('http://localhost:5000/api/ai/review', {
        code: activeFile.content,
        language: activeFile.language,
        fileName: activeFile.name
      });

      const reviewMessage = {
        id: Date.now(),
        type: 'ai',
        content: `**Code Review for ${activeFile.name}:**\n\n${response.data.review}`,
        timestamp: response.data.timestamp
      };

      setMessages(prev => [...prev, reviewMessage]);
    } catch (error) {
      console.error('Review error:', error);
      
      let errorMsg = 'Unknown error occurred';
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        content: `Error reviewing code: ${errorMsg}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-chat">
      <div className="chat-header">
        <FaRobot className="chat-icon" />
        <h3>AI Assistant</h3>
        {activeFile && (
          <button className="review-btn" onClick={reviewCurrentFile} disabled={loading}>
            <FaCode /> Review Code
          </button>
        )}
      </div>

      <div className="chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-icon">
              {message.type === 'user' ? <FaUser /> : <FaRobot />}
            </div>
            <div className="message-content">
              <pre>{message.content}</pre>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message ai loading">
            <div className="message-icon"><FaRobot /></div>
            <div className="message-content">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about your code or request help..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !inputMessage.trim()}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default AIChat;