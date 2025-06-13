import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hi! I'm ready to help you understand this page. Ask me anything!", 
      sender: 'bot' 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
  const handleMessage = (event) => {
    if (event.data?.type === 'AUTO_ACTION') {
      if (event.data.action === 'SUMMARIZE') {
        setInputValue("Summarize this document");
      } else if (event.data.action === 'EXTRACT_KEY_POINTS') {
        setInputValue("Extract key points from this document");
      }
    }
  };
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      setTimeout(async () => {
        let botResponse = {
          id: Date.now() + 1,
          text: `I received your message: "${userMessage.text}". This is a placeholder response. Soon I'll analyze the current page content to give you a proper answer!`,
          sender: 'bot'
        };
        const response = await fetch("http://localhost:8000/api/chat/user-query",{
          method: 'POST',
          headers:{
            'Content-Type': 'application/json'
          },
          body : JSON.stringify({
            query : userMessage
          })
        })
        const data = await response.json();
        botResponse.text = data.response;
        setMessages(prev => [...prev, botResponse]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    // Send message to content script to close sidebar
    window.parent.postMessage({ type: 'CLOSE_SIDEBAR' }, '*');
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const clearChat = () => {
    setMessages([
      { 
        id: 1, 
        text: "Chat cleared! Ask me anything about this page.", 
        sender: 'bot' 
      }
    ]);
  };

  return (
    <div className={`chatbot-container ${isMinimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="chatbot-header">
        <div className="header-left">
          <div className="bot-avatar">🤖</div>
          <div className="header-info">
            <h3>AI Page Assistant</h3>
            <span className="status">Ready to help</span>
          </div>
        </div>
        <div className="header-controls">
          <button 
            className="control-btn clear-btn" 
            onClick={clearChat}
            title="Clear chat"
          >
            🗑️
          </button>
          <button 
            className="control-btn minimize-btn" 
            onClick={handleMinimize}
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? '⬆️' : '⬇️'}
          </button>
          <button 
            className="control-btn close-btn" 
            onClick={handleClose}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages Area */}
      {!isMinimized && (
        <>
          <div className="messages-container">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message bot-message">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-container">
            <div className="input-wrapper">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about this page..."
                className="message-input"
                rows="1"
                disabled={isLoading}
              />
              <button 
                onClick={handleSendMessage}
                className="send-button"
                disabled={isLoading || !inputValue.trim()}
              >
                {isLoading ? '⏳' : '📤'}
              </button>
            </div>
            <div className="input-footer">
              <small>Press Enter to send • Shift+Enter for new line</small>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;