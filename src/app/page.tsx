"use client";

import React, { Suspense, useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/app/types/blogpost";
import { useBlogPosts } from "@/app/hooks/blogService";

export default function Blog() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 font-sans">
      {/* Outer container with max width to prevent full page width */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 shadow-sm">
        {/* Wrap all client-interactive content in Suspense */}
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-10 w-40 bg-gray-100 dark:bg-slate-700 rounded-md mb-4"></div>
                <div className="h-4 w-60 bg-gray-100 dark:bg-slate-700 rounded-md"></div>
              </div>
            </div>
          }
        >
          <BlogContent />
        </Suspense>
      </div>
    </div>
  );
}

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
    : posts.filter((p) => {
        // Always show all posts if "all" is selected
        if (selectedCategories.includes("all")) return true;

        // Make sure categories exist and are handled as an array
        const postCategories = Array.isArray(p.categories)
          ? p.categories
          : p.categories
          ? [p.categories]
          : [];

        // Do case-insensitive comparison and trim whitespace
        return selectedCategories.some((selectedCat) =>
          postCategories.some(
            (postCat) =>
              postCat &&
              typeof postCat === "string" &&
              postCat.toLowerCase().trim() === selectedCat.toLowerCase().trim()
          )
        );
      });

  // Sort posts by date (newest first)
  const sortedPosts = [...filteredPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get featured posts
  const featuredPosts = posts.filter((post) => post.featured);

  // Calculate category counts for the filter buttons
  const categoryCounts = posts.reduce((acc, post) => {
    // Make sure categories exist and are always handled as an array
    const categories = Array.isArray(post.categories)
      ? post.categories
      : post.categories
      ? [post.categories]
      : [];

    categories.forEach((cat) => {
      if (cat) {
        // Check that category is defined
        const lowerCat = cat.toLowerCase().trim();
        acc[lowerCat] = (acc[lowerCat] || 0) + 1;
      }
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
  const defaultImage = "https://picsum.photos/id/1039/1000/600";

  // Subtle text animation variants
  const textCharVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.05 * i,
        duration: 0.4,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    }),
  };

  return (
    <>
      {/* Hero Section with minimalist Apple-like design */}
      <section className="py-6 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="relative text-center mb-3"
          >
            {/* Subtle floating shape in background */}
            <motion.div
              className="absolute -top-10 left-1/2 w-40 h-40 rounded-full bg-gray-50 dark:bg-blue-400/10 filter blur-3xl opacity-40 dark:opacity-30"
              animate={{
                x: [0, 10, -10, 0],
                y: [0, -10, 10, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 12,
                ease: "easeInOut",
              }}
            />

            {/* Enhanced title with subtle character animation */}
            <motion.div 
              className="text-center"
              initial="hidden"
              animate="visible"
            >
              {["Digital", "notes", "on", "my", "interests.", "🧶"].map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block">
                  {wordIndex > 0 && <span>&nbsp;</span>}
                  {[...word].map((char, charIndex) => (
                    <motion.span
                      key={`${wordIndex}-${charIndex}`}
                      variants={textCharVariants}
                      custom={(wordIndex * 5) + charIndex}
                      className="text-[1.15em] text-gray-500 dark:text-gray-300 font-medium tracking-tight inline-block origin-bottom"
                      animate={{
                        color: wordIndex === 0 ? 
                          ['#6b7280', '#4b5563', '#6b7280'] : 
                          undefined,
                      }}
                      transition={{
                        repeat: wordIndex === 0 ? Infinity : 0,
                        repeatDelay: 3,
                        duration: 3,
                        ease: "easeInOut"
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              ))}
            </motion.div>

            {/* Clean minimal background */}
            <motion.div
              className="absolute -z-10 inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
            />
          </motion.div>

          {/* Category filters - Minimalist colors */}
          <div className="w-full flex flex-wrap justify-center gap-2 mb-3">
            {[
              { name: "all", count: posts.length },
              ...Object.entries(categoryCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count),
            ].map(({ name, count }) => (
              <motion.button
                key={name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(name)}
                className={`
                  px-2 py-1 
                  rounded-lg 
                  transition-all 
                  duration-200 
                  font-normal
                  text-xs
                  flex items-center
                  z-10 relative
                  cursor-pointer
                  ${
                    selectedCategories.includes(name)
                      ? "bg-gray-100 text-gray-800 dark:bg-blue-900/30 dark:text-blue-300 border border-gray-200 dark:border-blue-800"
                      : "bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-slate-600"
                  }
                `}
              >
                <span>
                  {name === "all"
                    ? "All Posts"
                    : name.charAt(0).toUpperCase() + name.slice(1)}
                  <span
                    className={`
                      ml-1
                      inline-flex items-center justify-center 
                      w-4 h-4 
                      rounded-full text-[10px] font-medium
                      ${
                        selectedCategories.includes(name)
                          ? "bg-white text-gray-700 dark:bg-blue-800 dark:text-blue-200"
                          : "bg-gray-50 text-gray-600 dark:bg-slate-600 dark:text-gray-300"
                      }
                    `}
                  >
                    {count}
                  </span>
                </span>
              </motion.button>
            ))}
          </div>

          {/* Search bar with minimalist styling */}
          <div className="relative w-full mb-3">
            <input
              type="text"
              placeholder="Search posts..."
              className="w-full px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-blue-800 font-normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <AnimatePresence>
              {searchTerm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-4 top-3 cursor-pointer"
                  onClick={() => setSearchTerm("")}
                >
                  <span className="text-gray-400 dark:text-gray-500 text-lg">
                    ×
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Blog Post List Section */}
      <section
        id="blog"
        className="py-4 bg-white dark:bg-slate-900 relative"
      >
        <div className="max-w-3xl mx-auto px-4 mb-10 -mt-4">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-6 space-y-2"
            >
              <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 dark:text-gray-500">
                Loading posts...
              </p>
            </motion.div>
          ) : sortedPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6"
            >
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                No posts found matching your criteria. Try a different search
                term or category.
              </p>
            </motion.div>
          ) : (
            /* Blog post cards in single column with Apple-like minimal design */
            <motion.div
              className="space-y-3"
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
                >
                  <Link href={`/blog/${post.slug}`} className="block h-full">
                    {/* Minimalist card design with subtle hover */}
                    <div className="flex flex-row bg-white dark:bg-slate-700 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-slate-600 transition-all duration-300 hover:shadow-md hover:border-gray-200 dark:hover:border-slate-500 h-32">
                      {/* Content - 4/5 of the space */}
                      <div className="p-4 flex-1 w-4/5 overflow-hidden flex flex-col">
                        <h3 className="text-base font-medium tracking-tight leading-snug line-clamp-2 mb-1 text-gray-800 dark:text-gray-100">
                          {post.title}
                        </h3> 

                        {/* Excerpt - added here with line clamp - increased font size for readability */}
                        <p className="text-sm text-gray-500 dark:text-gray-300 mb-auto line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Image - 1/5 of the space */}
                      <div className="relative w-1/5 min-w-[80px] transition-transform duration-500 group-hover:scale-105">
                        <Image
                          src={post.featuredImage || defaultImage}
                          alt={post.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = defaultImage;
                          }}
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
