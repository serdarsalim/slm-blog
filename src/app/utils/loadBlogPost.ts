// This is the blog post loader utility
import Papa from 'papaparse';
import type { BlogPost } from '@/app/types/blogpost';

// Define BlogPost with the missing 'load' property
interface ExtendedBlogPost extends BlogPost {
  load: boolean;
}

// Replace with your actual Google Sheet ID if you have one
// Otherwise, we'll rely on the fallback data
const BLOG_SHEET_URL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/pub?gid=0&single=true&output=csv';
const FALLBACK_URL = '/data/fallbackPosts.csv';
const TIMEOUT_MS = 3000; // 3 second timeout

// Event to notify subscribers when data changes
const postUpdateEvents = new Set<(posts: BlogPost[]) => void>();

function parseBlogData(item: Record<string, any>): ExtendedBlogPost {
  try {
    // Parse loadPost first for optimization
    const load = item.load === 'TRUE' || 
                 item.load === 'true' || 
                 item.load === true;
    
    return {
      load,
      id: item.id || "0", // Changed to string to match BlogPost interface
      title: item.title || 'Untitled Post',
      slug: item.slug || 'untitled-post',
      excerpt: item.excerpt || '',
      content: item.content || '',
      author: item.author || 'Anonymous',
      date: item.date || new Date().toISOString().split('T')[0],
      readTime: item.readTime || '5 min read',
      categories: item.categories ? item.categories.split(',').map((cat: string) => cat.trim()) : [],
      featuredImage: item.featuredImage || 'https://picsum.photos/id/1039/1000/600',
      featured: item.featured === 'TRUE' || item.featured === 'true'
    };
  } catch (error) {
    console.error("Error parsing blog post data:", error, item);
    return {
      load: false, // Don't load error posts by default
      id: "0", // Changed to string to match BlogPost interface
      title: 'Error Post',
      slug: 'error-post',
      excerpt: 'There was an error loading this post',
      content: 'There was an error loading this post content',
      author: 'System',
      date: new Date().toISOString().split('T')[0],
      readTime: '0 min read',
      categories: ['error'],
      featuredImage: 'https://picsum.photos/id/1039/1000/600',
      featured: false
    };
  }
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Function to fetch and process blog posts
async function fetchAndProcessPosts(url: string, isFallback = false): Promise<BlogPost[]> {
  try {
    console.log(`Fetching blog posts from: ${url}`);
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    
    if (!csvText || csvText.trim().length === 0) {
      throw new Error('Empty CSV response');
    }
    
    const { data, errors } = Papa.parse(csvText, { 
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0 && errors[0].code !== "TooFewFields") {
      console.warn("CSV parsing had errors:", errors);
    }

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No valid data in CSV');
    }

    // Parse all posts but only return those with load: true
    const allPosts = data.map(parseBlogData).filter(Boolean);
    
    // Early filter for posts that should be loaded
    const posts = allPosts.filter(post => post.load);
    
    if (allPosts.length > 0) {
      // Notify subscribers of new data (only loadable posts)
      postUpdateEvents.forEach(callback => callback(posts));
    }
    
    console.log(`Loaded ${posts.length} posts successfully`);
    return posts; // Return only posts with load: true
  } catch (error) {
    console.error("Error in fetchAndProcessPosts:", error);
    
    if (!isFallback) {
      console.log("Trying fallback CSV file");
      // Try fallback if primary source fails
      return fetchAndProcessPosts(FALLBACK_URL, true);
    }
    
    console.error("All data sources failed, no posts available", error);
    return []; // Return empty array as last resort
  }
}

// Main function to load blog posts
export async function loadBlogPosts(): Promise<BlogPost[]> {
  try {
    return await fetchAndProcessPosts(BLOG_SHEET_URL);
  } catch (error) {
    console.error("All blog post sources failed:", error);
    return []; // Return empty array as last resort
  }
}

// Get a specific post by slug
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const posts = await fetchAndProcessPosts(BLOG_SHEET_URL);
    return posts.find(p => p.slug === slug) || null;
  } catch (error) {
    console.error(`Failed to get post ${slug}:`, error);
    
    try {
      // Try the fallback CSV
      const fallbackPosts = await fetchAndProcessPosts(FALLBACK_URL, true);
      return fallbackPosts.find(p => p.slug === slug) || null;
    } catch (fallbackError) {
      console.error(`Failed to get post ${slug} from fallback:`, fallbackError);
      return null;
    }
  }
}

// Function to subscribe to post updates
export function subscribeToPostUpdates(callback: (posts: BlogPost[]) => void): () => void {
  postUpdateEvents.add(callback);
  
  // Return unsubscribe function
  return () => {
    postUpdateEvents.delete(callback);
  };
}