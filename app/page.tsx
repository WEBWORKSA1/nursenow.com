'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Search, Briefcase, BookOpen, GraduationCap, Users, Play, ArrowRight, Star, CheckCircle2, Globe, Zap, ShieldCheck, Sparkles, Stethoscope, Heart, Layout, Building2, Coffee, MessageSquare, Thermometer } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const featuredJobs = [
    { id: '1', title: 'Registered Nurse (ER)', hospital: 'St. Mary\'s Medical Center', location: 'San Francisco, CA', type: 'Full-time', salary: '$95k - $120k' },
    { id: '2', title: 'Pediatric Nurse Practitioner', hospital: 'Children\'s Health', location: 'Dallas, TX', type: 'Full-time', salary: '$110k - $140k' },
    { id: '3', title: 'Travel Nurse (ICU)', hospital: 'Rapid Response Healthcare', location: 'New York, NY', type: 'Contract', salary: '$3,500 - $4,200 / week' },
  ];

  const popularCourses = [
    { id: '1', title: 'NCLEX-RN Comprehensive Prep', instructor: 'Dr. Sarah Miller', price: '$49', rating: 4.9, students: 1240, image: 'https://picsum.photos/seed/nclex/400/250' },
    { id: '2', title: 'Advanced Cardiac Life Support (ACLS)', instructor: 'Nurse John Doe', price: '$29', rating: 4.8, students: 850, image: 'https://picsum.photos/seed/acls/400/250' },
    { id: '3', title: 'Nurse Interview Mastery Kit', instructor: 'NurseNow Expert', price: '$19', rating: 5.0, students: 2100, image: 'https://picsum.photos/seed/interview/400/250', isProduct: true },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-display font-bold tracking-tight text-slate-900 leading-tight"
            >
              Find Nursing Jobs, Skills & <span className="text-blue-600">Opportunities</span> — All in One Place
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-xl text-slate-600 leading-relaxed"
            >
              The AI-powered platform designed exclusively for nurses. Elevate your career with personalized job matches, expert-led courses, and professional tools.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 bg-white p-2 rounded-2xl shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-2 max-w-3xl mx-auto"
            >
              <div className="flex-1 flex items-center px-4 w-full">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Job title, specialty, or keywords"
                  className="w-full p-4 focus:outline-none text-slate-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="hidden md:block w-px h-8 bg-slate-200" />
              <div className="flex-1 flex items-center px-4 w-full">
                <input
                  type="text"
                  placeholder="Location (City, State)"
                  className="w-full p-4 focus:outline-none text-slate-900"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <button className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200">
                Find Jobs
              </button>
            </motion.div>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/jobs" className="flex items-center space-x-2 text-blue-600 font-semibold hover:underline">
                <span>Browse all jobs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-slate-300">|</span>
              <Link href="/courses" className="flex items-center space-x-2 text-green-600 font-semibold hover:underline">
                <span>Start learning</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-96 h-96 bg-green-200/30 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Active Jobs', value: '12,000+' },
              { label: 'Resume Score', value: 'Avg +45%' },
              { label: 'Hired Faster', value: '3x Speed' },
              { label: 'Success Rate', value: '98%' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MVP Feature: Resume AI */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-6">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">AI-Powered Optimization</span>
              </div>
              <h2 className="text-4xl font-display font-bold text-slate-900 leading-tight">
                Your Resume, <span className="text-blue-600">Reimagined by AI</span>
              </h2>
              <p className="mt-6 text-slate-600 text-lg leading-relaxed">
                Don&apos;t let your resume get lost in the stack. Our AI analyzes your experience and optimizes it for hospital tracking systems (ATS), helping you get 3x more interviews.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Instant ATS optimization',
                  'Stronger action-oriented bullet points',
                  'Specialty-specific keyword injection',
                  'Professional PDF download'
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/tools" className="mt-10 inline-flex bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                Optimize My Resume
              </Link>
            </div>
            <div className="relative">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner relative z-10">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm opacity-50 blur-[1px]">
                    <div className="h-4 w-1/3 bg-slate-200 rounded mb-2" />
                    <div className="h-3 w-full bg-slate-100 rounded" />
                  </div>
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    className="bg-white p-6 rounded-2xl shadow-xl border-2 border-blue-200 relative z-20"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-5 w-1/2 bg-blue-600 rounded" />
                      <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">OPTIMIZED</div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-slate-100 rounded" />
                      <div className="h-3 w-full bg-slate-100 rounded" />
                      <div className="h-3 w-4/5 bg-slate-100 rounded" />
                    </div>
                  </motion.div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm opacity-50 blur-[1px]">
                    <div className="h-4 w-1/4 bg-slate-200 rounded mb-2" />
                    <div className="h-3 w-full bg-slate-100 rounded" />
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400 rounded-full blur-[80px] opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Employer Branding Feature */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
               <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Life at St. Mary&apos;s</h3>
                        <p className="text-blue-400 font-medium">Verified Employer Profile</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="aspect-video bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                        <img src="https://picsum.photos/seed/hosp1/400/250" alt="Hospital" className="w-full h-full object-cover opacity-60" />
                      </div>
                      <div className="aspect-video bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                        <img src="https://picsum.photos/seed/hosp2/400/250" alt="Hospital" className="w-full h-full object-cover opacity-60" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 w-full bg-slate-800 rounded" />
                      <div className="h-2 w-4/5 bg-slate-800 rounded" />
                      <div className="h-2 w-full bg-slate-800 rounded" />
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32" />
               </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 mb-6">
                <Layout className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Employer Branding</span>
              </div>
              <h2 className="text-4xl font-display font-bold text-slate-900 leading-tight">
                Go Beyond the <span className="text-blue-600">Job Description</span>
              </h2>
              <p className="mt-6 text-slate-600 text-lg leading-relaxed">
                Hospitals aren&apos;t just buildings; they&apos;re communities. Explore &quot;Life at&quot; pages to see the technology, break rooms, and culture before you apply.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Virtual facility tours',
                  'Direct insights into unit culture',
                  'Technology & equipment highlights',
                  'Real photos of the workplace'
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/jobs" className="mt-10 inline-flex items-center space-x-2 text-blue-600 font-bold hover:underline">
                <span>Explore hospital profiles</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Nurse Lounge Feature */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-6">
                <Coffee className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">The Nurse Lounge</span>
              </div>
              <h2 className="text-4xl font-display font-bold text-slate-900 leading-tight">
                A Community That <br /> <span className="text-blue-600">Actually Gets It</span>
              </h2>
              <p className="mt-6 text-slate-600 text-lg leading-relaxed">
                Nursing is high-stress. Connect with peers who understand the grind. Share anonymous unit reviews and check in on your mental health with our burnout tool.
              </p>
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <MessageSquare className="w-6 h-6 text-blue-600 mb-3" />
                  <h4 className="font-bold text-slate-900 mb-1">Unit Reviews</h4>
                  <p className="text-sm text-slate-500">Real talk about staffing, management, and culture.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <Thermometer className="w-6 h-6 text-red-500 mb-3" />
                  <h4 className="font-bold text-slate-900 mb-1">Burnout Check-in</h4>
                  <p className="text-sm text-slate-500">Track your mental well-being and get support.</p>
                </div>
              </div>
              <Link href="/lounge" className="mt-10 inline-flex bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                Enter the Lounge
              </Link>
            </div>
            <div className="relative">
              <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="space-y-6 relative z-10">
                  <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">S</div>
                        <div className="text-white font-bold text-sm">St. Mary&apos;s - ICU</div>
                      </div>
                      <div className="flex items-center text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="ml-1 text-sm font-bold">4.8</span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm italic">&quot;Great team culture, but staffing can be tight on weekends...&quot;</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 ml-8">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">B</div>
                      <div className="text-white font-bold text-sm">Burnout Check-in</div>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[65%]" />
                    </div>
                    <div className="mt-2 text-[10px] text-green-400 font-bold uppercase tracking-widest">Healthy Range</div>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/20 rounded-full blur-[100px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MVP Feature: Digital Product (Interview Kit) */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-square relative flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse" />
                <motion.div 
                  whileHover={{ rotate: -2, scale: 1.02 }}
                  className="relative bg-slate-800 p-8 rounded-[3rem] border border-slate-700 shadow-2xl max-w-sm"
                >
                  <div className="absolute -top-4 -right-4 bg-amber-500 text-slate-900 font-black px-4 py-2 rounded-xl shadow-lg rotate-12">
                    $19 ONLY
                  </div>
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                    <GraduationCap className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Nurse Interview Mastery Kit</h3>
                  <div className="space-y-3 mb-8">
                    {['50+ Common Questions', 'Salary Negotiation Scripts', 'Follow-up Templates'].map(item => (
                      <div key={item} className="flex items-center space-x-2 text-sm text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/products/interview-kit" className="block w-full bg-white text-slate-900 text-center py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                    Get Instant Access
                  </Link>
                </motion.div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 mb-6 text-blue-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-xs font-bold uppercase tracking-wider">Bestselling Digital Product</span>
              </div>
              <h2 className="text-4xl font-display font-bold leading-tight">
                Ace Your Next <br /> <span className="text-blue-400">Nursing Interview</span>
              </h2>
              <p className="mt-6 text-slate-400 text-lg leading-relaxed">
                Stop guessing what recruiters want to hear. Our comprehensive Interview Mastery Kit gives you the exact frameworks and scripts used by nurses to land jobs at top-tier hospitals.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-6">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                  <div className="text-2xl font-bold text-white">2,000+</div>
                  <div className="text-xs text-slate-500 uppercase font-bold mt-1">Nurses Hired</div>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                  <div className="text-2xl font-bold text-white">4.9/5</div>
                  <div className="text-xs text-slate-500 uppercase font-bold mt-1">User Rating</div>
                </div>
              </div>
              <Link href="/products/interview-kit" className="mt-10 inline-flex items-center space-x-2 text-blue-400 font-bold hover:underline">
                <span>See everything included</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-900">Latest Nursing Jobs</h2>
              <p className="text-slate-600 mt-2">New opportunities posted in the last 24 hours.</p>
            </div>
            <Link href="/jobs" className="text-blue-600 font-semibold hover:underline flex items-center space-x-1">
              <span>View all jobs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-green-50 text-green-600 rounded-full uppercase tracking-wider">
                    {job.type}
                  </span>
                </div>
                <h3 className="text-xl font-bold mt-4 text-slate-900">{job.title}</h3>
                <p className="text-slate-600 font-medium">{job.hospital}</p>
                <div className="mt-4 flex items-center text-slate-500 text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{job.location}</span>
                </div>
                <div className="mt-6 flex justify-between items-center">
                  <span className="text-blue-600 font-bold">{job.salary}</span>
                  <button className="text-slate-900 font-semibold hover:text-blue-600 transition-colors">
                    Apply Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-900">Popular Courses</h2>
              <p className="text-slate-600 mt-2">Master new skills and advance your specialty.</p>
            </div>
            <Link href="/courses" className="text-blue-600 font-semibold hover:underline flex items-center space-x-1">
              <span>View all courses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularCourses.map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-blue-600 font-bold shadow-sm">
                    {course.price}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-1 text-yellow-400 mb-2">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-slate-900 font-bold text-sm">{course.rating}</span>
                    <span className="text-slate-400 text-sm">({course.students} students)</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">{course.title}</h3>
                  <p className="text-slate-500 text-sm mt-1">By {course.instructor}</p>
                  <Link 
                    href={course.isProduct ? '/products/interview-kit' : '/courses'}
                    className="mt-6 block w-full bg-slate-50 text-slate-900 text-center py-3 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all border border-slate-200"
                  >
                    {course.isProduct ? 'Get the Kit' : 'Enroll Now'}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gig Marketplace Preview */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner relative z-10">
                <div className="space-y-4">
                  {[
                    { title: 'ER Night Shift', rate: '$85/hr', hospital: 'General Hospital' },
                    { title: 'ICU Day Shift', rate: '$92/hr', hospital: 'St. Jude Medical' },
                    { title: 'Pediatrics', rate: '$78/hr', hospital: 'Children&apos;s Clinic' },
                  ].map((shift, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          <Zap className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{shift.title}</div>
                          <div className="text-xs text-slate-500">{shift.hospital}</div>
                        </div>
                      </div>
                      <div className="text-lg font-black text-blue-600">{shift.rate}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-600 rounded-full blur-[60px] opacity-10" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-green-600 rounded-full blur-[60px] opacity-10" />
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center space-x-2 bg-orange-100 px-3 py-1 rounded-full border border-orange-200 mb-6">
                <Zap className="w-4 h-4 text-orange-600 fill-current" />
                <span className="text-xs font-bold uppercase tracking-wider text-orange-700">Gig Marketplace</span>
              </div>
              <h2 className="text-4xl font-display font-bold text-slate-900 leading-tight">
                Flexible Shifts. <br /> <span className="text-blue-600">Instant Payouts.</span>
              </h2>
              <p className="mt-6 text-slate-600 text-lg leading-relaxed">
                Need extra cash or a flexible schedule? Pick up gig shifts at top facilities near you. No long-term contracts, just work when you want.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700 font-medium">Verified high-rate shifts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700 font-medium">Instant withdrawal after shift completion</span>
                </div>
              </div>
              <Link href="/gig" className="mt-10 inline-flex bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-xl">
                Browse Gig Shifts
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Relocation Preview */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-display font-bold text-slate-900">Go Global with NurseNow</h2>
            <p className="text-slate-600 mt-4 text-lg">We help nurses relocate to the world&apos;s top healthcare systems. Your international career starts here.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { name: 'USA', flag: '🇺🇸', desc: 'NCLEX & Visa Support' },
              { name: 'United Kingdom', flag: '🇬🇧', desc: 'NHS Placement' },
              { name: 'Australia', flag: '🇦🇺', desc: 'Lifestyle & High Pay' },
              { name: 'Canada', flag: '🇨🇦', desc: 'Fast-track Immigration' },
            ].map((country, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm text-center group"
              >
                <div className="text-5xl mb-4">{country.flag}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{country.name}</h3>
                <p className="text-slate-500 text-sm mb-6">{country.desc}</p>
                <Link href="/relocation" className="text-blue-600 font-bold text-sm group-hover:underline flex items-center justify-center space-x-1">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Licensing & Authorities Preview */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-6">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-blue-700">Regulatory Directory</span>
              </div>
              <h2 className="text-4xl font-display font-bold text-slate-900 leading-tight">
                Navigate Nursing <br /> <span className="text-blue-600">Licensure with Ease</span>
              </h2>
              <p className="mt-6 text-slate-600 text-lg leading-relaxed">
                Stay compliant and informed. Access our comprehensive database of US State Boards, Canadian Authorities, and professional associations. Compare licensing fees, renewal periods, and CEU requirements in one place.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-1 bg-blue-100 rounded-md">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">50+ US Boards</div>
                    <div className="text-sm text-slate-500">Full licensing parameters</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-1 bg-blue-100 rounded-md">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Compact Status</div>
                    <div className="text-sm text-slate-500">NLC state tracking</div>
                  </div>
                </div>
              </div>
              <Link href="/licensing" className="mt-12 inline-flex items-center space-x-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-xl group">
                <span>View Licensing Directory</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 relative z-10">
                <div className="space-y-6">
                  {[
                    { state: 'Texas', compact: true, fee: '$75', renewal: '2 Years' },
                    { state: 'California', compact: false, fee: '$350', renewal: '2 Years' },
                    { state: 'Florida', compact: true, fee: '$110', renewal: '2 Years' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-blue-600 shadow-sm">
                          {s.state[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{s.state}</div>
                          <div className="text-xs text-slate-500">{s.compact ? 'Compact State' : 'Non-Compact'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{s.fee}</div>
                        <div className="text-xs text-slate-500">{s.renewal}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100 rounded-full blur-[100px] opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* AI Tools Directory Preview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full border border-white/30 mb-6">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold uppercase tracking-widest">New Resource</span>
                </div>
                <h2 className="text-4xl font-display font-bold leading-tight">
                  The Ultimate Directory of <br /> <span className="text-blue-200">50+ AI Tools for Nurses</span>
                </h2>
                <p className="mt-6 text-blue-100 text-lg leading-relaxed">
                  We&apos;ve researched the top 1,000 hospital websites to find the best AI tools for clinical care, education, and well-being.
                </p>
                <Link href="/ai-tools" className="mt-10 inline-flex bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-xl">
                  Explore AI Tools
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Clinical AI', icon: Stethoscope },
                  { name: 'Education', icon: GraduationCap },
                  { name: 'Well-being', icon: Heart },
                  { name: 'Job Matching', icon: Briefcase },
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                    <item.icon className="w-8 h-8 mb-4 text-blue-200" />
                    <div className="font-bold text-lg">{item.name}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          </div>
        </div>
      </section>

      {/* YouTube / Video Hub */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-display font-bold leading-tight">
                Learn from the Best in the <span className="text-blue-400">Nursing Community</span>
              </h2>
              <p className="mt-6 text-slate-400 text-lg leading-relaxed">
                Watch expert-led tutorials, day-in-the-life vlogs, and NCLEX prep sessions. Our video hub brings the best nursing content directly to you.
              </p>
              <div className="mt-10 space-y-4">
                {[
                  'Daily NCLEX practice questions',
                  'Career advice from veteran nurses',
                  'Specialty certification guides',
                  'Hospital reviews and interview tips'
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    <span className="text-slate-200 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <button className="mt-12 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center space-x-2">
                <Play className="w-5 h-5 fill-current" />
                <span>Watch Now</span>
              </button>
            </div>
            <div className="relative">
              <div className="aspect-video bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl relative group cursor-pointer">
                <Image
                  src="https://picsum.photos/seed/nursevideo/800/450"
                  alt="Video Thumbnail"
                  fill
                  className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 fill-current text-white" />
                  </div>
                </div>
              </div>
              {/* Floating Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl text-slate-900 hidden md:block">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Live NCLEX Prep</div>
                    <div className="text-xs text-slate-500">2.4k watching now</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-slate-900">Trusted by Nurses Everywhere</h2>
            <p className="text-slate-600 mt-4">Join thousands of professionals growing their careers on NurseNow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Jenkins', role: 'ICU Nurse', text: 'NurseNow helped me find my dream job in San Francisco within two weeks. The resume builder is a game changer!' },
              { name: 'Michael Chen', role: 'Nursing Student', text: 'The NCLEX prep courses are top-notch. I felt so much more confident going into my exams thanks to the AI practice tools.' },
              { name: 'Elena Rodriguez', role: 'Nurse Manager', text: 'As a recruiter, NurseNow provides the highest quality candidates. The platform is intuitive and very effective.' },
            ].map((t, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                <div className="flex items-center space-x-1 text-blue-600 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-slate-700 italic text-lg">&quot;{t.text}&quot;</p>
                <div className="mt-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{t.name}</div>
                    <div className="text-sm text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-blue-600 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
            Ready to Take Your Nursing <br /> Career to the Next Level?
          </h2>
          <p className="mt-6 text-blue-100 text-xl max-w-2xl mx-auto">
            Join 50,000+ nurses who are already using NurseNow to find jobs, learn skills, and connect with the community.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/jobs" className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl text-center">
              Find My Next Job
            </Link>
            <Link href="/recruiter" className="bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-all border border-blue-500 text-center">
              Post a Job Listing
            </Link>
          </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500 rounded-full opacity-50 blur-3xl" />
        <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-400 rounded-full opacity-50 blur-3xl" />
      </section>
    </div>
  );
}
