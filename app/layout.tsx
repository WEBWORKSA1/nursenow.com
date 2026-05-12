import type {Metadata} from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import Navbar from '@/components/Navbar';
import Chatbot from '@/components/Chatbot';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'NurseNow - AI-Powered Nursing Career Platform',
  description: 'Find nursing jobs, learn skills, and grow your career with AI-driven tools.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body suppressHydrationWarning className="font-sans bg-slate-50 text-slate-900">
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Chatbot />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-display font-bold text-blue-600">NurseNow</h2>
            <p className="mt-4 text-slate-600 max-w-sm">
              Empowering nurses with AI-driven career tools, job opportunities, and skill-building resources.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Platform</h3>
            <ul className="mt-4 space-y-2 text-slate-600">
              <li><a href="/jobs" className="hover:text-blue-600 transition-colors">Jobs</a></li>
              <li><a href="/courses" className="hover:text-blue-600 transition-colors">Courses</a></li>
              <li><a href="/tools" className="hover:text-blue-600 transition-colors">Tools</a></li>
              <li><a href="/blog" className="hover:text-blue-600 transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Support</h3>
            <ul className="mt-4 space-y-2 text-slate-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-100 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} NurseNow. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
