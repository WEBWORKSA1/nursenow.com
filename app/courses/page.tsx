'use client';

import { useState, useEffect } from 'react';
import { db, auth, OperationType, handleFirestoreError } from '@/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { Search, BookOpen, GraduationCap, Star, Users, Play, Clock, CheckCircle2, ArrowRight, Filter, Sparkles, Gift, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Courses' },
    { id: 'nclex', name: 'NCLEX Prep' },
    { id: 'career', name: 'Career Growth' },
    { id: 'specialty', name: 'Specialty Certs' },
    { id: 'clinical', name: 'Clinical Skills' },
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, orderBy('rating', 'desc'), limit(20));
      const querySnapshot = await getDocs(q);
      const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (coursesData.length === 0) {
        setCourses([
          { id: '1', title: 'NCLEX-RN Comprehensive Prep', instructor: 'Dr. Sarah Miller', price: '$49', rating: 4.9, students: 1240, category: 'nclex', image: 'https://picsum.photos/seed/nclex/400/250', duration: '40 hours', isFeatured: true, badge: 'Best Seller' },
          { id: '2', title: 'Nursing Interview Mastery', instructor: 'Emily Coach', price: '$19', rating: 5.0, students: 420, category: 'career', image: 'https://picsum.photos/seed/interview/400/250', duration: '5 hours' },
          { id: '3', title: 'Advanced Cardiac Life Support (ACLS)', instructor: 'Nurse John Doe', price: '$29', rating: 4.8, students: 850, category: 'specialty', image: 'https://picsum.photos/seed/acls/400/250', duration: '12 hours', isFeatured: true, badge: 'Top Rated' },
          { id: '4', title: 'Resume Building for Nurses', instructor: 'Recruiter Mark', price: 'Free', rating: 4.7, students: 2100, category: 'career', image: 'https://picsum.photos/seed/resume/400/250', duration: '2 hours' },
          { id: '5', title: 'Pediatric Advanced Life Support (PALS)', instructor: 'Dr. Lisa Wong', price: '$35', rating: 4.9, students: 600, category: 'specialty', image: 'https://picsum.photos/seed/pals/400/250', duration: '15 hours' },
          { id: '6', title: 'Wound Care Specialist Certification', instructor: 'Nurse Sarah', price: '$59', rating: 4.8, students: 300, category: 'specialty', image: 'https://picsum.photos/seed/wound/400/250', duration: '20 hours' },
        ]);
      } else {
        setCourses(coursesData);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'courses');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(c => c.category === selectedCategory);

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Special Offer Banner */}
      <div className="bg-blue-600 text-white py-3 px-4 text-center relative overflow-hidden">
        <motion.div 
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 flex items-center justify-center space-x-3 text-sm font-bold"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Flash Sale: Get 25% off all specialty certifications with code <span className="bg-white/20 px-2 py-0.5 rounded">NURSE25</span></span>
          <Sparkles className="w-4 h-4 text-amber-300" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] animate-[shimmer_3s_infinite]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-slate-900 leading-tight">Master New Skills & <span className="text-blue-600">Advance Your Career</span></h1>
          <p className="text-slate-600 mt-4 text-lg">Expert-led courses designed specifically for the nursing profession. From NCLEX prep to advanced specialty certifications.</p>
        </div>

        {/* Featured Courses Section */}
        <div className="mb-20 bg-white rounded-[3rem] p-8 md:p-12 border border-slate-200 shadow-xl shadow-blue-900/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-50" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -ml-32 -mb-32 opacity-50" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shadow-inner">
                  <Sparkles className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-bold text-slate-900">Featured Courses</h2>
                  <p className="text-slate-500 text-sm font-medium">Hand-picked premium content for your growth</p>
                </div>
              </div>
              <div className="flex items-center text-blue-600 font-bold hover:underline cursor-pointer group bg-blue-50 px-6 py-3 rounded-xl transition-colors hover:bg-blue-100">
                <span>View all bundles</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {courses.filter(c => c.isFeatured).map((course) => (
                <motion.div
                  key={`featured-${course.id}`}
                  whileHover={{ y: -8 }}
                  className="lg:col-span-1 bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-lg shadow-slate-200/50 relative group"
                >
                  <div className="relative h-56 w-full">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute top-4 left-4 bg-amber-500 text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center space-x-1.5">
                      <Zap className="w-3 h-3 fill-current" />
                      <span>{course.badge || 'Featured'}</span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center space-x-1 text-amber-400 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < Math.floor(course.rating) ? 'fill-current' : ''}`} />
                        ))}
                        <span className="text-white font-bold text-xs ml-1">{course.rating}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">{course.title}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center font-bold text-blue-600 text-xs border border-blue-100">
                          {course.instructor[0]}
                        </div>
                        <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">{course.instructor}</span>
                      </div>
                      <div className="text-xl font-black text-blue-600">{course.price}</div>
                    </div>
                    <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-100 flex items-center justify-center space-x-2 group/btn">
                      <span>Enroll Now</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Bundle Offer Card */}
              <div className="lg:col-span-1 bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col justify-between border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="inline-flex items-center space-x-2 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30 mb-6">
                    <Gift className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">Bundle & Save</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-4 leading-tight">The Ultimate <br /> <span className="text-blue-400">Nursing Mastery</span> Bundle</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    Get our top 3 courses in one package and save 40%. Lifetime access to all future updates included.
                  </p>
                  <div className="space-y-3 mb-8">
                    {['NCLEX Prep + Interview Mastery', 'ACLS Certification Course', 'Exclusive Study Guides (PDF)'].map(item => (
                      <div key={item} className="flex items-center space-x-3 text-xs">
                        <div className="w-5 h-5 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                          <CheckCircle2 className="w-3 h-3 text-blue-400" />
                        </div>
                        <span className="text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-slate-500 line-through text-[10px] font-bold mb-1">VALUE: $135</div>
                      <div className="text-3xl font-black text-white">$79</div>
                    </div>
                    <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-black text-[10px] tracking-tighter animate-pulse">
                      SAVE 40%
                    </div>
                  </div>
                  <button className="w-full bg-white text-slate-900 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-xl flex items-center justify-center space-x-2 group/bundle">
                    <span>Claim Bundle Offer</span>
                    <ArrowRight className="w-5 h-5 group-hover/bundle:translate-x-1 transition-transform" />
                  </button>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600 rounded-full blur-[80px] opacity-10 -ml-24 -mb-24" />
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-full font-bold transition-all shadow-sm ${
                selectedCategory === cat.id 
                  ? 'bg-blue-600 text-white shadow-blue-100' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-medium tracking-wide">Loading courses...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="relative h-52 w-full">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-blue-600 font-bold shadow-md">
                    {course.price}
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                      <Play className="w-6 h-6 text-white fill-current" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full uppercase tracking-wider">
                      {course.category}
                    </span>
                    <div className="flex items-center text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-slate-900 font-bold text-sm ml-1">{course.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{course.title}</h3>
                  <p className="text-slate-500 text-sm mt-2 font-medium">By {course.instructor}</p>
                  
                  <div className="mt-6 flex items-center justify-between text-slate-500 text-sm border-t border-slate-100 pt-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1.5" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1.5" />
                      <span>{course.students} students</span>
                    </div>
                  </div>

                  <button className="mt-6 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-100">
                    Enroll Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Featured Section */}
        <div className="mt-24 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-display font-bold leading-tight">Get Certified with Our <br /> AI-Powered NCLEX Prep</h2>
              <p className="mt-6 text-blue-100 text-lg leading-relaxed">
                Our NCLEX prep uses adaptive AI to identify your weak spots and provide personalized practice questions. Join 10,000+ students who passed on their first try.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="font-medium">Adaptive Learning</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="font-medium">5,000+ Questions</span>
                </div>
              </div>
              <button className="mt-10 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-xl flex items-center space-x-2">
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <div className="aspect-square bg-white/10 rounded-full absolute -top-20 -right-20 w-80 h-80 blur-3xl" />
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="space-y-6">
                  {[
                    { label: 'Pharmacology', progress: 85 },
                    { label: 'Medical-Surgical', progress: 72 },
                    { label: 'Pediatrics', progress: 94 },
                    { label: 'Mental Health', progress: 68 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm font-bold mb-2 uppercase tracking-wider">
                        <span>{item.label}</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-green-400 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
