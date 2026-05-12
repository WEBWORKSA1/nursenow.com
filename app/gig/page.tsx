'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Filter, 
  Search, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  ShieldCheck, 
  Star, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  Bell,
  Sparkles,
  Gavel,
  User,
  X
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
  serverTimestamp, 
  updateDoc, 
  doc,
  getDocs,
  limit
} from 'firebase/firestore';

interface GigShift {
  id: string;
  title: string;
  hospital: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  baseRate: number;
  type: 'Urgent' | 'Premium' | 'Standard';
  status: 'open' | 'filled' | 'cancelled';
  postedBy: string;
  createdAt: any;
}

interface Bid {
  id: string;
  shiftId: string;
  nurseId: string;
  nurseName: string;
  proposedRate: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

interface GigNotification {
  id: string;
  uid: string;
  shiftId: string;
  message: string;
  isRead: boolean;
  createdAt: any;
}

export default function GigPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [shifts, setShifts] = useState<GigShift[]>([]);
  const [userBids, setUserBids] = useState<Bid[]>([]);
  const [recruiterShifts, setRecruiterShifts] = useState<GigShift[]>([]);
  const [allBidsForRecruiter, setAllBidsForRecruiter] = useState<Bid[]>([]);
  const [selectedShift, setSelectedShift] = useState<GigShift | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(0);
  
  // Recruiter State
  const [showPostModal, setShowPostModal] = useState(false);
  const [newShift, setNewShift] = useState({
    title: '',
    hospital: profile?.displayName || '',
    location: '',
    date: '',
    baseRate: 85,
    type: 'Standard' as 'Urgent' | 'Premium' | 'Standard'
  });
  const [posting, setPosting] = useState(false);
  const [viewingBidsFor, setViewingBidsFor] = useState<string | null>(null);

  // AI Agent State
  const [showAiAgent, setShowAiAgent] = useState(false);
  const [idealRate, setIdealRate] = useState<number>(profile?.idealRate || 85);
  const [preferredLocations, setPreferredLocations] = useState<string[]>(profile?.preferredLocations || []);
  const [newLocation, setNewLocation] = useState('');
  const [notifications, setNotifications] = useState<GigNotification[]>([]);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'gigShifts'), where('status', '==', 'open'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedShifts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GigShift[];
      setShifts(fetchedShifts);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gigShifts');
    });

    return () => unsubscribe();
  }, []);

  // Recruiter-specific data fetching
  useEffect(() => {
    if (!user || profile?.role !== 'recruiter') return;

    const qShifts = query(collection(db, 'gigShifts'), where('postedBy', '==', user.uid));
    const unsubShifts = onSnapshot(qShifts, (snapshot) => {
      setRecruiterShifts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as GigShift[]);
    });

    const qBids = query(collection(db, 'bids'), orderBy('createdAt', 'desc'));
    const unsubBids = onSnapshot(qBids, (snapshot) => {
      setAllBidsForRecruiter(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Bid[]);
    });

    return () => {
      unsubShifts();
      unsubBids();
    };
  }, [user, profile]);

  // Seed initial shifts if none exist (Development only)
  useEffect(() => {
    const seedShifts = async () => {
      const q = query(collection(db, 'gigShifts'), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        const initialShifts = [
          { title: 'ER Night Shift', hospital: 'General Hospital', location: 'Los Angeles, CA', baseRate: 85, date: '2026-04-10', type: 'Urgent', status: 'open', postedBy: 'system', createdAt: serverTimestamp() },
          { title: 'ICU Day Shift', hospital: 'St. Jude Medical', location: 'Santa Monica, CA', baseRate: 92, date: '2026-04-11', type: 'Premium', status: 'open', postedBy: 'system', createdAt: serverTimestamp() },
          { title: 'Pediatrics Afternoon', hospital: 'Children\'s Clinic', location: 'Pasadena, CA', baseRate: 78, date: '2026-04-12', type: 'Standard', status: 'open', postedBy: 'system', createdAt: serverTimestamp() },
          { title: 'Med-Surg Weekend', hospital: 'Valley Health', location: 'Burbank, CA', baseRate: 88, date: '2026-04-14', type: 'Urgent', status: 'open', postedBy: 'system', createdAt: serverTimestamp() },
        ];
        for (const s of initialShifts) {
          await addDoc(collection(db, 'gigShifts'), s);
        }
      }
    };
    seedShifts();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'bids'), where('nurseId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBids = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bid[];
      setUserBids(fetchedBids);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch AI Notifications
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'gigNotifications'), 
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as GigNotification[]);
    });
    return () => unsubscribe();
  }, [user]);

  // AI Agent Logic: Check for matches and create persistent notifications
  useEffect(() => {
    if (!user || !shifts.length || !profile?.idealRate) return;
    
    const checkMatches = async () => {
      const matches = shifts.filter(s => {
        const rateMatch = s.baseRate >= (profile.idealRate || 0);
        const locationMatch = !profile.preferredLocations?.length || 
          profile.preferredLocations.some((loc: string) => s.location.toLowerCase().includes(loc.toLowerCase()));
        return rateMatch && locationMatch;
      });

      for (const match of matches) {
        // Check if notification already exists for this shift
        const existingQ = query(
          collection(db, 'gigNotifications'), 
          where('uid', '==', user.uid),
          where('shiftId', '==', match.id)
        );
        const existingDocs = await getDocs(existingQ);
        
        if (existingDocs.empty) {
          try {
            await addDoc(collection(db, 'gigNotifications'), {
              uid: user.uid,
              shiftId: match.id,
              message: `Perfect Match! ${match.title} at ${match.hospital} pays $${match.baseRate}/hr, meeting your $${profile.idealRate}/hr goal.`,
              isRead: false,
              createdAt: serverTimestamp()
            });
          } catch (error) {
            console.error('Error creating AI notification:', error);
          }
        }
      }
    };

    checkMatches();
  }, [shifts, profile, user]);

  const handlePlaceBid = async () => {
    if (!user || !selectedShift || !bidAmount) return;
    setBidding(true);

    try {
      await addDoc(collection(db, 'bids'), {
        shiftId: selectedShift.id,
        nurseId: user.uid,
        nurseName: profile?.displayName || 'Anonymous Nurse',
        proposedRate: bidAmount,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSelectedShift(null);
      setBidAmount(0);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bids');
    } finally {
      setBidding(false);
    }
  };

  const handlePostShift = async () => {
    if (!user || !newShift.title || !newShift.location || !newShift.date) return;
    setPosting(true);

    try {
      await addDoc(collection(db, 'gigShifts'), {
        ...newShift,
        status: 'open',
        postedBy: user.uid,
        createdAt: serverTimestamp()
      });
      setShowPostModal(false);
      setNewShift({
        title: '',
        hospital: profile?.displayName || '',
        location: '',
        date: '',
        baseRate: 85,
        type: 'Standard'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gigShifts');
    } finally {
      setPosting(false);
    }
  };

  const handleAcceptBid = async (bid: Bid) => {
    if (!user) return;
    try {
      // 1. Accept the bid
      await updateDoc(doc(db, 'bids', bid.id), {
        status: 'accepted'
      });
      // 2. Mark the shift as filled
      await updateDoc(doc(db, 'gigShifts', bid.shiftId), {
        status: 'filled'
      });
      // 3. Reject other bids for the same shift
      const otherBids = allBidsForRecruiter.filter(b => b.shiftId === bid.shiftId && b.id !== bid.id);
      for (const b of otherBids) {
        await updateDoc(doc(db, 'bids', b.id), {
          status: 'rejected'
        });
      }
      setViewingBidsFor(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'bids/gigShifts');
    }
  };

  const updatePreferences = async () => {
    if (!user) return;
    setSavingPrefs(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        idealRate: idealRate,
        preferredLocations: preferredLocations
      });
      setShowAiAgent(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setSavingPrefs(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'gigNotifications', id), { isRead: true });
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* AI Agent Banner */}
        <AnimatePresence>
          {notifications.filter(n => !n.isRead).length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 rounded-3xl p-5 text-white shadow-xl flex items-center justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <div className="flex items-center space-x-4 relative z-10">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/30">
                    <Sparkles className="w-6 h-6 text-blue-100" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-white/20 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">AI Agent Active</span>
                      <p className="font-bold text-sm">New Perfect Match Found!</p>
                    </div>
                    <p className="text-xs text-blue-100 mt-1 max-w-xl">{notifications.find(n => !n.isRead)?.message}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 relative z-10">
                  <button 
                    onClick={() => {
                      const unread = notifications.find(n => !n.isRead);
                      if (unread) {
                        const shift = shifts.find(s => s.id === unread.shiftId);
                        if (shift) setSelectedShift(shift);
                        markNotificationRead(unread.id);
                      }
                    }}
                    className="bg-white text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg"
                  >
                    View Shift
                  </button>
                  <button 
                    onClick={() => {
                      const unread = notifications.find(n => !n.isRead);
                      if (unread) markNotificationRead(unread.id);
                    }}
                    className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-orange-100 px-3 py-1 rounded-full border border-orange-200 mb-4">
              <Zap className="w-4 h-4 text-orange-600 fill-current" />
              <span className="text-xs font-bold uppercase tracking-wider text-orange-700">Gig Shift Marketplace</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-slate-900 leading-tight">Pick Up Shifts, <span className="text-blue-600">Get Paid Instantly</span></h1>
            <p className="text-slate-600 mt-2 text-lg">Flexible nursing shifts at your fingertips. No long-term commitment, just great pay.</p>
          </div>
          <div className="flex items-center space-x-4">
            {profile?.role === 'recruiter' ? (
              <button 
                onClick={() => setShowPostModal(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
              >
                <Zap className="w-5 h-5" />
                <span>Post Urgent Need</span>
              </button>
            ) : (
              <button 
                onClick={() => setShowAiAgent(true)}
                className="flex items-center space-x-2 bg-white border border-slate-200 px-6 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              >
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span>AI Agent Settings</span>
              </button>
            )}
            <div className="text-right hidden md:block">
              <div className="text-sm text-slate-500 font-medium">Your Earnings This Week</div>
              <div className="text-2xl font-bold text-slate-900">$1,240.00</div>
            </div>
          </div>
        </div>

        {/* Recruiter Dashboard */}
        {profile?.role === 'recruiter' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <Building2 className="w-6 h-6 mr-2 text-blue-600" />
              Your Posted Shifts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recruiterShifts.map(shift => {
                const shiftBids = allBidsForRecruiter.filter(b => b.shiftId === shift.id);
                return (
                  <div key={shift.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        shift.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {shift.status}
                      </div>
                      <div className="text-xs font-bold text-slate-400">{shift.date}</div>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{shift.title}</h3>
                    <div className="flex items-center text-sm text-slate-500 mb-6">
                      <MapPin className="w-4 h-4 mr-1" /> {shift.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-black text-slate-900">${shift.baseRate}/hr</div>
                      <button 
                        onClick={() => setViewingBidsFor(shift.id)}
                        className="flex items-center space-x-2 text-blue-600 font-bold text-sm hover:underline"
                      >
                        <span>{shiftBids.length} Bids</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {recruiterShifts.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-500">You haven&apos;t posted any shifts yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Agent Settings Modal */}
        {showAiAgent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">AI Agent Preferences</h3>
                <p className="text-slate-500 text-sm mt-2">Set your ideal rate and location. Our AI will notify you the second a matching shift is posted.</p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Ideal Hourly Rate ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                      value={idealRate}
                      onChange={(e) => setIdealRate(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Preferred Locations</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. Los Angeles"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newLocation) {
                          setPreferredLocations([...preferredLocations, newLocation]);
                          setNewLocation('');
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        if (newLocation) {
                          setPreferredLocations([...preferredLocations, newLocation]);
                          setNewLocation('');
                        }
                      }}
                      className="bg-slate-900 text-white p-4 rounded-xl hover:bg-slate-800 transition-all"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {preferredLocations.map((loc, i) => (
                      <span key={i} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-2 border border-blue-100">
                        <span>{loc}</span>
                        <button onClick={() => setPreferredLocations(preferredLocations.filter((_, idx) => idx !== i))}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={updatePreferences}
                  disabled={savingPrefs}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  {savingPrefs ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Save Preferences</span>}
                </button>
                <button 
                  onClick={() => setShowAiAgent(false)}
                  className="w-full text-slate-400 font-bold text-sm hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center px-4 bg-slate-50 rounded-xl border border-slate-100">
            <Search className="w-5 h-5 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search by hospital or location..."
              className="w-full py-3 bg-transparent focus:outline-none text-slate-900"
            />
          </div>
          <div className="flex items-center px-4 bg-slate-50 rounded-xl border border-slate-100">
            <Filter className="w-5 h-5 text-slate-400 mr-2" />
            <select className="py-3 bg-transparent focus:outline-none text-slate-900 font-medium">
              <option>All Specialties</option>
              <option>ER</option>
              <option>ICU</option>
              <option>Med-Surg</option>
            </select>
          </div>
          <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">
            Filter Results
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shift List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="py-24 flex justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              </div>
            ) : shifts.length > 0 ? (
              shifts.map((shift) => {
                const hasBid = userBids.find(b => b.shiftId === shift.id);
                return (
                  <motion.div
                    key={shift.id}
                    whileHover={{ y: -4 }}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                    onClick={() => setSelectedShift(shift)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          shift.type === 'Urgent' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          <Clock className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-xl font-bold text-slate-900">{shift.title}</h3>
                            {shift.type === 'Urgent' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full uppercase tracking-wider">Urgent</span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-sm font-medium">
                            <span className="flex items-center"><Building2 className="w-4 h-4 mr-1" /> {shift.hospital}</span>
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {shift.location}</span>
                            <span className="flex items-center font-bold text-blue-600"><Calendar className="w-4 h-4 mr-1" /> {shift.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                        <div className="text-2xl font-black text-slate-900">${shift.baseRate}<span className="text-xs text-slate-400">/hr</span></div>
                        {hasBid ? (
                          <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Bid Placed: ${hasBid.proposedRate}</span>
                          </div>
                        ) : (
                          <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all">
                            {shift.type === 'Urgent' ? 'Place Bid' : 'Claim Shift'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-500">No open shifts available at the moment.</p>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-4">NurseNow Verified</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Complete your verification to unlock premium high-rate shifts and instant payouts.
                </p>
                <div className="space-y-3 mb-8">
                  {['License Verification', 'Background Check', 'Clinical Skills Assessment'].map(item => (
                    <div key={item} className="flex items-center space-x-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg">
                  Get Verified Now
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[60px] opacity-20 -mr-16 -mt-16" />
            </div>

            {/* AI Agent Activity Feed */}
            {profile?.role === 'nurse' && (
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900">AI Agent Activity</h3>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-4">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.isRead ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-blue-50 border-blue-100'}`}>
                        <p className="text-xs text-slate-700 leading-relaxed">{n.message}</p>
                        {!n.isRead && (
                          <button 
                            onClick={() => markNotificationRead(n.id)}
                            className="mt-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">No recent agent activity. We&apos;ll notify you when matches appear.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Your Bids Section */}
            {userBids.length > 0 && (
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6">Your Active Bids</h3>
                <div className="space-y-4">
                  {userBids.map(bid => (
                    <div key={bid.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Shift ID: {bid.shiftId.slice(0, 6)}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          bid.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                          bid.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {bid.status}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-slate-900">${bid.proposedRate}/hr</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shift Details / Bidding Modal */}
      <AnimatePresence>
        {selectedShift && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-12 relative"
            >
              <button 
                onClick={() => setSelectedShift(null)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Zap className="w-6 h-6 text-slate-400 rotate-45" />
              </button>

              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">{selectedShift.title}</h2>
                <p className="text-slate-500 font-medium mt-2">{selectedShift.hospital} • {selectedShift.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Base Rate</div>
                  <div className="text-2xl font-black text-slate-900">${selectedShift.baseRate}/hr</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Shift Type</div>
                  <div className={`text-2xl font-black ${selectedShift.type === 'Urgent' ? 'text-orange-600' : 'text-blue-600'}`}>
                    {selectedShift.type}
                  </div>
                </div>
              </div>

              {selectedShift.type === 'Urgent' ? (
                <div className="space-y-6 mb-10">
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-start space-x-3">
                    <Gavel className="w-5 h-5 text-orange-600 mt-0.5" />
                    <p className="text-xs text-orange-700 leading-relaxed">
                      This is an <strong>Urgent Need</strong> shift. You can bid your own hourly rate. Hospitals will review bids based on your Passport verification and rating.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Your Bid Rate ($/hr)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="number"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 focus:ring-2 focus:ring-orange-500 focus:outline-none font-bold text-xl"
                        placeholder={selectedShift.baseRate.toString()}
                        value={bidAmount || ''}
                        onChange={(e) => setBidAmount(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handlePlaceBid}
                    disabled={bidding || !bidAmount}
                    className="w-full bg-orange-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 flex items-center justify-center space-x-2"
                  >
                    {bidding ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>Submit Bid</span>}
                  </button>
                </div>
              ) : (
                <div className="space-y-6 mb-10">
                  <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                    Confirm & Claim Shift
                  </button>
                </div>
              )}

              <p className="text-center text-slate-400 text-xs mt-6">
                By participating, you agree to the NurseNow Gig Terms of Service.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Post Shift Modal (Recruiter) */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 md:p-10"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Post Urgent Need Shift</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shift Title</label>
                  <input
                    type="text"
                    placeholder="e.g. ER Night Shift"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={newShift.title}
                    onChange={e => setNewShift({...newShift, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</label>
                    <input
                      type="text"
                      placeholder="City, State"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={newShift.location}
                      onChange={e => setNewShift({...newShift, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</label>
                    <input
                      type="date"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={newShift.date}
                      onChange={e => setNewShift({...newShift, date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Base Rate ($/hr)</label>
                    <input
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={newShift.baseRate}
                      onChange={e => setNewShift({...newShift, baseRate: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={newShift.type}
                      onChange={e => setNewShift({...newShift, type: e.target.value as any})}
                    >
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                      <option value="Urgent">Urgent (Biddable)</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex space-x-4">
                  <button 
                    onClick={() => setShowPostModal(false)}
                    className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handlePostShift}
                    disabled={posting}
                    className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center space-x-2"
                  >
                    {posting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Post Shift</span>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Bids Modal (Recruiter) */}
      <AnimatePresence>
        {viewingBidsFor && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 md:p-10 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900">Bids for Shift</h3>
                <button onClick={() => setViewingBidsFor(null)} className="p-2 hover:bg-slate-100 rounded-full">
                  <Zap className="w-6 h-6 text-slate-400 rotate-45" />
                </button>
              </div>

              <div className="space-y-4">
                {allBidsForRecruiter.filter(b => b.shiftId === viewingBidsFor).length > 0 ? (
                  allBidsForRecruiter.filter(b => b.shiftId === viewingBidsFor).map(bid => {
                    // AI Recommendation Logic (Mock)
                    const isRecommended = bid.proposedRate <= 95 && bid.nurseName !== 'Anonymous Nurse';
                    
                    return (
                      <div key={bid.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200">
                            <User className="w-6 h-6 text-slate-400" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-slate-900">{bid.nurseName}</h4>
                              {isRecommended && (
                                <span className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                                  <Sparkles className="w-3 h-3" />
                                  <span>AI Recommended</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">Proposed Rate: <span className="font-bold text-slate-900">${bid.proposedRate}/hr</span></p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {bid.status === 'pending' ? (
                            <button 
                              onClick={() => handleAcceptBid(bid)}
                              className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all"
                            >
                              Accept Bid
                            </button>
                          ) : (
                            <span className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl ${
                              bid.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {bid.status}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-500">No bids received yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
