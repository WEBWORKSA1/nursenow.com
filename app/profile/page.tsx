'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { db, OperationType, handleFirestoreError } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { User, Mail, Briefcase, MapPin, GraduationCap, Save, Loader2, Camera, CheckCircle2, ShieldCheck, FileCheck, AlertCircle, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    role: '',
    specialty: '',
    experienceYears: 0,
    location: '',
    bio: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        role: profile.role || 'nurse',
        specialty: profile.specialty || '',
        experienceYears: profile.experienceYears || 0,
        location: profile.location || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        experienceYears: Number(formData.experienceYears),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Please Sign In</h2>
          <p className="text-slate-600 mt-4">You need to be signed in to view and edit your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-900">Your Profile</h1>
          <p className="text-slate-600 mt-2">Manage your professional information and career preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar / Avatar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg mx-auto relative">
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt="Profile" fill className="object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-16 h-16 text-blue-600" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mt-6">{formData.displayName || 'Nurse'}</h2>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <p className="text-blue-600 font-bold text-sm uppercase tracking-widest">{formData.role}</p>
                {profile?.isVerified ? (
                  <div className="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-100">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </div>
                ) : (
                  <div className="flex items-center text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Unverified
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-100 space-y-4 text-left">
                <div className="flex items-center space-x-3 text-slate-600">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <span className="text-sm truncate">{user.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-600">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <span className="text-sm">{formData.location || 'Location not set'}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl">
              <h3 className="font-bold text-xl mb-2">Nurse Passport</h3>
              <p className="text-blue-100 text-sm mb-6">Your digital vault for verified licenses and certifications.</p>
              <Link href="/passport" className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors inline-block text-center">
                Manage Passport
              </Link>
            </div>

            {/* Verification Steps */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-blue-600" />
                Verification
              </h3>
              <div className="space-y-6">
                {[
                  { name: 'Email Verified', status: 'completed', icon: Mail },
                  { name: 'License Upload', status: 'pending', icon: FileCheck },
                  { name: 'ID Verification', status: 'pending', icon: User },
                  { name: 'Background Check', status: 'pending', icon: ShieldCheck },
                ].map((step, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${step.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <span className={`text-sm font-medium ${step.status === 'completed' ? 'text-slate-900' : 'text-slate-500'}`}>{step.name}</span>
                    </div>
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <button className="text-blue-600 hover:text-blue-700">
                        <Upload className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {!profile?.isVerified && (
                <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Complete all steps to earn the <strong>Verified Nurse</strong> badge and unlock premium high-rate shifts.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Display Name</label>
                  <input
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Account Role</label>
                  <select
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="nurse">Nurse / Job Seeker</option>
                    <option value="recruiter">Recruiter / Hospital</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Specialty</label>
                  <input
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. ICU, Pediatrics"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Years of Experience</label>
                  <input
                    type="number"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Professional Bio</label>
                <textarea
                  className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-40"
                  placeholder="Tell us about your professional background and goals..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center space-x-2 text-green-600 font-bold"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Profile updated!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
