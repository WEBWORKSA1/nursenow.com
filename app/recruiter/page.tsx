'use client';

import { useState, useEffect } from 'react';
import { db, auth, OperationType, handleFirestoreError } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, getDocs, deleteDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/components/AuthContext';
import { 
  Briefcase, Building2, MapPin, DollarSign, FileText, Plus, 
  CheckCircle2, ArrowRight, Loader2, Sparkles, LayoutDashboard, 
  Users, ClipboardList, ChevronRight, ExternalLink, Clock,
  CheckCircle, XCircle, AlertCircle, Stethoscope, GraduationCap,
  Eye, User as UserIcon, Search, Filter, ArrowUpDown, Edit, Trash2, Star, Zap,
  ShieldCheck, Layout, Image as ImageIcon, Heart, FileCheck, RefreshCw,
  TrendingUp, Activity, CalendarDays, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import Link from 'next/link';
import Image from 'next/image';

interface NurseProfile {
  uid: string;
  displayName?: string;
  photoURL?: string;
  specialty?: string;
  experienceYears?: number;
  location?: string;
  bio?: string;
  resumeUrl?: string;
}

interface Job {
  id: string;
  title: string;
  hospital: string;
  location: string;
  type: string;
  salaryRange: string;
  specialty?: string;
  qualifications?: string;
  responsibilities?: string;
  description: string;
  postedBy: string;
  postedDate: any;
  createdAt: any;
  isFeatured: boolean;
}

interface Application {
  id: string;
  jobId: string;
  nurseId: string;
  recruiterId: string;
  status: string;
  coverLetter: string;
  createdAt: any;
  resumeUrl: string;
}

interface GigShift {
  id: string;
  title: string;
  hospital: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  baseRate: number;
  type: string; // 'Urgent', 'Premium', 'Standard'
  status: string; // 'open', 'filled', 'cancelled'
  postedBy: string;
  createdAt: any;
}

interface Bid {
  id: string;
  shiftId: string;
  nurseId: string;
  nurseName: string;
  proposedRate: number;
  status: string; // 'pending', 'accepted', 'rejected'
  createdAt: any;
}

export default function RecruiterDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showAiWizard, setShowAiWizard] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [schedulingAppId, setSchedulingAppId] = useState<string | null>(null);
  const [schedulingStep, setSchedulingStep] = useState(1);
  
  // Filter states
  const [filterJobId, setFilterJobId] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Data states
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [gigShifts, setGigShifts] = useState<GigShift[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftFormData, setShiftFormData] = useState({
    title: '',
    hospital: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    baseRate: '',
    type: 'Standard'
  });
  const [nurseProfiles, setNurseProfiles] = useState<Record<string, NurseProfile>>({});
  const [passports, setPassports] = useState<Record<string, any>>({});
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    pendingReviews: 0
  });

  // Enterprise Compliance Mock State
  const [isSyncingNursys, setIsSyncingNursys] = useState(false);
  const [mockStaff, setMockStaff] = useState([
    { id: '1', name: 'Sarah Jenkins', role: 'ICU RN', license: 'RN-12345', licenseExp: '2026-08-15', nursysStatus: 'verified', blsExp: '2027-01-10', aclsExp: '2026-05-20', immunizations: 'compliant', lastChecked: '2 hours ago' },
    { id: '2', name: 'Michael Chen', role: 'ER RN', license: 'RN-67890', licenseExp: '2026-04-30', nursysStatus: 'expiring_soon', blsExp: '2026-11-05', aclsExp: '2026-11-05', immunizations: 'missing_flu', lastChecked: '2 hours ago' },
    { id: '3', name: 'Emily Rodriguez', role: 'Med-Surg RN', license: 'RN-34567', licenseExp: '2027-03-12', nursysStatus: 'verified', blsExp: '2025-12-01', aclsExp: 'N/A', immunizations: 'compliant', lastChecked: '2 hours ago' },
    { id: '4', name: 'David Kim', role: 'Pediatrics RN', license: 'RN-98765', licenseExp: '2026-02-15', nursysStatus: 'invalid', blsExp: '2026-06-15', aclsExp: 'N/A', immunizations: 'compliant', lastChecked: '2 hours ago' },
    { id: '5', name: 'Jessica Taylor', role: 'OR RN', license: 'RN-45678', licenseExp: '2026-10-22', nursysStatus: 'verified', blsExp: '2026-08-30', aclsExp: '2026-08-30', immunizations: 'missing_tb', lastChecked: '2 hours ago' },
  ]);

  const handleNursysSync = () => {
    setIsSyncingNursys(true);
    setTimeout(() => {
      setMockStaff(prev => prev.map(staff => ({ ...staff, lastChecked: 'Just now' })));
      setIsSyncingNursys(false);
    }, 2000);
  };

  const [formData, setFormData] = useState({
    title: '',
    hospital: '',
    location: '',
    type: 'full-time',
    salaryRange: '',
    specialty: '',
    qualifications: '',
    responsibilities: '',
    description: '',
  });

  // Fetch recruiter's jobs and applications
  useEffect(() => {
    if (!user || profile?.role !== 'recruiter') return;

    const jobsQuery = query(collection(db, 'jobs'), where('postedBy', '==', user.uid));
    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      const jobsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      setMyJobs(jobsList);
      setStats(prev => ({ ...prev, totalJobs: jobsList.length }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'jobs'));

    const appsQuery = query(collection(db, 'applications'), where('recruiterId', '==', user.uid));
    const unsubscribeApps = onSnapshot(appsQuery, (snapshot) => {
      const appsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
      setApplications(appsList);
      setStats(prev => ({ 
        ...prev, 
        totalApplications: appsList.length,
        pendingReviews: appsList.filter(a => a.status === 'pending').length
      }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'applications'));

    const shiftsQuery = query(collection(db, 'gigShifts'), where('postedBy', '==', user.uid));
    const unsubscribeShifts = onSnapshot(shiftsQuery, (snapshot) => {
      const shiftsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GigShift));
      setGigShifts(shiftsList);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'gigShifts'));

    return () => {
      unsubscribeJobs();
      unsubscribeApps();
      unsubscribeShifts();
    };
  }, [user, profile]);

  // Fetch bids for the recruiter's gig shifts
  useEffect(() => {
    if (gigShifts.length === 0) return;
    
    // Firestore 'in' query supports up to 10 items. For simplicity, we'll fetch all bids and filter locally if there are many shifts,
    // or we can just fetch all bids for the shifts if we chunk them. Let's just fetch all bids and filter if needed, 
    // or better yet, since we don't have a recruiterId on bids, we can just fetch bids where shiftId is in gigShifts.
    // To avoid the 10 item limit, we'll fetch bids for each shift or just fetch all bids and filter.
    // Actually, let's just fetch all bids and filter locally for now to keep it simple, or use multiple queries.
    const unsubscribeBids = onSnapshot(collection(db, 'bids'), (snapshot) => {
      const allBids = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bid));
      const shiftIds = new Set(gigShifts.map(s => s.id));
      const myBids = allBids.filter(bid => shiftIds.has(bid.shiftId));
      setBids(myBids);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'bids'));

    return () => unsubscribeBids();
  }, [gigShifts]);

  // Fetch nurse profiles for applications and bids
  useEffect(() => {
    const fetchNurseProfiles = async () => {
      const appNurseIds = applications.map(app => app.nurseId);
      const bidNurseIds = bids.map(bid => bid.nurseId);
      const nurseIds = Array.from(new Set([...appNurseIds, ...bidNurseIds]));
      
      const newProfiles: Record<string, NurseProfile> = { ...nurseProfiles };
      let changed = false;

      for (const nurseId of nurseIds) {
        if (!newProfiles[nurseId]) {
          try {
            const nurseDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', nurseId)));
            if (!nurseDoc.empty) {
              newProfiles[nurseId] = nurseDoc.docs[0].data() as NurseProfile;
              changed = true;
            }
          } catch (error) {
            console.error('Error fetching nurse profile:', error);
          }
        }
        
        // Fetch passport
        if (!passports[nurseId]) {
          try {
            const passportDoc = await getDoc(doc(db, 'passports', nurseId));
            if (passportDoc.exists()) {
              setPassports(prev => ({ ...prev, [nurseId]: passportDoc.data() }));
            }
          } catch (error) {
            console.error('Error fetching passport:', error);
          }
        }
      }

      if (changed) {
        setNurseProfiles(newProfiles);
      }
    };

    if (applications.length > 0 || bids.length > 0) {
      fetchNurseProfiles();
    }
  }, [applications, bids, nurseProfiles, passports]);

  const generateDescription = async () => {
    if (!formData.title || !formData.hospital) return;
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a professional and compelling nursing job description for:
          Title: ${formData.title}
          Hospital: ${formData.hospital}
          Location: ${formData.location}
          Specialty: ${formData.specialty || 'General Nursing'}
          Key Responsibilities: ${formData.responsibilities || 'Standard nursing duties'}
          Required Qualifications: ${formData.qualifications || 'RN License, BSN preferred'}
          
          Please provide a detailed and engaging job description including:
          1. Role Overview (Exciting and welcoming)
          2. Key Responsibilities (Detailed bullet points)
          3. Mandatory Requirements & Qualifications (Clear and concise)
          4. Benefits & Perks (Standard nursing benefits)
          
          Format the output with clear headings and professional bullet points. Use a warm, professional tone that attracts top nursing talent.`,
      });
      setFormData({ ...formData, description: response.text || '' });
      setShowAiWizard(false);
    } catch (error) {
      console.error('AI error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      if (editingJobId) {
        await updateDoc(doc(db, 'jobs', editingJobId), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'jobs'), {
          ...formData,
          postedBy: user.uid,
          postedDate: serverTimestamp(),
          createdAt: serverTimestamp(),
          isFeatured: false,
        });
      }
      setSuccess(true);
      setFormData({ title: '', hospital: '', location: '', type: 'full-time', salaryRange: '', specialty: '', qualifications: '', responsibilities: '', description: '' });
      setEditingJobId(null);
      setTimeout(() => {
        setSuccess(false);
        setActiveTab('jobs');
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, editingJobId ? OperationType.UPDATE : OperationType.CREATE, 'jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'gigShifts'), {
        ...shiftFormData,
        baseRate: Number(shiftFormData.baseRate),
        status: 'open',
        postedBy: user.uid,
        createdAt: serverTimestamp(),
      });
      setShowShiftModal(false);
      setShiftFormData({ title: '', hospital: '', location: '', date: '', startTime: '', endTime: '', baseRate: '', type: 'Standard' });
      alert('Gig Shift posted successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gigShifts');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bid: Bid) => {
    try {
      // Accept this bid
      await updateDoc(doc(db, 'bids', bid.id), { status: 'accepted' });
      // Update shift status to filled
      await updateDoc(doc(db, 'gigShifts', bid.shiftId), { status: 'filled' });
      
      // Reject all other pending bids for this shift
      const otherBids = bids.filter(b => b.shiftId === bid.shiftId && b.id !== bid.id && b.status === 'pending');
      for (const otherBid of otherBids) {
        await updateDoc(doc(db, 'bids', otherBid.id), { status: 'rejected' });
      }
      alert('Bid accepted! Shift is now filled.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'bids');
    }
  };

  const handleRejectBid = async (bidId: string) => {
    try {
      await updateDoc(doc(db, 'bids', bidId), { status: 'rejected' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'bids');
    }
  };

  const handleEditJob = (job: Job) => {
    setFormData({
      title: job.title,
      hospital: job.hospital,
      location: job.location,
      type: job.type,
      salaryRange: job.salaryRange,
      specialty: job.specialty || '',
      qualifications: job.qualifications || '',
      responsibilities: job.responsibilities || '',
      description: job.description,
    });
    setEditingJobId(job.id);
    setActiveTab('post');
  };

  const toggleFeatured = async (job: Job) => {
    try {
      await updateDoc(doc(db, 'jobs', job.id), {
        isFeatured: !job.isFeatured
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'jobs');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
      setShowDeleteConfirm(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'jobs');
    } finally {
      setLoading(false);
    }
  };

  const updateAppStatus = async (appId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'applications', appId), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'applications');
    }
  };

  const filteredApplications = applications
    .filter(app => {
      const matchesJob = filterJobId === 'all' || app.jobId === filterJobId;
      const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
      return matchesJob && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate()?.getTime() || 0;
      const dateB = b.createdAt?.toDate()?.getTime() || 0;
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  if (!user || profile?.role !== 'recruiter') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Recruiter Access Only</h2>
          <p className="text-slate-600 mt-4">Please sign in with a recruiter account to access the dashboard.</p>
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
    <div className="bg-slate-50 min-h-screen pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-slate-900">Recruiter Dashboard</h1>
            <p className="text-slate-600 mt-2">Manage your listings and track candidate applications.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setEditingJobId(null);
                setFormData({ title: '', hospital: '', location: '', type: 'full-time', salaryRange: '', specialty: '', qualifications: '', responsibilities: '', description: '' });
                setActiveTab('post');
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center space-x-2 w-fit"
            >
              <Plus className="w-5 h-5" />
              <span>Post New Job</span>
            </button>
            <button 
              onClick={() => {
                setEditingJobId(null);
                setFormData({ title: '', hospital: '', location: '', type: 'full-time', salaryRange: '', specialty: '', qualifications: '', responsibilities: '', description: '' });
                setActiveTab('post');
                setShowAiWizard(true);
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center space-x-2 w-fit"
            >
              <Sparkles className="w-5 h-5" />
              <span>AI Job Wizard</span>
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-2xl border border-slate-200 mb-12 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'predictive', label: 'Predictive Staffing', icon: TrendingUp },
            { id: 'jobs', label: 'My Jobs', icon: Briefcase },
            { id: 'shifts', label: 'Gig Shifts', icon: Clock },
            { id: 'applications', label: 'Applications', icon: Users },
            { id: 'compliance', label: 'Compliance', icon: FileCheck },
            { id: 'branding', label: 'Employer Branding', icon: Layout },
            { id: 'post', label: editingJobId ? 'Edit Job' : 'Post a Job', icon: editingJobId ? Edit : Plus },
            { id: 'pricing', label: 'Pricing', icon: DollarSign },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-md' 
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
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-slate-900">{stats.totalJobs}</div>
                <div className="text-slate-600 font-medium mt-1">Active Job Listings</div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-4xl font-bold text-slate-900">{stats.totalApplications}</div>
                <div className="text-slate-600 font-medium mt-1">Total Applications</div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-4xl font-bold text-slate-900">{stats.pendingReviews}</div>
                <div className="text-slate-600 font-medium mt-1">Pending Reviews</div>
              </div>
            </div>
          )}

          {activeTab === 'predictive' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="relative z-10">
                  <div className="inline-flex items-center space-x-2 bg-indigo-500/30 px-3 py-1 rounded-full border border-indigo-400/30 mb-6">
                    <Sparkles className="w-4 h-4 text-indigo-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">AI Staffing Predictor</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight mb-4">
                    Forecasted Staffing Shortages
                  </h2>
                  <p className="text-indigo-200 text-lg max-w-2xl">
                    Our AI analyzes local health trends, upcoming events, and historical census data to predict when you'll need extra hands.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Predictive Factors */}
                <div className="space-y-6 lg:col-span-1">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center">
                    <Activity className="w-6 h-6 mr-2 text-indigo-600" />
                    Local Risk Factors
                  </h3>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <TrendingUp className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Flu Activity Surge</h4>
                        <p className="text-sm text-slate-500 mt-1">+18% increase in local ER visits for respiratory symptoms over the past 48 hours.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <CalendarDays className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">City Marathon</h4>
                        <p className="text-sm text-slate-500 mt-1">Expected road closures and +40k attendees this weekend. Historical data shows a 12% bump in orthopedic ER visits.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="space-y-6 lg:col-span-2">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center">
                    <AlertTriangle className="w-6 h-6 mr-2 text-amber-500" />
                    Actionable Predictions
                  </h3>

                  {/* Recommendation 1 */}
                  <div className="bg-white p-8 rounded-3xl border-2 border-indigo-100 shadow-md relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">High Risk</span>
                          <span className="text-sm font-bold text-slate-500">This Weekend (Fri-Sun)</span>
                        </div>
                        <h4 className="text-2xl font-bold text-slate-900">ER & Triage Shortage</h4>
                      </div>
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
                        <span className="text-2xl font-black text-slate-900">3</span>
                        <span className="text-[10px] font-bold uppercase text-slate-500">Nurses</span>
                      </div>
                    </div>
                    <p className="text-slate-600 mb-6">
                      Based on current flu trends and the upcoming marathon, AI predicts you will be <span className="font-bold text-red-600">understaffed by 3 nurses</span> in the ER this weekend.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => {
                           setShiftFormData(prev => ({...prev, title: 'ER RN - Urgent Weekend Coverage', location: 'ER Dept', type: 'Urgent'}));
                           setActiveTab('shifts');
                           setShowShiftModal(true);
                        }}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex justify-center items-center space-x-2 flex-1"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Post 3 Urgent Gig Shifts</span>
                      </button>
                      <button className="bg-slate-50 text-slate-600 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all flex-1">
                        Dismiss
                      </button>
                    </div>
                  </div>

                  {/* Recommendation 2 */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden opacity-80">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-md">Medium Risk</span>
                          <span className="text-sm font-bold text-slate-500">Next Week (Tue-Thu)</span>
                        </div>
                        <h4 className="text-xl font-bold text-slate-900">ICU Capacity Warning</h4>
                      </div>
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
                        <span className="text-2xl font-black text-slate-900">1</span>
                        <span className="text-[10px] font-bold uppercase text-slate-500">Nurse</span>
                      </div>
                    </div>
                    <p className="text-slate-600 mb-6 text-sm">
                      Historical census data indicates a high probability of ICU beds reaching 95% capacity mid-week. Consider securing a per-diem nurse in advance.
                    </p>
                    <button 
                       onClick={() => {
                         setShiftFormData(prev => ({...prev, title: 'ICU RN - Preventative Coverage', location: 'ICU', type: 'Premium'}));
                         setActiveTab('shifts');
                         setShowShiftModal(true);
                       }}
                      className="w-full bg-slate-50 text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-white hover:text-indigo-600 transition-all flex justify-center items-center space-x-2"
                    >
                      <span>Draft Preventative Shift</span>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-8 py-5 text-sm font-bold text-slate-700 uppercase tracking-wider">Job Details</th>
                      <th className="px-8 py-5 text-sm font-bold text-slate-700 uppercase tracking-wider">Type</th>
                      <th className="px-8 py-5 text-sm font-bold text-slate-700 uppercase tracking-wider">Applications</th>
                      <th className="px-8 py-5 text-sm font-bold text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="px-8 py-5 text-sm font-bold text-slate-700 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="font-bold text-slate-900">{job.title}</div>
                          <div className="text-sm text-slate-500 flex items-center mt-1">
                            <Building2 className="w-3 h-3 mr-1" /> {job.hospital}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold capitalize">
                            {job.type}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span className="font-bold text-slate-700">
                              {applications.filter(a => a.jobId === job.id).length}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="flex items-center text-green-600 text-sm font-bold">
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Active
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end space-x-3">
                            <button 
                              onClick={() => toggleFeatured(job)}
                              className={`p-2 rounded-lg transition-all ${job.isFeatured ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
                              title={job.isFeatured ? "Unmark as Featured" : "Mark as Featured"}
                            >
                              <Star className={`w-4 h-4 ${job.isFeatured ? 'fill-current' : ''}`} />
                            </button>
                            <button 
                              onClick={() => handleEditJob(job)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Edit Job"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setShowDeleteConfirm(job.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Job"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setFilterJobId(job.id);
                                setActiveTab('applications');
                              }}
                              className="text-blue-600 hover:text-blue-700 font-bold text-sm inline-flex items-center ml-2"
                            >
                              View Apps <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {myJobs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-12 text-center text-slate-500 italic">
                          No jobs posted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-6">
              {/* Filters UI */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">Filter by:</span>
                  </div>
                  
                  <select 
                    value={filterJobId}
                    onChange={(e) => setFilterJobId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="all">All Jobs</option>
                    {myJobs.map(job => (
                      <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                  </select>

                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  {(filterJobId !== 'all' || filterStatus !== 'all') && (
                    <button 
                      onClick={() => {
                        setFilterJobId('all');
                        setFilterStatus('all');
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <ArrowUpDown className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">Sort:</span>
                  </div>
                  <button 
                    onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-100 transition-colors flex items-center space-x-2"
                  >
                    <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
                  </button>
                </div>
              </div>

              {filteredApplications.map((app) => {
                const job = myJobs.find(j => j.id === app.jobId);
                const nurse = nurseProfiles[app.nurseId];
                return (
                  <div key={app.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex gap-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl font-bold text-blue-600 overflow-hidden relative">
                          {nurse?.photoURL ? (
                            <Image 
                              src={nurse.photoURL} 
                              alt={nurse.displayName || 'Candidate'} 
                              fill 
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <UserIcon className="w-8 h-8" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-slate-900">
                              {nurse?.displayName || `Candidate ${app.nurseId.slice(0, 4)}`}
                            </h3>
                            {passports[app.nurseId]?.isFullyVerified && (
                              <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Verified Passport
                              </div>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              app.status === 'hired' ? 'bg-green-100 text-green-700' :
                              app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              app.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                              'bg-indigo-100 text-indigo-700'
                            }`}>
                              {app.status}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1">Applied for: <span className="font-bold text-slate-900">{job?.title || 'Unknown Job'}</span></p>
                          
                          {nurse && (
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-slate-500">
                              {nurse.specialty && <span className="flex items-center"><Stethoscope className="w-4 h-4 mr-1" /> {nurse.specialty}</span>}
                              {nurse.experienceYears !== undefined && <span className="flex items-center"><GraduationCap className="w-4 h-4 mr-1" /> {nurse.experienceYears} years exp.</span>}
                              {nurse.location && <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {nurse.location}</span>}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-4 mt-4">
                            <div className="flex items-center text-sm text-slate-500">
                              <Clock className="w-4 h-4 mr-1" /> Applied {new Date(app.createdAt?.toDate()).toLocaleDateString()}
                            </div>
                            {(app.resumeUrl || nurse?.resumeUrl) && (
                              <a href={app.resumeUrl || nurse?.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm text-blue-600 font-bold hover:underline">
                                <FileText className="w-4 h-4 mr-1" /> View Resume
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {app.status === 'interviewing' && (
                          <button
                            onClick={() => {
                               // Assuming we'll open a modal or do something here
                               // For now just console.log or set state
                               setSchedulingAppId(app.id);
                            }}
                            className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2 font-bold text-sm"
                            title="Auto-Schedule Interview"
                          >
                            <CalendarDays className="w-5 h-5" />
                            <span className="hidden md:inline">Auto-Schedule</span>
                          </button>
                        )}
                        <button 
                          onClick={() => updateAppStatus(app.id, 'reviewed')}
                          className={`p-3 rounded-xl transition-colors ${app.status === 'reviewed' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                          title="Mark as Reviewed"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => updateAppStatus(app.id, 'interviewing')}
                          className={`p-3 rounded-xl transition-colors ${app.status === 'interviewing' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                          title="Move to Interview"
                        >
                          <ClipboardList className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => updateAppStatus(app.id, 'hired')}
                          className={`p-3 rounded-xl transition-colors ${app.status === 'hired' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                          title="Hire Candidate"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => updateAppStatus(app.id, 'rejected')}
                          className={`p-3 rounded-xl transition-colors ${app.status === 'rejected' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                          title="Reject Candidate"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {nurse?.bio && (
                      <div className="mt-6 p-4 bg-blue-50/30 rounded-2xl border border-blue-100/50 text-slate-600 text-sm italic">
                        &quot;{nurse.bio}&quot;
                      </div>
                    )}

                    {app.coverLetter && (
                      <div className="mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 text-sm leading-relaxed">
                        <div className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">Cover Letter / Note:</div>
                        {app.coverLetter}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredApplications.length === 0 && (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 italic">
                  {applications.length === 0 
                    ? "No applications received yet." 
                    : "No applications match your current filters."}
                </div>
              )}
            </div>
          )}

          {activeTab === 'shifts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">On-Demand Gig Shifts</h2>
                  <p className="text-slate-600">Post urgent shifts and manage nurse bids in real-time.</p>
                </div>
                <button 
                  onClick={() => setShowShiftModal(true)}
                  className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg flex items-center space-x-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>Post Urgent Shift</span>
                </button>
              </div>

              {gigShifts.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 italic">
                  No gig shifts posted yet. Click &quot;Post Urgent Shift&quot; to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {gigShifts.map((shift) => (
                    <div key={shift.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-900">{shift.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              shift.status === 'open' ? 'bg-green-100 text-green-700' :
                              shift.status === 'filled' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {shift.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              shift.type === 'Urgent' ? 'bg-red-100 text-red-700' :
                              shift.type === 'Premium' ? 'bg-purple-100 text-purple-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {shift.type}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            <span className="flex items-center"><Building2 className="w-4 h-4 mr-1" /> {shift.hospital}</span>
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {shift.location}</span>
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {shift.date} ({shift.startTime} - {shift.endTime})</span>
                            <span className="flex items-center font-bold text-slate-900"><DollarSign className="w-4 h-4 mr-1" /> ${shift.baseRate}/hr Base</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 mb-4">Bids ({bids.filter(b => b.shiftId === shift.id).length})</h4>
                        <div className="space-y-3">
                          {bids.filter(b => b.shiftId === shift.id).length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No bids yet.</p>
                          ) : (
                            bids.filter(b => b.shiftId === shift.id).map(bid => {
                              const nurse = nurseProfiles[bid.nurseId];
                              return (
                                <div key={bid.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold overflow-hidden relative">
                                      {nurse?.photoURL ? (
                                        <Image src={nurse.photoURL} alt={bid.nurseName} fill className="object-cover" referrerPolicy="no-referrer" />
                                      ) : (
                                        <UserIcon className="w-5 h-5" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-bold text-slate-900 flex items-center gap-2">
                                        {bid.nurseName}
                                        {passports[bid.nurseId]?.isFullyVerified && (
                                          <ShieldCheck className="w-3 h-3 text-blue-600" title="Verified Passport" />
                                        )}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        Proposed Rate: <span className="font-bold text-slate-900">${bid.proposedRate}/hr</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {bid.status === 'pending' && shift.status === 'open' ? (
                                      <>
                                        <button onClick={() => handleAcceptBid(bid)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors">
                                          Accept
                                        </button>
                                        <button onClick={() => handleRejectBid(bid.id)} className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-300 transition-colors">
                                          Reject
                                        </button>
                                      </>
                                    ) : (
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                        bid.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                        bid.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-slate-100 text-slate-700'
                                      }`}>
                                        {bid.status}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center space-x-2 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200 mb-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Enterprise SaaS</span>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900">Automated Compliance Hub</h2>
                  <p className="text-slate-600 mt-1">Real-time primary source verification and staff credential monitoring.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={handleNursysSync}
                    disabled={isSyncingNursys}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center space-x-2 shadow-lg disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncingNursys ? 'animate-spin' : ''}`} />
                    <span>{isSyncingNursys ? 'Syncing with Nursys...' : 'Run Global Nursys Sync'}</span>
                  </button>
                  <button className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Export Audit</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Staff</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900">{mockStaff.length}</div>
                  <div className="text-sm text-slate-500 font-medium mt-1">Actively Monitored</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Licenses</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900">
                    {mockStaff.filter(s => s.nursysStatus === 'expiring_soon').length}
                  </div>
                  <div className="text-sm text-amber-600 font-bold mt-1">Expiring &lt; 30 Days</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                      <XCircle className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900">
                    {mockStaff.filter(s => s.nursysStatus === 'invalid').length}
                  </div>
                  <div className="text-sm text-red-600 font-bold mt-1">Invalid/Suspended</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Health</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900">
                    {mockStaff.filter(s => s.immunizations !== 'compliant').length}
                  </div>
                  <div className="text-sm text-slate-500 font-medium mt-1">Missing Immunizations</div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-bold text-slate-900">Staff Credential Roster</h3>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Search staff..." 
                        className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button className="p-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Member</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nursys Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">License Exp</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">BLS / ACLS</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Immunizations</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mockStaff.map((staff) => (
                        <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                                {staff.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{staff.name}</div>
                                <div className="text-xs text-slate-500">{staff.role} • {staff.license}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit mb-1 ${
                                staff.nursysStatus === 'verified' ? 'bg-green-100 text-green-700' : 
                                staff.nursysStatus === 'expiring_soon' ? 'bg-amber-100 text-amber-700' : 
                                'bg-red-100 text-red-700'
                              }`}>
                                {staff.nursysStatus === 'verified' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {staff.nursysStatus === 'expiring_soon' && <AlertCircle className="w-3 h-3 mr-1" />}
                                {staff.nursysStatus === 'invalid' && <XCircle className="w-3 h-3 mr-1" />}
                                {staff.nursysStatus.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-slate-400 flex items-center">
                                <RefreshCw className="w-3 h-3 mr-1" /> {staff.lastChecked}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`text-sm font-medium ${staff.nursysStatus === 'expiring_soon' ? 'text-amber-600 font-bold' : 'text-slate-700'}`}>
                              {new Date(staff.licenseExp).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs space-y-1">
                              <div className="flex items-center justify-between w-24">
                                <span className="text-slate-500">BLS:</span>
                                <span className="font-medium text-slate-900">{new Date(staff.blsExp).toLocaleDateString()}</span>
                              </div>
                              {staff.aclsExp !== 'N/A' && (
                                <div className="flex items-center justify-between w-24">
                                  <span className="text-slate-500">ACLS:</span>
                                  <span className="font-medium text-slate-900">{new Date(staff.aclsExp).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {staff.immunizations === 'compliant' ? (
                              <div className="flex items-center text-sm text-green-600">
                                <CheckCircle2 className="w-4 h-4 mr-1" /> Compliant
                              </div>
                            ) : (
                              <div className="flex items-center text-sm text-amber-600 font-medium">
                                <AlertCircle className="w-4 h-4 mr-1" /> {staff.immunizations.replace('_', ' ').toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                              Send Reminder
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-display font-bold text-slate-900">Choose Your Posting Plan</h2>
                <p className="text-slate-600 mt-2 text-lg">Reach the best nursing talent with our flexible pricing options.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: 'Basic', price: '$99', features: ['30-day listing', 'Standard search ranking', 'Basic analytics'], color: 'slate' },
                  { name: 'Featured', price: '$199', features: ['60-day listing', 'Priority search ranking', 'Featured badge', 'Social media shoutout'], color: 'blue', popular: true },
                  { name: 'Enterprise', price: 'Custom', features: ['Unlimited listings', 'Dedicated account manager', 'Custom branding', 'API access'], color: 'slate' },
                ].map((plan, i) => (
                  <div key={i} className={`bg-white p-8 rounded-[2.5rem] border ${plan.popular ? 'border-blue-600 shadow-xl shadow-blue-100 relative' : 'border-slate-200 shadow-sm'} flex flex-col`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        Most Popular
                      </div>
                    )}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                      <div className="mt-4 flex items-baseline">
                        <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                        {plan.price !== 'Custom' && <span className="text-slate-500 ml-1">/job</span>}
                      </div>
                    </div>
                    <ul className="space-y-4 mb-10 flex-1">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-center space-x-3 text-sm text-slate-600">
                          <CheckCircle2 className={`w-4 h-4 ${plan.popular ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button className={`w-full py-4 rounded-xl font-bold transition-all ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                      {plan.price === 'Custom' ? 'Contact Sales' : 'Select Plan'}
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-16 bg-blue-50 p-8 rounded-3xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Need to post multiple jobs?</h4>
                    <p className="text-slate-600">Get a custom bundle and save up to 40% on your listings.</p>
                  </div>
                </div>
                <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold border border-blue-200 hover:bg-blue-50 transition-all">
                  Get a Quote
                </button>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-xl text-center max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Layout className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Employer Branding</h2>
              <p className="text-slate-600 mt-4 text-lg">
                Showcase your hospital&apos;s culture, technology, and facilities to attract top nursing talent.
              </p>
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <ImageIcon className="w-6 h-6 text-amber-500 mb-3" />
                  <h4 className="font-bold text-slate-900 mb-1">Visual Tours</h4>
                  <p className="text-xs text-slate-500">Show off your break rooms and tech.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <Heart className="w-6 h-6 text-red-500 mb-3" />
                  <h4 className="font-bold text-slate-900 mb-1">Culture First</h4>
                  <p className="text-xs text-slate-500">Tell your hospital&apos;s unique story.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <Zap className="w-6 h-6 text-green-500 mb-3" />
                  <h4 className="font-bold text-slate-900 mb-1">Perks & Benefits</h4>
                  <p className="text-xs text-slate-500">Highlight what makes you special.</p>
                </div>
              </div>
              <Link 
                href="/recruiter/branding"
                className="mt-12 inline-flex items-center space-x-2 bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl"
              >
                <span>Manage Branding Page</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          )}
          {activeTab === 'post' && (
            <div className="max-w-4xl mx-auto">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-xl text-center"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900">{editingJobId ? 'Job Updated Successfully!' : 'Job Posted Successfully!'}</h2>
                  <p className="text-slate-600 mt-4 text-lg">{editingJobId ? 'Your changes have been saved.' : 'Your listing is now live and visible to thousands of nurses.'}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-200 shadow-xl space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Job Title</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          required
                          type="text"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="e.g. Registered Nurse (ICU)"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Hospital / Facility</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          required
                          type="text"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="e.g. St. Jude Medical Center"
                          value={formData.hospital}
                          onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          required
                          type="text"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="e.g. San Francisco, CA"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Salary Range</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="e.g. $90k - $120k"
                          value={formData.salaryRange}
                          onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Specialty</label>
                      <div className="relative">
                        <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="e.g. ICU, Pediatrics, ER"
                          value={formData.specialty}
                          onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Required Qualifications</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <textarea
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-32"
                          placeholder="e.g. BSN, RN License, 2+ years experience..."
                          value={formData.qualifications}
                          onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Key Responsibilities</label>
                      <div className="relative">
                        <ClipboardList className="absolute left-4 top-6 w-5 h-5 text-slate-400" />
                        <textarea
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-32"
                          placeholder="e.g. Patient assessment, medication administration..."
                          value={formData.responsibilities}
                          onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Job Type</label>
                    <div className="flex flex-wrap gap-3">
                      {['full-time', 'part-time', 'contract', 'remote'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, type })}
                          className={`px-6 py-3 rounded-xl font-bold capitalize transition-all ${
                            formData.type === type 
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                              : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Job Description</label>
                      <button
                        type="button"
                        onClick={() => setShowAiWizard(true)}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 hover:bg-blue-100 transition-all border border-blue-100"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>AI Content Assistant</span>
                      </button>
                    </div>
                    <textarea
                      required
                      className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-64 font-sans text-slate-700 leading-relaxed"
                      placeholder="Describe the role, responsibilities, and benefits..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-6 h-6" />
                        <span>{editingJobId ? 'Save Changes' : 'Post Job Listing'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full"
              >
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Delete Job Listing?</h3>
                <p className="text-slate-600 mt-4">
                  Are you sure you want to delete this job listing? This action cannot be undone and all associated application data will be inaccessible.
                </p>
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteJob(showDeleteConfirm)}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete Job'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Auto-Schedule Modal */}
        <AnimatePresence>
          {schedulingAppId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden"
              >
                <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <CalendarDays className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">AI Interview Scheduler</h2>
                      <p className="text-slate-500 text-sm">Syncing calendars via AI proxy...</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSchedulingAppId(null);
                      setSchedulingStep(1);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 md:p-8 min-h-[300px] flex flex-col justify-center">
                  {schedulingStep === 1 && (
                    <div className="text-center space-y-6">
                      <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                        <CalendarDays className="absolute inset-0 m-auto w-8 h-8 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Analyzing Calendars</h3>
                        <p className="text-sm text-slate-500 mt-2">Checking your availability against the candidate's preferred hours...</p>
                      </div>
                      <button 
                        onClick={() => setSchedulingStep(2)}
                        className="opacity-0 w-full h-full absolute inset-0" 
                        title="Hidden button to advance step for demo purposes"
                      >
                         Advance
                      </button>
                      <button onClick={() => {
                        setTimeout(() => setSchedulingStep(2), 1500)
                      }} className="bg-indigo-50 text-indigo-600 font-bold px-6 py-2 rounded-xl text-sm">
                        Simulate AI Sync
                      </button>
                    </div>
                  )}

                  {schedulingStep === 2 && (
                    <div className="space-y-6">
                      <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-start space-x-3 border border-green-100">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-medium">Found 3 overlapping slots next week that work for both parties.</p>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Proposed Times (Local Time)</label>
                        <div className="p-4 bg-slate-50 border border-indigo-200 rounded-xl cursor-pointer ring-2 ring-indigo-500 bg-indigo-50/50">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900">Tuesday, Oct 24</span>
                            <span className="text-sm font-bold text-indigo-600">10:00 AM - 10:45 AM</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Highest probability of acceptance based on past candidate behavior.</p>
                        </div>
                        <div className="p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 opacity-60">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900">Wednesday, Oct 25</span>
                            <span className="text-sm font-bold text-slate-600">2:00 PM - 2:45 PM</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => setSchedulingStep(3)}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex justify-center items-center space-x-2 shadow-lg hover:bg-indigo-700 transition"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send Calendar Invites</span>
                      </button>
                    </div>
                  )}

                  {schedulingStep === 3 && (
                    <div className="text-center space-y-4">
                       <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">Invites Sent!</h3>
                      <p className="text-slate-600">
                        Calendar holds have been sent to both you and the candidate. A Google Meet link has been automatically generated.
                      </p>
                      <button 
                        onClick={() => {
                          setSchedulingAppId(null);
                          setSchedulingStep(1);
                        }}
                        className="mt-6 w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Shift Modal */}
        <AnimatePresence>
          {showShiftModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200"
              >
                <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Post Urgent Shift</h2>
                      <p className="text-slate-500 text-sm">Fill your staffing gaps instantly.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowShiftModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 md:p-8">
                  <form onSubmit={handleShiftSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Shift Title</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                          placeholder="e.g. ICU Night Shift"
                          value={shiftFormData.title}
                          onChange={(e) => setShiftFormData({ ...shiftFormData, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Hospital/Facility</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                          placeholder="e.g. St. Jude Medical"
                          value={shiftFormData.hospital}
                          onChange={(e) => setShiftFormData({ ...shiftFormData, hospital: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Location</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                          placeholder="e.g. Los Angeles, CA"
                          value={shiftFormData.location}
                          onChange={(e) => setShiftFormData({ ...shiftFormData, location: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Date</label>
                        <input
                          type="date"
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                          value={shiftFormData.date}
                          onChange={(e) => setShiftFormData({ ...shiftFormData, date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Start Time</label>
                        <input
                          type="time"
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                          value={shiftFormData.startTime}
                          onChange={(e) => setShiftFormData({ ...shiftFormData, startTime: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">End Time</label>
                        <input
                          type="time"
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                          value={shiftFormData.endTime}
                          onChange={(e) => setShiftFormData({ ...shiftFormData, endTime: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Base Rate ($/hr)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                          placeholder="e.g. 120"
                          value={shiftFormData.baseRate}
                          onChange={(e) => setShiftFormData({ ...shiftFormData, baseRate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Shift Urgency</label>
                      <select
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                        value={shiftFormData.type}
                        onChange={(e) => setShiftFormData({ ...shiftFormData, type: e.target.value })}
                      >
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                        <option value="Urgent">Urgent (Last Minute)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-5 h-5" />}
                      <span>{loading ? 'Posting...' : 'Post Shift Now'}</span>
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* AI Wizard Modal */}
        <AnimatePresence>
          {showAiWizard && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative"
              >
                <button 
                  onClick={() => setShowAiWizard(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
                >
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>

                <div className="p-8 md:p-12">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">AI Job Description Wizard</h2>
                      <p className="text-slate-500 font-medium">Provide a few details and I&apos;ll write the rest.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Job Title</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="e.g. Registered Nurse (ICU)"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Hospital / Facility</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="e.g. St. Jude Medical Center"
                          value={formData.hospital}
                          onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Location</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="e.g. Los Angeles, CA"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Specialty</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="e.g. ICU, ER, Pediatrics"
                          value={formData.specialty}
                          onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Key Qualifications</label>
                      <textarea
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-24"
                        placeholder="e.g. BSN, 2+ years experience, ACLS certification..."
                        value={formData.qualifications}
                        onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Primary Responsibilities</label>
                      <textarea
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-24"
                        placeholder="e.g. Patient care, medication administration, charting..."
                        value={formData.responsibilities}
                        onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                      />
                    </div>

                    <button
                      onClick={generateDescription}
                      disabled={aiLoading || !formData.title || !formData.hospital}
                      className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Generating Description...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Generate Compelling Description</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
