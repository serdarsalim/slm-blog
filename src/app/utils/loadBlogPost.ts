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

// Sample fallback posts for development
const SAMPLE_POSTS: ExtendedBlogPost[] = [
  {
    load: true,
    id: "1",
    title: "Getting Started with React Hooks",
    slug: "getting-started-with-react-hooks",
    excerpt: "Learn how to use React Hooks to simplify your functional components.",
    content: "# Getting Started with React Hooks\n\nReact Hooks are a powerful feature introduced in React 16.8. They allow you to use state and other React features without writing a class component.\n\n## useState Hook\n\nThe `useState` hook lets you add state to functional components.\n\n```jsx\nimport React, { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}\n```\n\n## useEffect Hook\n\nThe `useEffect` hook lets you perform side effects in function components.\n\n```jsx\nimport React, { useState, useEffect } from 'react';\n\nfunction Example() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    document.title = `You clicked ${count} times`;\n  });\n\n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}\n```",
    author: "Jane Developer",
    date: "2023-03-15",
    readTime: "8 min read",
    categories: ["React", "JavaScript", "Frontend"],
    featuredImage: "/images/react-hooks.jpg",
    featured: true
  },
  {
    load: true,
    id: "2",
    title: "Building a Blog with Next.js",
    slug: "building-a-blog-with-nextjs",
    excerpt: "A comprehensive guide to creating a high-performance blog using Next.js.",
    content: "# Building a Blog with Next.js\n\nNext.js is a powerful React framework that makes building websites and applications easier. In this guide, we'll walk through creating a blog from scratch.\n\n## Setting Up Your Project\n\n```bash\nnpx create-next-app my-blog\ncd my-blog\nnpm run dev\n```\n\n## Creating Blog Posts\n\nWe'll use Markdown for our blog posts, which allows for rich content formatting.\n\n```jsx\nimport fs from 'fs';\nimport path from 'path';\nimport matter from 'gray-matter';\n\nconst postsDirectory = path.join(process.cwd(), 'posts');\n\nexport function getSortedPostsData() {\n  // Get file names under /posts\n  const fileNames = fs.readdirSync(postsDirectory);\n  const allPostsData = fileNames.map((fileName) => {\n    // Remove \".md\" from file name to get id\n    const id = fileName.replace(/\\.md$/, '');\n\n    // Read markdown file as string\n    const fullPath = path.join(postsDirectory, fileName);\n    const fileContents = fs.readFileSync(fullPath, 'utf8');\n\n    // Use gray-matter to parse the post metadata section\n    const matterResult = matter(fileContents);\n\n    // Combine the data with the id\n    return {\n      id,\n      ...matterResult.data,\n    };\n  });\n  // Sort posts by date\n  return allPostsData.sort((a, b) => {\n    if (a.date < b.date) {\n      return 1;\n    } else {\n      return -1;\n    }\n  });\n}\n```",
    author: "Sam Tech",
    date: "2023-04-21",
    readTime: "12 min read",
    categories: ["Next.js", "React", "Web Development"],
    featuredImage: "/images/nextjs-blog.jpg",
    featured: true
  },
  {
    load: true,
    id: "3",
    title: "CSS Grid Layout: A Complete Guide",
    slug: "css-grid-layout-complete-guide",
    excerpt: "Master CSS Grid Layout with this comprehensive guide for web developers.",
    content: "# CSS Grid Layout: A Complete Guide\n\nCSS Grid Layout is a two-dimensional grid system that has transformed how we design web layouts.\n\n## Basic Grid Container\n\n```css\n.grid-container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-gap: 20px;\n}\n```\n\n## Grid Areas\n\n```css\n.grid-container {\n  display: grid;\n  grid-template-areas: \n    \"header header header\"\n    \"sidebar content content\"\n    \"footer footer footer\";\n  grid-template-rows: auto 1fr auto;\n  grid-template-columns: 200px 1fr 1fr;\n  min-height: 100vh;\n}\n\n.header { grid-area: header; }\n.sidebar { grid-area: sidebar; }\n.content { grid-area: content; }\n.footer { grid-area: footer; }\n```",
    author: "Alex Designer",
    date: "2023-05-10",
    readTime: "10 min read",
    categories: ["CSS", "Web Design", "Frontend"],
    featuredImage: "/images/css-grid.jpg",
    featured: false
  },
  {
    load: true,
    id: "4",
    title: "TypeScript for JavaScript Developers",
    slug: "typescript-for-javascript-developers",
    excerpt: "Learn how TypeScript can improve your JavaScript development workflow.",
    content: "# TypeScript for JavaScript Developers\n\nTypeScript adds static typing to JavaScript, providing better tooling, error-catching, and documentation.\n\n## Basic Types\n\n```typescript\n// Basic types\nlet isDone: boolean = false;\nlet decimal: number = 6;\nlet color: string = \"blue\";\nlet list: number[] = [1, 2, 3];\nlet x: [string, number] = [\"hello\", 10]; // Tuple\n\n// Enums\nenum Color {Red, Green, Blue}\nlet c: Color = Color.Green;\n\n// Any\nlet notSure: any = 4;\nnotSure = \"maybe a string instead\";\n\n// Void\nfunction warnUser(): void {\n  console.log(\"This is a warning message\");\n}\n```\n\n## Interfaces\n\n```typescript\ninterface User {\n  name: string;\n  id: number;\n  email?: string; // Optional property\n  readonly createdAt: Date; // Read-only property\n}\n\nfunction createUser(user: User): User {\n  return user;\n}\n\nconst newUser = createUser({\n  name: \"John\",\n  id: 1,\n  createdAt: new Date()\n});\n```",
    author: "Taylor Programmer",
    date: "2023-06-02",
    readTime: "15 min read",
    categories: ["TypeScript", "JavaScript", "Programming"],
    featuredImage: "/images/typescript.jpg",
    featured: false
  },
  {
    load: true,
    id: "5",
    title: "Responsive Design Best Practices",
    slug: "responsive-design-best-practices",
    excerpt: "Essential techniques for creating websites that work well on all devices.",
    content: "# Responsive Design Best Practices\n\nResponsive web design ensures your website looks and functions well on any device size.\n\n## Media Queries\n\n```css\n/* Base styles for all devices */\nbody {\n  font-family: 'Open Sans', sans-serif;\n  line-height: 1.6;\n  color: #333;\n}\n\n/* Small devices (phones) */\n@media (max-width: 576px) {\n  .container {\n    padding: 10px;\n  }\n  h1 {\n    font-size: 24px;\n  }\n}\n\n/* Medium devices (tablets) */\n@media (min-width: 577px) and (max-width: 991px) {\n  .container {\n    padding: 20px;\n  }\n  h1 {\n    font-size: 32px;\n  }\n}\n\n/* Large devices (desktops) */\n@media (min-width: 992px) {\n  .container {\n    padding: 30px;\n    max-width: 1200px;\n    margin: 0 auto;\n  }\n  h1 {\n    font-size: 40px;\n  }\n}\n```\n\n## Flexible Images\n\n```css\nimg {\n  max-width: 100%;\n  height: auto;\n}\n```\n\n## Mobile-First Approach\n\nAlways design for mobile first, then enhance for larger screens. This approach ensures your core content and functionality work well on the smallest screens.",
    author: "Morgan UX",
    date: "2023-06-15",
    readTime: "9 min read",
    categories: ["CSS", "Responsive Design", "Web Development"],
    featuredImage: "/images/responsive-design.jpg",
    featured: false
  }
];

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
      featuredImage: item.featuredImage || '/images/default-post.jpg',
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
      featuredImage: '/images/error-post.jpg',
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

// Flag to prevent multiple simultaneous background fetches
let isFetchingInBackground = false;

// Function to fetch and process blog posts
async function fetchAndProcessPosts(url: string, isFallback = false): Promise<BlogPost[]> {
  try {
    // Check if it's a local path
    if (url.startsWith('/')) {
      console.log("Using sample posts instead of CSV file");
      return SAMPLE_POSTS.filter(post => post.load);
    }
    
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
    
    return posts; // Return only posts with load: true
  } catch (error) {
    if (!isFallback) {
      console.error("Error in fetchAndProcessPosts:", error);
      // Try fallback if primary source fails
      return fetchAndProcessPosts(FALLBACK_URL, true);
    }
    console.error("All data sources failed, returning sample posts", error);
    return SAMPLE_POSTS.filter(post => post.load);
  }
}

// Main function to load blog posts
export async function loadBlogPosts(): Promise<BlogPost[]> {
  try {
    return await fetchAndProcessPosts(BLOG_SHEET_URL);
  } catch (error) {
    console.error("All blog post sources failed:", error);
    return SAMPLE_POSTS.filter(post => post.load); // Return sample posts as last resort
  }
}

// Get a specific post by slug
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const posts = await fetchAndProcessPosts(BLOG_SHEET_URL);
    return posts.find(p => p.slug === slug) || null;
  } catch (error) {
    console.error(`Failed to get post ${slug}:`, error);
    // Try to find in sample posts
    return SAMPLE_POSTS.find(p => p.slug === slug) || null;
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