import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ChatInterface.css";
import profileImage from './1234.jpeg';

const ChatInterface = ({ chatbotId }) => {
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [botProfileImage, setBotProfileImage] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;
  
  
  useEffect(() => {
    const fetchBotProfileImage = async () => {
      try {
        const response = await axios.get(`${API_URL}/persona/${chatbotId}/image`);
        if (response.data && response.data.image_base64) {
          const base64Image = response.data.image_base64;
          setBotProfileImage(`data:image/png;base64,${base64Image}`);
        } else {
          console.error("No valid image data found in API response.");
        }
      } catch (error) {
        console.error("Error fetching bot profile image:", error);
      }
    };
    
    fetchBotProfileImage();
  }, [chatbotId]);
  
  const handleSendMessage = async () => {
    if (userMessage.trim() !== "") {
      let dots = "...";
      setChatHistory([
        ...chatHistory,
        { role: "user", content: userMessage },
        { role: "assistant", content: "Typing " + dots },
      ]);
      setUserMessage(""); 
      
      let intervalId;
      const updateDots = () => {
        dots = dots.length < 3 ? dots + "." : "";
        setChatHistory((prevHistory) =>
          prevHistory.map((msg, index) =>
            index === prevHistory.length - 1 ? { ...msg, content: "Typing " + dots } : msg
      )
    );
  };
  
  intervalId = setInterval(updateDots, 300); 
  
  try {
    const payload = {
      id: chatbotId,
      chat_history: chatHistory,
      prompt: userMessage,
      nsfw: false,
      length: 40
    };
    const response = await axios.post(
      `${API_URL}/chat/`,
      payload
    );
    
    clearInterval(intervalId); 
    setChatHistory((prevHistory) =>
      prevHistory.map((msg, index) =>
        index === prevHistory.length - 1 ? { ...msg, content: response.data } : msg
  )
);
} catch (error) {
  console.error(error);
  clearInterval(intervalId);
}
}
};

const handleKeyPress = (event) => {
  if (event.key === "Enter") {
    handleSendMessage();
  }
};

return (
  <div className="chat-container">
  <div className="chat-history">
  {chatHistory.map((message, index) => (
    <div key={index} className={`message-row ${message.role === "user" ? "user-row" : "bot-row"}`}>
    {message.role === "assistant" && (
      <img 
      src={botProfileImage || profileImage}
      alt="Bot profile" 
      className="profile-image left" 
      />
    )}
    <div className={`message ${message.role === "user" ? "user-message" : "bot-message"}`}>
    <div className="message-content">{message.content}</div>
    </div>
    {message.role === "user" && (
      <img src={profileImage} alt="User profile" className="profile-image right" />
    )}
    </div>
  ))}
  </div>
  <div className="chat-input">
  <input
  type="text"
  value={userMessage}
  onChange={(e) => setUserMessage(e.target.value)}
  onKeyDown={handleKeyPress} 
  placeholder="Type a message..."
  />
  <button onClick={handleSendMessage}>Send</button>
  </div>
  </div>
);
};

export default ChatInterface;
