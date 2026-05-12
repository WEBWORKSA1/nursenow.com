'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Calendar, User, Clock, ArrowRight, Tag, Bookmark } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const posts = [
    {
      id: '1',
      title: 'Top 10 Nursing Jobs in the USA for 2026',
      excerpt: 'Discover the highest-paying and most in-demand nursing specialties this year. From CRNAs to Nurse Practitioners...',
      author: 'Dr. Sarah Miller',
      date: 'April 5, 2026',
      readTime: '8 min read',
      category: 'Careers',
      image: 'https://picsum.photos/seed/nursingjobs/800/400'
    },
    {
      id: '2',
      title: 'Mastering the NCLEX: 5 Study Tips from Top Scorers',
      excerpt: 'Passing the NCLEX doesn\'t have to be a nightmare. Learn the strategies used by nurses who scored in the top 5%...',
      author: 'Nurse John Doe',
      date: 'April 3, 2026',
      readTime: '6 min read',
      category: 'Exam Prep',
      image: 'https://picsum.photos/seed/nclexstudy/800/400'
    },
    {
      id: '3',
      title: 'How to Build a Nursing Resume That Gets You Hired',
      excerpt: 'Your resume is your first impression. Make it count with these nursing-specific formatting and content tips...',
      author: 'Recruiter Mark',
      date: 'April 1, 2026',
      readTime: '5 min read',
      category: 'Career Growth',
      image: 'https://picsum.photos/seed/resume-blog/800/400'
    },
    {
      id: '4',
      title: 'Work-Life Balance for Night Shift Nurses',
      excerpt: 'Working the night shift presents unique challenges. Here is how to maintain your health and social life while working nights...',
      author: 'Nurse Elena',
      date: 'March 28, 2026',
      readTime: '10 min read',
      category: 'Wellness',
      image: 'https://picsum.photos/seed/nightshift/800/400'
    }
  ];

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-slate-900 leading-tight">NurseNow <span className="text-blue-600">Blog</span></h1>
          <p className="text-slate-600 mt-4 text-lg">Expert insights, career advice, and clinical tips for the modern nurse.</p>
        </div>

        {/* Search & Categories */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', 'Careers', 'Exam Prep', 'Wellness', 'Clinical'].map((cat) => (
              <button key={cat} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {filteredPosts.length > 0 && searchQuery === '' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-xl group cursor-pointer"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-64 lg:h-auto">
                <Image
                  src={posts[0].image}
                  alt={posts[0].title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center space-x-2 text-blue-600 font-bold text-sm uppercase tracking-widest mb-4">
                  <Tag className="w-4 h-4" />
                  <span>{posts[0].category}</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                  {posts[0].title}
                </h2>
                <p className="mt-4 text-slate-600 text-lg leading-relaxed">
                  {posts[0].excerpt}
                </p>
                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                      {posts[0].author[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{posts[0].author}</div>
                      <div className="text-xs text-slate-500">{posts[0].date}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-slate-400 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{posts[0].readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm">
                  {post.category}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                  {post.title}
                </h3>
                <p className="mt-3 text-slate-500 text-sm line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-6 flex items-center justify-between text-slate-400 text-xs font-medium">
                  <div className="flex items-center space-x-2">
                    <User className="w-3 h-3" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>{post.date}</span>
                  </div>
                </div>
                <button className="mt-6 w-full flex items-center justify-center space-x-2 text-blue-600 font-bold py-3 rounded-xl border border-blue-100 hover:bg-blue-50 transition-all">
                  <span>Read Article</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-24 bg-slate-900 rounded-[3rem] p-12 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-display font-bold text-white">Get Career Tips in Your Inbox</h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Join 10,000+ nurses who receive our weekly newsletter with the best job opportunities and study resources.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg">
                Subscribe
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-green-600 rounded-full blur-3xl opacity-20" />
        </div>
      </div>
    </div>
  );
}
