'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { db, OperationType, handleFirestoreError } from '@/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  ShieldCheck, 
  FileCheck, 
  Award, 
  Syringe, 
  Plus, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ChevronRight,
  ArrowLeft,
  Info,
  Scan,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRef } from 'react';
import Link from 'next/link';

interface PassportData {
  uid: string;
  licenses: any[];
  certifications: any[];
  immunizations: any[];
  isFullyVerified: boolean;
  updatedAt: any;
}

export default function PassportPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passport, setPassport] = useState<PassportData | null>(null);
  const [activeTab, setActiveTab] = useState<'licenses' | 'certifications' | 'immunizations'>('licenses');
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchPassport() {
      if (!user) return;
      try {
        const docRef = doc(db, 'passports', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as PassportData;
          
          // Auto-expire items on load
          const now = new Date();
          const autoExpire = (items: any[]) => items.map(item => {
            if (item.expiryDate && new Date(item.expiryDate) < now && item.status !== 'expired') {
              return { ...item, status: 'expired' };
            }
            return item;
          });

          const updatedPassport = {
            ...data,
            licenses: autoExpire(data.licenses || []),
            certifications: autoExpire(data.certifications || []),
          };

          setPassport(updatedPassport);
        } else {
          const initialData: PassportData = {
            uid: user.uid,
            licenses: [],
            certifications: [],
            immunizations: [],
            isFullyVerified: false,
            updatedAt: serverTimestamp(),
          };
          await setDoc(docRef, initialData);
          setPassport(initialData);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `passports/${user.uid}`);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && user) {
      fetchPassport();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const calculateVerificationStatus = (data: PassportData) => {
    const allLicensesVerified = data.licenses.length > 0 && data.licenses.every(l => l.status === 'verified');
    const allCertsVerified = data.certifications.length > 0 && data.certifications.every(c => c.status === 'verified');
    const allImmsVerified = data.immunizations.length > 0 && data.immunizations.every(i => i.status === 'verified');
    return allLicensesVerified && allCertsVerified && allImmsVerified;
  };

  const handleAddItem = async (type: 'licenses' | 'certifications' | 'immunizations', initialData?: any) => {
    if (!user || !passport) return;
    setSaving(true);
    
    const newItem = initialData || (type === 'licenses' 
      ? { state: '', licenseNumber: '', expiryDate: '', status: 'pending' }
      : type === 'certifications'
      ? { name: '', issueDate: '', expiryDate: '', status: 'pending' }
      : { name: '', date: '', status: 'pending' });

    const updatedItems = [...passport[type], newItem];
    
    try {
      await updateDoc(doc(db, 'passports', user.uid), {
        [type]: updatedItems,
        updatedAt: serverTimestamp(),
      });
      setPassport({ ...passport, [type]: updatedItems });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `passports/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSmartUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !passport) return;

    setOcrLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
          
          const prompt = activeTab === 'licenses' 
            ? "Extract the License Number, State, and Expiry Date from this nurse license image. Return as JSON. If a field is not found, leave it empty."
            : "Extract the Certification Name and Expiry Date from this certification image. Return as JSON. If a field is not found, leave it empty.";

          const responseSchema = activeTab === 'licenses' ? {
            type: Type.OBJECT,
            properties: {
              licenseNumber: { type: Type.STRING },
              state: { type: Type.STRING },
              expiryDate: { type: Type.STRING, description: "ISO 8601 format YYYY-MM-DD" },
            },
            required: ["licenseNumber", "state", "expiryDate"]
          } : {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              expiryDate: { type: Type.STRING, description: "ISO 8601 format YYYY-MM-DD" },
            },
            required: ["name", "expiryDate"]
          };

          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64Data,
                },
              },
              { text: prompt },
            ],
            config: {
              responseMimeType: "application/json",
              responseSchema,
            },
          });

          const extractedData = JSON.parse(response.text || '{}');
          
          if (activeTab === 'licenses') {
            await handleAddItem('licenses', {
              state: extractedData.state || '',
              licenseNumber: extractedData.licenseNumber || '',
              expiryDate: extractedData.expiryDate || '',
              status: 'pending'
            });
          } else if (activeTab === 'certifications') {
            await handleAddItem('certifications', {
              name: extractedData.name || '',
              issueDate: '',
              expiryDate: extractedData.expiryDate || '',
              status: 'pending'
            });
          }
        } catch (err) {
          console.error("Gemini OCR Error:", err);
        } finally {
          setOcrLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File Reader Error:", error);
      setOcrLoading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpdateItem = async (type: 'licenses' | 'certifications' | 'immunizations', index: number, field: string, value: string) => {
    if (!user || !passport) return;
    
    const updatedItems = [...passport[type]];
    let updatedItem = { ...updatedItems[index], [field]: value };
    
    // Auto-expire logic on update
    if (field === 'expiryDate' && value) {
      const expiryDate = new Date(value);
      const now = new Date();
      if (expiryDate < now) {
        updatedItem.status = 'expired';
      } else if (updatedItem.status === 'expired') {
        // If they fixed the date, reset status to pending (or keep as is if it was verified?)
        // Usually if it was expired and they update to a future date, it should probably go back to pending for re-verification
        updatedItem.status = 'pending';
      }
    }
    
    updatedItems[index] = updatedItem;
    setPassport({ ...passport, [type]: updatedItems });
  };

  const handleSaveSection = async (type: 'licenses' | 'certifications' | 'immunizations') => {
    if (!user || !passport) return;
    setSaving(true);
    
    // Calculate overall verification status
    const isFullyVerified = calculateVerificationStatus(passport);

    try {
      await updateDoc(doc(db, 'passports', user.uid), {
        [type]: passport[type],
        isFullyVerified,
        updatedAt: serverTimestamp(),
      });
      setPassport({ ...passport, isFullyVerified });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `passports/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveItem = async (type: 'licenses' | 'certifications' | 'immunizations', index: number) => {
    if (!user || !passport) return;
    setSaving(true);
    const updatedItems = passport[type].filter((_, i) => i !== index);
    
    // Recalculate verification status
    const tempPassport = { ...passport, [type]: updatedItems };
    const isFullyVerified = calculateVerificationStatus(tempPassport);

    try {
      await updateDoc(doc(db, 'passports', user.uid), {
        [type]: updatedItems,
        isFullyVerified,
        updatedAt: serverTimestamp(),
      });
      setPassport({ ...passport, [type]: updatedItems, isFullyVerified });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `passports/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyLicense = async (index: number) => {
    if (!user || !passport) return;
    setSaving(true);
    
    const updatedItems = [...passport.licenses];
    // Simulate a verification process
    updatedItems[index] = { ...updatedItems[index], status: 'verified' };
    
    // Recalculate verification status
    const tempPassport = { ...passport, licenses: updatedItems };
    const isFullyVerified = calculateVerificationStatus(tempPassport);

    try {
      await updateDoc(doc(db, 'passports', user.uid), {
        licenses: updatedItems,
        isFullyVerified,
        updatedAt: serverTimestamp(),
      });
      setPassport({ ...passport, licenses: updatedItems, isFullyVerified });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `passports/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
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
          <h2 className="text-2xl font-bold text-slate-900">Sign In Required</h2>
          <p className="text-slate-600 mt-4">You need to be signed in as a nurse to access your Passport.</p>
          <Link href="/" className="mt-8 inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/profile" className="inline-flex items-center text-slate-500 hover:text-blue-600 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-8">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold">Nurse Passport</h1>
                <p className="text-blue-200 mt-1 font-medium">Your verified professional identity</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-xs font-black uppercase tracking-widest text-blue-300">Passport Status</p>
                <p className="text-xl font-bold">{passport?.isFullyVerified ? 'Fully Verified' : 'Action Required'}</p>
              </div>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${passport?.isFullyVerified ? 'bg-green-500' : 'bg-amber-500'} shadow-lg`}>
                {passport?.isFullyVerified ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[120px] opacity-20 -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 rounded-full blur-[120px] opacity-20 -ml-32 -mb-32" />
        </div>

        {/* Verification Summary Dashboard */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-8 mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Verification Summary</h2>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl ${passport?.isFullyVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              {passport?.isFullyVerified ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-bold uppercase tracking-wider text-sm">
                {passport?.isFullyVerified ? 'Fully Verified' : 'Action Required'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { id: 'licenses', label: 'Professional Licenses', items: passport?.licenses || [], icon: FileCheck, color: 'blue' },
              { id: 'certifications', label: 'Certifications', items: passport?.certifications || [], icon: Award, color: 'indigo' },
              { id: 'immunizations', label: 'Immunizations', items: passport?.immunizations || [], icon: Syringe, color: 'purple' },
            ].map((cat) => {
              const verified = cat.items.filter((i: any) => i.status === 'verified').length;
              const total = cat.items.length;
              const progress = total > 0 ? (verified / total) * 100 : 0;
              
              const colorClasses: Record<string, string> = {
                blue: 'bg-blue-600',
                indigo: 'bg-indigo-600',
                purple: 'bg-purple-600'
              };

              const bgColorClasses: Record<string, string> = {
                blue: 'bg-blue-50 text-blue-600',
                indigo: 'bg-indigo-50 text-indigo-600',
                purple: 'bg-purple-50 text-purple-600'
              };
              
              return (
                <div key={cat.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl ${bgColorClasses[cat.color]}`}>
                        <cat.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-700">{cat.label}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-500">{verified}/{total}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`h-full ${colorClasses[cat.color]} rounded-full`}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {total === 0 ? 'No records added' : verified === total ? 'All records verified' : `${total - verified} records pending verification`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {[
              { id: 'licenses', label: 'Licenses', icon: FileCheck, count: passport?.licenses.length || 0 },
              { id: 'certifications', label: 'Certifications', icon: Award, count: passport?.certifications.length || 0 },
              { id: 'immunizations', label: 'Immunizations', icon: Syringe, count: passport?.immunizations.length || 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                  {tab.count}
                </span>
              </button>
            ))}

            <div className="mt-8 p-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-2 text-blue-600 mb-4">
                <Info className="w-5 h-5" />
                <span className="font-bold">Why verify?</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Verified passports allow for <strong>one-click applications</strong>. Hospitals prioritize verified candidates, leading to faster hires and higher pay rates.
              </p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab}</h2>
                <div className="flex items-center space-x-3">
                  {(activeTab === 'licenses' || activeTab === 'certifications') && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleSmartUpload}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={ocrLoading || saving}
                        className="flex items-center space-x-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold hover:bg-indigo-100 transition-all disabled:opacity-50"
                      >
                        {ocrLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                        <span className="hidden md:inline">Smart Upload</span>
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleAddItem(activeTab)}
                    disabled={saving || ocrLoading}
                    className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-100 transition-all disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add {activeTab.slice(0, -1)}</span>
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <AnimatePresence mode="wait">
                  {passport && passport[activeTab].length > 0 ? (
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {passport[activeTab].map((item: any, index: number) => (
                        <div key={index} className="p-6 bg-slate-50 rounded-3xl border border-slate-200 relative group">
                          <button
                            onClick={() => handleRemoveItem(activeTab, index)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeTab === 'licenses' && (
                              <>
                                <div className="space-y-2">
                                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">State</label>
                                  <input
                                    type="text"
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={item.state}
                                    onChange={(e) => handleUpdateItem('licenses', index, 'state', e.target.value)}
                                    placeholder="e.g. California"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">License Number</label>
                                  <input
                                    type="text"
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={item.licenseNumber}
                                    onChange={(e) => handleUpdateItem('licenses', index, 'licenseNumber', e.target.value)}
                                    placeholder="e.g. RN123456"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">License Expiry Date</label>
                                  <input
                                    type="date"
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={item.expiryDate}
                                    onChange={(e) => handleUpdateItem('licenses', index, 'expiryDate', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Status</label>
                                  <select
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                                    value={item.status || 'pending'}
                                    onChange={(e) => handleUpdateItem('licenses', index, 'status', e.target.value)}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="verified">Verified</option>
                                    <option value="expired">Expired</option>
                                  </select>
                                </div>
                                {index === 0 && item.status !== 'verified' && (
                                  <div className="flex items-end">
                                    <button
                                      type="button"
                                      onClick={() => handleVerifyLicense(index)}
                                      disabled={saving || !item.state || !item.licenseNumber}
                                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:bg-slate-300"
                                    >
                                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                      <span>Verify License</span>
                                    </button>
                                  </div>
                                )}
                              </>
                            )}

                            {activeTab === 'certifications' && (
                              <>
                                <div className="space-y-2">
                                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Certification Name</label>
                                  <input
                                    type="text"
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={item.name}
                                    onChange={(e) => handleUpdateItem('certifications', index, 'name', e.target.value)}
                                    placeholder="e.g. ACLS, BLS, CCRN"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Expiry Date</label>
                                  <input
                                    type="date"
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={item.expiryDate}
                                    onChange={(e) => handleUpdateItem('certifications', index, 'expiryDate', e.target.value)}
                                  />
                                </div>
                              </>
                            )}

                            {activeTab === 'immunizations' && (
                              <>
                                <div className="space-y-2">
                                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Immunization / Vaccine</label>
                                  <input
                                    type="text"
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={item.name}
                                    onChange={(e) => handleUpdateItem('immunizations', index, 'name', e.target.value)}
                                    placeholder="e.g. COVID-19, Flu, Hep B"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Date Administered</label>
                                  <input
                                    type="date"
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={item.date}
                                    onChange={(e) => handleUpdateItem('immunizations', index, 'date', e.target.value)}
                                  />
                                </div>
                              </>
                            )}

                            <div className="md:col-span-2 flex items-center justify-between pt-4 border-t border-slate-200">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  item.status === 'verified' ? 'bg-green-500' :
                                  item.status === 'expired' ? 'bg-red-500' : 'bg-amber-500'
                                }`} />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                  {item.status || 'Pending Verification'}
                                </span>
                              </div>
                              {item.status !== 'verified' && (
                                <button className="text-blue-600 text-xs font-bold hover:underline">
                                  Upload Proof
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-8 flex justify-end">
                        <button
                          onClick={() => handleSaveSection(activeTab)}
                          disabled={saving}
                          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          <span>Save {activeTab}</span>
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        {activeTab === 'licenses' && <FileCheck className="w-8 h-8 text-slate-300" />}
                        {activeTab === 'certifications' && <Award className="w-8 h-8 text-slate-300" />}
                        {activeTab === 'immunizations' && <Syringe className="w-8 h-8 text-slate-300" />}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">No {activeTab} added yet</h3>
                      <p className="text-slate-500 text-sm mt-1">Start building your passport by adding your first {activeTab.slice(0, -1)}.</p>
                      <button
                        onClick={() => handleAddItem(activeTab)}
                        className="mt-6 text-blue-600 font-bold hover:underline"
                      >
                        Add {activeTab.slice(0, -1)} now
                      </button>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
