// src/components/ChatbotSelection.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ChatbotSelection.css";

const ChatbotSelection = ({ onSelectChatbot }) => {
    const [chatbots, setChatbots] = useState([]);
    const [chatbotImages, setChatbotImages] = useState({});
    const [continuationToken, setContinuationToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const API_URL = process.env.REACT_APP_API_URL;

const fetchChatbots = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/persona`, {
            params: {
                limit: 10,
                continuation_token: token
            }
        });
        if (response.data && response.data.items) {
            return { chatbots: response.data.items, continuationToken: response.data.continuation_token };
        } else {
            console.error("No valid chatbot data found in API response.");
            return { chatbots: [], continuationToken: null };
        }
    } catch (error) {
        console.error("Error fetching chatbots:", error);
        return { chatbots: [], continuationToken: null };
    }
};

const fetchChatbotImages = async (newChatbots) => {
    try {
        const promises = newChatbots.map(async (chatbot) => {
            const response = await axios.get(`${API_URL}/persona/${chatbot.id}/image`);
            if (response.data && response.data.image_base64) {
                return { id: chatbot.id, image: `data:image/png;base64,${response.data.image_base64}` };
            } else {
                console.error(`No valid image data found for chatbot ${chatbot.id}.`);
                return { id: chatbot.id, image: null };
            }
        });
        const images = await Promise.all(promises);
        setChatbotImages((prevImages) => ({ ...prevImages, ...images.reduce((acc, { id, image }) => ({ ...acc, [id]: image }), {}) }));
    } catch (error) {
        console.error("Error fetching chatbot images:", error);
    }
};

useEffect(() => {
    const fetchInitialChatbots = async () => {
        const { chatbots, continuationToken } = await fetchChatbots(null);
        setChatbots(chatbots);
        setContinuationToken(continuationToken);
        fetchChatbotImages(chatbots);
    };
    
    fetchInitialChatbots();
}, []);

const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight - 100 && !loading && continuationToken) {
        setLoading(true);
        fetchChatbots(continuationToken).then(({ chatbots, continuationToken }) => {
            setChatbots((prevChatbots) => [...prevChatbots, ...chatbots]);
            setContinuationToken(continuationToken);
            fetchChatbotImages(chatbots);
            setLoading(false);
        }).catch((error) => {
            console.error("Error fetching chatbots:", error);
            setLoading(false);
        });
    }
};

const handleSelectChatbot = (chatbotId) => {
    onSelectChatbot(chatbotId); 
};

return (
    <div className="chatbot-selection-container" onScroll={handleScroll}>
    <h2>Select a chatbot:</h2>
    <div className="chatbot-list">
    {chatbots.map((chatbot) => (
        <div key={chatbot.id} className="chatbot-item" onClick={() => handleSelectChatbot(chatbot.id)}>
        {chatbotImages[chatbot.id] ? (
            <img src={chatbotImages[chatbot.id]} alt={chatbot.name} className="chatbot-image" />
        ) : (
            <div className="chatbot-image-placeholder">No image available</div>
        )}
        <div className="chatbot-name">{chatbot.name}</div>
        </div>
    ))}
    {loading ? <div>Loading...</div> : null}
    </div>
    </div>
);
};

export default ChatbotSelection;