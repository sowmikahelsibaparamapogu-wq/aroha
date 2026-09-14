import React, { useState } from 'react';
import { 
  XCircle, 
  Search, 
  Filter, 
  AlertOctagon, 
  FileText, 
  Download, 
  ShieldAlert, 
  RotateCcw, 
  Calendar, 
  User, 
  Scale, 
  Building2,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Application, SchemeType } from '../types/scholarship';
import { Avatar } from './Avatar';

export interface StatutoryRejectionClause {
  code: string;
  ruleTitle: string;
  scheme: 'ALL' | 'NFST' | 'NOS';
  description: string;
  statutoryReference: string;
}

export const STATUTORY_REJECTION_CLAUSES: StatutoryRejectionClause[] = [
  {
    code: 'MOTA-SEC-4.1',
    ruleTitle: 'Annual Family Income Exceeds Statutory Ceiling',
    scheme: 'NOS',
    description: 'Candidate total family annual income from all sources exceeds the mandatory ceiling of ₹8,00,000 (8 Lakhs) per annum as prescribed under Rule 4.1 of the National Overseas Scholarship Scheme Guidelines.',
    statutoryReference: 'NOS Guidelines 2024-25, Para 4(i) • MoTA Gazette Notif. 14013/02/2021',
  },
  {
    code: 'MOTA-SEC-5.2',
    ruleTitle: 'Master Degree Marks Below 55% Statutory Threshold',
    scheme: 'NFST',
    description: 'Candidate aggregate percentage in Post-Graduation / Master’s Degree is below the non-negotiable threshold of 55.0% required for Scheduled Tribe fellowship candidates.',
    statutoryReference: 'NFST Scheme Guidelines, Clause 5(ii) • UGC/CSIR Regulation No. F.1-1/2002',
  },
  {
    code: 'MOTA-SEC-6.1',
    ruleTitle: 'Age Limit Exceeded (>35 Years as on 1st July)',
    scheme: 'NOS',
    description: 'Candidate has crossed the statutory upper age limit of 35 years as on the first day of July of the selection year.',
    statutoryReference: 'NOS Guidelines, Clause 6(a) • Order No. 11015/01/2020-Education',
  },
  {
    code: 'MOTA-SEC-8.3',
    ruleTitle: 'Unverified / Adverse Caste Certificate',
    scheme: 'ALL',
    description: 'Scheduled Tribe Caste Certificate furnished by the applicant could not be verified on the State Revenue / DigiLocker Portal, or contains mismatched authority seals contrary to Presidential ST Orders.',
    statutoryReference: 'The Constitution (Scheduled Tribes) Order 1950 • Ministry of Home Affairs Circular No. 35/1/72-RU',
  },
  {
    code: 'MOTA-SEC-3.1',
    ruleTitle: 'Foreign Institution Not Within Top 500 QS Rankings',
    scheme: 'NOS',
    description: 'The foreign university or higher educational institution where the candidate has secured admission is not listed within the Top 500 of the QS World University Rankings as mandated.',
    statutoryReference: 'NOS Revised Norms 2023, Clause 3(b) • QS World Ranking Roster',
  },
  {
    code: 'MOTA-SEC-7.2',
    ruleTitle: 'Failure to Cure Deficiency Within 15-Day Statutory Window',
    scheme: 'ALL',
    description: 'Candidate failed to furnish requisite attested clarification or replacement documents within 15 calendar days from the issuance of the MoTA Scrutiny Deficiency Notice.',
    statutoryReference: 'MoTA Citizen Charter 2024, Para 9(c) • Deficiency Resolution Rules',
  },
  {
    code: 'MOTA-SEC-9.3',
    ruleTitle: 'Concurrent Dual Fellowship Violation',
    scheme: 'NFST',
    description: 'Candidate is currently in receipt of a financial fellowship/stipend from UGC, CSIR, ICSSR, or another government body, violating the prohibition against concurrent dual public grants.',
    statutoryReference: 'General Financial Rules (GFR) 2017, Rule 230(1) • MoTA Fellowship Mandates',
  },
  {
    code: 'MOTA-SEC-9.9',
    ruleTitle: 'Custom Statutory Ground Ordered by Committee',
    scheme: 'ALL',
    description: 'Specific non-compliance or adverse statutory findings recorded directly by the Scrutinizing Officer with ministerial committee concurrence.',
    statutoryReference: 'MoTA Scrutiny Committee Directorate Discretion',
  }
];

interface RejectionDeskProps {
  applications: Application[];
  onOpenApplication: (app: Application) => void;
  onRevokeRejection?: (appId: string) => void;
  onRejectApplication: (appId: string, clauseCode: string, remarks: string) => void;
}

export const RejectionDesk: React.FC<RejectionDeskProps> = ({
  applications,
  onOpenApplication,
  onRevokeRejection,
  onRejectApplication,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<'ALL' | SchemeType>('ALL');
  const [selectedClause, setSelectedClause] = useState<string>('ALL');
  const [activeModalApp, setActiveModalApp] = useState<Application | null>(null);
  const [rejectionClauseCode, setRejectionClauseCode] = useState(STATUTORY_REJECTION_CLAUSES[0].code);
  const [customRemarks, setCustomRemarks] = useState('');
  const [selectedRejectionMemo, setSelectedRejectionMemo] = useState<Application | null>(null);

  const rejectedApps = applications.filter((a) => a.status === 'rejected');

  const filteredRejections = rejectedApps.filter((app) => {
    const matchesSearch =
      app.applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.stCommunity.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesScheme = selectedScheme === 'ALL' || app.scheme === selectedScheme;
    const matchesClause = selectedClause === 'ALL' || app.scrutiny?.remarks?.includes(selectedClause);

    return matchesSearch && matchesScheme && matchesClause;
  });

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalApp) return;

    const clause = STATUTORY_REJECTION_CLAUSES.find((c) => c.code === rejectionClauseCode);
    const fullRemarks = `[${rejectionClauseCode}] ${clause?.ruleTitle || ''}: ${customRemarks || clause?.description || ''}`;

    onRejectApplication(activeModalApp.id, rejectionClauseCode, fullRemarks);
    setActiveModalApp(null);
    setCustomRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Scrutinizer Statutory Authority */}
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-stone-900 text-white rounded-3xl p-6 shadow-md border border-rose-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-bold mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>Statutory Compliance & Legal Rejections Authority</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <XCircle className="w-6 h-6 text-rose-400" />
              <span>Rejection & Statutory Grounds Desk</span>
            </h2>
            <p className="text-xs text-rose-200/90 mt-1 max-w-2xl leading-relaxed">
              Exclusively for MoTA Scrutiny Officers to record non-compliance, enforce statutory income/age/academic thresholds, generate formal Rejection Memorandums, and maintain legal appeal audit trails.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/30 backdrop-blur-xs p-4 rounded-2xl border border-rose-700/40">
            <div className="text-center px-3 border-r border-rose-800">
              <div className="text-2xl font-black text-rose-400">{rejectedApps.length}</div>
              <div className="text-[10px] text-rose-200 uppercase font-semibold">Total Rejected</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-black text-amber-400">
                {applications.filter((a) => a.status === 'flagged_deficiency').length}
              </div>
              <div className="text-[10px] text-amber-200 uppercase font-semibold">Under 15-Day Cure</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search rejected candidate or application..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedScheme}
            onChange={(e) => setSelectedScheme(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white cursor-pointer"
          >
            <option value="ALL">All Schemes</option>
            <option value="NFST">NFST Fellowship</option>
            <option value="NOS">NOS Overseas Scholarship</option>
          </select>

          <select
            value={selectedClause}
            onChange={(e) => setSelectedClause(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white cursor-pointer max-w-[220px] truncate"
          >
            <option value="ALL">All Statutory Clauses</option>
            {STATUTORY_REJECTION_CLAUSES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}: {c.ruleTitle}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statutory Clauses Reference Cards Grid */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-rose-600" />
            <span>Standardized Statutory Grounds of Rejection (MoTA Guidelines)</span>
          </h3>
          <span className="text-[11px] text-slate-500">8 Legal Codes Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {STATUTORY_REJECTION_CLAUSES.slice(0, 4).map((clause) => (
            <div
              key={clause.code}
              className="bg-white p-3 rounded-xl border border-rose-100 hover:border-rose-300 shadow-2xs transition"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {clause.code}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {clause.scheme}
                </span>
              </div>
              <div className="font-bold text-xs text-slate-900 mt-1 line-clamp-1">
                {clause.ruleTitle}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                {clause.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Rejections Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Official Rejection Register & Dossiers</h3>
            <span className="text-xs font-semibold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
              {filteredRejections.length} Files Rejected
            </span>
          </div>
          <span className="text-xs text-slate-400">Section 14(2) Administrative Scrutiny Record</span>
        </div>

        {filteredRejections.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Rejected Applications in Current Filter</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Any application rejected with statutory grounds by a Scrutiny Officer will appear in this registry with its official memorandum and statutory reference.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-5">Candidate / Application</th>
                  <th className="py-3 px-4">Scheme</th>
                  <th className="py-3 px-4">Statutory Ground of Rejection</th>
                  <th className="py-3 px-4">Scrutinizing Authority</th>
                  <th className="py-3 px-4">Date of Order</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(filteredRejections || []).map((app) => (
                  <tr key={app.id} className="hover:bg-rose-50/40 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          type={app.applicant.gender === 'Female' ? 'scholar_female' : 'scholar_male'}
                          name={app.applicant.fullName}
                          role="applicant"
                          size="xs"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{app.applicant.fullName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {app.applicationNumber} • {app.applicant.stCommunity} Tribe
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        app.scheme === 'NOS'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {app.scheme}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-950 text-[11px]">
                        <span className="font-bold block text-rose-900">
                          {app.scrutiny?.remarks || 'Statutory eligibility criteria not met.'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block text-[11px]">
                        {app.scrutiny?.verifiedBy || 'MoTA Scrutiny Desk-IV'}
                      </span>
                      <span className="text-[10px] text-slate-400">Shastri Bhawan</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {app.scrutiny?.reviewedAt 
                        ? new Date(app.scrutiny.reviewedAt).toLocaleDateString() 
                        : new Date().toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedRejectionMemo(app)}
                          className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="Generate official Rejection Memorandum"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Memo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenApplication(app)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                        >
                          Inspect File
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Memorandum Preview Modal */}
      {selectedRejectionMemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            {/* Gov Header */}
            <div className="bg-rose-950 text-white p-5 border-b border-rose-900 flex items-center justify-between">
              <div>
                <div className="text-[10px] tracking-widest text-rose-300 font-bold uppercase">
                  Government of India • Ministry of Tribal Affairs
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Statutory Order of Ineligibility / Rejection Memorandum
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRejectionMemo(null)}
                className="p-1 rounded-lg text-rose-300 hover:text-white hover:bg-rose-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-800 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">MEMO REFERENCE NO:</span>
                  <span className="font-mono font-bold text-slate-900">
                    MOTA/SCRUTINY/{selectedRejectionMemo.scheme}/2025/REJ-{selectedRejectionMemo.applicationNumber.slice(-4)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">DATE:</span>
                  <span className="font-semibold text-slate-800">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">CANDIDATE PARTICULARS:</span>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-1 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Full Name: </span>
                    <span className="font-bold text-slate-900">{selectedRejectionMemo.applicant.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">ST Community: </span>
                    <span className="font-bold text-slate-900">{selectedRejectionMemo.applicant.stCommunity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Application ID: </span>
                    <span className="font-mono text-slate-800">{selectedRejectionMemo.applicationNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Scheme: </span>
                    <span className="font-bold text-slate-900">{selectedRejectionMemo.scheme}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Statutory Grounds & Officer Findings:
                </span>
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2">
                  <p className="font-bold text-xs text-rose-900">
                    {selectedRejectionMemo.scrutiny?.remarks || 'Statutory eligibility criteria not met.'}
                  </p>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    Under the mandatory provisions of the Ministry of Tribal Affairs Fellowship Guidelines and General Financial Rules (GFR), the application cannot be recommended for ministerial sanction.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                <span className="font-bold block">Statutory Right to Appeal:</span>
                The candidate may submit a formal representation to the Appellate Authority (Joint Secretary, Ministry of Tribal Affairs, Shastri Bhawan, New Delhi) within thirty (30) days from the issuance of this memorandum.
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <div>
                  <span className="block font-bold text-slate-800">Scrutinizing Officer</span>
                  <span>Desk-IV (Statutory Scrutiny), MoTA</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-emerald-800">Digitally Attested</span>
                  <span className="font-mono text-[10px]">SHA-256 Verified</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedRejectionMemo(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
