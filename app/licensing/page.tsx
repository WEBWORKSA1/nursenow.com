'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  ShieldCheck, 
  Globe, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Info, 
  ExternalLink,
  MapPin,
  Building2,
  Scale,
  Clock,
  DollarSign,
  Users,
  ArrowRight
} from 'lucide-react';

interface StateBoard {
  state: string;
  abbreviation: string;
  website: string;
  compact: boolean;
  renewalPeriod: string;
  ceuRequired: string;
  initialFee: string;
  backgroundCheck: boolean;
}

const usStateBoards: StateBoard[] = [
  { state: 'Alabama', abbreviation: 'AL', website: 'https://www.abn.alabama.gov', compact: true, renewalPeriod: '2 Years', ceuRequired: '24 Hours', initialFee: '$100', backgroundCheck: true },
  { state: 'Alaska', abbreviation: 'AK', website: 'https://www.commerce.alaska.gov/web/cbpl/ProfessionalLicensing/BoardofNursing.aspx', compact: false, renewalPeriod: '2 Years', ceuRequired: '30 Hours', initialFee: '$300', backgroundCheck: true },
  { state: 'Arizona', abbreviation: 'AZ', website: 'https://www.azbn.gov', compact: true, renewalPeriod: '4 Years', ceuRequired: 'None', initialFee: '$150', backgroundCheck: true },
  { state: 'Arkansas', abbreviation: 'AR', website: 'https://www.arsbn.org', compact: true, renewalPeriod: '2 Years', ceuRequired: '15 Hours', initialFee: '$100', backgroundCheck: true },
  { state: 'California', abbreviation: 'CA', website: 'https://www.rn.ca.gov', compact: false, renewalPeriod: '2 Years', ceuRequired: '30 Hours', initialFee: '$350', backgroundCheck: true },
  { state: 'Colorado', abbreviation: 'CO', website: 'https://dpo.colorado.gov/Nursing', compact: true, renewalPeriod: '2 Years', ceuRequired: 'None', initialFee: '$100', backgroundCheck: true },
  { state: 'Connecticut', abbreviation: 'CT', website: 'https://portal.ct.gov/DPH/Public-Health-Hearing-Office/Board-of-Examiners-for-Nursing/Board-of-Examiners-for-Nursing', compact: false, renewalPeriod: '1 Year', ceuRequired: 'None', initialFee: '$180', backgroundCheck: false },
  { state: 'Delaware', abbreviation: 'DE', website: 'https://dpr.delaware.gov/boards/nursing/', compact: true, renewalPeriod: '2 Years', ceuRequired: '30 Hours', initialFee: '$170', backgroundCheck: true },
  { state: 'Florida', abbreviation: 'FL', website: 'https://floridasnursing.gov', compact: true, renewalPeriod: '2 Years', ceuRequired: '24 Hours', initialFee: '$110', backgroundCheck: true },
  { state: 'Georgia', abbreviation: 'GA', website: 'https://sos.ga.gov/georgia-board-nursing', compact: true, renewalPeriod: '2 Years', ceuRequired: '30 Hours', initialFee: '$40', backgroundCheck: true },
  { state: 'Hawaii', abbreviation: 'HI', website: 'https://cca.hawaii.gov/pvl/boards/nursing/', compact: false, renewalPeriod: '2 Years', ceuRequired: '30 Hours', initialFee: '$200', backgroundCheck: true },
  { state: 'Idaho', abbreviation: 'ID', website: 'https://ibn.idaho.gov', compact: true, renewalPeriod: '2 Years', ceuRequired: 'None', initialFee: '$90', backgroundCheck: true },
  { state: 'Illinois', abbreviation: 'IL', website: 'https://idfpr.illinois.gov/profs/Nursing.asp', compact: false, renewalPeriod: '2 Years', ceuRequired: '20 Hours', initialFee: '$50', backgroundCheck: true },
  { state: 'Indiana', abbreviation: 'IN', website: 'https://www.in.gov/pla/professions/nursing-home/', compact: true, renewalPeriod: '2 Years', ceuRequired: 'None', initialFee: '$50', backgroundCheck: true },
  { state: 'Iowa', abbreviation: 'IA', website: 'https://nursing.iowa.gov', compact: true, renewalPeriod: '3 Years', ceuRequired: '36 Hours', initialFee: '$143', backgroundCheck: true },
  { state: 'Kansas', abbreviation: 'KS', website: 'https://ksbn.kansas.gov', compact: true, renewalPeriod: '2 Years', ceuRequired: '30 Hours', initialFee: '$75', backgroundCheck: true },
  { state: 'Kentucky', abbreviation: 'KY', website: 'https://kbn.ky.gov', compact: true, renewalPeriod: '1 Year', ceuRequired: '14 Hours', initialFee: '$125', backgroundCheck: true },
  { state: 'Louisiana', abbreviation: 'LA', website: 'https://www.lsbn.state.la.us', compact: true, renewalPeriod: '2 Years', ceuRequired: '30 Hours', initialFee: '$100', backgroundCheck: true },
  { state: 'Maine', abbreviation: 'ME', website: 'https://www.maine.gov/boardofnursing/', compact: true, renewalPeriod: '2 Years', ceuRequired: 'None', initialFee: '$75', backgroundCheck: true },
  { state: 'Maryland', abbreviation: 'MD', website: 'https://mbon.maryland.gov', compact: true, renewalPeriod: '2 Years', ceuRequired: 'None', initialFee: '$100', backgroundCheck: true },
  { state: 'Massachusetts', abbreviation: 'MA', website: 'https://www.mass.gov/orgs/board-of-registration-in-nursing', compact: false, renewalPeriod: '2 Years', ceuRequired: '15 Hours', initialFee: '$230', backgroundCheck: true },
  { state: 'Michigan', abbreviation: 'MI', website: 'https://www.michigan.gov/lara/bureau-list/bpl/occ/prof/nursing', compact: false, renewalPeriod: '2 Years', ceuRequired: '25 Hours', initialFee: '$200', backgroundCheck: true },
  { state: 'Minnesota', abbreviation: 'MN', website: 'https://mn.gov/boards/nursing/', compact: false, renewalPeriod: '2 Years', ceuRequired: '24 Hours', initialFee: '$115', backgroundCheck: true },
  { state: 'Mississippi', abbreviation: 'MS', website: 'https://www.msbn.ms.gov', compact: true, renewalPeriod: '2 Years', ceuRequired: 'None', initialFee: '$100', backgroundCheck: true },
  { state: 'Missouri', abbreviation: 'MO', website: 'https://pr.mo.gov/nursing.asp', compact: true, renewalPeriod: '2 Years', ceuRequired: 'None', initialFee: '$45', backgroundCheck: true },
  { state: 'Montana', abbreviation: 'MT', website: 'https://boards.bsd.dli.mt.gov/nursing/', compact: true, renewalPeriod: '2 Years', ceuRequired: 'None', initialFee: '$100', backgroundCheck: true },
  { state: 'Nebraska', abbreviation: 'NE', website: 'https://dhhs.ne.gov/licensure/Pages/Nurse-Licensing.aspx', compact: true, renewalPeriod: '2 Years', ceuRequired: '20 Hours', initialFee: '$123', backgroundCheck: true },
  { state: 'Nevada', abbreviation: 'NV', website: 'https://nevadanursingboard.org', compact: false, renewalPeriod: '2 Years', ceuRequired: '30 Hours', initialFee: '$100', backgroundCheck: true },
  { state: 'New Hampshire', abbreviation: 'NH', website: 'https://www.oplc.nh.gov/board-nursing', compact: true, renewalPeriod: '2 Years', ceuRequired: '30 Hours', initialFee: '$120', backgroundCheck: true },
  { state: 'New Jersey', abbreviation: 'NJ', website: 'https://www.njconsumeraffairs.gov/nur', compact: true, renewalPeriod: '2 Years', ceuRequired: '30 Hours', initialFee: '$200', backgroundCheck: true },
  { state: 'New Mexico', abbreviation: 'NM', website: 'https://nmbon.sks.com', compact: true, renewalPeriod: '2 Years', ceuRequired: '30 Hours', initialFee: '$110', backgroundCheck: true },
  { state: 'New York', abbreviation: 'NY', website: 'https://www.op.nysed.gov/professions/registered-professional-nursing', compact: false, renewalPeriod: '3 Years', ceuRequired: 'None', initialFee: '$143', backgroundCheck: false },
  { state: 'North Carolina', abbreviation: 'NC', website: 'https://www.ncbon.com', compact: true, renewalPeriod: '2 Years', ceuRequired: '30 Hours', initialFee: '$75', backgroundCheck: true },
  { state: 'North Dakota', abbreviation: 'ND', website: 'https://www.ndbon.org', compact: true, renewalPeriod: '2 Years', ceuRequired: '12 Hours', initialFee: '$130', backgroundCheck: true },
  { state: 'Ohio', abbreviation: 'OH', website: 'https://nursing.ohio.gov', compact: true, renewalPeriod: '2 Years', ceuRequired: '24 Hours', initialFee: '$75', backgroundCheck: true },
  { state: 'Oklahoma', abbreviation: 'OK', website: 'https://nursing.ok.gov', compact: true, renewalPeriod: '2 Years', ceuRequired: 'None', initialFee: '$85', backgroundCheck: true },
  { state: 'Oregon', abbreviation: 'OR', website: 'https://www.oregon.gov/osbn/Pages/index.aspx', compact: false, renewalPeriod: '2 Years', ceuRequired: 'None', initialFee: '$160', backgroundCheck: true },
  { state: 'Pennsylvania', abbreviation: 'PA', website: 'https://www.dos.pa.gov/ProfessionalLicensing/BoardsCommissions/Nursing/Pages/default.aspx', compact: true, renewalPeriod: '2 Years', ceuRequired: '30 Hours', initialFee: '$100', backgroundCheck: true },
  { state: 'Rhode Island', abbreviation: 'RI', website: 'https://health.ri.gov/licenses/detail.php?id=231', compact: true, renewalPeriod: '2 Years', ceuRequired: 'None', initialFee: '$135', backgroundCheck: true },
  { state: 'South Carolina', abbreviation: 'SC', website: 'https://llr.sc.gov/nurse/', compact: true, renewalPeriod: '2 Years', ceuRequired: '30 Hours', initialFee: '$100', backgroundCheck: true },
  { state: 'South Dakota', abbreviation: 'SD', website: 'https://doh.sd.gov/boards/nursing/', compact: true, renewalPeriod: '2 Years', ceuRequired: 'None', initialFee: '$100', backgroundCheck: true },
  { state: 'Tennessee', abbreviation: 'TN', website: 'https://www.tn.gov/health/health-program-areas/health-professional-boards/nursing-board.html', compact: true, renewalPeriod: '2 Years', ceuRequired: '5 Hours', initialFee: '$100', backgroundCheck: true },
  { state: 'Texas', abbreviation: 'TX', website: 'https://www.bon.texas.gov', compact: true, renewalPeriod: '2 Years', ceuRequired: '20 Hours', initialFee: '$75', backgroundCheck: true },
  { state: 'Utah', abbreviation: 'UT', website: 'https://dopl.utah.gov/nursing/', compact: true, renewalPeriod: '2 Years', ceuRequired: 'None', initialFee: '$100', backgroundCheck: true },
  { state: 'Vermont', abbreviation: 'VT', website: 'https://sos.vermont.gov/nursing/', compact: true, renewalPeriod: '2 Years', ceuRequired: 'None', initialFee: '$75', backgroundCheck: true },
  { state: 'Virginia', abbreviation: 'VA', website: 'https://www.dhp.virginia.gov/Boards/Nursing/', compact: true, renewalPeriod: '2 Years', ceuRequired: 'None', initialFee: '$190', backgroundCheck: true },
  { state: 'Washington', abbreviation: 'WA', website: 'https://nursing.wa.gov', compact: true, renewalPeriod: '1 Year', ceuRequired: '8 Hours', initialFee: '$135', backgroundCheck: true },
  { state: 'West Virginia', abbreviation: 'WV', website: 'https://wvrnboard.wv.gov', compact: true, renewalPeriod: '2 Years', ceuRequired: '12 Hours', initialFee: '$100', backgroundCheck: true },
  { state: 'Wisconsin', abbreviation: 'WI', website: 'https://dsps.wi.gov/Pages/Professions/RN/Default.aspx', compact: true, renewalPeriod: '2 Years', ceuRequired: 'None', initialFee: '$73', backgroundCheck: true },
  { state: 'Wyoming', abbreviation: 'WY', website: 'https://nursing-online.state.wy.us', compact: true, renewalPeriod: '2 Years', ceuRequired: 'None', initialFee: '$130', backgroundCheck: true },
];

const canadianProvinces = [
  { name: 'Ontario', authority: 'College of Nurses of Ontario (CNO)', website: 'https://www.cno.org' },
  { name: 'British Columbia', authority: 'British Columbia College of Nurses and Midwives (BCCNM)', website: 'https://www.bccnm.ca' },
  { name: 'Alberta', authority: 'College of Registered Nurses of Alberta (CRNA)', website: 'https://www.nurses.ab.ca' },
  { name: 'Quebec', authority: 'Ordre des infirmières et infirmiers du Québec (OIIQ)', website: 'https://www.oiiq.org' },
  { name: 'Manitoba', authority: 'College of Registered Nurses of Manitoba (CRNM)', website: 'https://www.crnm.mb.ca' },
  { name: 'Saskatchewan', authority: 'College of Registered Nurses of Saskatchewan (CRNS)', website: 'https://www.crns.ca' },
  { name: 'Nova Scotia', authority: 'Nova Scotia College of Nursing (NSCN)', website: 'https://www.nscn.ca' },
  { name: 'New Brunswick', authority: 'Nurses Association of New Brunswick (NANB)', website: 'https://www.nanb.nb.ca' },
  { name: 'Newfoundland and Labrador', authority: 'College of Registered Nurses of Newfoundland and Labrador (CRNNL)', website: 'https://crnnl.ca' },
  { name: 'Prince Edward Island', authority: 'College of Registered Nurses of Prince Edward Island (CRNPEI)', website: 'https://www.crnpei.ca' },
];

const associations = [
  { name: 'American Nurses Association (ANA)', website: 'https://www.nursingworld.org' },
  { name: 'National Council of State Boards of Nursing (NCSBN)', website: 'https://www.ncsbn.org' },
  { name: 'International Council of Nurses (ICN)', website: 'https://www.icn.ch' },
  { name: 'Canadian Nurses Association (CNA)', website: 'https://www.cna-aiic.ca' },
  { name: 'American Association of Critical-Care Nurses (AACN)', website: 'https://www.aacn.org' },
  { name: 'Emergency Nurses Association (ENA)', website: 'https://www.ena.org' },
];

export default function LicensingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompact, setFilterCompact] = useState<'all' | 'compact' | 'non-compact'>('all');

  const filteredStates = usStateBoards.filter(s => {
    const matchesSearch = s.state.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.abbreviation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompact = filterCompact === 'all' || 
                          (filterCompact === 'compact' && s.compact) || 
                          (filterCompact === 'non-compact' && !s.compact);
    return matchesSearch && matchesCompact;
  });

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-6"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700">Licensing & Authorities</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-display font-bold text-slate-900 leading-tight"
          >
            Nursing Boards <span className="text-blue-600">& Associations</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-slate-600 text-lg leading-relaxed"
          >
            A comprehensive directory of nursing regulatory bodies, professional associations, and licensing requirements across the US and Canada.
          </motion.p>
        </div>

        {/* US State Boards Section */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h2 className="text-3xl font-bold text-slate-900 flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <span>US State Boards of Nursing</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search state..."
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm appearance-none"
                value={filterCompact}
                onChange={(e) => setFilterCompact(e.target.value as any)}
              >
                <option value="all">All States</option>
                <option value="compact">NLC Compact Only</option>
                <option value="non-compact">Non-Compact Only</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">State</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-center">Compact (NLC)</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Renewal</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">CEU Requirements</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Initial Fee</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStates.map((s) => (
                    <tr key={s.abbreviation} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{s.state}</div>
                        <div className="text-xs text-slate-400 font-medium">{s.abbreviation}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {s.compact ? (
                          <div className="inline-flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Yes</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-black uppercase">
                            <XCircle className="w-3 h-3" />
                            <span>No</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4 text-slate-300" />
                          <span>{s.renewalPeriod}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <FileText className="w-4 h-4 text-slate-300" />
                          <span>{s.ceuRequired}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-sm font-bold text-slate-700">
                          <DollarSign className="w-4 h-4 text-slate-300" />
                          <span>{s.initialFee}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={s.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all inline-flex"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Canadian Provinces */}
          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center space-x-3">
              <Globe className="w-8 h-8 text-blue-600" />
              <span>Canadian Authorities</span>
            </h2>
            <div className="space-y-4">
              {canadianProvinces.map((p) => (
                <div key={p.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                  <div>
                    <h3 className="font-bold text-slate-900">{p.name}</h3>
                    <p className="text-sm text-slate-500">{p.authority}</p>
                  </div>
                  <a
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white rounded-xl transition-all"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Professional Associations */}
          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <span>Key Associations</span>
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {associations.map((a) => (
                <div key={a.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900">{a.name}</h3>
                  </div>
                  <a
                    href={a.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white rounded-xl transition-all"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              ))}
            </div>

            {/* Info Box */}
            <div className="mt-12 bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <Info className="w-6 h-6 text-blue-200" />
                  <h3 className="text-xl font-bold">What is the NLC?</h3>
                </div>
                <p className="text-blue-100 text-sm leading-relaxed mb-6">
                  The Nurse Licensure Compact (NLC) allows a nurse to have one multistate license, with the ability to practice in all home state and other compact states.
                </p>
                <a
                  href="https://www.ncsbn.org/nurse-licensure-compact.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                >
                  <span>Learn about NLC</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
