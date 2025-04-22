'use client';

import { useState, FormEvent, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { storeCrawlResults } from '@/utils/supabase-storage';
import { checkSupabaseConnection } from '@/utils/supabase';

// Bearer token value
const API_TOKEN = "WinWin0209";
type CrawlResult = string | CrawlJsonResult;

interface CrawlJsonResult {
  pages?: Array<{
    url: string;
    title?: string;
    content?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}
export default function CrawlPage() {
  // Form state
  const [url, setUrl] = useState('');
  const [returnType, setReturnType] = useState('1'); // 1 for JSON, 2 for Markdown
  const [maxPages, setMaxPages] = useState(10);
  const [respectRobots, setRespectRobots] = useState(true);
  const [crawlSubpages, setCrawlSubpages] = useState(true);
  const [llmFilter, setLlmFilter] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [actualResponseFormat, setActualResponseFormat] = useState<'json' | 'markdown' | null>(null);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  
  // Form validation
  const [urlError, setUrlError] = useState('');
  
  // Check Supabase connection on component mount
  useEffect(() => {
    async function checkConnection() {
      const isConnected = await checkSupabaseConnection();
      setSupabaseConnected(isConnected);
    }
    
    checkConnection();
  }, []);
  
  const validateUrl = (url: string) => {
    try {
      new URL(url);
      setUrlError('');
      return true;
    } catch {
      setUrlError('Please enter a valid URL (e.g., https://example.com)');
      return false;
    }
  };
  
  // Helper function to detect if content is Markdown
  const isMarkdownContent = (content: string): boolean => {
    // Check for common Markdown patterns
    return (
      content.trim().startsWith('#') || // Headers
      content.includes('![') || // Images
      content.includes('](') || // Links
      /\*\*.+\*\*/.test(content) || // Bold text
      /\*.+\*/.test(content) || // Italic text
      /\n\s*[-*+]\s/.test(content) || // Unordered lists
      /\n\s*\d+\.\s/.test(content) // Ordered lists
    );
  };
  
  // Helper function to safely check if a string is valid JSON
  const isJsonString = (str: string): boolean => {
    try {
      const result = JSON.parse(str);
      return typeof result === 'object' && result !== null;
    } catch {
      return false;
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setResult(null);
    setActualResponseFormat(null);
    setSaveSuccess(null);
    
    // Validate URL
    if (!validateUrl(url)) return;
    
    // Validate max pages
    if (maxPages <= 0) {
      setError('Max pages must be greater than 0');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Construct API URL with query parameters
      const apiUrl = new URL('https://markdowner.banana18nt.workers.dev');
      apiUrl.searchParams.append('url', url);
      apiUrl.searchParams.append('crawlSubpages', crawlSubpages ? 'true' : 'false');
      apiUrl.searchParams.append('llmFilter', llmFilter ? 'true' : 'false');
      apiUrl.searchParams.append('maxLinks', maxPages.toString()); // Add maxLinks parameter
      
      // Set appropriate headers for the request
      const headers: HeadersInit = {
        'Authorization': `Bearer ${API_TOKEN}`
      };
      
      // For GET requests, we use Accept header to specify what format we want to receive
      if (returnType === '1') {
        headers['Accept'] = 'application/json';
        headers['Content-type'] = 'application/json';
        
      } else {
        headers['Accept'] = 'text/markdown';
        headers['Content-type'] = 'application/text';
      }
      // Make the API call with appropriate headers
      const response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: headers,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Get the content type from response headers
      const contentType = response.headers.get('content-type') || '';
      console.log('Response content type:', contentType);
      
      // Get the raw text first
      const rawText = await response.text();
      console.log('Raw response text (first 100 chars):', rawText.substring(0, 100));
      
      // Determine the format based on content inspection
      if (isJsonString(rawText)) {
        // It's valid JSON
        const data = JSON.parse(rawText);
        setResult(data);
        setActualResponseFormat('json');
        console.log('Detected format: JSON');
      } else if (isMarkdownContent(rawText)) {
        // It's Markdown
        setResult(rawText);
        setActualResponseFormat('markdown');
        console.log('Detected format: Markdown');
      } else {
        // It's neither valid JSON nor clearly Markdown
        // Default to treating it as text/markdown
        setResult(rawText);
        setActualResponseFormat('markdown');
        console.log('Detected format: Unknown (treating as text)');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to save results to Supabase
  const handleSaveToSupabase = async () => {
    if (!result) return;
    
    setIsSaving(true);
    setSaveSuccess(null);
    
    try {
      // Prepare data for storage
      const crawlData = {
        url: url,
        maxLinks: maxPages,
        crawlSubpages: crawlSubpages,
        llmFilter: llmFilter,
        // If result is a string (markdown), create a simple page object
        // If result is JSON, use its structure
        pages: typeof result === 'string' 
          ? [{ url: url, content: result, title: url }] 
          : (result.pages || [{ url: url, content: JSON.stringify(result), title: url }])
      };
      
      // Store in Supabase
      const { success, crawlId } = await storeCrawlResults(crawlData);
      
      if (success) {
        setSaveSuccess(true);
        console.log(`Successfully saved crawl data with ID: ${crawlId}`);
      } else {
        setSaveSuccess(false);
        setError('Failed to save data to Supabase');
      }
    } catch (err) {
      console.error('Error saving to Supabase:', err);
      setSaveSuccess(false);
      setError(err instanceof Error ? `Error saving to Supabase: ${err.message}` : 'An unknown error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Web Crawler</h1>
      
      {/* Supabase connection status */}
      {/* {supabaseConnected !== null && (
        <div className={`mb-6 p-4 rounded-md ${supabaseConnected ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {supabaseConnected ? (
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700">
                {supabaseConnected 
                  ? 'Supabase connection established. You can save crawl results to the database.' 
                  : 'Supabase connection not available. Saving results will not work.'}
              </p>
            </div>
          </div>
        </div>
      )} */}
      
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                Website URL or Sitemap URL
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border ${
                    urlError ? 'border-red-500' : ''
                  }`}
                  placeholder="https://example.com"
                  required
                />
                {urlError && <p className="mt-1 text-sm text-red-600">{urlError}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="returnType" className="block text-sm font-medium text-gray-700">
                  Preferred Data Format
                </label>
                <select
                  id="returnType"
                  name="returnType"
                  value={returnType}
                  onChange={(e) => setReturnType(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="1">JSON</option>
                  <option value="2">Markdown format</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="maxPages" className="block text-sm font-medium text-gray-700">
                  Max Links to Crawl
                </label>
                <input
                  type="number"
                  name="maxPages"
                  id="maxPages"
                  value={maxPages}
                  onChange={(e) => setMaxPages(parseInt(e.target.value))}
                  min="1"
                  className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="10"
                />
              </div>
            </div>
            
            <div>
              <fieldset>
                <legend className="text-sm font-medium text-gray-700">Crawl Options</legend>
                <div className="mt-2 space-y-2">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="respectRobots"
                        name="respectRobots"
                        type="checkbox"
                        checked={respectRobots}
                        onChange={(e) => setRespectRobots(e.target.checked)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="respectRobots" className="font-medium text-gray-700">
                        Respect robots.txt
                      </label>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="crawlSubpages"
                        name="crawlSubpages"
                        type="checkbox"
                        checked={crawlSubpages}
                        onChange={(e) => setCrawlSubpages(e.target.checked)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="crawlSubpages" className="font-medium text-gray-700">
                        Crawl subpages
                      </label>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="llmFilter"
                        name="llmFilter"
                        type="checkbox"
                        checked={llmFilter}
                        onChange={(e) => setLlmFilter(e.target.checked)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="llmFilter" className="font-medium text-gray-700">
                        Filter out unnecessary information using LLM
                      </label>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Crawling...
                  </>
                ) : (
                  'Start Crawling'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Save success message */}
      {saveSuccess === true && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Successfully saved crawl results to Database!
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Format mismatch warning */}
      {result && actualResponseFormat && returnType === '1' && actualResponseFormat === 'markdown' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> You requested JSON format, but the API returned Markdown content. Displaying as Markdown instead.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Results */}
      {result && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Results</h2>
            
            {/* Save to Supabase button */}
            <button
              onClick={handleSaveToSupabase}
              disabled={isSaving || !supabaseConnected}
              className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                supabaseConnected 
                  ? (isSaving ? 'bg-green-400 cursor-not-allowed' : 'text-white bg-green-600 hover:bg-green-700')
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save to DB for next process
                </>
              )}
            </button>
          </div>
          
          {actualResponseFormat === 'json' ? (
            // JSON result
            <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
              <pre className="text-sm text-gray-800">{JSON.stringify(result, null, 2)}</pre>
            </div>
          ) : (
            // Markdown result
            <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
              <div className="prose max-w-none">
              {typeof window !== 'undefined' && typeof ReactMarkdown !== 'undefined' ? (
                typeof result === 'string' ? (
                  <ReactMarkdown>{result}</ReactMarkdown>
                ) : (
                  <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                )
              ) : (
                <pre className="whitespace-pre-wrap">{typeof result === 'string' ? result : JSON.stringify(result, null, 2)}</pre>
              )}
              </div>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                const data = actualResponseFormat === 'json'
                              ? JSON.stringify(result, null, 2)
                              : (typeof result === 'string' ? result : JSON.stringify(result, null, 2));
                const blob = new Blob([data], { 
                  type: actualResponseFormat === 'json' ? 'application/json' : 'text/markdown' 
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `crawl-result.${actualResponseFormat === 'json' ? 'json' : 'md'}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  )
}