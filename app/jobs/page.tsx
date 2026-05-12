'use client';

import { useState, useEffect, useCallback } from 'react';
import { db, auth, OperationType, handleFirestoreError } from '@/firebase';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { Search, MapPin, Briefcase, Filter, ChevronRight, DollarSign, Clock, Building2, X, Send, CheckCircle2, Loader2, Stethoscope, GraduationCap, ClipboardList, Star, Sparkles, Zap, Bell, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import { addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { GoogleGenAI, Type } from "@google/genai";

export default function JobsPage() {
  const { user, profile, login } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [brandingMap, setBrandingMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [matchedJobs, setMatchedJobs] = useState<any[]>([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'jobs' | 'gigs'>('jobs');
  const [gigShifts, setGigShifts] = useState<any[]>([]);
  const [biddingShift, setBiddingShift] = useState<any | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isBidding, setIsBidding] = useState(false);
  const [myBids, setMyBids] = useState<any[]>([]);
  
  // Advanced Filter State
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedShiftTypes, setSelectedShiftTypes] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState<string>('all');

  // Application Modal State
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [passport, setPassport] = useState<any | null>(null);
  const [isQuickApplying, setIsQuickApplying] = useState(false);

  // Job Alert State
  const [isJobAlertModalOpen, setIsJobAlertModalOpen] = useState(false);
  const [jobAlertForm, setJobAlertForm] = useState({
    email: '',
    specialty: '',
    location: '',
    experienceYears: 0
  });
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setJobAlertForm({
        email: profile.email || '',
        specialty: profile.specialty || '',
        location: profile.location || '',
        experienceYears: profile.experienceYears || 0
      });
    }
  }, [profile]);

  useEffect(() => {
    fetchJobs();
    fetchBranding();
    fetchGigShifts();
  }, []);

  const fetchGigShifts = async () => {
    try {
      const gigRef = collection(db, 'gigShifts');
      const q = query(gigRef, orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const shifts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // If none, use mock data
      if (shifts.length === 0) {
        setGigShifts([
          {
            id: 'mock-1',
            title: 'ER Night Coverage',
            hospital: 'St. Mary\'s Medical Center',
            location: 'San Francisco, CA',
            date: '2026-10-24',
            startTime: '19:00',
            endTime: '07:00',
            type: 'Urgent',
            status: 'open',
            baseRate: 75,
            postedBy: 'mock-recruiter'
          },
          {
            id: 'mock-2',
            title: 'ICU Weekend Shift',
            hospital: 'General Hospital',
            location: 'Oakland, CA',
            date: '2026-10-25',
            startTime: '07:00',
            endTime: '19:00',
            type: 'Premium',
            status: 'open',
            baseRate: 85,
            postedBy: 'mock-recruiter'
          }
        ]);
      } else {
        setGigShifts(shifts);
      }
    } catch (error) {
      console.error('Error fetching gig shifts:', error);
    }
  };

  useEffect(() => {
    if (user && profile?.role === 'nurse') {
      fetchMyBids();
    }
  }, [user, profile]);

  const fetchMyBids = async () => {
    if (!user) return;
    try {
      const bidsRef = collection(db, 'gigBids');
      const q = query(bidsRef, where('nurseId', '==', user.uid));
      const snapshot = await getDocs(q);
      setMyBids(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  const submitBid = async () => {
    if (!user || !biddingShift || !bidAmount) {
      login();
      return;
    }
    
    setIsBidding(true);
    try {
      await addDoc(collection(db, 'gigBids'), {
        shiftId: biddingShift.id,
        nurseId: user.uid,
        amount: Number(bidAmount),
        status: 'pending',
        createdAt: serverTimestamp()
      });
      fetchMyBids();
      setBiddingShift(null);
      setBidAmount('');
      alert('Your bid has been placed!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gigBids');
    } finally {
      setIsBidding(false);
    }
  };

  const fetchPassport = useCallback(async () => {
    if (!user) return;
    try {
      const passportRef = doc(db, 'passports', user.uid);
      const passportSnap = await getDoc(passportRef);
      if (passportSnap.exists()) {
        setPassport(passportSnap.data());
      }
    } catch (error) {
      console.error('Error fetching passport:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user && profile?.role === 'nurse') {
      fetchPassport();
    }
  }, [user, profile, fetchPassport]);

  const findMatches = useCallback(async (allJobs: any[]) => {
    if (!profile || profile.role !== 'nurse' || allJobs.length === 0) return;
    
    setMatchingLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const nurseProfile = {
        specialty: profile.specialty || 'General Nursing',
        experience: profile.experienceYears || 0,
        location: profile.location || '',
        preferredLocations: profile.preferredLocations || []
      };

      const jobsContext = allJobs.map(j => ({
        id: j.id,
        title: j.title,
        hospital: j.hospital,
        location: j.location,
        specialty: j.specialty || '',
        description: j.description?.substring(0, 200) + '...'
      }));

      const prompt = `As an expert nursing recruiter, analyze this nurse's profile and the list of available jobs. 
      Identify the top 3 most relevant job matches based on specialty, experience, and location preferences.
      
      Nurse Profile:
      - Specialty: ${nurseProfile.specialty}
      - Experience: ${nurseProfile.experience} years
      - Current Location: ${nurseProfile.location}
      - Preferred Locations: ${nurseProfile.preferredLocations.join(', ')}
      
      Available Jobs:
      ${JSON.stringify(jobsContext)}
      
      Return the IDs of the top 3 matches in order of relevance.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ text: prompt }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              reasoning: { type: Type.STRING, description: "Brief explanation of why these matches were chosen" }
            },
            required: ["matchIds", "reasoning"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      const matches = result.matchIds
        .map((id: string) => allJobs.find(j => j.id === id))
        .filter(Boolean);
      
      setMatchedJobs(matches);
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setMatchingLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (profile && profile.role === 'nurse' && jobs.length > 0 && matchedJobs.length === 0) {
      findMatches(jobs);
    }
  }, [profile, jobs, matchedJobs.length, findMatches]);

  const fetchBranding = async () => {
    try {
      const brandingRef = collection(db, 'employerBranding');
      const querySnapshot = await getDocs(brandingRef);
      const map: Record<string, string> = {};
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        map[data.hospitalName] = doc.id;
      });
      setBrandingMap(map);
    } catch (error) {
      console.error('Error fetching branding:', error);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, orderBy('createdAt', 'desc'), limit(20));
      const querySnapshot = await getDocs(q);
      const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // If no jobs in DB, use mock data for demo
      if (jobsData.length === 0) {
        setJobs([
          { 
            id: '1', 
            title: 'Registered Nurse (ER)', 
            hospital: 'St. Mary\'s Medical Center', 
            location: 'San Francisco, CA', 
            type: 'full-time', 
            salaryRange: '$95k - $120k', 
            specialty: 'Emergency Room',
            experienceLevel: 'Mid Level',
            shiftType: 'Rotating',
            description: 'Join our fast-paced ER team at a Level 1 Trauma Center. We are looking for dedicated nurses who thrive in high-pressure environments.',
            qualifications: '• Valid RN License in CA\n• 2+ years ER experience\n• BLS, ACLS, and PALS certifications',
            responsibilities: '• Assess and stabilize patients in critical condition\n• Administer medications and treatments\n• Collaborate with multidisciplinary teams',
            postedBy: 'mock-recruiter-1' 
          },
          { 
            id: '2', 
            title: 'Pediatric Nurse Practitioner', 
            hospital: 'Children\'s Health', 
            location: 'Dallas, TX', 
            type: 'full-time', 
            salaryRange: '$110k - $140k', 
            specialty: 'Pediatrics',
            experienceLevel: 'Senior Level',
            shiftType: 'Day',
            description: 'Provide expert care to children in our specialized pediatric unit. Focus on family-centered care and evidence-based practice.',
            qualifications: '• Master\'s or Doctorate in Nursing\n• Certified Pediatric Nurse Practitioner\n• 3+ years clinical experience\n• BLS certification',
            responsibilities: '• Conduct physical exams and diagnostic tests\n• Develop and implement treatment plans\n• Educate families on child health and wellness',
            postedBy: 'mock-recruiter-2' 
          },
          { 
            id: '3', 
            title: 'Travel Nurse (ICU)', 
            hospital: 'Rapid Response Healthcare', 
            location: 'New York, NY', 
            type: 'contract', 
            salaryRange: '$3,500 - $4,200 / week', 
            specialty: 'ICU/Critical Care',
            experienceLevel: 'Mid Level',
            shiftType: 'Night',
            description: 'High-pay travel assignments in top-tier ICU units. Experience New York while advancing your career.',
            qualifications: '• Valid RN License\n• 2+ years ICU experience\n• CCRN certification preferred\n• ACLS and BLS required',
            responsibilities: '• Monitor critically ill patients\n• Manage advanced life support equipment\n• Provide compassionate care to patients and families',
            postedBy: 'mock-recruiter-3' 
          },
          { 
            id: '4', 
            title: 'Home Health Nurse', 
            hospital: 'CareAtHome', 
            location: 'Remote', 
            type: 'part-time', 
            salaryRange: '$45 - $60 / hr', 
            specialty: 'Home Health',
            experienceLevel: 'Entry Level',
            shiftType: 'Flexible',
            description: 'Flexible home visits for patients requiring post-acute care. Manage your own schedule and build meaningful relationships.',
            qualifications: '• Valid RN License\n• 1+ year home health experience\n• Strong assessment and communication skills\n• BLS certification',
            responsibilities: '• Perform home health assessments\n• Coordinate care with physicians and families\n• Document patient progress and outcomes',
            postedBy: 'mock-recruiter-4' 
          },
        ]);
      } else {
        setJobs(jobsData);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      login();
      return;
    }
    if (!selectedJob) return;

    setIsApplying(true);
    try {
      await addDoc(collection(db, 'applications'), {
        jobId: selectedJob.id,
        nurseId: user.uid,
        recruiterId: selectedJob.postedBy || 'unknown',
        status: 'pending',
        coverLetter: coverLetter,
        isQuickApply: false,
        passportVerified: passport?.isFullyVerified || false,
        createdAt: serverTimestamp(),
        resumeUrl: profile?.resumeUrl || ''
      });
      setApplySuccess(true);
      setTimeout(() => {
        setSelectedJob(null);
        setApplySuccess(false);
        setCoverLetter('');
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'applications');
    } finally {
      setIsApplying(false);
    }
  };

  const handleQuickApply = async () => {
    if (!user || !selectedJob || !passport) return;

    setIsQuickApplying(true);
    try {
      await addDoc(collection(db, 'applications'), {
        jobId: selectedJob.id,
        nurseId: user.uid,
        recruiterId: selectedJob.postedBy || 'unknown',
        status: 'pending',
        coverLetter: "Quick Apply via Nurse Passport. All credentials pre-verified.",
        isQuickApply: true,
        passportVerified: passport.isFullyVerified || false,
        createdAt: serverTimestamp(),
        resumeUrl: profile?.resumeUrl || ''
      });
      setApplySuccess(true);
      setTimeout(() => {
        setSelectedJob(null);
        setApplySuccess(false);
        setCoverLetter('');
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'applications');
    } finally {
      setIsQuickApplying(false);
    }
  };

  const handleSubscribeAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      login();
      return;
    }

    setIsSubscribing(true);
    try {
      await addDoc(collection(db, 'jobAlerts'), {
        uid: user.uid,
        email: jobAlertForm.email,
        specialty: jobAlertForm.specialty,
        location: jobAlertForm.location,
        experienceYears: Number(jobAlertForm.experienceYears),
        isActive: true,
        createdAt: serverTimestamp()
      });
      setSubscribeSuccess(true);
      setTimeout(() => {
        setIsJobAlertModalOpen(false);
        setSubscribeSuccess(false);
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'jobAlerts');
    } finally {
      setIsSubscribing(false);
    }
  };

  const parseSalary = (salaryStr: string) => {
    if (!salaryStr) return 0;
    const str = salaryStr.toLowerCase().replace(/,/g, '');
    const match = str.match(/\$?(\d+)(k)?/);
    if (!match) return 0;
    let val = parseInt(match[1], 10);
    if (str.includes('k')) val *= 1000;
    if (str.includes('/ hr') || str.includes('/hr')) val *= 2080;
    if (str.includes('/ week') || str.includes('/week')) val *= 52;
    return val;
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = job.location.toLowerCase().includes(location.toLowerCase());
    const matchesType = filterType === 'all' || job.type === filterType;
    
    const matchesSpecialty = selectedSpecialties.length === 0 || (job.specialty && selectedSpecialties.includes(job.specialty));
    const matchesExperience = selectedExperience.length === 0 || (job.experienceLevel && selectedExperience.includes(job.experienceLevel));
    const matchesShiftType = selectedShiftTypes.length === 0 || (job.shiftType && selectedShiftTypes.includes(job.shiftType));
    
    const matchesCerts = selectedCertifications.length === 0 || selectedCertifications.every(cert => 
      job.qualifications && job.qualifications.toLowerCase().includes(cert.toLowerCase())
    );

    let matchesSalary = true;
    if (minSalary !== 'all') {
      const jobSalary = parseSalary(job.salaryRange);
      matchesSalary = jobSalary >= parseInt(minSalary, 10);
    }

    return matchesSearch && matchesLocation && matchesType && matchesSpecialty && matchesExperience && matchesShiftType && matchesCerts && matchesSalary;
  });

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-900">Find Your Next Nursing Role</h1>
          <p className="text-slate-600 mt-2">Browse thousands of opportunities from top hospitals and clinics.</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8">
          <button
            onClick={() => setViewTab('jobs')}
            className={`px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all ${
              viewTab === 'jobs' 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span>Full-Time & Per Diem Jobs</span>
          </button>
          <button
            onClick={() => setViewTab('gigs')}
            className={`px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all ${
              viewTab === 'gigs' 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>On-Demand Gig Shifts</span>
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ml-2">New</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center px-4 bg-slate-50 rounded-xl border border-slate-100">
              <Search className="w-5 h-5 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Job title or keywords"
                className="w-full py-3 bg-transparent focus:outline-none text-slate-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center px-4 bg-slate-50 rounded-xl border border-slate-100">
              <MapPin className="w-5 h-5 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Location"
                className="w-full py-3 bg-transparent focus:outline-none text-slate-900"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="flex items-center px-4 bg-slate-50 rounded-xl border border-slate-100">
              <Filter className="w-5 h-5 text-slate-400 mr-2" />
              <select
                className="w-full py-3 bg-transparent focus:outline-none text-slate-900 appearance-none"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <button className="bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md">
              Search Jobs
            </button>
          </div>
        </div>

        {/* Main Content */}
        {viewTab === 'jobs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar Filters */}
            <div className="hidden lg:block space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Salary Range</h3>
              <select
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 text-sm"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
              >
                <option value="all">Any Salary</option>
                <option value="50000">$50,000+ / year</option>
                <option value="75000">$75,000+ / year</option>
                <option value="100000">$100,000+ / year</option>
                <option value="125000">$125,000+ / year</option>
                <option value="150000">$150,000+ / year</option>
              </select>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Specialty</h3>
              <div className="space-y-2">
                {['Emergency Room', 'Pediatrics', 'ICU/Critical Care', 'Labor & Delivery', 'Surgical', 'Psychiatric', 'Home Health'].map((s) => (
                  <label key={s} className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedSpecialties.includes(s)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedSpecialties([...selectedSpecialties, s]);
                        else setSelectedSpecialties(selectedSpecialties.filter(x => x !== s));
                      }}
                    />
                    <span className="text-slate-600 group-hover:text-blue-600 transition-colors text-sm">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Shift Type</h3>
              <div className="space-y-2">
                {['Day', 'Night', 'Rotating', 'Flexible'].map((s) => (
                  <label key={s} className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedShiftTypes.includes(s)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedShiftTypes([...selectedShiftTypes, s]);
                        else setSelectedShiftTypes(selectedShiftTypes.filter(x => x !== s));
                      }}
                    />
                    <span className="text-slate-600 group-hover:text-blue-600 transition-colors text-sm">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Certifications</h3>
              <div className="space-y-2">
                {['BLS', 'ACLS', 'PALS', 'CCRN', 'NRP'].map((c) => (
                  <label key={c} className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedCertifications.includes(c)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedCertifications([...selectedCertifications, c]);
                        else setSelectedCertifications(selectedCertifications.filter(x => x !== c));
                      }}
                    />
                    <span className="text-slate-600 group-hover:text-blue-600 transition-colors text-sm">{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Experience Level</h3>
              <div className="space-y-2">
                {['Entry Level', 'Mid Level', 'Senior Level', 'Management'].map((e) => (
                  <label key={e} className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedExperience.includes(e)}
                      onChange={(ev) => {
                        if (ev.target.checked) setSelectedExperience([...selectedExperience, e]);
                        else setSelectedExperience(selectedExperience.filter(x => x !== e));
                      }}
                    />
                    <span className="text-slate-600 group-hover:text-blue-600 transition-colors text-sm">{e}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-xl">
              <h3 className="font-bold text-xl mb-2">Post a Job</h3>
              <p className="text-blue-100 text-sm mb-6">Reach 50,000+ qualified nurses. Get your job featured today.</p>
              <Link href="/recruiter" className="block w-full bg-white text-blue-600 text-center py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                Recruiter Portal
              </Link>
            </div>

            {/* Job Alert Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Bell className="w-16 h-16 text-blue-600" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center space-x-2 text-blue-600 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">AI Powered</span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Smart Job Alerts</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Get notified the moment a job matching your specialty and preferences is posted.
                </p>
                <button 
                  onClick={() => setIsJobAlertModalOpen(true)}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-100"
                >
                  <Bell className="w-4 h-4" />
                  <span>Set Alert</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Matches Section */}
          {profile?.role === 'nurse' && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-xl">
                    <Sparkles className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Matches for You</h2>
                    <p className="text-slate-500 text-sm">AI-powered suggestions based on your profile</p>
                  </div>
                </div>
                {matchedJobs.length > 0 && (
                  <button 
                    onClick={() => findMatches(jobs)}
                    disabled={matchingLoading}
                    className="text-indigo-600 font-bold text-sm hover:underline flex items-center space-x-1"
                  >
                    {matchingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    <span>Refresh Matches</span>
                  </button>
                )}
              </div>

              {matchingLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 animate-pulse h-48" />
                  ))}
                </div>
              ) : matchedJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {matchedJobs.map((job) => (
                    <motion.div
                      key={job.id}
                      whileHover={{ y: -5, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                      className={`bg-white rounded-3xl border shadow-sm transition-all relative overflow-hidden group cursor-pointer flex flex-col h-fit ${
                        expandedJobId === job.id ? 'ring-2 ring-indigo-500 border-transparent shadow-xl' : 'border-indigo-100 hover:border-indigo-300'
                      }`}
                      onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                    >
                      <div className="p-6 flex-1">
                        <div className="absolute top-0 right-0 p-3 z-10">
                          <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg">
                            <Sparkles className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                            <Building2 className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors leading-tight">{job.title}</h3>
                            <p className="text-xs text-slate-500 font-medium truncate">{job.hospital}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                            <MapPin className="w-3 h-3 mr-2 text-slate-400" />
                            <span className="truncate">{job.location}</span>
                          </div>
                          <div className="flex items-center text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                            <DollarSign className="w-3 h-3 mr-2 text-slate-400" />
                            <span className="truncate">{job.salaryRange}</span>
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedJobId === job.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 mt-4 border-t border-indigo-50 space-y-4">
                                {job.qualifications && (
                                  <div>
                                    <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Qualifications</h4>
                                    <p className="text-slate-600 text-[10px] leading-relaxed line-clamp-3">{job.qualifications}</p>
                                  </div>
                                )}
                                <div>
                                  <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">About the Role</h4>
                                  <p className="text-slate-600 text-[10px] leading-relaxed line-clamp-3">{job.description}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedJob(job);
                                    }}
                                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-[10px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                  >
                                    Apply Now
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedJobId(null);
                                    }}
                                    className="w-full py-1 text-slate-400 text-[9px] font-bold hover:text-slate-600 transition-colors uppercase tracking-widest"
                                  >
                                    Show Less
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {!expandedJobId || expandedJobId !== job.id ? (
                        <div className="px-6 pb-6 mt-auto">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedJob(job);
                            }}
                            className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[10px] hover:bg-indigo-600 transition-all"
                          >
                            Quick Apply
                          </button>
                        </div>
                      ) : null}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100 text-center">
                  <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
                  <h3 className="font-bold text-indigo-900">Complete your profile for better matches</h3>
                  <p className="text-indigo-700/70 text-sm mt-2 max-w-md mx-auto">
                    Add your specialty, experience, and location preferences to see personalized job suggestions.
                  </p>
                  <Link href="/profile" className="mt-6 inline-block bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all">
                    Update Profile
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Job List */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-medium tracking-wide">Loading opportunities...</p>
              </div>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                  className={`bg-white rounded-3xl border shadow-sm transition-all group relative overflow-hidden cursor-pointer flex flex-col h-fit ${
                    job.isFeatured ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 hover:border-blue-300'
                  } ${expandedJobId === job.id ? 'ring-2 ring-blue-500 border-transparent shadow-xl' : ''}`}
                  onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                >
                  {job.isFeatured && (
                    <div className="absolute top-0 right-0 z-10">
                      <div className="bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-2xl flex items-center shadow-sm">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        FEATURED
                      </div>
                    </div>
                  )}
                  <div className="p-6 flex-1">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                        <Building2 className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">{job.title}</h3>
                        <div className="flex items-center mt-1 text-slate-500 text-xs font-medium truncate">
                          <Building2 className="w-3 h-3 mr-1" /> 
                          {job.hospital}
                          {brandingMap[job.hospital] && (
                            <Link 
                              href={`/hospitals/${brandingMap[job.hospital]}`}
                              className="ml-2 text-blue-600 hover:underline flex items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              (Profile)
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center text-xs text-slate-600 bg-slate-50 p-2 rounded-xl">
                        <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-600 bg-slate-50 p-2 rounded-xl">
                        <DollarSign className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        <span className="truncate">{job.salaryRange}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                          {job.type}
                        </span>
                        {job.specialty && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                            {job.specialty}
                          </span>
                        )}
                      </div>
                      <div className={`p-1.5 rounded-full bg-slate-50 text-slate-400 transition-transform duration-300 ${expandedJobId === job.id ? 'rotate-180 bg-blue-50 text-blue-600' : ''}`}>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedJobId === job.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pt-6 mt-6 border-t border-slate-100 space-y-6">
                            {job.qualifications && (
                              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                                  <GraduationCap className="w-3 h-3 mr-1" />
                                  Qualifications
                                </h4>
                                <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">{job.qualifications}</p>
                              </div>
                            )}
                            
                            {job.responsibilities && (
                              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                                  <ClipboardList className="w-3 h-3 mr-1" />
                                  Key Responsibilities
                                </h4>
                                <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
                              </div>
                            )}

                            <div>
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Full Description</h4>
                              <p className="text-slate-600 text-xs leading-relaxed">{job.description}</p>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedJob(job);
                                }}
                                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                              >
                                <Send className="w-4 h-4" />
                                <span>Apply Now</span>
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedJobId(null);
                                }}
                                className="w-full py-2 text-slate-400 text-[10px] font-bold hover:text-slate-600 transition-colors uppercase tracking-widest"
                              >
                                Show Less
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {!expandedJobId || expandedJobId !== job.id ? (
                    <div className="px-6 pb-6 mt-auto">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJob(job);
                        }}
                        className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all"
                      >
                        Quick Apply
                      </button>
                    </div>
                  ) : null}
                </motion.div>
              ))
            ) : (
              <div className="col-span-full bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No jobs found</h3>
                <p className="text-slate-500 mt-2">Try adjusting your search filters or keywords.</p>
                <button 
                  onClick={() => {setSearchQuery(''); setLocation(''); setFilterType('all');}}
                  className="mt-6 text-blue-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
        )}

        {viewTab === 'gigs' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -mr-32 -mt-32" />
              <div className="relative z-10">
                <div className="inline-flex items-center space-x-2 bg-blue-500/30 px-3 py-1 rounded-full border border-blue-400/30 mb-6">
                  <Zap className="w-4 h-4 text-blue-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Live Gig Marketplace</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight mb-4">
                  Bid on Urgent Shifts
                </h2>
                <p className="text-blue-200 text-lg max-w-2xl">
                  Hospitals are experiencing sudden shortages. Place a bid on these urgent needs and get guaranteed instant payouts via NursePay when the shift ends.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gigShifts.length === 0 ? (
                <div className="col-span-full p-12 text-center text-slate-500 italic">No gig shifts active right now.</div>
              ) : (
                gigShifts.map((shift) => {
                  const hasBid = myBids.find(b => b.shiftId === shift.id);
                  return (
                    <motion.div 
                      key={shift.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col"
                    >
                      {shift.type === 'Urgent' && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">Urgent</div>
                      )}
                      {shift.type === 'Premium' && (
                        <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">Premium</div>
                      )}
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 mt-4">{shift.title}</h3>
                        <div className="flex items-center text-slate-500 text-sm mb-4">
                          <Building2 className="w-4 h-4 mr-2" />
                          <span>{shift.hospital} • {shift.location}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-indigo-700 bg-indigo-50 p-3 rounded-xl mb-6">
                          <Clock className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm font-semibold">{shift.date} | {shift.startTime} - {shift.endTime}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Base Rate</p>
                          <p className="text-2xl font-black text-slate-900">${shift.baseRate}<span className="text-sm font-medium text-slate-500">/hr</span></p>
                        </div>
                        {hasBid ? (
                           <div className="text-right">
                             <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">Bid Placed: ${hasBid.amount}/hr</div>
                             <div className="text-xs text-slate-400 mt-1 capitalize text-right">{hasBid.status}</div>
                           </div>
                        ) : (
                          <button 
                            onClick={() => {
                              if (!user) login();
                              else setBiddingShift(shift);
                            }}
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                          >
                            Place Bid
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bid Modal */}
      <AnimatePresence>
        {biddingShift && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Place Your Bid</h2>
                      <p className="text-slate-500 text-sm">Negotiate your hourly rate</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setBiddingShift(null);
                      setBidAmount('');
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-slate-900">{biddingShift.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">{biddingShift.hospital}</p>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200">
                      <span className="text-sm font-bold text-slate-600">Base Rate</span>
                      <span className="font-bold text-slate-900">${biddingShift.baseRate}/hr</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Your Counter-Bid ($/hr)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="number"
                          min={biddingShift.baseRate}
                          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg font-bold text-slate-900"
                          placeholder="0.00"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Hospitals are more likely to accept bids within 10-15% of the base rate.</p>
                    </div>

                    <button
                      onClick={submitBid}
                      disabled={isBidding || !bidAmount}
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex justify-center items-center space-x-2 shadow-lg disabled:opacity-50 hover:bg-blue-700 transition"
                    >
                       {isBidding ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Submit Bid</span>}
                    </button>
                  </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Apply Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative"
            >
              <button 
                onClick={() => setSelectedJob(null)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>

              {applySuccess ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900">Application Sent!</h2>
                  <p className="text-slate-600 mt-4 text-lg">Your application for {selectedJob.title} has been submitted successfully.</p>
                </div>
              ) : (
                <div className="p-8 md:p-12">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Apply for {selectedJob.title}</h2>
                      <p className="text-slate-500 font-medium">{selectedJob.hospital} • {selectedJob.location}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                      {selectedJob.specialty && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Specialty</h4>
                          <div className="flex items-center text-slate-700 font-medium">
                            <Stethoscope className="w-4 h-4 mr-2 text-blue-600" />
                            {selectedJob.specialty}
                          </div>
                        </div>
                      )}
                      {selectedJob.qualifications && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Qualifications</h4>
                          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{selectedJob.qualifications}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-6">
                      {selectedJob.responsibilities && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Key Responsibilities</h4>
                          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{selectedJob.responsibilities}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Description</h4>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 text-sm leading-relaxed max-h-64 overflow-y-auto custom-scrollbar">
                      <div className="prose prose-slate prose-sm max-w-none">
                        {selectedJob.description}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleApply} className="space-y-6">
                    {passport && (
                      <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-indigo-100 rounded-xl">
                              <ShieldCheck className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-indigo-900">Nurse Passport Detected</h4>
                              <p className="text-indigo-700/70 text-xs">Your verified credentials are ready</p>
                            </div>
                          </div>
                          {passport.isFullyVerified && (
                            <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              VERIFIED
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleQuickApply}
                          disabled={isQuickApplying}
                          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2"
                        >
                          {isQuickApplying ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Zap className="w-5 h-5" />
                              <span>Quick Apply with Passport</span>
                            </>
                          )}
                        </button>
                        <div className="mt-4 flex items-center justify-center">
                          <div className="h-px bg-indigo-200 flex-grow" />
                          <span className="px-4 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Or apply manually</span>
                          <div className="h-px bg-indigo-200 flex-grow" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Cover Letter / Note to Recruiter</label>
                      <textarea
                        required
                        className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-48 text-slate-700 leading-relaxed"
                        placeholder="Tell the recruiter why you're a great fit for this role..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                      />
                    </div>

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-blue-900">Your profile will be shared</p>
                          <p className="text-xs text-blue-700 mt-1">The recruiter will receive your contact info, specialty, and experience from your profile.</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isApplying}
                      className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isApplying ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Submit Application</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Job Alert Modal */}
      <AnimatePresence>
        {isJobAlertModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative"
            >
              <button 
                onClick={() => setIsJobAlertModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>

              {subscribeSuccess ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900">Alert Set!</h2>
                  <p className="text-slate-600 mt-4 text-lg">We&apos;ll notify you at <strong>{jobAlertForm.email}</strong> when matching jobs are found.</p>
                </div>
              ) : (
                <div className="p-8 md:p-10">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                      <Bell className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Smart Job Alert</h2>
                      <p className="text-slate-500 font-medium">Get AI-powered notifications</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubscribeAlert} className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Notification Email</label>
                      <input
                        required
                        type="email"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900"
                        placeholder="your@email.com"
                        value={jobAlertForm.email}
                        onChange={(e) => setJobAlertForm({ ...jobAlertForm, email: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Specialty</label>
                        <input
                          required
                          type="text"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900"
                          placeholder="e.g. ICU"
                          value={jobAlertForm.specialty}
                          onChange={(e) => setJobAlertForm({ ...jobAlertForm, specialty: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Location</label>
                        <input
                          required
                          type="text"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900"
                          placeholder="City, State"
                          value={jobAlertForm.location}
                          onChange={(e) => setJobAlertForm({ ...jobAlertForm, location: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Experience (Years)</label>
                      <input
                        required
                        type="number"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900"
                        value={jobAlertForm.experienceYears}
                        onChange={(e) => setJobAlertForm({ ...jobAlertForm, experienceYears: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <Sparkles className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-indigo-900">AI Matching Enabled</p>
                          <p className="text-xs text-indigo-700 mt-1">Our AI will analyze job descriptions to find the best fit for your specific skills.</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubscribing}
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isSubscribing ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <Bell className="w-5 h-5" />
                          <span>Activate Alert</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
