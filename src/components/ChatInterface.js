import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ChatInterface.css";
import profileImage from './1234.jpeg'; // Placeholder for user

const ChatInterface = () => {
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [botProfileImage, setBotProfileImage] = useState(null);


  useEffect(() => {
    const fetchBotProfileImage = async () => {
      try {
        const personaId = 20240502212745; // Replace with your actual persona ID
        const response = await axios.get(`https://api-llm-q3p.site/api/v1/persona/${personaId}/image`);

        // Ensure the response has base64 image data
        if (response.data && response.data.image_base64) {
          const base64Image = response.data.image_base64;
          setBotProfileImage(`data:image/png;base64,${base64Image}`); // Create a data URL
        } else {
          console.error("No valid image data found in API response.");
          // Handle the error (e.g., show a default image)
        }
      } catch (error) {
        console.error("Error fetching bot profile image:", error);
        // Handle the error
      }
    };

    fetchBotProfileImage(); // Call the function when the component mounts
  }, []); // Empty dependency array ensures this runs only once


  const handleSendMessage = async () => {
    if (userMessage.trim() !== "") {
      setChatHistory([
        ...chatHistory,
        { role: "user", content: userMessage },
        { role: "assistant", content: "" }, 
      ]);
      setUserMessage(""); 

      let dots = "";
      let intervalId;
      const updateDots = () => {
        dots = dots.length < 3 ? dots + "." : "";
        setChatHistory((prevHistory) =>
          prevHistory.map((msg, index) =>
            index === prevHistory.length - 1 ? { ...msg, content: dots } : msg
          )
        );
      };

      intervalId = setInterval(updateDots, 300); 

      try {
        const chatbotId = 1234;
        const payload = {
          id: chatbotId,
          chat_history: chatHistory,
          prompt: userMessage,
          nsfw: false,
        };
        // const response = await axios.post(
        //   "http://localhost:8080/api/v1/chat/",
        //   payload
        // );
        const response = {}
        response.data = "Hello, how can I help you today?"
        
        clearInterval(intervalId); 
        setChatHistory((prevHistory) =>
          prevHistory.map((msg, index) =>
            index === prevHistory.length - 1 ? { ...msg, content: response.data } : msg
          )
        );
      } catch (error) {
        console.error(error);
        clearInterval(intervalId);
        // Handle the error (e.g., show an error message to the user)
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
                src={botProfileImage || profileImage} // Use bot image, fallback to placeholder
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
