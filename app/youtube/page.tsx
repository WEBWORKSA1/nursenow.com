'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Play, Youtube, Search, Filter, Clock, Users, Star, 
  ArrowRight, CheckCircle2, Briefcase, GraduationCap, 
  Download, Sparkles, FileText, Twitter, Facebook, Linkedin, Share2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function YouTubeHub() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const videos = [
    // Topic 1: 5 NCLEX Questions That Trip Everyone Up
    {
      id: 'nclex-1-1',
      title: 'NCLEX Practice Questions: How to Answer NCLEX Questions',
      thumbnail: 'https://img.youtube.com/vi/R2-X_v4X_8A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=R2-X_v4X_8A',
      duration: '18:45',
      views: '450k',
      date: '1 year ago',
      category: 'nclex',
      author: 'RegisteredNurseRN'
    },
    {
      id: 'nclex-1-2',
      title: 'NCLEX Questions and Answers: NCLEX Review 2026',
      thumbnail: 'https://img.youtube.com/vi/0Wp6p9v3f9A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=0Wp6p9v3f9A',
      duration: '32:10',
      views: '890k',
      date: '6 months ago',
      category: 'nclex',
      author: 'Simple Nursing'
    },
    {
      id: 'nclex-1-3',
      title: 'NCLEX Question Breakdown: Prioritization & Delegation',
      thumbnail: 'https://img.youtube.com/vi/uD2vG6X_9_Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=uD2vG6X_9_Y',
      duration: '25:15',
      views: '320k',
      date: '2 years ago',
      category: 'nclex',
      author: 'Nexus Nursing'
    },

    // Topic 2: How I Passed the NCLEX in 30 Days
    {
      id: 'nclex-2-1',
      title: 'How I Passed NCLEX in 75 Questions (30 Day Plan)',
      thumbnail: 'https://img.youtube.com/vi/zH0Y8G_8_8Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=zH0Y8G_8_8Y',
      duration: '15:24',
      views: '1.2M',
      date: '1 year ago',
      category: 'nclex',
      author: 'Beautiful Nursing'
    },
    {
      id: 'nclex-2-2',
      title: 'My Exact NCLEX Study Schedule: 4 Weeks to Pass',
      thumbnail: 'https://img.youtube.com/vi/_3m-qW9I90o/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=_3m-qW9I90o',
      duration: '12:45',
      views: '150k',
      date: '8 months ago',
      category: 'nclex',
      author: 'Nurse Meg'
    },
    {
      id: 'nclex-2-3',
      title: 'How to Pass NCLEX-RN in 30 Days: Archer Review',
      thumbnail: 'https://img.youtube.com/vi/8-S_6e-o_fI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=8-S_6e-o_fI',
      duration: '20:30',
      views: '210k',
      date: '4 months ago',
      category: 'nclex',
      author: 'Archer Review'
    },

    // Topic 3: NCLEX Pharmacology
    {
      id: 'nclex-3-1',
      title: 'Pharmacology Made Easy: Top 50 Drugs for NCLEX',
      thumbnail: 'https://img.youtube.com/vi/0Wp6p9v3f9A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=0Wp6p9v3f9A',
      duration: '45:10',
      views: '2.5M',
      date: '2 years ago',
      category: 'nclex',
      author: 'Simple Nursing'
    },
    {
      id: 'nclex-3-2',
      title: 'Pharmacology Nursing: Cardiac Medications Review',
      thumbnail: 'https://img.youtube.com/vi/uD2vG6X_9_Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=uD2vG6X_9_Y',
      duration: '35:20',
      views: '1.1M',
      date: '3 years ago',
      category: 'nclex',
      author: 'RegisteredNurseRN'
    },
    {
      id: 'nclex-3-3',
      title: 'NCLEX Pharmacology: Psychotropic Medications',
      thumbnail: 'https://img.youtube.com/vi/R2-X_v4X_8A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=R2-X_v4X_8A',
      duration: '28:15',
      views: '450k',
      date: '1 year ago',
      category: 'nclex',
      author: 'Nexus Nursing'
    },

    // Topic 4: Why You’re Failing NCLEX Practice Exams
    {
      id: 'nclex-4-1',
      title: 'Why You Are Failing NCLEX Practice Questions',
      thumbnail: 'https://img.youtube.com/vi/zH0Y8G_8_8Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=zH0Y8G_8_8Y',
      duration: '14:20',
      views: '180k',
      date: '6 months ago',
      category: 'nclex',
      author: 'Nexus Nursing'
    },
    {
      id: 'nclex-4-2',
      title: 'How to Stop Failing NCLEX: Test Taking Strategies',
      thumbnail: 'https://img.youtube.com/vi/_3m-qW9I90o/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=_3m-qW9I90o',
      duration: '22:15',
      views: '340k',
      date: '1 year ago',
      category: 'nclex',
      author: 'Simple Nursing'
    },
    {
      id: 'nclex-4-3',
      title: 'NCLEX Failure: What to do if you fail the NCLEX',
      thumbnail: 'https://img.youtube.com/vi/8-S_6e-o_fI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=8-S_6e-o_fI',
      duration: '18:50',
      views: '120k',
      date: '2 years ago',
      category: 'nclex',
      author: 'RegisteredNurseRN'
    },

    // Topic 5: Next-Gen NCLEX: Case Studies
    {
      id: 'nclex-5-1',
      title: 'Next Generation NCLEX (NGN) Case Study Review',
      thumbnail: 'https://img.youtube.com/vi/R2-X_v4X_8A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=R2-X_v4X_8A',
      duration: '40:15',
      views: '560k',
      date: '1 year ago',
      category: 'nclex',
      author: 'RegisteredNurseRN'
    },
    {
      id: 'nclex-5-2',
      title: 'NGN Case Studies: How to Answer Case Study Questions',
      thumbnail: 'https://img.youtube.com/vi/0Wp6p9v3f9A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=0Wp6p9v3f9A',
      duration: '35:40',
      views: '420k',
      date: '8 months ago',
      category: 'nclex',
      author: 'Simple Nursing'
    },
    {
      id: 'nclex-5-3',
      title: 'Next Gen NCLEX Case Study Practice: Archer Review',
      thumbnail: 'https://img.youtube.com/vi/uD2vG6X_9_Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=uD2vG6X_9_Y',
      duration: '28:30',
      views: '280k',
      date: '5 months ago',
      category: 'nclex',
      author: 'Archer Review'
    },

    // Topic 6: Lab Values
    {
      id: 'nclex-6-1',
      title: 'Lab Values Nursing: NCLEX Review for Nurses',
      thumbnail: 'https://img.youtube.com/vi/uD2vG6X_9_Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=uD2vG6X_9_Y',
      duration: '22:10',
      views: '3.5M',
      date: '4 years ago',
      category: 'nclex',
      author: 'RegisteredNurseRN'
    },
    {
      id: 'nclex-6-2',
      title: 'Lab Values Made Easy: Electrolytes & CBC',
      thumbnail: 'https://img.youtube.com/vi/0Wp6p9v3f9A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=0Wp6p9v3f9A',
      duration: '30:45',
      views: '1.8M',
      date: '2 years ago',
      category: 'nclex',
      author: 'Simple Nursing'
    },
    {
      id: 'nclex-6-3',
      title: 'Lab Values for NCLEX: High Yield Review',
      thumbnail: 'https://img.youtube.com/vi/zH0Y8G_8_8Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=zH0Y8G_8_8Y',
      duration: '15:30',
      views: '450k',
      date: '1 year ago',
      category: 'nclex',
      author: 'Beautiful Nursing'
    },

    // Topic 7: Mnemonics
    {
      id: 'nclex-7-1',
      title: 'Nursing Mnemonics: Memory Tricks for NCLEX',
      thumbnail: 'https://img.youtube.com/vi/_3m-qW9I90o/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=_3m-qW9I90o',
      duration: '12:40',
      views: '890k',
      date: '3 years ago',
      category: 'nclex',
      author: 'Simple Nursing'
    },
    {
      id: 'nclex-7-2',
      title: 'Top 10 Nursing Mnemonics You Need to Know',
      thumbnail: 'https://img.youtube.com/vi/8-S_6e-o_fI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=8-S_6e-o_fI',
      duration: '10:15',
      views: '650k',
      date: '2 years ago',
      category: 'nclex',
      author: 'RegisteredNurseRN'
    },
    {
      id: 'nclex-7-3',
      title: 'Mnemonics for NCLEX: Pharmacology & Med-Surg',
      thumbnail: 'https://img.youtube.com/vi/R2-X_v4X_8A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=R2-X_v4X_8A',
      duration: '18:20',
      views: '230k',
      date: '1 year ago',
      category: 'nclex',
      author: 'Nexus Nursing'
    },

    // Topic 8: Reviews
    {
      id: 'nclex-8-1',
      title: 'UWorld vs Archer: Which NCLEX Prep is Better?',
      thumbnail: 'https://img.youtube.com/vi/zH0Y8G_8_8Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=zH0Y8G_8_8Y',
      duration: '22:45',
      views: '150k',
      date: '6 months ago',
      category: 'nclex',
      author: 'Nurse Meg'
    },
    {
      id: 'nclex-8-2',
      title: 'Is Saunders NCLEX Review Worth It? (Honest Review)',
      thumbnail: 'https://img.youtube.com/vi/_3m-qW9I90o/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=_3m-qW9I90o',
      duration: '15:10',
      views: '85k',
      date: '1 year ago',
      category: 'nclex',
      author: 'RegisteredNurseRN'
    },
    {
      id: 'nclex-8-3',
      title: 'Simple Nursing Review: Is it worth the money?',
      thumbnail: 'https://img.youtube.com/vi/8-S_6e-o_fI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=8-S_6e-o_fI',
      duration: '12:30',
      views: '45k',
      date: '3 months ago',
      category: 'nclex',
      author: 'Nurse Sarah'
    },

    // Category 2: Career & Salary
    // Topic 1: Top 10 Highest Paying Nursing Specialties
    {
      id: 'career-1-1',
      title: 'Top 10 Highest Paying Nursing Specialties in 2026',
      thumbnail: 'https://img.youtube.com/vi/_3m-qW9I90o/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=_3m-qW9I90o',
      duration: '15:45',
      views: '1.2M',
      date: '1 year ago',
      category: 'career',
      author: 'RegisteredNurseRN'
    },
    {
      id: 'career-1-2',
      title: 'Highest Paying Nursing Jobs in USA & Canada',
      thumbnail: 'https://img.youtube.com/vi/8-S_6e-o_fI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=8-S_6e-o_fI',
      duration: '18:20',
      views: '850k',
      date: '6 months ago',
      category: 'career',
      author: 'Nurse Sarah'
    },
    {
      id: 'career-1-3',
      title: 'Top 5 Highest Paying Nursing Careers',
      thumbnail: 'https://img.youtube.com/vi/0Wp6p9v3f9A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=0Wp6p9v3f9A',
      duration: '12:10',
      views: '450k',
      date: '2 years ago',
      category: 'career',
      author: 'Simple Nursing'
    },

    // Topic 2: Travel Nursing in 2026
    {
      id: 'career-2-1',
      title: 'Travel Nursing in 2026: Is it still worth it?',
      thumbnail: 'https://img.youtube.com/vi/zH0Y8G_8_8Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=zH0Y8G_8_8Y',
      duration: '22:15',
      views: '320k',
      date: '4 months ago',
      category: 'career',
      author: 'Nurse Meg'
    },
    {
      id: 'career-2-2',
      title: 'Travel Nursing Pay Rates & Stress Levels',
      thumbnail: 'https://img.youtube.com/vi/R2-X_v4X_8A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=R2-X_v4X_8A',
      duration: '25:40',
      views: '150k',
      date: '1 year ago',
      category: 'career',
      author: 'RegisteredNurseRN'
    },
    {
      id: 'career-2-3',
      title: 'The Truth About Travel Nursing in 2026',
      thumbnail: 'https://img.youtube.com/vi/uD2vG6X_9_Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=uD2vG6X_9_Y',
      duration: '18:50',
      views: '210k',
      date: '8 months ago',
      category: 'career',
      author: 'Simple Nursing'
    },

    // Topic 3: Negotiate $10k Bonus
    {
      id: 'career-3-1',
      title: 'How to Negotiate a $10k Sign-On Bonus',
      thumbnail: 'https://img.youtube.com/vi/uD2vG6X_9_Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=uD2vG6X_9_Y',
      duration: '14:30',
      views: '45k',
      date: '1 year ago',
      category: 'career',
      author: 'RegisteredNurseRN'
    },
    {
      id: 'career-3-2',
      title: 'Nursing Interview Tips: Negotiating Your Salary',
      thumbnail: 'https://img.youtube.com/vi/8-S_6e-o_fI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=8-S_6e-o_fI',
      duration: '16:15',
      views: '120k',
      date: '6 months ago',
      category: 'career',
      author: 'Nurse Sarah'
    },
    {
      id: 'career-3-3',
      title: 'How I Got a $15k Sign-On Bonus as a New Grad',
      thumbnail: 'https://img.youtube.com/vi/zH0Y8G_8_8Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=zH0Y8G_8_8Y',
      duration: '12:45',
      views: '85k',
      date: '2 years ago',
      category: 'career',
      author: 'Nurse Meg'
    },

    // Topic 4: Moving to Canada
    {
      id: 'career-4-1',
      title: 'Moving to Canada as a Nurse: Step-by-Step Guide',
      thumbnail: 'https://img.youtube.com/vi/8-S_6e-o_fI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=8-S_6e-o_fI',
      duration: '35:20',
      views: '250k',
      date: '1 year ago',
      category: 'career',
      author: 'Nurse Sarah'
    },
    {
      id: 'career-4-2',
      title: 'Nursing Immigration to Canada: My Experience',
      thumbnail: 'https://img.youtube.com/vi/zH0Y8G_8_8Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=zH0Y8G_8_8Y',
      duration: '28:10',
      views: '180k',
      date: '8 months ago',
      category: 'career',
      author: 'Nurse Meg'
    },
    {
      id: 'career-4-3',
      title: 'How to Get a Nursing License in Canada',
      thumbnail: 'https://img.youtube.com/vi/R2-X_v4X_8A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=R2-X_v4X_8A',
      duration: '22:45',
      views: '95k',
      date: '2 years ago',
      category: 'career',
      author: 'RegisteredNurseRN'
    },

    // Topic 5: ICU vs ER
    {
      id: 'career-5-1',
      title: 'ICU vs ER: Which Specialty is Right for You?',
      thumbnail: 'https://img.youtube.com/vi/R2-X_v4X_8A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=R2-X_v4X_8A',
      duration: '20:15',
      views: '560k',
      date: '3 years ago',
      category: 'career',
      author: 'RegisteredNurseRN'
    },
    {
      id: 'career-5-2',
      title: 'ER Nursing vs ICU Nursing: Pros and Cons',
      thumbnail: 'https://img.youtube.com/vi/0Wp6p9v3f9A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=0Wp6p9v3f9A',
      duration: '18:30',
      views: '420k',
      date: '1 year ago',
      category: 'career',
      author: 'Simple Nursing'
    },
    {
      id: 'career-5-3',
      title: 'ICU vs Emergency Room: High Stress Specialties',
      thumbnail: 'https://img.youtube.com/vi/8-S_6e-o_fI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=8-S_6e-o_fI',
      duration: '24:50',
      views: '280k',
      date: '6 months ago',
      category: 'career',
      author: 'Nurse Sarah'
    },

    // Topic 6: 5 Nursing Jobs No Bedside
    {
      id: 'career-6-1',
      title: '5 Nursing Jobs That Don’t Require Bedside Care',
      thumbnail: 'https://img.youtube.com/vi/8-S_6e-o_fI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=8-S_6e-o_fI',
      duration: '15:20',
      views: '1.5M',
      date: '2 years ago',
      category: 'career',
      author: 'Nurse Sarah'
    },
    {
      id: 'career-6-2',
      title: 'Non-Bedside Nursing Jobs: Remote & Office Roles',
      thumbnail: 'https://img.youtube.com/vi/zH0Y8G_8_8Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=zH0Y8G_8_8Y',
      duration: '12:45',
      views: '890k',
      date: '1 year ago',
      category: 'career',
      author: 'Nurse Meg'
    },
    {
      id: 'career-6-3',
      title: 'How to Leave Bedside Nursing: Top 10 Jobs',
      thumbnail: 'https://img.youtube.com/vi/R2-X_v4X_8A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=R2-X_v4X_8A',
      duration: '18:10',
      views: '450k',
      date: '3 years ago',
      category: 'career',
      author: 'RegisteredNurseRN'
    },

    // Topic 7: Nursing Resume AI Filters
    {
      id: 'career-7-1',
      title: 'How to Write a Nursing Resume That Beats AI Filters',
      thumbnail: 'https://img.youtube.com/vi/R2-X_v4X_8A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=R2-X_v4X_8A',
      duration: '14:20',
      views: '120k',
      date: '6 months ago',
      category: 'career',
      author: 'RegisteredNurseRN'
    },
    {
      id: 'career-7-2',
      title: 'Nursing Resume Tips: Keywords for ATS',
      thumbnail: 'https://img.youtube.com/vi/8-S_6e-o_fI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=8-S_6e-o_fI',
      duration: '16:45',
      views: '85k',
      date: '1 year ago',
      category: 'career',
      author: 'Nurse Sarah'
    },
    {
      id: 'career-7-3',
      title: 'The Perfect Nursing Resume Template 2026',
      thumbnail: 'https://img.youtube.com/vi/zH0Y8G_8_8Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=zH0Y8G_8_8Y',
      duration: '12:30',
      views: '210k',
      date: '2 years ago',
      category: 'career',
      author: 'Nurse Meg'
    },

    // Topic 8: Why I Left Bedside
    {
      id: 'career-8-1',
      title: 'Why I Left Bedside Nursing (Honest Truth)',
      thumbnail: 'https://img.youtube.com/vi/8-S_6e-o_fI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=8-S_6e-o_fI',
      duration: '22:15',
      views: '2.1M',
      date: '1 year ago',
      category: 'career',
      author: 'Nurse Sarah'
    },
    {
      id: 'career-8-2',
      title: 'The Reality of Nursing Burnout: Why I Quit',
      thumbnail: 'https://img.youtube.com/vi/zH0Y8G_8_8Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=zH0Y8G_8_8Y',
      duration: '18:40',
      views: '1.5M',
      date: '2 years ago',
      category: 'career',
      author: 'Nurse Meg'
    },
    {
      id: 'career-8-3',
      title: 'Leaving Bedside Nursing for a Better Life',
      thumbnail: 'https://img.youtube.com/vi/R2-X_v4X_8A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=R2-X_v4X_8A',
      duration: '25:10',
      views: '890k',
      date: '3 years ago',
      category: 'career',
      author: 'RegisteredNurseRN'
    },

    // Category 3: Lifestyle & "Day in the Life"
    // Topic 1: Day in the Life: ICU Nurse
    {
      id: 'vlog-1-1',
      title: 'Day in the Life: ICU Nurse (12-Hour Night Shift)',
      thumbnail: 'https://img.youtube.com/vi/zH0Y8G_8_8Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=zH0Y8G_8_8Y',
      duration: '18:45',
      views: '1.5M',
      date: '1 year ago',
      category: 'vlog',
      author: 'Beautiful Nursing'
    },
    {
      id: 'vlog-1-2',
      title: 'ICU Nurse Night Shift Reality: 12 Hours',
      thumbnail: 'https://img.youtube.com/vi/_3m-qW9I90o/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=_3m-qW9I90o',
      duration: '22:10',
      views: '890k',
      date: '6 months ago',
      category: 'vlog',
      author: 'Nurse Meg'
    },
    {
      id: 'vlog-1-3',
      title: 'A Day in the Life of an ICU Nurse',
      thumbnail: 'https://img.youtube.com/vi/8-S_6e-o_fI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=8-S_6e-o_fI',
      duration: '15:30',
      views: '2.1M',
      date: '2 years ago',
      category: 'vlog',
      author: 'Nurse Sarah'
    },

    // Topic 2: What’s in My Nursing Bag?
    {
      id: 'vlog-2-1',
      title: 'What’s in My Nursing Bag? (2026 Essentials)',
      thumbnail: 'https://img.youtube.com/vi/R2-X_v4X_8A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=R2-X_v4X_8A',
      duration: '12:15',
      views: '450k',
      date: '1 year ago',
      category: 'vlog',
      author: 'RegisteredNurseRN'
    },
    {
      id: 'vlog-2-2',
      title: 'Nursing Bag Essentials: What I Carry Every Shift',
      thumbnail: 'https://img.youtube.com/vi/0Wp6p9v3f9A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=0Wp6p9v3f9A',
      duration: '10:45',
      views: '320k',
      date: '8 months ago',
      category: 'vlog',
      author: 'Simple Nursing'
    },
    {
      id: 'vlog-2-3',
      title: 'My Nursing Bag Tour: Must-Have Gear',
      thumbnail: 'https://img.youtube.com/vi/uD2vG6X_9_Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=uD2vG6X_9_Y',
      duration: '14:20',
      views: '150k',
      date: '2 years ago',
      category: 'vlog',
      author: 'Nexus Nursing'
    },

    // Topic 3: 7 Things I Wish I Knew
    {
      id: 'vlog-3-1',
      title: '7 Things I Wish I Knew Before My First Shift',
      thumbnail: 'https://img.youtube.com/vi/zH0Y8G_8_8Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=zH0Y8G_8_8Y',
      duration: '15:40',
      views: '890k',
      date: '1 year ago',
      category: 'vlog',
      author: 'Beautiful Nursing'
    },
    {
      id: 'vlog-3-2',
      title: 'Advice for Your First Nursing Shift',
      thumbnail: 'https://img.youtube.com/vi/_3m-qW9I90o/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=_3m-qW9I90o',
      duration: '12:15',
      views: '450k',
      date: '6 months ago',
      category: 'vlog',
      author: 'Nurse Meg'
    },
    {
      id: 'vlog-3-3',
      title: 'First Day as a Nurse: What to Expect',
      thumbnail: 'https://img.youtube.com/vi/8-S_6e-o_fI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=8-S_6e-o_fI',
      duration: '18:30',
      views: '1.2M',
      date: '2 years ago',
      category: 'vlog',
      author: 'Nurse Sarah'
    },

    // Topic 4: Post-Shift Decompression
    {
      id: 'vlog-4-1',
      title: 'How I Stay Sane: My Post-Shift Routine',
      thumbnail: 'https://img.youtube.com/vi/R2-X_v4X_8A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=R2-X_v4X_8A',
      duration: '10:20',
      views: '230k',
      date: '1 year ago',
      category: 'vlog',
      author: 'RegisteredNurseRN'
    },
    {
      id: 'vlog-4-2',
      title: 'Nursing Self Care: Decompressing After a Shift',
      thumbnail: 'https://img.youtube.com/vi/0Wp6p9v3f9A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=0Wp6p9v3f9A',
      duration: '12:45',
      views: '180k',
      date: '8 months ago',
      category: 'vlog',
      author: 'Simple Nursing'
    },
    {
      id: 'vlog-4-3',
      title: 'My Post-Shift Decompression Routine',
      thumbnail: 'https://img.youtube.com/vi/uD2vG6X_9_Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=uD2vG6X_9_Y',
      duration: '15:10',
      views: '95k',
      date: '2 years ago',
      category: 'vlog',
      author: 'Nexus Nursing'
    },

    // Topic 5: Nursing School vs Real World
    {
      id: 'vlog-5-1',
      title: 'Nursing School vs. Real World: 5 Differences',
      thumbnail: 'https://img.youtube.com/vi/zH0Y8G_8_8Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=zH0Y8G_8_8Y',
      duration: '14:30',
      views: '1.5M',
      date: '1 year ago',
      category: 'vlog',
      author: 'Beautiful Nursing'
    },
    {
      id: 'vlog-5-2',
      title: 'The Reality of Nursing: School vs Job',
      thumbnail: 'https://img.youtube.com/vi/_3m-qW9I90o/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=_3m-qW9I90o',
      duration: '16:15',
      views: '890k',
      date: '6 months ago',
      category: 'vlog',
      author: 'Nurse Meg'
    },
    {
      id: 'vlog-5-3',
      title: 'Nursing School vs Reality: What they don’t tell you',
      thumbnail: 'https://img.youtube.com/vi/8-S_6e-o_fI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=8-S_6e-o_fI',
      duration: '12:45',
      views: '2.1M',
      date: '2 years ago',
      category: 'vlog',
      author: 'Nurse Sarah'
    },

    // Topic 6: 5 Mistakes New Grad Nurses Make
    {
      id: 'vlog-6-1',
      title: '5 Mistakes New Grad Nurses Make',
      thumbnail: 'https://img.youtube.com/vi/R2-X_v4X_8A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=R2-X_v4X_8A',
      duration: '18:20',
      views: '1.2M',
      date: '1 year ago',
      category: 'vlog',
      author: 'RegisteredNurseRN'
    },
    {
      id: 'vlog-6-2',
      title: 'New Grad Nursing Tips: Avoid These Mistakes',
      thumbnail: 'https://img.youtube.com/vi/0Wp6p9v3f9A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=0Wp6p9v3f9A',
      duration: '15:45',
      views: '850k',
      date: '8 months ago',
      category: 'vlog',
      author: 'Simple Nursing'
    },
    {
      id: 'vlog-6-3',
      title: 'Common Mistakes New Nurses Make',
      thumbnail: 'https://img.youtube.com/vi/uD2vG6X_9_Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=uD2vG6X_9_Y',
      duration: '12:10',
      views: '450k',
      date: '2 years ago',
      category: 'vlog',
      author: 'Nexus Nursing'
    },

    // Topic 7: Nurses Eating Their Young
    {
      id: 'vlog-7-1',
      title: 'Dealing with "Nurses Eating Their Young"',
      thumbnail: 'https://img.youtube.com/vi/zH0Y8G_8_8Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=zH0Y8G_8_8Y',
      duration: '20:15',
      views: '320k',
      date: '1 year ago',
      category: 'vlog',
      author: 'Beautiful Nursing'
    },
    {
      id: 'vlog-7-2',
      title: 'Nursing Bullying: How to Handle Toxic Coworkers',
      thumbnail: 'https://img.youtube.com/vi/_3m-qW9I90o/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=_3m-qW9I90o',
      duration: '18:30',
      views: '150k',
      date: '6 months ago',
      category: 'vlog',
      author: 'Nurse Meg'
    },
    {
      id: 'vlog-7-3',
      title: 'Workplace Culture in Nursing: My Advice',
      thumbnail: 'https://img.youtube.com/vi/8-S_6e-o_fI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=8-S_6e-o_fI',
      duration: '25:40',
      views: '210k',
      date: '2 years ago',
      category: 'vlog',
      author: 'Nurse Sarah'
    },

    // Topic 8: Why I Almost Quit Nursing
    {
      id: 'vlog-8-1',
      title: 'Why I Almost Quit Nursing (And Why I Stayed)',
      thumbnail: 'https://img.youtube.com/vi/R2-X_v4X_8A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=R2-X_v4X_8A',
      duration: '22:45',
      views: '2.5M',
      date: '1 year ago',
      category: 'vlog',
      author: 'RegisteredNurseRN'
    },
    {
      id: 'vlog-8-2',
      title: 'The Truth About Nursing Burnout',
      thumbnail: 'https://img.youtube.com/vi/0Wp6p9v3f9A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=0Wp6p9v3f9A',
      duration: '15:10',
      views: '1.1M',
      date: '8 months ago',
      category: 'vlog',
      author: 'Simple Nursing'
    },
    {
      id: 'vlog-8-3',
      title: 'Why I Stayed in Nursing: My Story',
      thumbnail: 'https://img.youtube.com/vi/uD2vG6X_9_Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=uD2vG6X_9_Y',
      duration: '28:15',
      views: '450k',
      date: '2 years ago',
      category: 'vlog',
      author: 'Nexus Nursing'
    },

    // Category 4: Passive Income & Finance
    // Topic 1: How I Made $5,000/mo Passive Income
    {
      id: 'finance-1-1',
      title: 'How I Made $5,000/mo Passive Income as a Registered Nurse',
      thumbnail: 'https://img.youtube.com/vi/R2-X_v4X_8A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=R2-X_v4X_8A',
      duration: '15:45',
      views: '1.2M',
      date: '1 year ago',
      category: 'finance',
      author: 'RegisteredNurseRN'
    },
    {
      id: 'finance-1-2',
      title: 'Passive Income for Nurses: My $5k/Month Strategy',
      thumbnail: 'https://img.youtube.com/vi/zH0Y8G_8_8Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=zH0Y8G_8_8Y',
      duration: '18:20',
      views: '850k',
      date: '6 months ago',
      category: 'finance',
      author: 'Nurse Meg'
    },
    {
      id: 'finance-1-3',
      title: 'How to Build Passive Income in Nursing',
      thumbnail: 'https://img.youtube.com/vi/8-S_6e-o_fI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=8-S_6e-o_fI',
      duration: '12:10',
      views: '450k',
      date: '2 years ago',
      category: 'finance',
      author: 'Nurse Sarah'
    },

    // Topic 2: 5 Profitable Side Hustles for Nurses
    {
      id: 'finance-2-1',
      title: '5 Profitable Side Hustles for Nurses (No Extra Schooling)',
      thumbnail: 'https://img.youtube.com/vi/0Wp6p9v3f9A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=0Wp6p9v3f9A',
      duration: '14:30',
      views: '2.1M',
      date: '1 year ago',
      category: 'finance',
      author: 'Simple Nursing'
    },
    {
      id: 'finance-2-2',
      title: 'Top 5 Nursing Side Hustles for 2026',
      thumbnail: 'https://img.youtube.com/vi/uD2vG6X_9_Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=uD2vG6X_9_Y',
      duration: '12:45',
      views: '1.5M',
      date: '8 months ago',
      category: 'finance',
      author: 'Nexus Nursing'
    },
    {
      id: 'finance-2-3',
      title: 'Best Side Hustles for Registered Nurses',
      thumbnail: 'https://img.youtube.com/vi/zH0Y8G_8_8Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=zH0Y8G_8_8Y',
      duration: '16:15',
      views: '890k',
      date: '2 years ago',
      category: 'finance',
      author: 'Beautiful Nursing'
    },

    // Topic 3: How to Start a Nursing Blog/YouTube Channel
    {
      id: 'finance-3-1',
      title: 'How to Start a Nursing Blog/YouTube Channel in 2026',
      thumbnail: 'https://img.youtube.com/vi/8-S_6e-o_fI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=8-S_6e-o_fI',
      duration: '22:10',
      views: '120k',
      date: '1 year ago',
      category: 'finance',
      author: 'Nurse Sarah'
    },
    {
      id: 'finance-3-2',
      title: 'Starting a Nursing YouTube Channel: Step-by-Step',
      thumbnail: 'https://img.youtube.com/vi/R2-X_v4X_8A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=R2-X_v4X_8A',
      duration: '25:40',
      views: '85k',
      date: '6 months ago',
      category: 'finance',
      author: 'RegisteredNurseRN'
    },
    {
      id: 'finance-3-3',
      title: 'How I Built a Profitable Nursing Blog',
      thumbnail: 'https://img.youtube.com/vi/_3m-qW9I90o/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=_3m-qW9I90o',
      duration: '18:50',
      views: '210k',
      date: '2 years ago',
      category: 'finance',
      author: 'Nurse Meg'
    },

    // Topic 4: Investing for Nurses
    {
      id: 'finance-4-1',
      title: 'Investing for Nurses: How to Retire Early',
      thumbnail: 'https://img.youtube.com/vi/0Wp6p9v3f9A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=0Wp6p9v3f9A',
      duration: '20:15',
      views: '560k',
      date: '1 year ago',
      category: 'finance',
      author: 'Simple Nursing'
    },
    {
      id: 'finance-4-2',
      title: 'Nurse Retirement Planning: Investing 101',
      thumbnail: 'https://img.youtube.com/vi/uD2vG6X_9_Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=uD2vG6X_9_Y',
      duration: '15:30',
      views: '420k',
      date: '8 months ago',
      category: 'finance',
      author: 'Nexus Nursing'
    },
    {
      id: 'finance-4-3',
      title: 'How to Retire Early on a Nurse’s Salary',
      thumbnail: 'https://img.youtube.com/vi/R2-X_v4X_8A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=R2-X_v4X_8A',
      duration: '24:50',
      views: '280k',
      date: '2 years ago',
      category: 'finance',
      author: 'RegisteredNurseRN'
    },

    // Topic 5: Turning Expertise into an Online Course
    {
      id: 'finance-5-1',
      title: 'Turning Your Nursing Expertise into an Online Course',
      thumbnail: 'https://img.youtube.com/vi/_3m-qW9I90o/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=_3m-qW9I90o',
      duration: '18:45',
      views: '45k',
      date: '1 year ago',
      category: 'finance',
      author: 'Nurse Meg'
    },
    {
      id: 'finance-5-2',
      title: 'Create and Sell Your Own Nursing Course',
      thumbnail: 'https://img.youtube.com/vi/8-S_6e-o_fI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=8-S_6e-o_fI',
      duration: '22:10',
      views: '120k',
      date: '6 months ago',
      category: 'finance',
      author: 'Nurse Sarah'
    },
    {
      id: 'finance-5-3',
      title: 'Monetizing Your Nursing Knowledge Online',
      thumbnail: 'https://img.youtube.com/vi/zH0Y8G_8_8Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=zH0Y8G_8_8Y',
      duration: '15:30',
      views: '85k',
      date: '2 years ago',
      category: 'finance',
      author: 'Beautiful Nursing'
    },

    // Topic 6: 2026 Nursing Trends
    {
      id: 'finance-6-1',
      title: '2026 Nursing Trends: Where the Money is Moving',
      thumbnail: 'https://img.youtube.com/vi/R2-X_v4X_8A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=R2-X_v4X_8A',
      duration: '14:20',
      views: '1.5M',
      date: '1 year ago',
      category: 'finance',
      author: 'RegisteredNurseRN'
    },
    {
      id: 'finance-6-2',
      title: 'The Future of Nursing Pay: 2026 Trends',
      thumbnail: 'https://img.youtube.com/vi/0Wp6p9v3f9A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=0Wp6p9v3f9A',
      duration: '16:45',
      views: '890k',
      date: '8 months ago',
      category: 'finance',
      author: 'Simple Nursing'
    },
    {
      id: 'finance-6-3',
      title: 'Highest Paying Nursing Trends in 2026',
      thumbnail: 'https://img.youtube.com/vi/uD2vG6X_9_Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=uD2vG6X_9_Y',
      duration: '12:30',
      views: '450k',
      date: '2 years ago',
      category: 'finance',
      author: 'Nexus Nursing'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Videos' },
    { id: 'nclex', name: 'NCLEX Mastery' },
    { id: 'vlog', name: 'Vlogs' },
    { id: 'career', name: 'Career Advice' },
    { id: 'clinical', name: 'Clinical Skills' },
    { id: 'finance', name: 'Passive Income' },
  ];

  const filteredVideos = videos.filter(v => {
    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-slate-900 min-h-screen pt-12 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2 text-red-500 font-bold text-sm uppercase tracking-widest mb-4">
              <Youtube className="w-5 h-5" />
              <span>NurseNow Video Hub</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">Learn Visually with Our <br /> <span className="text-blue-400">Expert-Led Video Content</span></h1>
            <p className="mt-6 text-slate-400 text-lg leading-relaxed">
              From clinical procedures to career coaching, our video hub brings the best nursing education directly to your screen.
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl text-center">
              <div className="text-3xl font-bold text-white">50k+</div>
              <div className="text-slate-400 text-sm mt-1 uppercase tracking-wider">Subscribers</div>
              <button className="mt-6 bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center space-x-2 mx-auto">
                <Youtube className="w-5 h-5" />
                <span>Subscribe</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title or author..."
              className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-white placeholder-slate-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-full font-bold transition-all ${
                selectedCategory === cat.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link 
                href={video.url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-white fill-current" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded text-xs font-bold">
                    {video.duration}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-bold leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-slate-400 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center font-bold text-xs text-slate-300">
                        {video.author[0]}
                      </div>
                      <span>{video.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>{video.views} views</span>
                    </div>
                  </div>
                </div>
              </Link>
              {/* Strategic CTA based on category */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                {video.category === 'nclex' ? (
                  <Link href="/courses" className="text-xs font-bold text-blue-400 flex items-center hover:underline">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    <span>Join NCLEX Prep Course</span>
                  </Link>
                ) : video.category === 'career' ? (
                  <Link href="/jobs" className="text-xs font-bold text-green-400 flex items-center hover:underline">
                    <Briefcase className="w-3 h-3 mr-1" />
                    <span>View Open Nursing Jobs</span>
                  </Link>
                ) : (
                  <Link href="/tools" className="text-xs font-bold text-amber-400 flex items-center hover:underline">
                    <Download className="w-3 h-3 mr-1" />
                    <span>Download Free Study Guide</span>
                  </Link>
                )}

                {/* Social Sharing Buttons */}
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(video.title)}&url=${encodeURIComponent(video.url)}`, '_blank')}
                    className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition-all"
                    title="Share on Twitter"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(video.url)}`, '_blank')}
                    className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-700 transition-all"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(video.url)}`, '_blank')}
                    className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-slate-700 transition-all"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => window.open(video.url, '_blank')}
                    className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-700 transition-all"
                    title="Watch on YouTube"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Free Resources Section (Middle of Funnel) */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="flex items-center space-x-2 text-blue-400 font-bold text-sm uppercase tracking-widest mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Middle of Funnel</span>
              </div>
              <h2 className="text-3xl font-display font-bold">Free Resources <br /> for Every Nurse</h2>
              <p className="mt-4 text-slate-400 leading-relaxed">
                We don&apos;t just make videos. We provide the tools you need to succeed in your shifts and your exams.
              </p>
              <Link href="/tools" className="mt-8 inline-flex items-center space-x-2 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all border border-slate-700">
                <span>View All Tools</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'NCLEX Cheat Sheet', desc: 'The 50 most common drugs on the exam.', icon: FileText, color: 'text-red-400', bg: 'bg-red-400/10' },
              { title: 'Resume Template', desc: 'ATS-friendly nursing resume guide.', icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { title: 'IV Insertion Guide', desc: 'Step-by-step clinical procedure PDF.', icon: Star, color: 'text-amber-400', bg: 'bg-amber-400/10' },
              { title: 'Interview Questions', desc: 'Top 25 nursing interview answers.', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            ].map((resource, i) => (
              <div key={i} className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 hover:border-slate-600 transition-all group">
                <div className={`w-12 h-12 ${resource.bg} ${resource.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <resource.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{resource.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{resource.desc}</p>
                <button className="text-sm font-bold text-blue-400 flex items-center hover:underline">
                  <Download className="w-4 h-4 mr-1" />
                  <span>Download PDF</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Playlist */}
        <div className="mt-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] p-12 border border-slate-700 relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold">Featured Playlist: <br /> <span className="text-blue-400">NCLEX Mastery Series</span></h2>
              <p className="mt-6 text-slate-400 text-lg leading-relaxed">
                Everything you need to pass the NCLEX-RN on your first attempt. 20+ hours of high-yield content covering every major topic.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Pharmacology Fundamentals',
                  'Fluid and Electrolytes Made Easy',
                  'Prioritization and Delegation',
                  'Acid-Base Balance Review'
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    <span className="text-slate-300 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <button className="mt-10 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-xl flex items-center space-x-2">
                <span>Start Watching Series</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-video bg-slate-700 rounded-xl overflow-hidden border border-slate-600 relative group cursor-pointer">
                  <Image
                    src={`https://picsum.photos/seed/playlist${i}/400/225`}
                    alt="Playlist Video"
                    fill
                    className="object-cover opacity-60 group-hover:opacity-100 transition-all"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white fill-current" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10" />
        </div>
      </div>
    </div>
  );
}
