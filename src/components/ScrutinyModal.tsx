import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  Send, 
  RotateCcw, 
  XCircle, 
  SlidersHorizontal,
  Eye,
  Info
} from 'lucide-react';
import { Application, DocumentUpload, DeficiencyNotice } from '../types/scholarship';
import { useLanguage } from '../context/LanguageContext';

interface ScrutinyModalProps {
  application: Application | null;
  onClose: () => void;
  onApprove: (appId: string, remarks: string) => void;
  onIssueDeficiency: (appId: string, notice: DeficiencyNotice) => void;
  onReject: (appId: string, reason: string) => void;
}

export const ScrutinyModal: React.FC<ScrutinyModalProps> = ({
  application,
  onClose,
  onApprove,
  onIssueDeficiency,
  onReject,
}) => {
  const { t } = useLanguage();
  if (!application) return null;

  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [deficiencyText, setDeficiencyText] = useState(
    application.aiAnalysis?.flags?.[0]
      ? `Discrepancy noted: ${application.aiAnalysis.flags[0]}. Please furnish a clarified/digitally-signed document.`
      : 'Please submit a clarified and digitally attested copy of your certificate.'
  );
  const [activeTab, setActiveTab] = useState<'decision' | 'deficiency'>('decision');

  const currentDoc = application.documents?.[selectedDocIndex] || application.documents?.[0];

  const handleApproveClick = () => {
    onApprove(application.id, remarks || 'Verified against Digilocker & MoTA rule engine criteria.');
    onClose();
  };

  const handleDeficiencyClick = () => {
    const notice: DeficiencyNotice = {
      id: `def_${Date.now()}`,
      documentId: currentDoc?.id,
      field: currentDoc?.type || 'caste_certificate',
      title: `Deficiency in ${currentDoc ? currentDoc.name : 'Submitted Document'}`,
      description: deficiencyText,
      severity: 'critical',
      issuedAt: new Date().toISOString(),
      isResolved: false,
    };
    onIssueDeficiency(application.id, notice);
    onClose();
  };

  const handleRejectClick = () => {
    onReject(application.id, remarks || 'Statutory eligibility criteria not met.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs">
              MoTA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{t('scrutinyDeskTitle', 'Scrutiny & Document Verification Desk')}</h3>
                <span className="bg-blue-900 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-700">
                  {application.scheme} {t('scheme', 'Scheme')}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t('applicationNumber', 'Application')}: <span className="font-mono text-slate-300">{application.applicationNumber}</span> • {t('candidateTribeHeader', 'Candidate')}: <span className="text-white font-semibold">{application.applicant.fullName}</span> ({application.applicant.stCommunity} {t('tribe', 'Tribe')})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Columns: 3-column Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left Column (5 cols): Document OCR vs Form Fields */}
          <div className="lg:col-span-5 p-5 space-y-4 overflow-y-auto max-h-[75vh]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                1. {t('uploadedDocsOcr', 'Uploaded Documents & OCR Data')}
              </h4>
              <span className="text-[11px] text-slate-400">
                {application.documents?.length || 0} {t('files', 'Files')}
              </span>
            </div>

            {/* Document Selector Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {application.documents?.map((doc, idx) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedDocIndex(idx)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition whitespace-nowrap cursor-pointer ${
                    selectedDocIndex === idx
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {doc.name.slice(0, 18)}...
                </button>
              ))}
            </div>

            {/* Document Details & OCR Card */}
            {currentDoc ? (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                      {currentDoc.name}
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    currentDoc.ocrConfidence >= 85
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-orange-50 text-orange-700 border-orange-200'
                  }`}>
                    OCR: {currentDoc.ocrConfidence}%
                  </span>
                </div>

                {/* Extracted Fields Table */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {t('extractedOcrEntities', 'Extracted OCR Entities:')}
                  </span>
                  <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-2 text-[11px]">
                    {Object.entries(currentDoc.extractedFields || {}).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-start gap-2 border-b border-slate-100 pb-1 last:border-0 last:pb-0">
                        <span className="text-slate-400 font-medium">{k}:</span>
                        <span className="text-slate-900 font-semibold text-right">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mismatch Alert if Present */}
                {currentDoc.mismatches && currentDoc.mismatches.length > 0 && (
                  <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-950">
                    <div className="font-bold flex items-center gap-1.5 text-orange-700 mb-1">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span>{t('aiDetectedDiscrepancy', 'AI Detected Discrepancy:')}</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-orange-900">
                      {currentDoc.mismatches.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No documents attached.</p>
            )}

            {/* Cross-Check Comparison Box */}
            <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs space-y-2">
              <span className="font-bold text-blue-950 block">{t('crossReference', 'Application Form Cross-Reference:')}</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded border border-blue-100">
                  <span className="text-slate-400 block">{t('fullName', 'Form Full Name')}:</span>
                  <span className="font-semibold text-slate-800">{application.applicant.fullName}</span>
                </div>
                <div className="bg-white p-2 rounded border border-blue-100">
                  <span className="text-slate-400 block">{t('stTribe', 'Form ST Tribe')}:</span>
                  <span className="font-semibold text-slate-800">{application.applicant.stCommunity}</span>
                </div>
                <div className="bg-white p-2 rounded border border-blue-100">
                  <span className="text-slate-400 block">{t('qualifyingMarks', 'Qualifying Marks')}:</span>
                  <span className="font-semibold text-slate-800">{application.academic.qualifyingPercentage}%</span>
                </div>
                <div className="bg-white p-2 rounded border border-blue-100">
                  <span className="text-slate-400 block">{t('annualFamilyIncome', 'Reported Income')}:</span>
                  <span className="font-semibold text-slate-800">₹{application.applicant.annualFamilyIncome.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column (4 cols): Rule Engine Checks Breakdown */}
          <div className="lg:col-span-4 p-5 space-y-4 overflow-y-auto max-h-[75vh]">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. {t('motaRuleVerification', 'MoTA Rule Engine Verification')}
            </h4>

            <div className="space-y-2.5 text-xs">
              {/* Check 1: ST Category */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{t('stTribeValidation', 'ST Tribe Validation')}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Community "{application.applicant.stCommunity}" matched against Constitutional Order (Scheduled Tribes List 1950).
                </p>
              </div>

              {/* Check 2: Academic Cutoff */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{t('academicMarksMin', 'Academic Minimum Marks')}</span>
                  {application.academic.qualifyingPercentage >= 55 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Candidate scored {application.academic.qualifyingPercentage}% (Cutoff: 55.0% for ST).
                </p>
              </div>

              {/* Check 3: Scheme Specifics */}
              {application.scheme === 'NOS' ? (
                <>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{t('incomeCeilingRule', 'NOS Family Income Ceiling')}</span>
                      {application.applicant.annualFamilyIncome <= 800000 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Reported: ₹{application.applicant.annualFamilyIncome.toLocaleString('en-IN')} (Ceiling: ₹8,00,000).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{t('qsRankRule', 'QS World Ranking Tier')}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      University QS Rank: #{application.academic.qsWorldRanking || 15} (Top 500 mandatory).
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{t('ugcNetRule', 'UGC-NET / JRF Validity')}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    NTA Score: {application.academic.ugcNetScore || 94.5} Percentile.
                  </p>
                </div>
              )}

              {/* Merit Score Card */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-blue-950">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{t('computedMeritScore', 'Computed Merit Score')}</span>
                  <span className="text-lg font-extrabold text-blue-700">
                    {application.aiAnalysis?.meritScore || 90}/100
                  </span>
                </div>
                <p className="text-[11px] text-blue-800 mt-1">
                  Weighted score calculated using {application.scheme} official formula.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (3 cols): Officer Actions Panel */}
          <div className="lg:col-span-3 p-5 space-y-4 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="flex p-1 bg-slate-200 rounded-xl mb-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('decision')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    activeTab === 'decision' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  {t('decisionTab', 'Decision')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('deficiency')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    activeTab === 'deficiency' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  {t('deficiencyTab', 'Deficiency')}
                </button>
              </div>

              {activeTab === 'decision' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('officerRemarks', 'Scrutiny Officer Remarks:')}
                    </label>
                    <textarea
                      rows={4}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter verification notes for committee record..."
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={handleApproveClick}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('approveAndMove', 'Approve & Move to Merit Pool')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('deficiency')}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>{t('issueDeficiencyNotice', 'Issue Deficiency Notice')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRejectClick}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{t('rejectWithGrounds', 'Reject with Grounds')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('deficiencyNoticeLabel', 'Applicant-Facing Deficiency Notice:')}
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">
                      {t('deficiencyNoticeDesc', "This text will appear immediately on the candidate's dashboard and trigger an SMS/Email alert.")}
                    </p>
                    <textarea
                      rows={5}
                      value={deficiencyText}
                      onChange={(e) => setDeficiencyText(e.target.value)}
                      placeholder="State clearly what is missing or deficient..."
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleDeficiencyClick}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t('dispatchDeficiency', 'Dispatch Deficiency Notice')}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400">
              Scrutinizing Officer: MoTA Directorate (Desk-IV)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
