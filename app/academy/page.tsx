'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Award, 
  Clock, 
  Plus, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  BookOpen,
  TrendingUp,
  Calendar,
  XCircle,
  Upload,
  Sparkles,
  Map as MapIcon,
  PlayCircle,
  ChevronRight,
  Target
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { db, OperationType, handleFirestoreError } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import Link from 'next/link';

interface CEULog {
  id: string;
  userId: string;
  title: string;
  provider: string;
  date: string;
  hours: number;
  certificateUrl?: string;
  createdAt: any;
}

export default function AcademyPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'ceu' | 'career'>('ceu');
  const [ceuLogs, setCeuLogs] = useState<CEULog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [simulatingCourse, setSimulatingCourse] = useState(false);
  const [simulatedCourseId, setSimulatedCourseId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    date: '',
    hours: '',
  });

  // Goal settings (could be moved to user profile later)
  const CEU_GOAL = 30; 
  const RENEWAL_DATE = '2026-12-31';

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'ceuLogs'), 
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CEULog[];
      setCeuLogs(logs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'ceuLogs');
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title || !formData.hours || !formData.date) return;
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'ceuLogs'), {
        userId: user.uid,
        title: formData.title,
        provider: formData.provider,
        date: formData.date,
        hours: Number(formData.hours),
        createdAt: serverTimestamp()
      });
      setShowLogModal(false);
      setFormData({ title: '', provider: '', date: '', hours: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'ceuLogs');
    } finally {
      setSubmitting(false);
    }
  };

  const totalHours = ceuLogs.reduce((sum, log) => sum + log.hours, 0);
  const progressPercentage = Math.min(Math.round((totalHours / CEU_GOAL) * 100), 100);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || profile?.role !== 'nurse') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Nurse Access Only</h2>
          <p className="text-slate-600 mt-4">Please sign in with a nurse account to access the NurseNow Academy and CEU Tracker.</p>
          <Link 
            href="/profile"
            className="mt-8 block w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
          >
            Go to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200 mb-4">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">NurseNow Academy</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-slate-900 leading-tight">Your <span className="text-blue-600">CEU Tracker</span></h1>
            <p className="text-slate-600 mt-2 text-lg">Manage your continuing education, track your hours, and stay compliant.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowLogModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Log CEU Hours</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit shadow-sm">
          <button
            onClick={() => setActiveTab('ceu')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 ${
              activeTab === 'ceu' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>CEU Tracker</span>
          </button>
          <button
            onClick={() => setActiveTab('career')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 ${
              activeTab === 'career' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Career Pathing</span>
          </button>
        </div>

        {activeTab === 'ceu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content - Progress & Logs */}
            <div className="lg:col-span-2 space-y-8">
            
            {/* Progress Dashboard */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-60" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Renewal Cycle Progress</h2>
                    <p className="text-slate-500 text-sm mt-1 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" /> Deadline: {new Date(RENEWAL_DATE).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-blue-600">{totalHours} <span className="text-lg text-slate-400 font-bold">/ {CEU_GOAL}</span></div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Hours Completed</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${progressPercentage >= 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs font-bold text-slate-500">
                    <span>0 Hours</span>
                    <span>{progressPercentage}% Completed</span>
                    <span>{CEU_GOAL} Hours</span>
                  </div>
                </div>

                {progressPercentage >= 100 ? (
                  <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-green-900">Requirements Met!</h4>
                      <p className="text-sm text-green-700">You have completed all required CEU hours for this renewal cycle. Great job!</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-900">{CEU_GOAL - totalHours} Hours Remaining</h4>
                      <p className="text-sm text-amber-700">You need {CEU_GOAL - totalHours} more hours before {new Date(RENEWAL_DATE).toLocaleDateString()}. Check out our recommended courses below.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CEU Logs List */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                Completed CEUs
              </h3>
              
              {ceuLogs.length === 0 ? (
                <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">No CEUs Logged Yet</h4>
                  <p className="text-slate-500 mb-6">Start tracking your continuing education by logging your first course.</p>
                  <button 
                    onClick={() => setShowLogModal(true)}
                    className="bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                  >
                    Log Your First CEU
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {ceuLogs.map((log) => (
                    <div key={log.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Award className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{log.title}</h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                            <span className="flex items-center"><GraduationCap className="w-4 h-4 mr-1" /> {log.provider}</span>
                            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {log.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-black text-lg">
                          {log.hours} <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Hrs</span>
                        </div>
                        {log.certificateUrl && (
                          <a href={log.certificateUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center">
                            <FileText className="w-3 h-3 mr-1" /> View Cert
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Recommendations */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/30">
                  <TrendingUp className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Need More Hours?</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Explore our premium NurseNow courses to fulfill your remaining CEU requirements quickly and easily.
                </p>
                <Link href="/courses" className="w-full block text-center bg-amber-500 text-slate-900 py-4 rounded-2xl font-bold hover:bg-amber-400 transition-all shadow-lg">
                  Browse Courses
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 rounded-full blur-[60px] opacity-20 -mr-16 -mt-16" />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6">Recommended for You</h3>
              <div className="space-y-6">
                {[
                  { title: 'Advanced Pharmacology Update', hours: 5, price: '$29' },
                  { title: 'Ethics in Modern Nursing', hours: 2, price: 'Free' },
                  { title: 'Infection Control Mastery', hours: 3, price: '$19' }
                ].map((course, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{course.title}</h4>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{course.hours} CEU Hours</span>
                      <span className="font-bold text-blue-600">{course.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
        )}

        {activeTab === 'career' && (
          <div className="space-y-8">
            {/* AI Career Coach Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 backdrop-blur-3xl" />
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full border border-white/30 mb-6 backdrop-blur-md">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">AI Career Coach</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight mb-4">
                  You are <span className="text-amber-300 border-b-2 border-amber-300 border-dashed pb-1">2 certifications</span> away from qualifying for a Flight Nurse role.
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-6">
                  <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20">
                    <span className="text-blue-200 text-sm block mb-0.5">Target Salary</span>
                    <span className="text-2xl font-black">$140k/yr</span>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20">
                    <span className="text-blue-200 text-sm block mb-0.5">Time to Goal</span>
                    <span className="text-2xl font-black">12 Weeks</span>
                  </div>
                  <button 
                    onClick={() => {
                      setSimulatingCourse(true);
                      setSimulatedCourseId('flight-nurse');
                    }}
                    className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-lg flex items-center space-x-2 ml-auto lg:ml-0"
                  >
                    <span>Start Path Now</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Path Steps */}
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <Target className="w-6 h-6 mr-2 text-blue-600" />
                  Your Flight Nurse Roadmap
                </h3>
                
                <div className="relative border-l-2 border-blue-100 ml-4 space-y-8 pb-4">
                  {/* Step 1 */}
                  <div className="relative pl-8">
                    <div className="absolute -left-3.5 top-1 w-7 h-7 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm opacity-60">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900 line-through">2+ Years ICU/ER Experience</h4>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">Completed</span>
                      </div>
                      <p className="text-slate-500 text-sm">Verified from your Nurse Passport employment history.</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative pl-8">
                    <div className="absolute -left-3.5 top-1 w-7 h-7 bg-amber-500 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                    <div className="bg-white p-6 rounded-3xl border-2 border-blue-500 shadow-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">CFRN (Certified Flight Registered Nurse)</h4>
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mt-1">In Progress</span>
                        </div>
                        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-xl font-black text-sm">
                          15 <span className="text-[10px] uppercase font-bold text-blue-500">CEUs</span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm mb-4">Complete our accredited prep course to sit for the BCEN exam.</p>
                      <button 
                        onClick={() => {
                          setSimulatingCourse(true);
                          setSimulatedCourseId('cfrn-prep');
                        }}
                        className="w-full bg-blue-50 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors flex items-center justify-center"
                      >
                        <PlayCircle className="w-5 h-5 mr-2" /> Resume Course (60% Complete)
                      </button>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative pl-8">
                    <div className="absolute -left-3.5 top-1 w-7 h-7 bg-slate-200 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                      <div className="w-2 h-2 bg-slate-400 rounded-full" />
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900 text-lg">Neonatal Resuscitation Program (NRP)</h4>
                        <div className="bg-slate-50 text-slate-500 px-3 py-1 rounded-xl font-black text-sm">
                          8 <span className="text-[10px] uppercase font-bold text-slate-400">CEUs</span>
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm mb-4">Required by 90% of flight nurse employers.</p>
                      <button className="w-full border border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center">
                        <BookOpen className="w-5 h-5 mr-2" /> View Course Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Insights */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-6 flex items-center">
                    <MapIcon className="w-5 h-5 mr-2 text-indigo-500" />
                    Market Demand
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Open Flight Roles</span>
                      <span className="font-bold text-slate-900 bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs">High (142 roles)</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Avg. Hourly Rate</span>
                      <span className="font-bold text-slate-900">$72.50/hr</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-4">
                      <span className="text-slate-500 font-medium">Top Locations</span>
                      <div className="text-right">
                        <span className="block font-bold text-slate-900">Texas</span>
                        <span className="block font-bold text-slate-900 mt-1">California</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-[2.5rem] border border-indigo-100">
                  <h3 className="font-bold text-indigo-900 mb-2">Automatic Passport Sync</h3>
                  <p className="text-sm text-indigo-700 leading-relaxed mb-4">
                    All courses completed in NurseNow Academy are instantly verified and added to your Nurse Passport profile.
                  </p>
                  <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" /> <span>No manual uploads needed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Log CEU Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
            >
              <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Log CEU Hours</h2>
                    <p className="text-slate-500 text-sm">Add an external course or certification.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowLogModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 md:p-8">
                <form onSubmit={handleLogSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Course/Activity Title</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                      placeholder="e.g. Advanced Cardiac Life Support"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Provider/Institution</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                      placeholder="e.g. American Heart Association"
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Date Completed</label>
                      <input
                        type="date"
                        required
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">CEU Hours</label>
                      <input
                        type="number"
                        required
                        min="0.5"
                        step="0.5"
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                        placeholder="e.g. 12"
                        value={formData.hours}
                        onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Certificate (Optional)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 font-medium">Click to upload certificate PDF/Image</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    <span>{submitting ? 'Saving...' : 'Save CEU Log'}</span>
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Course Simulation Modal */}
      <AnimatePresence>
        {simulatingCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 flex flex-col h-[80vh]"
            >
              <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <PlayCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                      {simulatedCourseId === 'flight-nurse' ? 'Intro to Flight Nursing' : 'CFRN Exam Prep - Module 4'}
                    </h2>
                    <p className="text-slate-500 text-sm flex items-center">
                      <Clock className="w-4 h-4 mr-1" /> 45 mins remaining • 15 CEUs upon completion
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSimulatingCourse(false);
                    setSimulatedCourseId(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
                {/* Video Player Area */}
                <div className="w-full md:w-2/3 bg-slate-900 p-6 flex flex-col items-center justify-center relative min-h-[300px]">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <PlayCircle className="w-48 h-48 text-white" />
                  </div>
                  <div className="z-10 text-center">
                    <div className="w-16 h-16 bg-blue-600/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/50 backdrop-blur-md cursor-pointer hover:bg-blue-600/50 transition-colors">
                       <PlayCircle className="w-8 h-8 text-white ml-1" />
                    </div>
                    <p className="text-slate-300 font-medium">Video Player Simulation</p>
                  </div>
                </div>

                {/* Course Navigation Sidebar */}
                <div className="w-full md:w-1/3 bg-slate-50 border-l border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Course Contents</h3>
                  <div className="space-y-3">
                    {[
                      { title: '1. Fundamentals of Transport', status: 'completed' },
                      { title: '2. Advanced Airway Management', status: 'completed' },
                      { title: '3. Altitude Physiology', status: 'completed' },
                      { title: '4. Trauma Resuscitation in Flight', status: 'active' },
                      { title: '5. Pediatric/Neonatal Transport', status: 'locked' },
                      { title: '6. CFRN Practice Exam', status: 'locked' },
                    ].map((item, i) => (
                      <div 
                        key={i} 
                        className={`p-3 rounded-xl border flex items-start space-x-3 
                          ${item.status === 'active' ? 'bg-white border-blue-200 shadow-sm' : 
                            item.status === 'completed' ? 'bg-slate-100 border-slate-200 opacity-60' : 
                            'bg-slate-50 border-slate-100 opacity-40'}`}
                      >
                        <div className="mt-0.5">
                          {item.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          {item.status === 'active' && <PlayCircle className="w-4 h-4 text-blue-600" />}
                          {item.status === 'locked' && <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${item.status === 'active' ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                            {item.title}
                          </p>
                          {item.status === 'active' && <p className="text-xs text-blue-600 mt-1 font-medium">Current Module</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Nav */}
              <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center">
                <button className="text-slate-500 font-medium hover:text-slate-800 px-4 py-2">
                  Previous Module
                </button>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                  Next Module
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
