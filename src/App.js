// src/App.js
import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import ChatbotSelection from './components/ChatbotSelection';

function App() {
  const [selectedChatbotId, setSelectedChatbotId] = useState(null);

  const handleSelectChatbot = (chatbotId) => {
    setSelectedChatbotId(chatbotId);
  };

  return (
    <div>
      {selectedChatbotId ? (
        <ChatInterface chatbotId={selectedChatbotId} />
      ) : (
        <ChatbotSelection onSelectChatbot={handleSelectChatbot} />
      )}
    </div>
  );
}

export default App;