'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const N8N_CHAT_API = 'https://n8n.winwinsolutions.vn/webhook/text-recevier';

function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: "Welcome to Freight Insurance website. How I can help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const sessionIdRef = useRef<string | null>(null);

  // Generate/persist session_id per tab
  useEffect(() => {
    if (!sessionIdRef.current) {
      let stored = sessionStorage.getItem('sessionId');
      if (!stored) {
        stored = generateSessionId();
        sessionStorage.setItem('sessionId', stored);
      }
      sessionIdRef.current = stored;
    }
  }, []);

  const sendToN8n = async (text: string) => {
    const sessionId = sessionIdRef.current || generateSessionId();
    try {
      const response = await fetch(N8N_CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sessionId,
        }),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      // The response is expected in data.response.out
      return data?.output || "Sorry, I didn't get a valid response.";
    } catch (err) {
      console.error('Error sending to n8n:', err);
      return "Sorry, there was an error processing your request.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Send to n8n and get response
    const botMarkdown = await sendToN8n(input.trim());

    // Add bot message
    const botMessage: Message = {
      id: `bot-${Date.now()}`,
      content: botMarkdown,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };
  // Handle the "Get A Quote Today!" button click
  const handleGetQuote = async () => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: "I'd like to get a quote today!",
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const botMarkdown = await sendToN8n("I'd like to get a quote today!");

    const botMessage: Message = {
      id: `bot-${Date.now()}`,
      content: botMarkdown,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };
  // Handle the "Get A Quote Today!" button click
  const handleMakeAClaim = async () => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: "I'd like to make a claim!",
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    const botMarkdown = await sendToN8n("I'd like to make a claim!");
    const botMessage: Message = {
      id: `bot-${Date.now()}`,
      content: botMarkdown,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };
  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
        {/* Chat header */}
        <div className="bg-blue-600 text-white px-6 py-4">
          <h1 className="text-xl font-semibold">I&apos;m a lovely agent</h1>
          <p className="text-blue-100 text-sm">How can I help you today?</p>
        </div>
        
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-6 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block max-w-[80%] rounded-2xl px-6 py-3 chat-content-box ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                {message.sender === 'bot' ? (
                  <div className="text-left">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-left">{message.content}</div>
                )}
              </div>
              <div
                className={`text-xs mt-1 text-gray-500`}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start mb-6">
              <div className="bg-white border border-gray-200 rounded-2xl px-6 py-3">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-3 w-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <div className="h-3 w-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Show the "Get A Quote Today!" button if there are no messages or only the welcome message */}
        {messages.length <= 1 && !isLoading && (
          <div>
            <div className="flex justify-center my-3">
              <button
                onClick={handleGetQuote}
                className="bg-blue-600 hover:bg-blue-700 w-45 text-white font-medium py-3 px-6 rounded-lg shadow-md transform transition-transform duration-200 hover:scale-105 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Get A Quote
              </button>
            </div>
            <div className="flex justify-center my-3">
            <button
              onClick={handleMakeAClaim}
              className="bg-blue-600 hover:bg-blue-700 w-45 text-white font-medium py-3 px-6 rounded-lg shadow-md transform transition-transform duration-200 hover:scale-105 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
             Make a claim
            </button>
          </div>
          </div>
        )}
        {/* Quick action buttons */}
        <div className="border-t border-gray-200 p-2 bg-gray-50 flex  justify-center space-x-2">
          <button
            onClick={handleGetQuote}
            className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md shadow-sm"
          >
            Get A Quote
          </button>
          <button
            onClick={handleMakeAClaim}
            className="text-sm bg-emerald-800 hover:bg-emerald-600 text-white px-3 py-1 rounded-md shadow-sm"
          >
          Make a claim
          </button>
        </div>
        {/* Input form */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`rounded-full p-4 ${
                isLoading || !input.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" transform="rotate(45 10 10)" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
