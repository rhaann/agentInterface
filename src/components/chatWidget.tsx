// src/components/chatWidget.tsx
'use client'; // Needed for React Hooks in Next.js App Router

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import styles from './chatWidget.module.css'; // Import CSS Module

// Define the structure of a message object
interface Message {
  id: number; // Simple ID for React key prop
  sender: 'user' | 'ai';
  text: string;
}

// Define the expected structure of the successful API response from /api/chat
interface ApiSuccessResponse {
  reply: string;
}

// Define the expected structure of the error API response from /api/chat
interface ApiErrorResponse {
  error: string;
}

const ChatWidget: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

  // State for Session ID
  const [sessionId, setSessionId] = useState<string>('');

  // Effect to generate Session ID on mount
  useEffect(() => {
    // Generate a simple unique ID when the component mounts
    // For production, consider a more robust UUID library (e.g., `uuid`)
    const newSessionId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setSessionId(newSessionId);
    console.log("ChatWidget: Generated Session ID:", newSessionId);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to toggle chat window
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
       setError(null); // Clear error when opening
    }
  };

  // Function to handle sending messages (calls API)
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    const trimmedInput = currentInput.trim();
    // Ensure sessionId is generated before sending
    if (!trimmedInput || isLoading || !sessionId) return;

    // 1. Add user message immediately to UI
    const newUserMessage: Message = {
      id: Date.now(), // Use timestamp as simple unique ID
      sender: 'user',
      text: trimmedInput,
    };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setCurrentInput('');
    setIsLoading(true);
    setError(null);

    // --- API Call Section ---
    try {
      console.log(`ChatWidget: Calling /api/chat (Session: ${sessionId}) with message:`, trimmedInput);

      // Make the POST request to our Next.js API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send message and sessionId in the correct format
        body: JSON.stringify({
            message: trimmedInput,
            sessionId: sessionId
        }),
      });

      // Check if the request was successful
      if (!response.ok) {
        let errorMessage = `Error: ${response.status} ${response.statusText}`;
        try {
            const errorData: ApiErrorResponse = await response.json();
            errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
            console.error("ChatWidget: Could not parse error JSON from API", jsonError);
        }
        throw new Error(errorMessage); // Throw an error to be caught below
      }

      // Parse the successful JSON response from the API route
      const data: ApiSuccessResponse = await response.json();

      // Ensure we got a reply string
      if (data && typeof data.reply === 'string') {
          const aiResponse: Message = {
            id: Date.now() + 1, // Ensure unique ID
            sender: 'ai',
            text: data.reply, // Use the actual reply from the API
          };
          setMessages(prevMessages => [...prevMessages, aiResponse]);
      } else {
          console.error("ChatWidget: Received invalid success response format from API", data);
          throw new Error("Received an unexpected response from the server.");
      }

    } catch (fetchError: unknown) { // Use unknown instead of any for better type safety
      console.error("ChatWidget: Failed to send message or process response:", fetchError);
      // Set the error state to display message in the UI
      setError(
        fetchError instanceof Error 
          ? fetchError.message 
          : "Sorry, failed to get a response. Please try again."
      );
    } finally {
      // This will run whether the try block succeeded or failed
      setIsLoading(false);
    }
    // --- End of API Call Section ---
  };

  // Effect to scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]); // Dependency array includes messages

  return (
    <>
      {/* Chat Toggle Button */}
      <button onClick={toggleChat} className={styles.toggleButton}>
        {isChatOpen ? 'Close Chat' : 'Open Chat'}
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className={styles.chatWindow}>
          {/* Header (Optional) */}
          <div className={styles.chatHeader}>AI Agent</div>

          {/* Message Display Area */}
          <div className={styles.messagesContainer}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.sender === 'user' ? styles.userMessage : styles.aiMessage
                }`}
              >
                {message.text}
              </div>
            ))}
            {/* Display Loading Indicator */}
            {isLoading && <div className={`${styles.message} ${styles.loadingMessage}`}>Thinking...</div>}
            {/* Display Error Message */}
            {error && <div className={`${styles.message} ${styles.errorMessage}`}>{error}</div>}
            {/* Empty div to scroll to */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Using a form for better accessibility & Enter key handling */}
          <form onSubmit={handleSendMessage} className={styles.inputArea}>
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Ask the agent..."
              className={styles.inputField}
              disabled={isLoading} // Disable input while loading
              style={{ color: '#333' }} // Sets the text color for the input field
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={isLoading || currentInput.trim().length === 0} // Disable if loading or input empty
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;