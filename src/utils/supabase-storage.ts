
import { supabase } from './supabase';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // This is also the default, can be omitted
  dangerouslyAllowBrowser: true
});

interface LinkData {
  url: string;
  text?: string;
}

interface PageData {
  url: string;
  title?: string;
  content?: string;
  links?: LinkData[];
  [key: string]: unknown; // For any extra properties
}

interface CrawlData {
  url: string;
  maxLinks?: number;
  crawlSubpages?: boolean;
  llmFilter?: boolean;
  content?: string;
  pages?: PageData[];
}

// Function to chunk text for LLM consumption
export function chunkText(text: string, maxTokens: number = 1000): string[] {
  if (!text) return [];
  
  // Simple chunking by approximate token count (characters / 4)
  const chunks: string[] = [];
  const approximateTokens = text.length / 4;
  const chunkSize = Math.floor(text.length / (approximateTokens / maxTokens));
  
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  
  return chunks;
}

// Function to generate embeddings for text
export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!text || !process.env.NEXT_PUBLIC_OPENAI_API_KEY) return null;
  
  try {
    // Using the correct method from the latest OpenAI SDK
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text.replace(/\n/g, " ")
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

// Main function to store crawl results in Supabase
export async function storeCrawlResults(crawlData: CrawlData) {
  try {
    // 1. Store crawl session
    const { data: crawlSession, error: crawlError } = await supabase
      .from('crawl_sessions')
      .insert({
        source_url: crawlData.url,
        options: {
          maxLinks: crawlData.maxLinks,
          crawlSubpages: crawlData.crawlSubpages,
          llmFilter: crawlData.llmFilter
        }
      })
      .select('id')
      .single();
    
    if (crawlError) {
      throw new Error(`Error storing crawl session: ${crawlError.message}`);
    }
    
    const crawlId = crawlSession.id;
    
    // 2. Process and store pages
    const pages: PageData[] = Array.isArray(crawlData.pages) ? crawlData.pages : 
                 (crawlData.content ? [{ url: crawlData.url, content: crawlData.content }] : []);
    
    for (const page of pages) {
      // Store the page
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .insert({
          crawl_id: crawlId,
          url: page.url,
          title: page.title || '',
          content_text: page.content || '',
          content_json: page
        })
        .select('id')
        .single();
      
      if (pageError) {
        console.error(`Error storing page ${page.url}:`, pageError);
        continue;
      }
      
      const pageId = pageData.id;
      
      // 3. Create and store chunks for LLM consumption
      const contentChunks = chunkText(page.content || '');
      
      for (let i = 0; i < contentChunks.length; i++) {
        const chunk = contentChunks[i];
        const tokenCount = Math.ceil(chunk.length / 4); // Approximate token count
        
        // Generate embedding for the chunk
        const embedding = await generateEmbedding(chunk);
        
        // Store the chunk
        const { error: chunkError } = await supabase
          .from('page_chunks')
          .insert({
            page_id: pageId,
            chunk_index: i,
            content: chunk,
            token_count: tokenCount,
            embedding: embedding
          });
        
        if (chunkError) {
          console.error(`Error storing chunk ${i} for page ${page.url}:`, chunkError);
        }
      }
      
      // 4. Store links
      if (page.links && Array.isArray(page.links) && page.links.length > 0) {
        const pageLinks = page.links.map((link: LinkData) => ({
          source_page_id: pageId,
          target_url: link.url,
          anchor_text: link.text || '',
          is_internal: link.url.startsWith(new URL(page.url).origin)
        }));
        
        const { error: linksError } = await supabase
          .from('page_links')
          .insert(pageLinks);
        
        if (linksError) {
          console.error(`Error storing links for page ${page.url}:`, linksError);
        }
      }
    }
    
    return { success: true, crawlId };
  } catch (error) {
    console.error('Error storing crawl results:', error);
    throw error;
  }
}

// Function to search for content in Supabase using vector similarity
export async function searchSupabase(query: string, threshold: number = 0.7, limit: number = 5) {
  try {
    // Generate embedding for the query
    const embedding = await generateEmbedding(query);
    
    if (!embedding) {
      throw new Error('Failed to generate embedding for query');
    }
    
    // Search for similar content using the match_page_chunks function
    const { data, error } = await supabase.rpc('match_page_chunks', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit
    });
    
    if (error) {
      throw new Error(`Error searching Supabase: ${error.message}`);
    }
    
    // Get page details for the matching chunks
    const pageIds = [...new Set(data.map((item: { page_id: number }) => item.page_id))];
    
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('id, url, title')
      .in('id', pageIds);
    
    if (pagesError) {
      throw new Error(`Error fetching page details: ${pagesError.message}`);
    }
    
    // Combine the results
    const results = data.map((item: { content: string; similarity: number; page_id: number }) => {
      const page = pages.find((p: { id: number }) => p.id === item.page_id);
      return {
        content: item.content,
        similarity: item.similarity,
        url: page?.url || '',
        title: page?.title || ''
      };
    });
    
    return results;
  } catch (error) {
    console.error('Error searching Supabase:', error);
    throw error;
  }
}
