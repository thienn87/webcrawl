
'use client';

import './global.css'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { Inter } from 'next/font/google'
import FloatingChatWidget from '../components/FloatingChatWidget'
import { useState, useEffect } from 'react'
const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showChat, setShowChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Only show chat widget after a delay and on client-side
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChat(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex flex-1 relative">
            {/* Sidebar for desktop */}
            <div className="hidden md:block bg-cyan-400">
              <Sidebar />
            </div>

            {/* Sidebar overlay for mobile */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity duration-300 md:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-hidden={sidebarOpen ? 'false' : 'true'}
              />
            )}
            {/* Sidebar for mobile */}
            <div
              className={`fixed z-50 inset-y-0 left-0 w-64 transform bg-white dark:bg-blue-900 border-r border-blue-100 dark:border-blue-800 transition-transform duration-300 md:hidden ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <Sidebar />
              <button
                className="absolute top-4 right-4 text-blue-600 dark:text-blue-200 focus:outline-none"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sidebar toggle button for mobile */}
            {!sidebarOpen && (
              <button
                className="absolute top-4 left-4 z-50 md:hidden bg-blue-600 text-white p-2 rounded-md shadow-lg focus:outline-none"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
          {/* Floating Chat Widget */}
          {showChat && (
            <FloatingChatWidget 
              title="WinWin, Ai Agent"
              initialMessage="Hello! Welcome to Freight Insurance. How can I help you with today?"
            />
          )}
        </div>
      </body>
    </html>
  )
}
