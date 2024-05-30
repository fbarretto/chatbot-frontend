// src/components/ChatbotSelection.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ChatbotSelection.css";
import { FaTimes, FaCheck } from 'react-icons/fa';
import { useSwipeable } from 'react-swipeable';

const ChatbotSelection = ({ onSelectChatbot }) => {
    const [chatbots, setChatbots] = useState([]);
    const [chatbotImages, setChatbotImages] = useState({});
    const [chatbotDescriptions, setChatbotDescriptions] = useState({});
    const [continuationToken, setContinuationToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentChatbotIndex, setCurrentChatbotIndex] = useState(0);
    const [animationClass, setAnimationClass] = useState('');
    const [nextAnimationClass, setNextAnimationClass] = useState('');
    const API_URL = process.env.REACT_APP_API_URL;
    
    const fetchChatbots = async (token, limit = 3) => {
        try {
            const response = await axios.get(`${API_URL}/persona`, {
                params: {
                    limit, // Fetch 'limit' chatbots at a time
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
    
    const fetchChatbotImage = async (chatbotId) => {
        try {
            const response = await axios.get(`${API_URL}/persona/${chatbotId}/image`);
            if (response.data && response.data.image_base64) {
                return `data:image/png;base64,${response.data.image_base64}`;
            } else {
                console.error(`No valid image data found for chatbot ${chatbotId}.`);
                return null;
            }
        } catch (error) {
            console.error("Error fetching chatbot image:", error);
            return null;
        }
    };
    
    const fetchChatbotDescription = async (chatbotId) => {
        try {
            const response = await axios.get(`${API_URL}/persona/${chatbotId}`);
            if (response.data && response.data.description) {
                return response.data.description;
            } else {
                console.error(`No valid description data found for chatbot ${chatbotId}.`);
                return null;
            }
        } catch (error) {
            console.error("Error fetching chatbot description:", error);
            return null;
        }
    };
    
    useEffect(() => {
        const fetchInitialChatbots = async () => {
            const { chatbots, continuationToken } = await fetchChatbots(null);
            setChatbots(chatbots);
            setContinuationToken(continuationToken);
            chatbots.forEach(async (chatbot) => {
                const image = await fetchChatbotImage(chatbot.id);
                const description = await fetchChatbotDescription(chatbot.id);
                setChatbotImages((prevImages) => ({ ...prevImages, [chatbot.id]: image }));
                setChatbotDescriptions((prevDescriptions) => ({ ...prevDescriptions, [chatbot.id]: description }));
            });
        };
        
        fetchInitialChatbots();
    }, []);
    
    useEffect(() => {
        const bufferChatbots = async () => {
            if (chatbots.length < 3 && continuationToken) {
                const { chatbots: newChatbots, continuationToken: newContinuationToken } = await fetchChatbots(continuationToken);
                setChatbots((prevChatbots) => [...prevChatbots, ...newChatbots]);
                setContinuationToken(newContinuationToken);
                newChatbots.forEach(async (chatbot) => {
                    const image = await fetchChatbotImage(chatbot.id);
                    const description = await fetchChatbotDescription(chatbot.id);
                    setChatbotImages((prevImages) => ({ ...prevImages, [chatbot.id]: image }));
                    setChatbotDescriptions((prevDescriptions) => ({ ...prevDescriptions, [chatbot.id]: description }));
                });
            }
        };
        
        bufferChatbots();
    }, [chatbots, continuationToken]);
    
    const handleSwipe = (eventData) => {
        console.log("Swiped", eventData.dir);
        console.log("Current chatbot index:", currentChatbotIndex);
        console.log("Chatbots:", chatbots);
        if (eventData.dir === 'Left') {
            setAnimationClass('swipe-left');
            setNextAnimationClass('enter-from-right');
            setTimeout(() => {
                handleDiscardChatbot();
                setAnimationClass('');
                setNextAnimationClass('');
            }, 500);
        } else if (eventData.dir === 'Right') {
            setAnimationClass('swipe-right');
            setNextAnimationClass('enter-from-left');
            setTimeout(() => {
                handleSelectChatbot();
                setAnimationClass('');
                setNextAnimationClass('');
            }, 500);
        }
    };
    
    const handlers = useSwipeable({
        onSwiped: handleSwipe,
        trackMouse: true
    });
    
    const handleDiscardChatbot = () => {
        const newIndex = currentChatbotIndex + 1;
        setCurrentChatbotIndex(newIndex);
        const buffer = chatbots.length - newIndex;
        if (buffer < 3 && continuationToken) {
            const limit = 3 - buffer;
            fetchChatbots(continuationToken, limit).then(({ chatbots: newChatbots, continuationToken: newContinuationToken }) => {
                setChatbots((prevChatbots) => [...prevChatbots, ...newChatbots]);
                setContinuationToken(newContinuationToken);
                newChatbots.forEach(async (chatbot) => {
                    const image = await fetchChatbotImage(chatbot.id);
                    const description = await fetchChatbotDescription(chatbot.id);
                    setChatbotImages((prevImages) => ({ ...prevImages, [chatbot.id]: image }));
                    setChatbotDescriptions((prevDescriptions) => ({ ...prevDescriptions, [chatbot.id]: description }));
                });
            }).catch((error) => {
                console.error("Error fetching chatbots:", error);
            });
        }
    };
    
    const handleSelectChatbot = () => {
        if (chatbots[currentChatbotIndex]) { 
            onSelectChatbot(chatbots[currentChatbotIndex].id);
        }
    };
    
    return (
        <div className="chatbot-selection-container" {...handlers}>
        {chatbots.length > 0 ? (
            <div className={`chatbot-profile ${animationClass}`}>
            <div className="chatbot-image-container">
            {chatbotImages[chatbots[currentChatbotIndex]?.id] ? ( 
                <img src={chatbotImages[chatbots[currentChatbotIndex].id]} alt={chatbots[currentChatbotIndex].name} className="chatbot-image" />
            ) : (
                <div className="chatbot-image-placeholder">No image available</div>
            )}
            </div>
            <div className="chatbot-info">
            <h2>{chatbots[currentChatbotIndex]?.name}</h2>
            <p>Description: {chatbotDescriptions[chatbots[currentChatbotIndex]?.id]}</p>
            </div>
            <div className="actions">
            <FaTimes className="discard-icon" onClick={handleDiscardChatbot} />
            <FaCheck className="select-icon" onClick={handleSelectChatbot} />
            </div>
            </div>
        ) : (
            <div>Loading...</div>
        )}
        {chatbots.length > 1 && (
            <div className={`next-chatbot-profile ${nextAnimationClass}`}>
            <div className="chatbot-image-container">
            {chatbotImages[chatbots[currentChatbotIndex + 1]?.id] ? (
                <img src={chatbotImages[chatbots[currentChatbotIndex + 1].id]} alt={chatbots[currentChatbotIndex + 1].name} className="chatbot-image" />
            ) : (
                <div className="chatbot-image-placeholder">No image available</div>
            )}
            </div>
            <div className="chatbot-info">
            <h2>{chatbots[currentChatbotIndex + 1]?.name}</h2> 
            <p>Description: {chatbotDescriptions[chatbots[currentChatbotIndex + 1]?.id]}</p>
            </div>
            </div>
        )}
        </div>
    );
};

export default ChatbotSelection;