'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Plane, MapPin, CheckCircle2, ArrowRight, Info, ShieldCheck, GraduationCap, Briefcase, Building2 } from 'lucide-react';
import Image from 'next/image';
import PurchasingPowerMap from '@/components/PurchasingPowerMap';

export default function RelocationPage() {
  const [selectedCountry, setSelectedCountry] = useState('usa');

  const countries = [
    { id: 'usa', name: 'USA', flag: '🇺🇸', description: 'High salaries and diverse opportunities across 50 states.' },
    { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', description: 'Work for the NHS or private sector with streamlined visa paths.' },
    { id: 'australia', name: 'Australia', flag: '🇦🇺', description: 'Excellent work-life balance and sunshine year-round.' },
    { id: 'canada', name: 'Canada', flag: '🇨🇦', description: 'Welcoming immigration policies and high demand for healthcare.' },
    { id: 'uae', name: 'UAE', flag: '🇦🇪', description: 'Tax-free salaries and luxury living in Dubai or Abu Dhabi.' },
  ];

  const requirements = {
    usa: [
      'NCLEX-RN Certification',
      'CGFNS VisaScreen Certificate',
      'English Proficiency (IELTS/TOEFL)',
      'State Board Licensure',
      'EB-3 or H-1B Visa Sponsorship'
    ],
    uk: [
      'NMC Registration',
      'CBT (Computer Based Test)',
      'OSCE (Objective Structured Clinical Examination)',
      'IELTS (7.0) or OET (Grade B)',
      'Health and Care Worker Visa'
    ]
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden mb-16">
          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-blue-500/20 px-4 py-2 rounded-full border border-blue-500/30 mb-6"
            >
              <Globe className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold uppercase tracking-widest text-blue-300">Global Relocation Hub</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-display font-bold leading-tight"
            >
              Your Nursing Career, <span className="text-blue-400">Without Borders</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-slate-400 text-lg leading-relaxed"
            >
              We help nurses relocate globally. From visa sponsorship to licensing and housing, NurseNow is your partner in international career growth.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl flex items-center space-x-2">
                <span>Check Eligibility</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="bg-white/10 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20">
                View Countries
              </button>
            </motion.div>
          </div>
          {/* Decorative World Map Background */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <Globe className="w-[800px] h-[800px] absolute -top-40 -right-40" />
          </div>
        </div>

        {/* Global Purchasing Power Map */}
        <div className="mb-24">
          <PurchasingPowerMap />
        </div>

        {/* Country Selector */}
        <div className="mb-12">
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-8 text-center">Where do you want to go?</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {countries.map((country) => (
              <button
                key={country.id}
                onClick={() => setSelectedCountry(country.id)}
                className={`p-6 rounded-3xl transition-all text-center border-2 ${
                  selectedCountry === country.id
                    ? 'bg-white border-blue-600 shadow-xl shadow-blue-900/5'
                    : 'bg-white border-slate-100 hover:border-blue-200 text-slate-600'
                }`}
              >
                <div className="text-4xl mb-3">{country.flag}</div>
                <div className="font-bold text-slate-900">{country.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Country Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              key={selectedCountry}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm"
            >
              <h3 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
                Relocating to {countries.find(c => c.id === selectedCountry)?.name}
              </h3>
              <p className="text-slate-600 text-lg mb-10">
                {countries.find(c => c.id === selectedCountry)?.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Requirements</h4>
                  <div className="space-y-4">
                    {(requirements[selectedCountry as keyof typeof requirements] || requirements.usa).map((req, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-slate-700 font-medium">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
                  <h4 className="text-blue-900 font-bold mb-4 flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-2 text-blue-600" />
                    NurseNow Concierge
                  </h4>
                  <p className="text-blue-700 text-sm leading-relaxed mb-6">
                    Our relocation specialists handle the paperwork for you. We partner with top hospitals to ensure your transition is smooth and secure.
                  </p>
                  <ul className="text-blue-800 text-sm space-y-2 mb-8">
                    <li>• Free Visa Consultation</li>
                    <li>• Licensing Assistance</li>
                    <li>• Housing Placement</li>
                    <li>• Flight Reimbursement</li>
                  </ul>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                    Talk to an Expert
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Steps Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Assessment', desc: 'We review your qualifications and English level.' },
                { step: '02', title: 'Licensing', desc: 'We guide you through the board exams and registration.' },
                { step: '03', title: 'Placement', desc: 'Interview with top hospitals and sign your contract.' },
              ].map((s) => (
                <div key={s.step} className="bg-white p-8 rounded-3xl border border-slate-200">
                  <div className="text-4xl font-display font-black text-slate-100 mb-4">{s.step}</div>
                  <h4 className="font-bold text-slate-900 mb-2">{s.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6">Success Stories</h3>
              <div className="space-y-6">
                {[
                  { name: 'Maria S.', from: 'Philippines', to: 'USA', text: 'NurseNow made my dream of working in New York a reality. The licensing support was incredible.' },
                  { name: 'James K.', from: 'India', to: 'UK', text: 'I relocated to London in just 6 months. The OSCE prep course was the key to my success.' },
                ].map((story, i) => (
                  <div key={i} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                    <p className="text-slate-600 text-sm italic mb-4">&quot;{story.text}&quot;</p>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-xs">
                        {story.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{story.name}</div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{story.from} → {story.to}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold text-xl mb-4">Relocation Webinar</h3>
                <p className="text-blue-100 text-sm mb-6">Join our live session on &quot;Nursing in Australia: Steps to Success&quot; this Friday.</p>
                <button className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                  Register Now
                </button>
              </div>
              <Plane className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 rotate-12" />
            </div>
          </div>
        </div>

        {/* Partner Hospitals */}
        <div className="text-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Trusted by Global Healthcare Systems</h3>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center space-x-2">
              <Building2 className="w-6 h-6" />
              <span className="font-bold text-xl">NHS UK</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="w-6 h-6" />
              <span className="font-bold text-xl">Mayo Clinic</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="w-6 h-6" />
              <span className="font-bold text-xl">Cleveland Clinic</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="w-6 h-6" />
              <span className="font-bold text-xl">Aspen Health</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
