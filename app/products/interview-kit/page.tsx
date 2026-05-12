'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Star, ArrowRight, ShieldCheck, Zap, Download, Play, Users, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function InterviewKitPage() {
  const [isPurchased, setIsPurchased] = useState(false);

  const features = [
    '50+ Most Common Nursing Interview Questions',
    'AI-Powered Answer Feedback Tool',
    'Specialty-Specific Question Banks (ER, ICU, Peds)',
    'Video Mock Interview Sessions',
    'Follow-up Email Templates',
    'Salary Negotiation Scripts',
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30 mb-6">
                <Zap className="w-4 h-4 text-blue-400 fill-current" />
                <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Best Seller</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-bold leading-tight">
                The Ultimate <br /> <span className="text-blue-400">Nurse Interview</span> Mastery Kit
              </h1>
              <p className="mt-6 text-slate-400 text-xl leading-relaxed">
                Stop stressing about your next interview. Get the exact frameworks, scripts, and AI tools used by nurses to land jobs at top-tier hospitals.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setIsPurchased(true)}
                  className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center space-x-2"
                >
                  <span>Get the Kit Now — $19</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-3 px-6 py-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-slate-400">
                    <span className="text-white font-bold">4.9/5</span> from 2,000+ nurses
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-blue-600 rounded-[3rem] rotate-3 absolute inset-0 blur-3xl opacity-20" />
              <div className="relative bg-slate-800 rounded-[3rem] border border-slate-700 p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                        <Download className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-bold">Interview Guide.pdf</div>
                        <div className="text-xs text-slate-500">45 Pages • Comprehensive</div>
                      </div>
                    </div>
                    <div className="text-blue-400 font-bold">Included</div>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-700 pb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                        <Play className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <div className="font-bold">Video Masterclass</div>
                        <div className="text-xs text-slate-500">12 Modules • 4 Hours</div>
                      </div>
                    </div>
                    <div className="text-green-400 font-bold">Included</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <div className="font-bold">AI Mock Interview</div>
                        <div className="text-xs text-slate-500">Unlimited Practice</div>
                      </div>
                    </div>
                    <div className="text-amber-400 font-bold">Included</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Inside */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-display font-bold text-slate-900">Everything You Need to Get Hired</h2>
            <p className="text-slate-600 mt-4 text-lg">We&apos;ve distilled years of recruiting data into a single, easy-to-follow kit.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start space-x-4 p-6 rounded-2xl border border-slate-100 bg-slate-50">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-slate-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-display font-bold text-slate-900 leading-tight">Join 2,000+ Nurses Who Landed Their Dream Jobs</h2>
              <div className="mt-8 space-y-8">
                {[
                  { name: 'Jessica R.', role: 'New Grad Nurse', text: 'I was so nervous for my first hospital interview. This kit gave me the confidence and the exact answers they were looking for. I got the job!' },
                  { name: 'David L.', role: 'ICU Nurse', text: 'The salary negotiation scripts alone are worth 10x the price. I managed to negotiate a $5,000 sign-on bonus using the techniques in this kit.' }
                ].map((t, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center space-x-1 text-amber-400 mb-3">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-slate-700 italic">&quot;{t.text}&quot;</p>
                    <div className="mt-4 font-bold text-slate-900">{t.name} — <span className="text-slate-500 font-medium">{t.role}</span></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-blue-600 rounded-[3rem] p-12 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-3xl font-display font-bold mb-6">100% Money-Back Guarantee</h3>
                <p className="text-blue-100 text-lg leading-relaxed mb-8">
                  If you don&apos;t feel more confident and prepared for your interview after using this kit, we&apos;ll refund your entire purchase. No questions asked.
                </p>
                <div className="flex items-center space-x-4">
                  <ShieldCheck className="w-12 h-12 text-white" />
                  <div className="font-bold text-xl">Secure Checkout</div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-display font-bold text-slate-900">Ready to Get Hired?</h2>
          <p className="mt-6 text-slate-600 text-xl">Download the Nurse Interview Mastery Kit today and start your journey to a better career.</p>
          <button 
            onClick={() => setIsPurchased(true)}
            className="mt-10 bg-blue-600 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200"
          >
            Get Instant Access — $19
          </button>
          <p className="mt-4 text-slate-400 text-sm">One-time payment. Lifetime access.</p>
        </div>
      </section>
    </div>
  );
}
