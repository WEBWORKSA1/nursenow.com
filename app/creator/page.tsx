'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Youtube, LayoutDashboard, Target, TrendingUp, 
  Plus, FileText, Play, Users, DollarSign, 
  ArrowRight, CheckCircle2, Sparkles, Loader2,
  ChevronRight, Calendar, MessageSquare, Share2,
  BarChart3, MousePointer2, ShoppingCart, BookOpen,
  Clock, Smartphone, Mail, Instagram
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { db, OperationType, handleFirestoreError } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';

interface VideoIdea {
  id: string;
  title: string;
  category: 'nclex' | 'career' | 'vlog' | 'finance';
  status: 'idea' | 'scripting' | 'filming' | 'editing' | 'published';
  platform: 'youtube' | 'tiktok' | 'instagram' | 'email';
  hook?: string;
  value?: string;
  cta?: string;
  targetLink?: string;
  scheduledDate?: string;
  createdAt: any;
}

export default function CreatorDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('strategy');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026 as per context

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const importTemplateIdeas = async () => {
    if (!user) return;
    setImporting(true);
    const templateIdeas = [
      { title: "5 NCLEX Questions That Trip Everyone Up", category: "nclex", platform: "youtube" },
      { title: "How I Passed the NCLEX in 30 Days", category: "nclex", platform: "youtube" },
      { title: "NCLEX Pharmacology: 10 Drugs You MUST Know", category: "nclex", platform: "tiktok" },
      { title: "Top 10 Highest Paying Nursing Specialties", category: "career", platform: "youtube" },
      { title: "Travel Nursing in 2026: Is it Still Worth it?", category: "career", platform: "instagram" },
      { title: "Day in the Life: ICU Nurse (12-Hour Shift)", category: "vlog", platform: "youtube" },
      { title: "How I Made $5,000/mo Passive Income as a Nurse", category: "finance", platform: "email" },
      { title: "5 Mistakes New Grad Nurses Make", category: "career", platform: "tiktok" },
      { title: "Dealing with 'Nurses Eating Their Young'", category: "vlog", platform: "instagram" },
    ];

    try {
      for (const idea of templateIdeas) {
        await addDoc(collection(db, 'video_ideas'), {
          ...idea,
          status: 'idea',
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          scheduledDate: ''
        });
      }
      setActiveTab('planner');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'video_ideas');
    } finally {
      setImporting(false);
    }
  };
  const [videoIdeas, setVideoIdeas] = useState<VideoIdea[]>([]);
  const [newIdea, setNewIdea] = useState({
    title: '',
    category: 'nclex' as const,
    status: 'idea' as const,
    platform: 'youtube' as const,
    hook: '',
    value: '',
    cta: '',
    targetLink: '',
    scheduledDate: ''
  });

  // Stats for the funnel
  const stats = {
    topOfFunnel: { views: '125k', subscribers: '12.4k', growth: '+15%' },
    middleOfFunnel: { webVisits: '45k', jobClicks: '8.2k', conversion: '18.2%' },
    bottomOfFunnel: { courseSales: '$12,450', adRevenue: '$2,100', total: '$14,550' }
  };

  useEffect(() => {
    if (!user || profile?.role !== 'admin') return;

    const q = query(collection(db, 'video_ideas'), where('createdBy', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ideas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoIdea));
      setVideoIdeas(ideas);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'video_ideas'));

    return () => unsubscribe();
  }, [user, profile]);

  const addVideoIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'video_ideas'), {
        ...newIdea,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      setNewIdea({
        title: '',
        category: 'nclex',
        status: 'idea',
        platform: 'youtube',
        hook: '',
        value: '',
        cta: '',
        targetLink: '',
        scheduledDate: ''
      });
      setActiveTab('planner');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'video_ideas');
    } finally {
      setLoading(false);
    }
  };

  const updateIdeaStatus = async (id: string, status: VideoIdea['status']) => {
    try {
      await updateDoc(doc(db, 'video_ideas', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'video_ideas');
    }
  };

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Youtube className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Marketing Hub Access Only</h2>
          <p className="text-slate-600 mt-4">This dashboard is reserved for the NurseNow marketing and content strategy team.</p>
          <button className="mt-8 w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center space-x-2 text-red-600 font-bold text-sm uppercase tracking-widest mb-2">
              <Sparkles className="w-4 h-4" />
              <span>The NurseNow Funnel</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-slate-900">Marketing Hub</h1>
            <p className="text-slate-600 mt-2">Manage your content strategy, marketing playbook, and content calendar.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue (MTD)</div>
              <div className="text-2xl font-bold text-slate-900">{stats.bottomOfFunnel.total}</div>
            </div>
          </div>
        </div>

        {/* Funnel Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-red-100 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Youtube className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-red-100 uppercase tracking-wider">Top of Funnel (YouTube)</div>
              <div className="text-4xl font-bold mt-2">{stats.topOfFunnel.views}</div>
              <div className="mt-4 flex items-center text-red-100 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" /> {stats.topOfFunnel.growth} growth this month
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Youtube className="w-40 h-40" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <MousePointer2 className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-blue-100 uppercase tracking-wider">Middle (Website Traffic)</div>
              <div className="text-4xl font-bold mt-2">{stats.middleOfFunnel.webVisits}</div>
              <div className="mt-4 flex items-center text-blue-100 text-sm font-medium">
                <Users className="w-4 h-4 mr-1" /> {stats.middleOfFunnel.conversion} conversion rate
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <LayoutDashboard className="w-40 h-40" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-emerald-100 uppercase tracking-wider">Bottom (Monetization)</div>
              <div className="text-4xl font-bold mt-2">{stats.bottomOfFunnel.courseSales}</div>
              <div className="mt-4 flex items-center text-emerald-100 text-sm font-medium">
                <ShoppingCart className="w-4 h-4 mr-1" /> Course Sales + Ad Revenue
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <TrendingUp className="w-40 h-40" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 bg-white p-1 rounded-2xl border border-slate-200 mb-12 w-fit">
          {[
            { id: 'strategy', label: 'Funnel Strategy', icon: Target },
            { id: 'playbook', label: 'Marketing Playbook', icon: BookOpen },
            { id: 'calendar', label: 'Content Calendar', icon: Calendar },
            { id: 'templates', label: 'Script Templates', icon: FileText },
            { id: 'planner', label: 'Content Planner', icon: LayoutDashboard },
            { id: 'add', label: 'New Video Idea', icon: Plus },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'playbook' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                  <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                    <Smartphone className="w-6 h-6 mr-3 text-blue-600" />
                    Short-Form Playbook (TikTok/Reels)
                  </h3>
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <h4 className="font-bold text-slate-900 mb-2">The &quot;Day in the Life&quot; Formula</h4>
                      <p className="text-slate-600 text-sm">Fast cuts, trending audio, and relatable nursing struggles. Goal: 10k views/video.</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <h4 className="font-bold text-slate-900 mb-2">The &quot;NCLEX Hack&quot; Series</h4>
                      <p className="text-slate-600 text-sm">One mnemonic per video. High shareability. CTA to the full course.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                  <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                    <Mail className="w-6 h-6 mr-3 text-emerald-600" />
                    Email Marketing Playbook
                  </h3>
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <h4 className="font-bold text-slate-900 mb-2">Weekly Newsletter: &quot;The Night Shift&quot;</h4>
                      <p className="text-slate-600 text-sm">Curated job listings, one clinical tip, and a student highlight.</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <h4 className="font-bold text-slate-900 mb-2">Abandoned Cart Sequence</h4>
                      <p className="text-slate-600 text-sm">3-email flow for NCLEX course dropouts. 15% recovery target.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                  <Target className="w-6 h-6 mr-3 text-amber-500" />
                  Brand Voice & Guidelines
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-widest text-slate-400">Tone</h4>
                    <p className="text-slate-700">Empathetic, authoritative, yet relatable. We are the &quot;big sister/brother&quot; in nursing.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-widest text-slate-400">Visuals</h4>
                    <p className="text-slate-700">Clean, high-contrast, blue/white/slate palette. Real photos over stock images.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-widest text-slate-400">Mission</h4>
                    <p className="text-slate-700">To bridge the gap between nursing school and a successful, high-paying career.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                    <FileText className="w-6 h-6 mr-3 text-red-600" />
                    Script Templates
                  </h3>
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Proven Formats</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {/* The Authority Template */}
                  <div className="bg-slate-50 rounded-[2.5rem] border border-slate-200 overflow-hidden">
                    <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-bold">The &quot;Authority&quot; Template</h4>
                        <p className="text-slate-400 text-sm mt-1">Best for NCLEX Prep & Clinical Expertise</p>
                      </div>
                      <button 
                        onClick={() => {
                          setNewIdea({
                            ...newIdea,
                            title: 'NCLEX Authority Video',
                            hook: 'Did you know that 1 in 5 nursing students fail their first NCLEX attempt? It’s not because they aren\'t smart—it\'s because they\'re studying the wrong way. Today, I’m giving you the 3-step framework I used to pass in 75 questions.',
                            value: 'Pillar 1: The Concept (The \'Why\')\nPillar 2: The Strategy (The \'How\')\nPillar 3: The Pro-Tip (The \'Secret Sauce\')\n\nEngagement: "If this is helpful, hit that like button so I know to make more NCLEX prep videos for you guys."',
                            cta: 'The Bridge: "Now, these tips are just the tip of the iceberg."\nThe Offer: "If you want my full, deep-dive study guides and practice exams, I’ve put them all together in the NurseNow NCLEX Mastery Course. You can find that at NurseNow.com/courses."\nThe Secondary CTA: "And if you’re looking for your next high-paying specialty, check out our job board at NurseNow.com."'
                          });
                          setActiveTab('add');
                        }}
                        className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-red-700 transition-all"
                      >
                        Use Template
                      </button>
                    </div>
                    <div className="p-8 space-y-8">
                      <div className="flex gap-8">
                        <div className="w-32 flex-shrink-0">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Timing</div>
                          <div className="text-lg font-bold text-slate-900">0:00 - 0:45</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">1. The Hook</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="p-4 bg-white rounded-2xl border border-slate-100">
                              <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Visual</div>
                              <p className="text-slate-700 text-sm italic">Fast-paced B-roll of a hospital or a clear graphic of a &quot;failed&quot; exam score.</p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border border-slate-100">
                              <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Script</div>
                              <p className="text-slate-900 text-sm font-medium leading-relaxed">
                                &quot;Did you know that 1 in 5 nursing students fail their first NCLEX attempt? It’s not because they aren&apos;t smart—it&apos;s because they&apos;re studying the wrong way. Today, I’m giving you the 3-step framework I used to pass in 75 questions.&quot;
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-8">
                        <div className="w-32 flex-shrink-0">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Timing</div>
                          <div className="text-lg font-bold text-slate-900">0:45 - 8:00</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">2. The Value</div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="p-4 bg-white rounded-2xl border border-slate-100">
                              <div className="text-[10px] font-bold text-blue-400 uppercase mb-2">Pillar 1</div>
                              <p className="text-slate-900 text-sm font-bold">The Concept</p>
                              <p className="text-slate-500 text-xs mt-1">The &quot;Why&quot; behind the strategy.</p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border border-slate-100">
                              <div className="text-[10px] font-bold text-blue-400 uppercase mb-2">Pillar 2</div>
                              <p className="text-slate-900 text-sm font-bold">The Strategy</p>
                              <p className="text-slate-500 text-xs mt-1">The &quot;How&quot; - actionable steps.</p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border border-slate-100">
                              <div className="text-[10px] font-bold text-blue-400 uppercase mb-2">Pillar 3</div>
                              <p className="text-slate-900 text-sm font-bold">The Pro-Tip</p>
                              <p className="text-slate-500 text-xs mt-1">The &quot;Secret Sauce&quot; for success.</p>
                            </div>
                          </div>
                          <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">Engagement Hook</div>
                            <p className="text-blue-900 text-sm italic">&quot;If this is helpful, hit that like button so I know to make more NCLEX prep videos for you guys.&quot;</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-8">
                        <div className="w-32 flex-shrink-0">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Timing</div>
                          <div className="text-lg font-bold text-slate-900">8:00 - 10:00</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">3. The CTA</div>
                          <div className="space-y-4 mt-4">
                            <div className="p-4 bg-white rounded-2xl border border-slate-100">
                              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">The Bridge</div>
                              <p className="text-slate-900 text-sm font-medium">&quot;Now, these tips are just the tip of the iceberg.&quot;</p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                              <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">The Offer</div>
                              <p className="text-emerald-900 text-sm font-bold">&quot;If you want my full, deep-dive study guides and practice exams, I’ve put them all together in the NurseNow NCLEX Mastery Course. You can find that at NurseNow.com/courses.&quot;</p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border border-slate-100">
                              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Secondary CTA</div>
                              <p className="text-slate-900 text-sm font-medium">&quot;And if you’re looking for your next high-paying specialty, check out our job board at NurseNow.com. See you in the next video!&quot;</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* The Relatable Template */}
                  <div className="bg-slate-50 rounded-[2.5rem] border border-slate-200 overflow-hidden opacity-75 grayscale hover:grayscale-0 transition-all">
                    <div className="p-8 bg-white flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-slate-900">The &quot;Relatable&quot; Template</h4>
                        <p className="text-slate-500 text-sm mt-1">Best for Vlogs & Lifestyle Content</p>
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-4">
                  <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                    <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    <button 
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                      className="p-1 hover:bg-white rounded transition-all"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                    <button 
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                      className="p-1 hover:bg-white rounded transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs font-bold text-slate-500 uppercase">YouTube</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs font-bold text-slate-500 uppercase">TikTok</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Email</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="bg-slate-50 p-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {day}
                  </div>
                ))}
                {(() => {
                  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
                  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
                  const days = [];
                  
                  // Previous month padding
                  for (let i = 0; i < firstDay; i++) {
                    days.push(<div key={`prev-${i}`} className="bg-slate-50/50 min-h-[140px] p-4 border-slate-100"></div>);
                  }
                  
                  // Current month days
                  for (let d = 1; d <= daysInMonth; d++) {
                    const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                    const dayIdeas = videoIdeas.filter(idea => idea.scheduledDate === dateStr);
                    
                    days.push(
                      <div key={d} className="bg-white min-h-[140px] p-4 border-slate-100">
                        <div className="text-sm font-bold mb-3 text-slate-900">{d}</div>
                        <div className="space-y-2">
                          {dayIdeas.map((idea) => (
                            <div 
                              key={idea.id} 
                              className={`p-2 rounded-lg text-[10px] font-bold truncate border ${
                                idea.platform === 'youtube' ? 'bg-red-50 text-red-700 border-red-100' :
                                idea.platform === 'tiktok' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                idea.platform === 'instagram' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                'bg-slate-50 text-slate-700 border-slate-100'
                              }`}
                            >
                              {idea.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
            </div>
          )}
          {activeTab === 'strategy' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                  <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                    <Youtube className="w-6 h-6 mr-3 text-red-600" />
                    YouTube Strategy Guide
                  </h3>
                  <div className="space-y-8">
                    <div className="flex gap-6">
                      <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-red-600 font-bold">1</div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">The Hook (0:00 - 0:45)</h4>
                        <p className="text-slate-600 mt-2">Stop the scroll. Use high-energy visuals and address a specific pain point immediately.</p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-blue-600 font-bold">2</div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">The Value (0:45 - 8:00)</h4>
                        <p className="text-slate-600 mt-2">Deliver on the promise. Break down complex topics into 3 actionable pillars.</p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-emerald-600 font-bold">3</div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">The CTA (8:00 - 10:00)</h4>
                        <p className="text-slate-600 mt-2">Bridge to NurseNow.com. Link to specific courses or job listings related to the video.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                  <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                    <Target className="w-6 h-6 mr-3 text-blue-600" />
                    Conversion Goals
                  </h3>
                  <div className="space-y-6">
                    {[
                      { label: 'Drive to NCLEX Course', target: '2,000 clicks/mo', progress: 65, color: 'bg-blue-600' },
                      { label: 'Job Board Signups', target: '5,000/mo', progress: 82, color: 'bg-indigo-600' },
                      { label: 'Free Resource Downloads', target: '10,000/mo', progress: 45, color: 'bg-emerald-600' },
                    ].map((goal) => (
                      <div key={goal.label}>
                        <div className="flex justify-between text-sm font-bold mb-2">
                          <span className="text-slate-700">{goal.label}</span>
                          <span className="text-slate-400">Target: {goal.target}</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${goal.progress}%` }}
                            className={`h-full ${goal.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center space-x-2 text-slate-900 font-bold mb-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>AI Content Tip</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Videos about &quot;Nursing Salaries&quot; and &quot;Day in the Life&quot; have 3x higher click-through rates this month. Consider doubling down on these categories.
                    </p>
                  </div>
                </div>
              </div>

              {/* 30 Video Ideas Template */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                    <Sparkles className="w-6 h-6 mr-3 text-amber-500" />
                    30-Day Content Strategy Template
                  </h3>
                  <button 
                    onClick={importTemplateIdeas}
                    disabled={importing}
                    className="text-blue-600 font-bold text-sm hover:underline disabled:opacity-50"
                  >
                    {importing ? 'Importing...' : 'Import All to Planner'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: "5 NCLEX Questions That Trip Everyone Up", cat: "nclex" },
                    { title: "How I Passed the NCLEX in 30 Days", cat: "nclex" },
                    { title: "NCLEX Pharmacology: 10 Drugs You MUST Know", cat: "nclex" },
                    { title: "Top 10 Highest Paying Nursing Specialties", cat: "career" },
                    { title: "Travel Nursing in 2026: Is it Still Worth it?", cat: "career" },
                    { title: "Day in the Life: ICU Nurse (12-Hour Shift)", cat: "vlog" },
                    { title: "How I Made $5,000/mo Passive Income as a Nurse", cat: "finance" },
                    { title: "5 Mistakes New Grad Nurses Make", cat: "career" },
                    { title: "Dealing with &apos;Nurses Eating Their Young&apos;", cat: "vlog" },
                  ].map((idea, i) => (
                    <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{idea.cat}</span>
                        <Plus className="w-4 h-4 text-slate-300 group-hover:text-blue-600 cursor-pointer" />
                      </div>
                      <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{idea.title}</h4>
                    </div>
                  ))}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-bold text-sm">
                    + 21 More Ideas Available
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'planner' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videoIdeas.map((idea) => (
                  <div key={idea.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        idea.category === 'nclex' ? 'bg-red-100 text-red-700' :
                        idea.category === 'career' ? 'bg-blue-100 text-blue-700' :
                        idea.category === 'vlog' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {idea.category}
                      </span>
                      <select 
                        value={idea.status}
                        onChange={(e) => updateIdeaStatus(idea.id, e.target.value as VideoIdea['status'])}
                        className="text-xs font-bold text-slate-400 bg-transparent focus:outline-none cursor-pointer"
                      >
                        <option value="idea">Idea</option>
                        <option value="scripting">Scripting</option>
                        <option value="filming">Filming</option>
                        <option value="editing">Editing</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 leading-tight mb-4">{idea.title}</h4>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-xs text-slate-500">
                        {idea.platform === 'youtube' && <Youtube className="w-3 h-3 mr-2 text-red-500" />}
                        {idea.platform === 'tiktok' && <Smartphone className="w-3 h-3 mr-2 text-blue-500" />}
                        {idea.platform === 'instagram' && <Instagram className="w-3 h-3 mr-2 text-pink-500" />}
                        {idea.platform === 'email' && <Mail className="w-3 h-3 mr-2 text-emerald-500" />}
                        <span className="capitalize">{idea.platform}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <Calendar className="w-3 h-3 mr-2" />
                        <span>{idea.scheduledDate || 'Not Scheduled'}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <ArrowRight className="w-3 h-3 mr-2" />
                        <span>Target: {idea.targetLink || 'NurseNow.com'}</span>
                      </div>
                    </div>

                    <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all flex items-center justify-center space-x-2">
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {videoIdeas.length === 0 && (
                  <div className="col-span-full bg-white p-12 rounded-[3rem] border border-slate-200 text-center text-slate-500 italic">
                    No video ideas added yet. Start by adding a new idea!
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <div className="max-w-4xl mx-auto">
              <form onSubmit={addVideoIdea} className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Video Title</label>
                    <input
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                      placeholder="e.g. 5 NCLEX Questions That Trip Everyone Up"
                      value={newIdea.title}
                      onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Category</label>
                    <select
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                      value={newIdea.category}
                      onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value as any })}
                    >
                      <option value="nclex">NCLEX Prep</option>
                      <option value="career">Career Advice</option>
                      <option value="vlog">Vlog / Lifestyle</option>
                      <option value="finance">Finance / Passive Income</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Platform</label>
                    <select
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                      value={newIdea.platform}
                      onChange={(e) => setNewIdea({ ...newIdea, platform: e.target.value as any })}
                    >
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                      <option value="instagram">Instagram</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Scheduled Date</label>
                    <input
                      type="date"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                      value={newIdea.scheduledDate}
                      onChange={(e) => setNewIdea({ ...newIdea, scheduledDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Target Link</label>
                    <input
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                      placeholder="e.g. /courses/nclex"
                      value={newIdea.targetLink}
                      onChange={(e) => setNewIdea({ ...newIdea, targetLink: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">The Hook (Script)</label>
                    <textarea
                      className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:outline-none h-24"
                      placeholder="How will you grab attention in the first 10 seconds?"
                      value={newIdea.hook}
                      onChange={(e) => setNewIdea({ ...newIdea, hook: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">The Value (Pillars)</label>
                    <textarea
                      className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:outline-none h-32"
                      placeholder="What are the 3 main points of the video?"
                      value={newIdea.value}
                      onChange={(e) => setNewIdea({ ...newIdea, value: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">The CTA</label>
                    <input
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                      placeholder="CTA Text (e.g. Join our NCLEX course)"
                      value={newIdea.cta}
                      onChange={(e) => setNewIdea({ ...newIdea, cta: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-6 h-6" />
                      <span>Add to Planner</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
