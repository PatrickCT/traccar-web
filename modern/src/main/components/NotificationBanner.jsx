import React, { useEffect, useState } from 'react';
import './NotificationsBanner.css';

const NotificationsBanner = () => {
  const [messages, setMessages] = useState([]);

  // functions
  useEffect(() => {
    setMessages(['Every new beginning comes from some other beginning s end.', 'Even the genius asks questions.']);
    setInterval(() => setMessages((messages) => messages.slice(1)), 5000);
  }, []);

  return (
    <div>
      {messages.length > 0 && (
        <div className="main slide-left">
          <p>{messages[0]}</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsBanner;
