'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  ArrowRightLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Zap,
  CreditCard,
  Landmark,
  ShieldCheck,
  ChevronRight,
  Plus,
  X,
  FileText,
  Calculator,
  MapPin,
  Home,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { db, OperationType, handleFirestoreError } from '@/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';

interface Transaction {
  id: string;
  type: 'earnings' | 'payout';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'processing';
  shiftId?: string;
}

export default function NursePayPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'wallet' | 'tax'>('wallet');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [cashingOut, setCashingOut] = useState(false);
  const [showCashoutModal, setShowCashoutModal] = useState(false);

  // Mock data for demonstration since we don't have a full payment backend yet
  const availableBalance = 1240.50;
  const pendingBalance = 350.00;

  useEffect(() => {
    if (!user) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    // In a real app, we would fetch transactions from a 'transactions' collection
    // For now, we'll use mock data to demonstrate the UI
    setTimeout(() => {
      setTransactions([
        { id: 't1', type: 'earnings', amount: 450.00, description: 'ICU Night Shift - General Hospital', date: '2026-04-12T08:00:00Z', status: 'completed' },
        { id: 't2', type: 'earnings', amount: 380.50, description: 'ER Evening Shift - St. Jude', date: '2026-04-10T23:00:00Z', status: 'completed' },
        { id: 't3', type: 'payout', amount: -800.00, description: 'Instant Transfer to Chase Bank ****1234', date: '2026-04-11T09:30:00Z', status: 'completed' },
        { id: 't4', type: 'earnings', amount: 410.00, description: 'Med-Surg Day Shift - Valley Health', date: '2026-04-08T16:00:00Z', status: 'completed' },
        { id: 't5', type: 'earnings', amount: 350.00, description: 'Pediatrics Morning - Children\'s Clinic', date: '2026-04-14T12:00:00Z', status: 'pending' },
      ]);
      setLoading(false);
    }, 1000);

  }, [user]);

  const handleInstantPayout = () => {
    setCashingOut(true);
    // Simulate API call to payment processor (e.g., Stripe Instant Payouts)
    setTimeout(() => {
      setCashingOut(false);
      setShowCashoutModal(false);
      alert('Success! $1,240.50 is on its way to your linked debit card. It should arrive in minutes.');
      // In a real app, we would update the balance and add a transaction record here
    }, 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || profile?.role !== 'nurse') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Nurse Access Only</h2>
          <p className="text-slate-600 mt-4">Please sign in with a nurse account to access NursePay.</p>
          <Link 
            href="/profile"
            className="mt-8 block w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
          >
            Go to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 mb-4">
              <Zap className="w-4 h-4 text-emerald-600 fill-current" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">NursePay</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-slate-900 leading-tight">Your <span className="text-emerald-600">Finances</span></h1>
            <p className="text-slate-600 mt-2 text-lg">Manage your earnings, instant payouts, and travel tax compliance.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit shadow-sm">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 ${
              activeTab === 'wallet' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Digital Wallet</span>
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 ${
              activeTab === 'tax' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Travel Tax Assistant</span>
          </button>
        </div>

        {activeTab === 'wallet' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Wallet Card */}
            <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] -mr-48 -mt-48 opacity-30" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] -ml-32 -mb-32 opacity-20" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                      <Wallet className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="font-bold text-slate-300 tracking-wider uppercase text-sm">Available Balance</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-300">FDIC Insured</span>
                  </div>
                </div>

                <div className="mb-10">
                  <div className="text-6xl md:text-7xl font-black text-white tracking-tight">
                    ${availableBalance.toFixed(2)}
                  </div>
                  {pendingBalance > 0 && (
                    <div className="mt-3 text-emerald-400 font-medium flex items-center">
                      <Clock className="w-4 h-4 mr-1.5" />
                      + ${pendingBalance.toFixed(2)} pending from recent shifts
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setShowCashoutModal(true)}
                    className="bg-emerald-500 text-slate-900 py-4 px-6 rounded-2xl font-bold text-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 group"
                  >
                    <Zap className="w-5 h-5 fill-current" />
                    <span>Instant Payout</span>
                    <ArrowRightLeft className="w-4 h-4 ml-2 opacity-50 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="bg-white/10 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-md border border-white/10 flex items-center justify-center space-x-2">
                    <Landmark className="w-5 h-5" />
                    <span>Standard Transfer</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h3>
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                {transactions.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">No recent transactions.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                            tx.type === 'earnings' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {tx.type === 'earnings' ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{tx.description}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-slate-500">{new Date(tx.date).toLocaleDateString()}</span>
                              <span className="text-slate-300">•</span>
                              <span className={`text-xs font-bold uppercase tracking-wider ${
                                tx.status === 'completed' ? 'text-emerald-600' : 
                                tx.status === 'pending' ? 'text-amber-500' : 'text-blue-500'
                              }`}>
                                {tx.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={`text-xl font-black ${tx.type === 'earnings' ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {tx.type === 'earnings' ? '+' : ''}{tx.amount > 0 ? '$' : '-$'}{Math.abs(tx.amount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                  <button className="text-blue-600 font-bold text-sm hover:underline">View All Transactions</button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Linked Accounts & Settings */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6">Linked Accounts</h3>
              
              <div className="space-y-4">
                {/* Debit Card */}
                <div className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between group hover:border-blue-300 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Chase Debit</div>
                      <div className="text-xs text-slate-500">**** 1234 • Expires 09/28</div>
                    </div>
                  </div>
                  <div className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase px-2 py-1 rounded-md">
                    Instant
                  </div>
                </div>

                {/* Bank Account */}
                <div className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between group hover:border-blue-300 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Bank of America</div>
                      <div className="text-xs text-slate-500">Checking **** 5678</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>

                <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Payment Method</span>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-blue-900 mb-2">Secure Payments</h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                Your funds are held securely by our banking partners. Instant payouts are processed via Stripe and typically arrive in your account within 30 minutes.
              </p>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'tax' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10" />
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      <Home className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-600">YTD Housing Stipends</span>
                  </div>
                  <div className="text-4xl font-black text-slate-900">$12,450</div>
                  <div className="text-sm text-slate-500 mt-2 font-medium">Tax-free allowance collected</div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10" />
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-600">YTD M&IE Stipends</span>
                  </div>
                  <div className="text-4xl font-black text-slate-900">$4,820</div>
                  <div className="text-sm text-slate-500 mt-2 font-medium">Meals & Incidentals (Tax-free)</div>
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl -mr-10 -mt-10 opacity-50" />
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-indigo-300">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-300">Est. Tax Savings</span>
                  </div>
                  <div className="text-4xl font-black text-white">$4,145</div>
                  <div className="text-sm text-indigo-300 mt-2 font-medium">Compared to fully-taxed income</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Multi-State Compliance</h3>
                      <p className="text-slate-500 text-sm mt-1">Track days worked per state for tax filing.</p>
                    </div>
                    <button className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-100 transition-colors flex items-center space-x-2 border border-slate-200">
                      <FileText className="w-4 h-4" />
                      <span>Export Tax Report</span>
                    </button>
                  </div>
                  <div className="p-8">
                    <div className="space-y-6">
                      {/* State 1 */}
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            <span className="font-bold text-slate-900 text-lg">California</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-slate-900">84</span>
                            <span className="text-slate-500 text-sm ml-1">days</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div className="bg-blue-500 h-3 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Non-resident tax return required.</p>
                      </div>

                      {/* State 2 */}
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5 text-emerald-500" />
                            <span className="font-bold text-slate-900 text-lg">Texas (Home State)</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-slate-900">12</span>
                            <span className="text-slate-500 text-sm ml-1">days</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">No state income tax.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100">
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-amber-900 mb-2">Tax Home Status</h3>
                  <p className="text-sm text-amber-800 leading-relaxed mb-4">
                    To continue receiving tax-free stipends, you must maintain a valid &quot;tax home&quot;. Ensure you are duplicating living expenses.
                  </p>
                  <button className="text-amber-700 font-bold text-sm hover:underline flex items-center">
                    Learn about Tax Homes <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Cashout Modal */}
      <AnimatePresence>
        {showCashoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="p-8 text-center relative">
                <button 
                  onClick={() => setShowCashoutModal(false)}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-10 h-10 text-emerald-500 fill-current" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Instant Payout</h2>
                <p className="text-slate-500 mb-8">Transfer your available balance to your linked debit card instantly.</p>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 text-left">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500 font-medium">Available Balance</span>
                    <span className="font-bold text-slate-900">${availableBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500 font-medium">Instant Transfer Fee (1.5%)</span>
                    <span className="font-bold text-slate-900">-${(availableBalance * 0.015).toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-slate-200 w-full my-4" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">You&apos;ll Receive</span>
                    <span className="text-2xl font-black text-emerald-600">${(availableBalance - (availableBalance * 0.015)).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleInstantPayout}
                  disabled={cashingOut}
                  className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {cashingOut ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRightLeft className="w-5 h-5" />}
                  <span>{cashingOut ? 'Processing...' : 'Confirm Transfer'}</span>
                </button>
                <button 
                  onClick={() => setShowCashoutModal(false)}
                  className="w-full mt-4 text-slate-500 font-bold hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
