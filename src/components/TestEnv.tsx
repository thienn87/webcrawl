import { useState, useEffect } from 'react';
import { checkSupabaseConnection } from '../utils/supabase';

export default function TestEnv() {
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [hasOpenAiKey, setHasOpenAiKey] = useState<boolean>(false);

  useEffect(() => {
    // Check if environment variables are set
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const openAiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
    
    setSupabaseUrl(url);
    setHasOpenAiKey(!!openAiKey);
    
    // Test Supabase connection
    async function testConnection() {
      if (url && key) {
        const isConnected = await checkSupabaseConnection();
        setSupabaseStatus(isConnected ? 'connected' : 'error');
      } else {
        setSupabaseStatus('error');
      }
    }
    
    testConnection();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Environment Configuration</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Supabase URL:</p>
          <p className="text-sm text-gray-600">
            {supabaseUrl ? 
              `${supabaseUrl.substring(0, 8)}...${supabaseUrl.substring(supabaseUrl.length - 5)}` : 
              'Not configured'}
          </p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-700">Supabase Connection:</p>
          <div className="flex items-center">
            {supabaseStatus === 'checking' && (
              <span className="flex items-center text-yellow-600">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
              </span>
            )}
            
            {supabaseStatus === 'connected' && (
              <span className="flex items-center text-green-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                Connected
              </span>
            )}
            
            {supabaseStatus === 'error' && (
              <span className="flex items-center text-red-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                </svg>
                Error
              </span>
            )}
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-700">OpenAI API Key:</p>
          <div className="flex items-center">
            {hasOpenAiKey ? (
              <span className="flex items-center text-green-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                Configured
              </span>
            ) : (
              <span className="flex items-center text-red-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                </svg>
                Not configured
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}