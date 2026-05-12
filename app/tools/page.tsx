'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wrench, FileText, Calculator, Calendar, Sparkles, ArrowRight, MapPin, Briefcase, Clock, DollarSign, Download, Plus, Trash2, Send, MessageSquare, Bot, User as UserIcon, Loader2, Globe, FileCheck } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import PurchasingPowerMap from '@/components/PurchasingPowerMap';
import Markdown from 'react-markdown';

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<'resume' | 'salary' | 'shift' | 'chat'>('resume');

  const tools = [
    { id: 'resume', name: 'Resume AI', icon: FileText, description: 'Build or optimize your nursing resume.' },
    { id: 'chat', name: 'Career Coach', icon: MessageSquare, description: 'AI interview prep and career advice.' },
    { id: 'salary', name: 'Salary Calc', icon: Calculator, description: 'Market value estimator by location.' },
    { id: 'shift', name: 'Shift Planner', icon: Calendar, description: 'Burnout prevention and scheduling.' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-slate-900 leading-tight">Professional <span className="text-blue-600">Nursing Tools</span></h1>
          <p className="text-slate-600 mt-4 text-lg">Free, AI-powered tools designed to help you manage your career, finances, and time more effectively.</p>
        </div>

        {/* Tool Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as any)}
              className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold transition-all shadow-sm ${
                activeTool === tool.id 
                  ? 'bg-blue-600 text-white shadow-blue-100' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <tool.icon className="w-5 h-5" />
              <span>{tool.name}</span>
            </button>
          ))}
        </div>

        {/* Tool Content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTool === 'resume' && <ResumeBuilder key="resume" />}
            {activeTool === 'chat' && <CareerChat key="chat" />}
            {activeTool === 'salary' && <SalaryCalculator key="salary" />}
            {activeTool === 'shift' && <ShiftPlanner key="shift" />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function CareerChat() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: "Hello! I'm your NurseNow Career Assistant. How can I help you today? I can provide interview tips, career path advice, or help you understand specialty certifications." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      
      const prompt = `You are a professional nursing career coach at NurseNow.com. 
      Provide helpful, encouraging, and specific advice to a nurse or nursing student.
      User says: ${userMsg}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      const text = response.text || "I'm sorry, I couldn't generate a response.";
      
      setMessages(prev => [...prev, { role: 'ai', content: text }]);
    } catch (error) {
      console.error('AI error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[600px]"
    >
      <div className="p-6 bg-blue-600 text-white flex items-center space-x-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold">AI Career Coach</h2>
          <p className="text-xs text-blue-100">Powered by NurseNow Intelligence</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl rounded-tl-none border border-slate-100">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            placeholder="Ask anything about your nursing career..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function ResumeBuilder() {
  const [mode, setMode] = useState<'build' | 'optimize'>('build');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    experience: '',
    skills: '',
    existingResume: '',
  });
  const [aiResult, setAiResult] = useState('');
  const [loading, setLoading] = useState(false);

  const processResume = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      
      let prompt = '';
      if (mode === 'build') {
        prompt = `Create a professional nursing resume summary and key accomplishments for:
          Name: ${formData.name}
          Specialty: ${formData.specialty}
          Experience: ${formData.experience}
          Skills: ${formData.skills}
          Format it in professional markdown. Include sections for Summary, Key Skills, and Professional Experience highlights.`;
      } else {
        prompt = `You are an expert nursing career coach and ATS (Applicant Tracking System) specialist. 
          Analyze and optimize the following nursing resume text. 
          
          Focus on:
          1. ATS Compatibility: Ensure keywords related to nursing specialties, certifications (ACLS, BLS, etc.), and clinical skills are prominent.
          2. Action-Oriented Language: Replace passive descriptions with strong action verbs (e.g., "Administered", "Coordinated", "Spearheaded").
          3. Impact: Quantify achievements where possible.
          4. Keyword Optimization: Include high-demand nursing keywords.

          Resume Content: 
          ${formData.existingResume}
          
          Provide the response in two sections:
          ### 1. Optimization Analysis
          (Briefly explain what was changed and why for ATS/impact)
          
          ### 2. Optimized Resume Version
          (The full, rewritten resume text ready for use)
          
          Format the entire response in clean Markdown.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ text: prompt }],
      });
      setAiResult(response.response.text() || '');
      setStep(2);
    } catch (error) {
      console.error('AI error:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = () => {
    const element = document.createElement("a");
    const file = new Blob([aiResult], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Optimized_Nursing_Resume_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 rounded-xl">
            {mode === 'build' ? <Sparkles className="w-6 h-6 text-blue-600" /> : <FileCheck className="w-6 h-6 text-blue-600" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{mode === 'build' ? 'Resume Builder' : 'Resume Optimizer'}</h2>
            <p className="text-slate-500 text-sm">
              {mode === 'build' 
                ? 'Generate a professional summary and skills from scratch.' 
                : 'Optimize your existing resume for ATS and impact.'}
            </p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => { setMode('build'); setStep(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'build' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Build New
          </button>
          <button 
            onClick={() => { setMode('optimize'); setStep(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'optimize' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Optimize Existing
          </button>
        </div>
      </div>

      {step === 1 ? (
        <div className="space-y-6">
          {mode === 'build' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Jane Doe, RN"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Specialty</label>
                  <input
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="ICU, Pediatrics, ER..."
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Experience (Years)</label>
                <input
                  type="text"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. 5 years in Critical Care"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Key Skills</label>
                <textarea
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-32"
                  placeholder="e.g. ACLS, PALS, Patient Advocacy, Ventilator Management..."
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Paste Your Current Resume</label>
              <textarea
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-64 font-mono text-sm"
                placeholder="Paste the text of your resume here..."
                value={formData.existingResume}
                onChange={(e) => setFormData({ ...formData, existingResume: e.target.value })}
              />
            </div>
          )}
          
          <button
            onClick={processResume}
            disabled={loading || (mode === 'build' ? !formData.name : !formData.existingResume)}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{mode === 'build' ? 'Generate AI Resume' : 'Optimize Resume'}</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 text-slate-700 max-h-[600px] overflow-y-auto custom-scrollbar prose prose-slate prose-sm max-w-none">
            <Markdown>{aiResult}</Markdown>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-slate-100 text-slate-900 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Back to Edit
            </button>
            <button 
              onClick={downloadResume}
              className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download Text</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SalaryCalculator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-green-50 rounded-xl">
            <Globe className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Global Relocation Map</h2>
            <p className="text-slate-500 text-sm">Compare purchasing power, salaries, and cost of living globally.</p>
          </div>
        </div>
        <p className="text-slate-600 text-sm mb-8 leading-relaxed">
          Raw salary numbers don&apos;t tell the whole story. Our Global Relocation Map calculates <strong>Purchasing Power</strong> by factoring in local taxes, average rent, and cost of living indices. Find out where your nursing career can truly thrive.
        </p>
      </div>

      <PurchasingPowerMap />
    </motion.div>
  );
}

function ShiftPlanner() {
  const [shifts, setShifts] = useState<{ id: string, date: string, type: string }[]>([]);
  const [newDate, setNewDate] = useState('');
  const [newType, setNewType] = useState('day');

  const addShift = () => {
    if (!newDate) return;
    setShifts([...shifts, { id: Math.random().toString(36).substr(2, 9), date: newDate, type: newType }]);
    setNewDate('');
  };

  const removeShift = (id: string) => {
    setShifts(shifts.filter(s => s.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl"
    >
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-purple-50 rounded-xl">
          <Calendar className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Shift Planner</h2>
          <p className="text-slate-500 text-sm">Track your schedule and prevent burnout.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="date"
          className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
        />
        <select
          className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none appearance-none"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
        >
          <option value="day">Day Shift (12h)</option>
          <option value="night">Night Shift (12h)</option>
          <option value="on-call">On Call</option>
        </select>
        <button
          onClick={addShift}
          className="bg-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Shift</span>
        </button>
      </div>

      <div className="space-y-3">
        {shifts.length > 0 ? (
          shifts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((shift) => (
            <div key={shift.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${shift.type === 'night' ? 'bg-indigo-600' : 'bg-orange-400'}`} />
                <div>
                  <div className="font-bold text-slate-900">{new Date(shift.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">{shift.type} shift</div>
                </div>
              </div>
              <button
                onClick={() => removeShift(shift.id)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-400 italic">
            No shifts added yet. Start planning your week!
          </div>
        )}
      </div>
    </motion.div>
  );
}
