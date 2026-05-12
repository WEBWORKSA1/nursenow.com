'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Stethoscope, 
  GraduationCap, 
  Heart, 
  Briefcase, 
  Building2, 
  ExternalLink, 
  ChevronRight,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AITool {
  id: string;
  name: string;
  category: 'Nursing Care' | 'Nursing Education' | 'Nurse Well-being' | 'Jobs & Placements' | 'Work Environments';
  description: string;
  features: string[];
  icon: any;
  color: string;
}

const AI_TOOLS: AITool[] = [
  {
    id: '1',
    name: 'Clinical Decision Support AI',
    category: 'Nursing Care',
    description: 'Real-time patient data analysis that identifies early warning signs of sepsis or clinical deterioration.',
    features: ['Early Warning Scores', 'Sepsis Prediction', 'Vital Sign Trends'],
    icon: Stethoscope,
    color: 'blue'
  },
  {
    id: '2',
    name: 'Smart IV Infusion Systems',
    category: 'Nursing Care',
    description: 'AI-integrated pumps that cross-reference patient records to prevent medication dosage errors.',
    features: ['Dose Error Reduction', 'EMR Integration', 'Real-time Alerts'],
    icon: Zap,
    color: 'indigo'
  },
  {
    id: '3',
    name: 'AI Wound Analysis',
    category: 'Nursing Care',
    description: 'Mobile-based image assessment that tracks wound healing progress and suggests care plan adjustments.',
    features: ['Image Recognition', 'Healing Tracking', 'Care Recommendations'],
    icon: Shield,
    color: 'emerald'
  },
  {
    id: '4',
    name: 'Virtual Patient Simulations',
    category: 'Nursing Education',
    description: 'AI-driven avatars that simulate complex clinical scenarios for risk-free practice and skill building.',
    features: ['Dynamic Responses', 'Scenario Branching', 'Performance Feedback'],
    icon: GraduationCap,
    color: 'purple'
  },
  {
    id: '5',
    name: 'NCLEX AI Tutor',
    category: 'Nursing Education',
    description: 'Personalized study assistant that identifies knowledge gaps and creates custom practice exams.',
    features: ['Gap Analysis', 'Adaptive Testing', 'Rationales Generation'],
    icon: GraduationCap,
    color: 'violet'
  },
  {
    id: '6',
    name: 'Burnout Predictor',
    category: 'Nurse Well-being',
    description: 'Analyzes scheduling patterns and workload intensity to proactively suggest rest and recovery periods.',
    features: ['Workload Analysis', 'Fatigue Monitoring', 'Rest Suggestions'],
    icon: Heart,
    color: 'rose'
  },
  {
    id: '7',
    name: 'MindfulNurse AI',
    category: 'Nurse Well-being',
    description: 'Personalized mental health support and stress-relief exercises tailored for high-stress healthcare environments.',
    features: ['Stress Tracking', 'Guided Meditation', 'Peer Support Network'],
    icon: Heart,
    color: 'pink'
  },
  {
    id: '8',
    name: 'NurseNow Match',
    category: 'Jobs & Placements',
    description: 'Proprietary AI matching engine that connects nurses with roles based on skills, values, and lifestyle needs.',
    features: ['Skill Mapping', 'Culture Fit', 'Location Optimization'],
    icon: Briefcase,
    color: 'blue'
  },
  {
    id: '9',
    name: 'Resume Optimizer AI',
    category: 'Jobs & Placements',
    description: 'Tailors nursing resumes for specific hospital ATS systems to increase visibility to recruiters.',
    features: ['Keyword Optimization', 'Format Checking', 'Impact Analysis'],
    icon: Briefcase,
    color: 'sky'
  },
  {
    id: '10',
    name: 'Staffing Ratio Optimizer',
    category: 'Work Environments',
    description: 'Predicts patient surge and acuity levels to ensure safe and balanced staffing ratios across units.',
    features: ['Acuity Prediction', 'Ratio Compliance', 'Dynamic Scheduling'],
    icon: Building2,
    color: 'amber'
  },
  {
    id: '11',
    name: 'Smart Ward Inventory',
    category: 'Work Environments',
    description: 'AI-powered tracking of supplies and equipment to ensure nurses always have what they need at the bedside.',
    features: ['Automated Restock', 'Equipment Tracking', 'Waste Reduction'],
    icon: Building2,
    color: 'orange'
  },
  {
    id: '12',
    name: 'Alarm Fatigue Filter',
    category: 'Work Environments',
    description: 'AI that filters non-critical monitor alarms to reduce noise pollution and focus attention on urgent needs.',
    features: ['Noise Reduction', 'Priority Routing', 'Contextual Alerts'],
    icon: Zap,
    color: 'yellow'
  }
];

const CATEGORIES = [
  'All',
  'Nursing Care',
  'Nursing Education',
  'Nurse Well-being',
  'Jobs & Placements',
  'Work Environments'
];

export default function AIToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTools = AI_TOOLS.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Innovation Hub</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-4">
            AI Tools for Modern Nursing
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Discover the latest AI technologies designed to enhance patient care, 
            support your education, and protect your well-being.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-200 mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search AI tools, features, or categories..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
              <Filter className="w-5 h-5 text-slate-400 mr-2 hidden md:block" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool) => (
              <motion.div
                key={tool.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -8 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors bg-${tool.color}-50 group-hover:bg-${tool.color}-100`}>
                  <tool.icon className={`w-8 h-8 text-${tool.color}-600`} />
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold uppercase tracking-widest text-${tool.color}-600`}>
                    {tool.category}
                  </span>
                  <div className="p-1.5 bg-slate-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {tool.name}
                </h3>
                
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {tool.description}
                </p>

                <div className="space-y-2">
                  {tool.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-xs font-medium text-slate-500">
                      <ChevronRight className={`w-3 h-3 mr-2 text-${tool.color}-400`} />
                      {feature}
                    </div>
                  ))}
                </div>

                <button className={`mt-8 w-full py-3 rounded-xl font-bold text-sm border border-slate-100 hover:border-${tool.color}-200 hover:bg-${tool.color}-50 text-slate-600 hover:text-${tool.color}-700 transition-all flex items-center justify-center space-x-2`}>
                  <span>Learn More</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">No tools found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search or category filters.</p>
            <button 
              onClick={() => {setSearchQuery(''); setActiveCategory('All');}}
              className="mt-8 text-blue-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-24 bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Have an AI tool to suggest?</h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-8">
              We&apos;re constantly updating our hub with the best AI tools for nurses. 
              Help us grow the community by sharing your favorites.
            </p>
            <button className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl">
              Submit a Tool
            </button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -ml-32 -mb-32" />
        </div>
      </div>
    </div>
  );
}
