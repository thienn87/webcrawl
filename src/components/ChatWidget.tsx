
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatWidgetProps {
  title?: string;
  placeholder?: string;
  initialMessage?: string;
}

const N8N_CHAT_API = 'https://winwinsols.app.n8n.cloud/webhook/text-recevier';
/*
test: https://winwinsols.app.n8n.cloud/webhook-test/text-recevier
*/

function generateSessionId() {
  // Simple random session id (could use uuid for more robustness)
  return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
}

export default function ChatWidget({
  title = "WinWin, Ai Agent",
  placeholder = "Send message...",
  initialMessage = "Hello! Welcome to Freight Insurance. How can I help you with today?"
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Generate/persist session_id per tab
  useEffect(() => {
    if (!sessionIdRef.current) {
      // Try to get from sessionStorage first
      let stored = sessionStorage.getItem('sessionId');
      if (!stored) {
        stored = generateSessionId();
        sessionStorage.setItem('sessionId', stored);
      }
      sessionIdRef.current = stored;
    }
  }, []);

  // Add initial message when component mounts
  useEffect(() => {
    if (initialMessage) {
      setMessages([
        {
          id: 'welcome',
          content: initialMessage,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  }, [initialMessage]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Send message to n8n API
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
    if (!input.trim()) return;

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
    <div className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden h-[500px] border border-gray-200">
      {/* Chat header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center">
        <div className="h-2.5 w-2.5 rounded-full bg-green-400 mr-2"></div>
        <h3 className="font-medium">{title}</h3>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 chat-content-box ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              {message.sender === 'bot' ? (
                <div className="">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <div className="">{message.content}</div>
              )}
              <div
                className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 rounded-bl-none">
              <div className="flex space-x-1">
                <div className="bg-gray-400 rounded-full h-2 w-2 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="bg-gray-400 rounded-full h-2 w-2 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="bg-gray-400 rounded-full h-2 w-2 animate-bounce" style={{ animationDelay: '600ms' }}></div>
              </div>
            </div>
          </div>
        )}

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

        <div ref={messagesEndRef} />
      </div>

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
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`rounded-full p-3 ${
              isLoading || !input.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
