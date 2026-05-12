'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { db, OperationType, handleFirestoreError } from '@/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coffee, MessageSquare, Star, Shield, AlertCircle, 
  Plus, Send, Filter, Search, Heart, Zap, 
  Brain, Smile, Meh, Frown, Thermometer, 
  Info, CheckCircle2, TrendingUp, Users,
  Ghost, Loader2, TrendingDown
} from 'lucide-react';

interface UnitReview {
  id: string;
  hospitalName: string;
  unitName: string;
  rating: number;
  content: string;
  pros: string;
  cons: string;
  authorUid: string;
  createdAt: any;
}

interface BurnoutCheckin {
  id: string;
  uid: string;
  score: number;
  mood: string;
  factors: string[];
  createdAt: any;
}

export default function NurseLounge() {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'reviews' | 'burnout'>('reviews');
  const [reviews, setReviews] = useState<UnitReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  // Review Form State
  const [newReview, setNewReview] = useState({
    hospitalName: '',
    unitName: '',
    rating: 5,
    content: '',
    pros: '',
    cons: '',
  });

  // Burnout Form State
  const [burnoutStep, setBurnoutStep] = useState(0);
  const [burnoutAnswers, setBurnoutAnswers] = useState<number[]>([]);
  const [burnoutMood, setBurnoutMood] = useState('');
  const [burnoutFactors, setBurnoutFactors] = useState<string[]>([]);
  const [burnoutResult, setBurnoutResult] = useState<BurnoutCheckin | null>(null);
  const [lastCheckin, setLastCheckin] = useState<BurnoutCheckin | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'unitReviews'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UnitReview[];
      setReviews(reviewsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'unitReviews');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'burnoutCheckins'), 
      where('uid', '==', user.uid), 
      orderBy('createdAt', 'desc'), 
      limit(1)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLastCheckin({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BurnoutCheckin);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      await addDoc(collection(db, 'unitReviews'), {
        ...newReview,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
      });
      setShowReviewForm(false);
      setNewReview({
        hospitalName: '',
        unitName: '',
        rating: 5,
        content: '',
        pros: '',
        cons: '',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'unitReviews');
    } finally {
      setSaving(false);
    }
  };

  const burnoutQuestions = [
    "How often do you feel emotionally drained from your work?",
    "How often do you feel used up at the end of the workday?",
    "How often do you feel fatigued when you get up in the morning and have to face another day on the job?",
    "How often do you feel that you are working too hard on your job?",
    "How often do you feel frustrated by your job?",
    "How often do you feel that you are at the end of your rope?"
  ];

  const burnoutFactorsList = [
    "Understaffing", "Long Shifts", "Lack of Support", "Patient Load", 
    "Administrative Burden", "Work-Life Balance", "Physical Strain", "Emotional Stress"
  ];

  const handleBurnoutNext = (score: number) => {
    const newAnswers = [...burnoutAnswers, score];
    setBurnoutAnswers(newAnswers);
    if (burnoutStep < burnoutQuestions.length - 1) {
      setBurnoutStep(burnoutStep + 1);
    } else {
      setBurnoutStep(burnoutQuestions.length); // Move to mood selection
    }
  };

  const submitBurnoutCheckin = async () => {
    if (!user) return;
    setSaving(true);

    const totalScore = burnoutAnswers.reduce((a, b) => a + b, 0);
    const normalizedScore = Math.round((totalScore / (burnoutQuestions.length * 6)) * 100);

    const checkinData = {
      uid: user.uid,
      score: normalizedScore,
      mood: burnoutMood,
      factors: burnoutFactors,
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, 'burnoutCheckins'), checkinData);
      // Note: serverTimestamp() is not available immediately in local state
      setBurnoutResult({ id: docRef.id, ...checkinData, createdAt: new Date() });
      setBurnoutStep(burnoutQuestions.length + 2); // Show results
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'burnoutCheckins');
    } finally {
      setSaving(false);
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.unitName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pt-12 pb-20 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 mb-6"
              >
                <Coffee className="w-5 h-5 text-blue-300" />
                <span className="text-sm font-bold uppercase tracking-widest text-blue-200">The Nurse Lounge</span>
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
                Community & <br /> <span className="text-blue-400">Peer Support</span>
              </h1>
              <p className="text-slate-300 mt-6 text-lg max-w-2xl leading-relaxed">
                Anonymous unit reviews, burnout support, and peer advice. Because nursing is hard, and you shouldn&apos;t do it alone.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xl font-black text-white">2.4k Active</div>
                  <div className="text-sm text-blue-300 font-medium">Nurses Online</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-2 mt-12 bg-white/5 backdrop-blur-md p-1.5 rounded-2xl w-fit border border-white/10">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-8 py-4 rounded-xl font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'reviews' ? 'bg-white text-blue-600 shadow-xl' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Unit Reviews</span>
            </button>
            <button
              onClick={() => setActiveTab('burnout')}
              className={`px-8 py-4 rounded-xl font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'burnout' ? 'bg-white text-blue-600 shadow-xl' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Thermometer className="w-5 h-5" />
              <span>Burnout Check-in</span>
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20 -ml-48 -mb-48" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'reviews' ? (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Reviews Header & Search */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search hospital or unit..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center space-x-2 shadow-xl shadow-blue-100"
                >
                  <Plus className="w-5 h-5" />
                  <span>Write a Review</span>
                </button>
              </div>

              {/* Review Form Modal */}
              <AnimatePresence>
                {showReviewForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden"
                    >
                      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">Anonymous Unit Review</h2>
                          <p className="text-slate-500 text-sm mt-1">Your identity will never be shared.</p>
                        </div>
                        <button onClick={() => setShowReviewForm(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                          <Plus className="w-6 h-6 rotate-45 text-slate-400" />
                        </button>
                      </div>
                      <form onSubmit={handleReviewSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Hospital Name</label>
                            <input
                              required
                              type="text"
                              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={newReview.hospitalName}
                              onChange={e => setNewReview({...newReview, hospitalName: e.target.value})}
                              placeholder="e.g. St. Mary's Medical"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Unit / Ward</label>
                            <input
                              required
                              type="text"
                              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={newReview.unitName}
                              onChange={e => setNewReview({...newReview, unitName: e.target.value})}
                              placeholder="e.g. ICU, ER, Pediatrics"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Overall Rating</label>
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewReview({...newReview, rating: star})}
                                className={`p-2 rounded-xl transition-all ${newReview.rating >= star ? 'text-amber-500 bg-amber-50' : 'text-slate-300 bg-slate-50'}`}
                              >
                                <Star className={`w-8 h-8 ${newReview.rating >= star ? 'fill-current' : ''}`} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Your Experience</label>
                          <textarea
                            required
                            rows={4}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newReview.content}
                            onChange={e => setNewReview({...newReview, content: e.target.value})}
                            placeholder="How is the management, staffing, and work environment?"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-green-600">Pros</label>
                            <textarea
                              rows={2}
                              className="w-full p-4 bg-green-50 border border-green-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={newReview.pros}
                              onChange={e => setNewReview({...newReview, pros: e.target.value})}
                              placeholder="What's great about this unit?"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-red-600">Cons</label>
                            <textarea
                              rows={2}
                              className="w-full p-4 bg-red-50 border border-red-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500"
                              value={newReview.cons}
                              onChange={e => setNewReview({...newReview, cons: e.target.value})}
                              placeholder="What could be improved?"
                            />
                          </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-2xl flex items-start space-x-3 border border-blue-100">
                          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                          <p className="text-xs text-blue-700 leading-relaxed">
                            Your review is <strong>anonymous</strong>. We will never show your name or profile to other users or recruiters.
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={saving}
                          className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center space-x-2"
                        >
                          {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>Submit Anonymous Review</span>}
                        </button>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Reviews List */}
              <div className="grid grid-cols-1 gap-6">
                {loading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                  </div>
                ) : filteredReviews.length > 0 ? (
                  filteredReviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900">{review.hospitalName}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">{review.unitName}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400 text-xs">{review.createdAt?.toDate().toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
                          <Star className="w-4 h-4 text-amber-500 fill-current mr-2" />
                          <span className="font-black text-amber-700">{review.rating}.0</span>
                        </div>
                      </div>

                      <p className="text-slate-700 leading-relaxed mb-8 text-lg italic">
                        &quot;{review.content}&quot;
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {review.pros && (
                          <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                            <div className="flex items-center space-x-2 text-green-700 font-black uppercase tracking-widest text-xs mb-3">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Pros</span>
                            </div>
                            <p className="text-sm text-green-800 leading-relaxed">{review.pros}</p>
                          </div>
                        )}
                        {review.cons && (
                          <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                            <div className="flex items-center space-x-2 text-red-700 font-black uppercase tracking-widest text-xs mb-3">
                              <AlertCircle className="w-4 h-4" />
                              <span>Cons</span>
                            </div>
                            <p className="text-sm text-red-800 leading-relaxed">{review.cons}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4" />
                          <span className="font-medium">Verified Nurse Review</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button className="hover:text-blue-600 transition-colors font-bold">Helpful (12)</button>
                          <button className="hover:text-red-600 transition-colors font-bold">Report</button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                    <Ghost className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">No reviews found</h3>
                    <p className="text-slate-500 mt-2">Be the first to share your experience!</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="burnout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
                {burnoutStep < burnoutQuestions.length ? (
                  <div className="p-12">
                    <div className="flex items-center justify-between mb-12">
                      <div className="text-sm font-black text-slate-400 uppercase tracking-widest">
                        Question {burnoutStep + 1} of {burnoutQuestions.length}
                      </div>
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-500" 
                          style={{ width: `${((burnoutStep + 1) / burnoutQuestions.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 leading-tight mb-12">
                      {burnoutQuestions[burnoutStep]}
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { label: 'Never', score: 0 },
                        { label: 'A few times a year', score: 1 },
                        { label: 'Once a month', score: 2 },
                        { label: 'A few times a month', score: 3 },
                        { label: 'Once a week', score: 4 },
                        { label: 'A few times a week', score: 5 },
                        { label: 'Every day', score: 6 },
                      ].map((option) => (
                        <button
                          key={option.label}
                          onClick={() => handleBurnoutNext(option.score)}
                          className="w-full text-left p-6 rounded-2xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 group-hover:text-blue-700">{option.label}</span>
                            <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-blue-600 flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : burnoutStep === burnoutQuestions.length ? (
                  <div className="p-12 text-center">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Brain className="w-12 h-12 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">How are you feeling today?</h2>
                    <p className="text-slate-500 mb-12 text-lg">Select the mood that best describes your current state.</p>
                    
                    <div className="grid grid-cols-3 gap-6">
                      {[
                        { id: 'good', icon: Smile, label: 'Good', color: 'text-green-500 bg-green-50 border-green-100' },
                        { id: 'okay', icon: Meh, label: 'Okay', color: 'text-amber-500 bg-amber-50 border-amber-100' },
                        { id: 'bad', icon: Frown, label: 'Exhausted', color: 'text-red-500 bg-red-50 border-red-100' },
                      ].map((mood) => (
                        <button
                          key={mood.id}
                          onClick={() => {
                            setBurnoutMood(mood.id);
                            setBurnoutStep(burnoutQuestions.length + 1);
                          }}
                          className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${
                            burnoutMood === mood.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <mood.icon className={`w-14 h-14 ${mood.color.split(' ')[0]}`} />
                          <span className="font-black uppercase tracking-widest text-xs text-slate-700">{mood.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : burnoutStep === burnoutQuestions.length + 1 ? (
                  <div className="p-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">What factors are contributing?</h2>
                    <p className="text-slate-500 mb-12 text-lg">Select all that apply to your current situation.</p>

                    <div className="flex flex-wrap gap-3 mb-12">
                      {burnoutFactorsList.map((factor) => (
                        <button
                          key={factor}
                          onClick={() => {
                            if (burnoutFactors.includes(factor)) {
                              setBurnoutFactors(burnoutFactors.filter(f => f !== factor));
                            } else {
                              setBurnoutFactors([...burnoutFactors, factor]);
                            }
                          }}
                          className={`px-6 py-3 rounded-full border-2 font-bold transition-all text-sm ${
                            burnoutFactors.includes(factor) 
                              ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100' 
                              : 'border-slate-100 text-slate-600 hover:border-slate-200 bg-white'
                          }`}
                        >
                          {factor}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={submitBurnoutCheckin}
                      disabled={saving}
                      className="w-full bg-blue-600 text-white py-6 rounded-2xl font-bold text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center space-x-2"
                    >
                      {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>Complete Check-in</span>}
                    </button>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center mx-auto mb-8 relative">
                      <div 
                        className={`absolute inset-0 rounded-full border-8 transition-all duration-1000 ${
                          burnoutResult!.score > 70 ? 'border-red-500' : burnoutResult!.score > 40 ? 'border-amber-500' : 'border-green-500'
                        }`}
                        style={{ clipPath: `polygon(0 0, 100% 0, 100% ${burnoutResult!.score}%, 0 ${burnoutResult!.score}%)` }}
                      />
                      <span className="text-4xl font-black text-slate-900">{burnoutResult?.score}%</span>
                    </div>
                    
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">Your Burnout Score</h2>
                    <p className="text-slate-600 mb-12 max-w-md mx-auto text-lg leading-relaxed">
                      {burnoutResult!.score > 70 
                        ? "Your score indicates a high level of burnout. Please prioritize your mental health and consider speaking with a professional or taking a break."
                        : burnoutResult!.score > 40
                        ? "You're showing moderate signs of burnout. It's a good time to focus on self-care and set boundaries."
                        : "Your score is in the healthy range. Keep practicing good work-life balance!"}
                    </p>

                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 text-left mb-12">
                      <h4 className="font-black uppercase tracking-widest text-xs text-slate-400 mb-6 flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>Recommended Actions</span>
                      </h4>
                      <ul className="space-y-4">
                        {[
                          "Schedule a 'No-Work' day this week",
                          "Practice 10 minutes of mindfulness before your next shift",
                          "Connect with a peer in the Lounge for support",
                          "Review your unit's staffing policies"
                        ].map((action, i) => (
                          <li key={i} className="flex items-start space-x-4 text-slate-700 font-medium">
                            <div className="mt-1 p-0.5 bg-green-100 rounded-full">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </div>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        setBurnoutStep(0);
                        setBurnoutAnswers([]);
                        setBurnoutFactors([]);
                        setBurnoutMood('');
                        setBurnoutResult(null);
                      }}
                      className="text-blue-600 font-bold hover:underline text-lg"
                    >
                      Start New Check-in
                    </button>
                  </div>
                )}
              </div>

              {/* Resources */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex items-start space-x-6 hover:shadow-md transition-all">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Heart className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xl">Mental Health Hotline</h4>
                    <p className="text-slate-500 mt-2 leading-relaxed">Free, confidential support for healthcare workers 24/7. You are not alone.</p>
                    <button className="mt-6 bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-red-100 transition-all">
                      Call 1-800-XXX-XXXX
                    </button>
                  </div>
                </div>
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex items-start space-x-6 hover:shadow-md transition-all">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xl">Track Your Progress</h4>
                    <p className="text-slate-500 mt-2 leading-relaxed">See how your burnout score changes over time with weekly check-ins.</p>
                    <button className="mt-6 bg-blue-50 text-blue-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all">
                      View History
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
