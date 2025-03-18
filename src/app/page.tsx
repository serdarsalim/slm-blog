"use client";

import React, { Suspense, useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Fuse from "fuse.js";
import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/app/types/blogpost";
import { useBlogPosts } from "@/app/hooks/blogService";

export default function Blog() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white relative overflow-hidden">
      {/* Grid Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px), " +
            "linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px), " +
            "linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px 98%), " +
            "linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px 98%)",
          backgroundSize: "5% 5%, 2% 2%, 100% 100%, 100% 100%",
          backgroundPosition: "0 0, 0 0, 5% 0, 0 5%",
        }}
      ></div>

      {/* Wrap all client-interactive content in Suspense */}
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-md mb-4"></div>
              <div className="h-4 w-60 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            </div>
          </div>
        }
      >
        <BlogContent />
      </Suspense>
    </div>
  );
}

// Create a client component for all the interactive parts
function BlogContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(["all"]);
  const [isVisible, setIsVisible] = useState(false);
  const { posts, loading } = useBlogPosts();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: ["title", "excerpt", "categories", "author"],
        threshold: 0.4,
      }),
    [posts]
  );

  const handleCategoryClick = (cat: string) => {
    setSelectedCategories((prev) => {
      if (cat === "all") return ["all"];
      const newCategories = prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev.filter((c) => c !== "all"), cat];
      return newCategories.length === 0 ? ["all"] : newCategories;
    });
  };

  const filteredPosts = searchTerm
    ? fuse.search(searchTerm).map((result) => result.item)
    : posts.filter(
        (p) =>
          selectedCategories.includes("all") ||
          selectedCategories.every((cat) =>
            p.categories.map((c) => c.toLowerCase()).includes(cat.toLowerCase())
          )
      );

  // Sort posts by date (newest first)
  const sortedPosts = [...filteredPosts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get featured posts
  const featuredPosts = posts.filter(post => post.featured);

  // Calculate category counts for the filter buttons
  const categoryCounts = posts.reduce((acc, post) => {
    post.categories.forEach((cat) => {
      const lowerCat = cat.toLowerCase();
      acc[lowerCat] = (acc[lowerCat] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  // Default fallback image for posts
  const defaultImage = "/images/default-post.jpg";

  return (
    <>
      {/* Hero Section */}
      <main
        id="home"
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-12 pb-12 min-h-[28vh] select-none max-w-6xl mx-auto"
      >
        {/* Background container */}
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 rounded-b-lg shadow-2xl overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-20 dark:opacity-10" 
               style={{
                 backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)",
                 backgroundSize: "20px 20px"
               }} />
        </div>

        {/* Content */}
        <motion.div
          className="relative z-10 max-w-4xl w-full"
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.7,
            type: "spring",
            stiffness: 60,
            damping: 15,
          }}
        >
          {/* Header content */}
          <div className="mt-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-800 dark:text-white"
              style={{
                letterSpacing: "-0.025em",
              }}
            >
              My Tech Blog
            </motion.h1>

            {/* Subtext */}
            <motion.p
              className="text-xl mt-6 mb-6 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Insights, tutorials, and stories about technology and development
            </motion.p>
          </div>
        </motion.div>
      </main>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="relative z-10 py-12 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">
              Featured Posts
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.slice(0, 2).map((post) => (
                <Link 
                  href={`/blog/${post.slug}`} 
                  key={post.id}
                  className="group"
                >
                  <motion.div
                    className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden h-full"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="relative h-64">
                      <Image
                        src={post.featuredImage || defaultImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback for client-side error handling
                          const target = e.target as HTMLImageElement;
                          target.src = defaultImage;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-6 text-white">
                        <div className="flex gap-2 mb-2">
                          {post.categories.slice(0, 2).map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-1 text-xs font-medium rounded-full bg-white/20 backdrop-blur-sm"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{post.title}</h3>
                        <div className="flex items-center text-sm">
                          <span>{post.date}</span>
                          <span className="mx-2">•</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Section */}
      <section id="blog" className="relative z-10 p-6 md:p-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.5 }}
          className="card-container dark:bg-gray-800"
        >
          <div className="flex flex-col items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              Latest Articles
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300 text-center text-lg pb-2">
              Browse all posts or filter by category
            </p>

            <div className="w-full flex flex-wrap justify-center gap-2 mb-4">
              {[
                { name: "all", count: posts.length },
                ...Object.entries(categoryCounts)
                  .map(([name, count]) => ({ name, count }))
                  .sort((a, b) => b.count - a.count)
              ].map(({ name, count }) => (
                <motion.button
                  key={name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryClick(name)}
                  className={`
                    px-3 py-2 
                    rounded-lg 
                    transition-all 
                    duration-300 
                    font-medium
                    text-sm
                    flex items-center
                    ${
                      selectedCategories.includes(name)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 hover:bg-blue-300 dark:hover:bg-blue-700 text-gray-800 dark:text-gray-200"
                    }
                  `}
                >
                  <span>
                    {name === "all"
                      ? "All Posts"
                      : name.charAt(0).toUpperCase() + name.slice(1)}
                    <span
                      className={`
                        ml-2
                        inline-flex items-center justify-center 
                        w-6 h-6 
                        rounded-full text-xs font-bold
                        ${
                          selectedCategories.includes(name)
                            ? "bg-white text-blue-500"
                            : "bg-gray-500/20 text-gray-700 dark:bg-gray-600/40 dark:text-gray-300"
                        }
                      `}
                    >
                      {count}
                    </span>
                  </span>
                </motion.button>
              ))}
            </div>

            <div className="relative w-full max-w-2xl">
              <input
                type="text"
                placeholder="Search posts..."
                className="w-full px-4 py-3 rounded-lg text-black dark:text-white bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <motion.div
                animate={{ opacity: searchTerm ? 1 : 0 }}
                className="absolute right-4 top-3 cursor-pointer"
                onClick={() => setSearchTerm("")}
              >
                {searchTerm && (
                  <span className="text-gray-500 dark:text-gray-400 text-lg">
                    ×
                  </span>
                )}
              </motion.div>
            </div>
          </div>

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 space-y-4"
            >
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 dark:text-gray-500">
                Loading posts...
              </p>
            </motion.div>
          ) : sortedPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-400 dark:text-gray-500">
                No posts found matching your criteria. Try a different search term or category.
              </p>
            </motion.div>
          ) : (
            /* Blog post cards */
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {sortedPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  className="flex flex-col h-full bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl"
                >
                  <Link href={`/blog/${post.slug}`} className="block h-full">
                    <div className="relative h-56">
                      <Image
                        src={post.featuredImage || defaultImage}
                        alt={post.title}
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        fill
                        onError={(e) => {
                          // Fallback for client-side error handling
                          const target = e.target as HTMLImageElement;
                          target.src = defaultImage;
                        }}
                      />
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="mb-3 flex flex-wrap gap-1">
                        {post.categories.slice(0, 3).map((cat) => (
                          <span
                            key={cat}
                            className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-700 dark:text-gray-300 line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{post.date}</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </section>
    </>
  );
}