'use client';

import { useState, useEffect } from 'react';
import { db, auth, OperationType, handleFirestoreError } from '@/firebase';
import { collection, query, getDocs, where, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Building2, Image as ImageIcon, Video, Globe, Linkedin, Twitter, Instagram, Save, Loader2, Plus, X, Layout, Heart, Zap, Coffee } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';

export default function RecruiterBrandingPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branding, setBranding] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    hospitalName: '',
    tagline: '',
    about: '',
    ratios: '',
    breakAreas: '',
    culture: '',
    technology: '',
    benefits: [] as string[],
    images: [] as string[],
    videoUrl: '',
    location: '',
    website: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      instagram: ''
    }
  });

  const [newBenefit, setNewBenefit] = useState('');
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    if (user && profile?.role === 'recruiter') {
      fetchBranding();
    } else if (user && profile && profile.role !== 'recruiter') {
      router.push('/');
    }
  }, [user, profile]);

  const fetchBranding = async () => {
    setLoading(true);
    try {
      const brandingRef = collection(db, 'employerBranding');
      const q = query(brandingRef, where('recruiterId', '==', user?.uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        const docId = querySnapshot.docs[0].id;
        setBranding({ id: docId, ...docData });
        setFormData({
          hospitalName: docData.hospitalName || '',
          tagline: docData.tagline || '',
          about: docData.about || '',
          ratios: docData.ratios || '',
          breakAreas: docData.breakAreas || '',
          culture: docData.culture || '',
          technology: docData.technology || '',
          benefits: docData.benefits || [],
          images: docData.images || [],
          videoUrl: docData.videoUrl || '',
          location: docData.location || '',
          website: docData.website || '',
          socialLinks: docData.socialLinks || { linkedin: '', twitter: '', instagram: '' }
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'employerBranding');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const data = {
        ...formData,
        recruiterId: user.uid,
        updatedAt: serverTimestamp()
      };

      if (branding) {
        await updateDoc(doc(db, 'employerBranding', branding.id), data);
      } else {
        const newDoc = await addDoc(collection(db, 'employerBranding'), {
          ...data,
          createdAt: serverTimestamp()
        });
        setBranding({ id: newDoc.id, ...data });
      }
      alert('Branding page saved successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'employerBranding');
    } finally {
      setSaving(false);
    }
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData({ ...formData, benefits: [...formData.benefits, newBenefit.trim()] });
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    const updated = [...formData.benefits];
    updated.splice(index, 1);
    setFormData({ ...formData, benefits: updated });
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImage.trim()] });
      setNewImage('');
    }
  };

  const removeImage = (index: number) => {
    const updated = [...formData.images];
    updated.splice(index, 1);
    setFormData({ ...formData, images: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold text-slate-900">Employer Branding</h1>
            <p className="text-slate-600 mt-2">Create a &quot;Life at {formData.hospitalName || 'Your Hospital'}&quot; page to attract top talent.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>{branding ? 'Update Page' : 'Create Page'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Basic Information</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Hospital Name</label>
                  <input
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. St. Mary's Medical Center"
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Tagline</label>
                  <input
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. Where Compassion Meets Innovation"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">About the Hospital</label>
                  <textarea
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-32"
                    placeholder="Describe your hospital's mission and history..."
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  />
                </div>
              </div>
            </section>

            {/* Culture & Tech */}
            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-50 rounded-xl">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Culture & Technology</h2>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Nurse-to-Patient Ratios</label>
                    <input
                      type="text"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="e.g. 1:4 Med-Surg, 1:2 ICU"
                      value={formData.ratios || ''}
                      onChange={(e) => setFormData({ ...formData, ratios: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Break Areas & Lounges</label>
                    <input
                      type="text"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="e.g. Dedicated Nurse Lounge, Massage Chairs"
                      value={formData.breakAreas || ''}
                      onChange={(e) => setFormData({ ...formData, breakAreas: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Workplace Culture</label>
                  <textarea
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-32"
                    placeholder="What is it like to work here? Mention team spirit, work-life balance, etc."
                    value={formData.culture}
                    onChange={(e) => setFormData({ ...formData, culture: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Technology & Innovation</label>
                  <textarea
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-32"
                    placeholder="Highlight your medical technology, EHR systems, or innovative practices..."
                    value={formData.technology}
                    onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                  />
                </div>
              </div>
            </section>

            {/* Media */}
            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <ImageIcon className="w-6 h-6 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Facility Media</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Add Image URL</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="https://images.unsplash.com/..."
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                    />
                    <button
                      onClick={addImage}
                      className="bg-slate-900 text-white px-6 rounded-xl font-bold hover:bg-slate-800"
                    >
                      Add
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-slate-200">
                        <img src={img} alt="Facility" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Video Tour URL (YouTube/Vimeo)</label>
                  <div className="flex items-center px-4 bg-slate-50 rounded-xl border border-slate-200">
                    <Video className="w-5 h-5 text-slate-400 mr-2" />
                    <input
                      type="text"
                      className="w-full py-4 bg-transparent focus:outline-none"
                      placeholder="https://youtube.com/watch?v=..."
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Sidebar Info */}
          <div className="space-y-8">
            {/* Benefits */}
            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-50 rounded-xl">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Benefits</h2>
              </div>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    placeholder="e.g. On-site Daycare"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                  />
                  <button
                    onClick={addBenefit}
                    className="bg-slate-900 text-white px-4 rounded-xl font-bold"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.benefits.map((benefit, idx) => (
                    <span key={idx} className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                      {benefit}
                      <button onClick={() => removeBenefit(idx)} className="ml-2 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Links & Location */}
            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Links & Location</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Website</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="https://hospital.org"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Location</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="City, State"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="pt-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Linkedin className="w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                      placeholder="LinkedIn URL"
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })}
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <Twitter className="w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                      placeholder="Twitter URL"
                      value={formData.socialLinks.twitter}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <Instagram className="w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                      placeholder="Instagram URL"
                      value={formData.socialLinks.instagram}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
