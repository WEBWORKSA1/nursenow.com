'use client';

import { useState, useEffect } from 'react';
import { db, OperationType, handleFirestoreError } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Building2, MapPin, Globe, Linkedin, Twitter, Instagram, ArrowLeft, Heart, Zap, Coffee, Shield, Microscope, Users, Star, PlayCircle, Image as ImageIcon, Video, Send, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function HospitalBrandingView() {
  const { id } = useParams();
  const [branding, setBranding] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBranding();
    }
  }, [id]);

  const fetchBranding = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'employerBranding', id as string);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBranding({ id: docSnap.id, ...data });
        
        // Fetch jobs for this hospital
        const jobsRef = collection(db, 'jobs');
        const q = query(jobsRef, where('hospital', '==', data.hospitalName));
        const jobsSnap = await getDocs(q);
        setJobs(jobsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'employerBranding');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await addDoc(collection(db, 'contactMessages'), {
        hospitalId: branding.id,
        recruiterId: branding.recruiterId,
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
        createdAt: serverTimestamp()
      });
      setSendSuccess(true);
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setSendSuccess(false), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'contactMessages');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium tracking-wide">Loading hospital profile...</p>
      </div>
    );
  }

  if (!branding) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-slate-900">Hospital profile not found</h2>
        <Link href="/jobs" className="mt-4 text-blue-600 font-bold hover:underline flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        {branding.images?.[0] ? (
          <img src={branding.images[0]} alt={branding.hospitalName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 text-blue-400 font-bold tracking-widest uppercase text-sm">
                <Shield className="w-4 h-4" />
                <span>Verified Employer</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight">
                Life at {branding.hospitalName}
              </h1>
              <p className="text-xl md:text-2xl text-slate-200 max-w-3xl font-medium italic">
                &quot;{branding.tagline}&quot;
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center text-white font-medium">
                  <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                  {branding.location}
                </div>
                {branding.website && (
                  <a href={branding.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-white font-medium hover:text-blue-400 transition-colors">
                    <Globe className="w-5 h-5 mr-2 text-blue-400" />
                    Official Website
                  </a>
                )}
                <div className="flex items-center space-x-4">
                  {branding.socialLinks?.linkedin && <a href={branding.socialLinks.linkedin} className="text-white hover:text-blue-400"><Linkedin className="w-5 h-5" /></a>}
                  {branding.socialLinks?.twitter && <a href={branding.socialLinks.twitter} className="text-white hover:text-blue-400"><Twitter className="w-5 h-5" /></a>}
                  {branding.socialLinks?.instagram && <a href={branding.socialLinks.instagram} className="text-white hover:text-blue-400"><Instagram className="w-5 h-5" /></a>}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            {/* About Section */}
            <section className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100">
              <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
                <Building2 className="w-8 h-8 mr-4 text-blue-600" />
                About Our Facility
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
                {branding.about}
              </p>
            </section>

            {/* Culture & Tech Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-purple-50 p-10 rounded-[2.5rem] border border-purple-100"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-purple-900 mb-4">Our Culture</h3>
                <p className="text-purple-800/80 leading-relaxed">
                  {branding.culture}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-blue-50 p-10 rounded-[2.5rem] border border-blue-100"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Microscope className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Innovation & Tech</h3>
                <p className="text-blue-800/80 leading-relaxed">
                  {branding.technology}
                </p>
              </motion.div>
            </div>

            {/* Photo Gallery */}
            {branding.images?.length > 1 && (
              <section>
                <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center">
                  <ImageIcon className="w-8 h-8 mr-4 text-amber-600" />
                  Facility Gallery
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {branding.images.slice(1).map((img: string, idx: number) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="aspect-video rounded-[2rem] overflow-hidden shadow-lg border-4 border-white"
                    >
                      <img src={img} alt={`Facility ${idx + 1}`} className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Video Section */}
            {branding.videoUrl && (
              <section className="bg-slate-900 p-12 rounded-[3rem] text-white overflow-hidden relative">
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-4 flex items-center">
                    <PlayCircle className="w-8 h-8 mr-4 text-blue-400" />
                    Take a Virtual Tour
                  </h2>
                  <p className="text-slate-400 mb-8 max-w-xl">Experience our state-of-the-art facilities and meet the team from the comfort of your home.</p>
                  
                  {branding.videoUrl.includes('youtube.com') || branding.videoUrl.includes('youtu.be') || branding.videoUrl.includes('vimeo.com') ? (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800">
                      <iframe
                        src={
                          branding.videoUrl.includes('youtube.com/watch?v=') 
                            ? branding.videoUrl.replace('watch?v=', 'embed/') 
                            : branding.videoUrl.includes('youtu.be/')
                            ? branding.videoUrl.replace('youtu.be/', 'youtube.com/embed/')
                            : branding.videoUrl.includes('vimeo.com/')
                            ? branding.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')
                            : branding.videoUrl
                        }
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <a 
                      href={branding.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-8 py-4 bg-blue-600 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl"
                    >
                      Watch Video Tour
                    </a>
                  )}
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                   <Video className="w-full h-full text-white" />
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Benefits Card */}
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <Zap className="w-6 h-6 mr-3 text-green-600" />
                Why Join Us?
              </h3>
              <div className="space-y-4">
                {branding.benefits?.map((benefit: string, idx: number) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className="mt-1 p-1 bg-green-100 rounded-full">
                      <Zap className="w-3 h-3 text-green-600 fill-current" />
                    </div>
                    <span className="text-slate-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-10 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Open Positions</h3>
                <div className="space-y-3">
                  {jobs.length > 0 ? (
                    jobs.map(job => (
                      <Link 
                        key={job.id} 
                        href="/jobs" 
                        className="block p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all group"
                      >
                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">{job.type} • {job.salaryRange}</p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm italic">No open positions at the moment.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Form Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <Mail className="w-6 h-6 mr-3 text-blue-600" />
                Contact Recruiter
              </h3>
              
              {sendSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 p-6 rounded-2xl border border-green-100 text-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-3" />
                  <p className="text-green-900 font-bold">Message Sent!</p>
                  <p className="text-green-700 text-sm mt-1">The recruiter will get back to you soon.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Name</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900"
                      placeholder="Jane Doe"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                    <input
                      required
                      type="email"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900"
                      placeholder="jane@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Message</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 resize-none"
                      placeholder="I'm interested in learning more about..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
