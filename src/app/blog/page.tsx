// src/app/blog/page.tsx
"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import Fuse from "fuse.js";
import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { BlogPost } from "@/app/types/blogpost";
import { useBlogPosts } from "@/app/hooks/blogService";

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white relative overflow-hidden">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        }
      >
        <BlogIndexContent />
      </Suspense>
    </div>
  );
}

function BlogIndexContent() {
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

  return (
    <>
      {/* Page header */}
      <header className="relative z-10 py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-300"
          >
            Insights, tutorials and stories about technology and development
          </motion.p>
        </div>
      </header>

      {/* Blog Posts Section */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center gap-4 mb-8">
            {/* Search and filters */}
            <div className="w-full max-w-xl mb-8">
              <div className="relative mb-4">
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

              <div className="flex flex-wrap justify-center gap-2 mb-4">
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
            </div>

            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="inline-block animate-spin w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Loading posts...
                </p>
              </motion.div>
            ) : sortedPosts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-500 dark:text-gray-400">
                  No posts found matching your criteria. Try a different search term or category.
                </p>
              </motion.div>
            ) : (
              /* Blog post cards */
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch"
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
                    className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl"
                  >
                    <Link href={`/blog/${post.slug}`} className="block h-full">
                      <div className="relative h-56">
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          fill
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

                        <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                          {post.title}
                        </h2>
                        
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
          </div>
        </div>
      </section>
    </>
  );
}