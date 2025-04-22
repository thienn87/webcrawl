import React, { useState, useEffect } from 'react';
import ChatWidget from './ChatWidget';

interface FloatingChatWidgetProps {
  title?: string;
  placeholder?: string;
  initialMessage?: string;
}

export default function FloatingChatWidget({
  title = "WinWin, Ai Agent",
  placeholder = "Send message...",
  initialMessage = "Hello! Welcome to Freight Insurance. How can I help you with today?"
}: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [unreadCount, setUnreadCount] = useState(1); // Start with 1 for the welcome message
  
  // Reset unread count when chat is opened
  useEffect(() => {
    if (!isMinimized) {
      setUnreadCount(0);
    }
  }, [isMinimized]);
  
  // Delayed appearance for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Chat bubble button */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center relative transition-all duration-300 ease-in-out"
      >
        {isMinimized ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>
      
      {/* Chat widget */}
      <div
        className={`mt-4 w-80 md:w-96 transform transition-all duration-300 ease-in-out ${
          isMinimized ? 'scale-0 opacity-0 h-0' : 'scale-100 opacity-100'
        }`}
      >
        {!isMinimized && (
          <div className="origin-bottom-right">
            <ChatWidget
              title={title}
              placeholder={placeholder}
              initialMessage={initialMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
}