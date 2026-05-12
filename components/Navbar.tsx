'use client';

import Link from 'next/link';
import { useAuth } from './AuthContext';
import Image from 'next/image';
import { Search, Menu, X, User, LogOut, Briefcase, BookOpen, Wrench, LayoutDashboard, Youtube, Sparkles, Zap, Globe, ShieldCheck, Coffee, GraduationCap, Wallet } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, profile, login, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Lounge', href: '/lounge', icon: Coffee },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Gig Shifts', href: '/gig', icon: Zap },
    { name: 'NursePay', href: '/nursepay', icon: Wallet },
    { name: 'Relocation', href: '/relocation', icon: Globe },
    { name: 'Academy', href: '/academy', icon: GraduationCap },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'YouTube', href: '/youtube', icon: Youtube },
    { name: 'AI Tools', href: '/ai-tools', icon: Sparkles },
    { name: 'Licensing', href: '/licensing', icon: ShieldCheck },
    { name: 'Tools', href: '/tools', icon: Wrench },
  ];

  if (profile?.role === 'recruiter') {
    navLinks.unshift({ name: 'Dashboard', href: '/recruiter', icon: LayoutDashboard });
  }

  if (profile?.role === 'nurse') {
    navLinks.unshift({ name: 'Passport', href: '/passport', icon: ShieldCheck });
  }

  if (profile?.role === 'admin') {
    navLinks.push({ name: 'Marketing Hub', href: '/creator', icon: Sparkles });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-display font-bold text-blue-600">
              NurseNow
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="flex items-center space-x-2 text-slate-700 hover:text-blue-600 transition-colors">
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt="Profile" width={32} height={32} className="rounded-full border border-slate-200" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                  <span className="font-medium">{profile?.displayName || 'Nurse'}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.name}</span>
                </Link>
              ))}
              <div className="pt-4 border-t border-slate-100">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 p-3 rounded-lg text-slate-700 hover:bg-blue-50"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      login();
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
