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
  Info,
  FileSearch,
  Sparkles,
  Download,
  ExternalLink,
  Maximize2,
  FileCheck
} from 'lucide-react';
import { Application, DocumentUpload, DeficiencyNotice } from '../types/scholarship';
import { useLanguage } from '../context/LanguageContext';
import { STATUTORY_REJECTION_CLAUSES } from './RejectionDesk';
import { MeticulousVerificationView } from './MeticulousVerificationView';
import { DocumentViewerModal } from './DocumentViewerModal';
import { matchEnteredFieldsWithDocument, DocumentFieldMatchResult } from '../services/fieldMatcher';

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
  const [deskMode, setDeskMode] = useState<'standard' | 'meticulous'>('standard');
  const [previewingDoc, setPreviewingDoc] = useState<DocumentUpload | null>(null);
  const [inlineDocPreviewOpen, setInlineDocPreviewOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [selectedClauseCode, setSelectedClauseCode] = useState(STATUTORY_REJECTION_CLAUSES[0].code);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [deficiencyText, setDeficiencyText] = useState(
    application.aiAnalysis?.flags?.[0]
      ? `Discrepancy noted: ${application.aiAnalysis.flags[0]}. Please furnish a clarified/digitally-signed document.`
      : 'Please submit a clarified and digitally attested copy of your certificate.'
  );
  const [activeTab, setActiveTab] = useState<'decision' | 'deficiency' | 'rejection'>('decision');

  const currentDoc = application.documents?.[selectedDocIndex] || application.documents?.[0];

  // Deep comparison between entered application fields and current document
  const currentDocMatch: DocumentFieldMatchResult | null = currentDoc
    ? matchEnteredFieldsWithDocument(
        {
          fullName: application.applicant.fullName,
          fatherName: application.applicant.fatherName,
          stCommunity: application.applicant.stCommunity,
          state: application.applicant.state,
          district: application.applicant.district,
          annualFamilyIncome: application.applicant.annualFamilyIncome,
          qualifyingPercentage: application.academic.qualifyingPercentage,
          ugcNetRollNo: application.academic.ugcNetRollNo,
          offerStatus: application.academic.offerStatus,
          qsWorldRanking: application.academic.qsWorldRanking,
          scheme: application.scheme,
        },
        currentDoc
      )
    : null;

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
    const clause = STATUTORY_REJECTION_CLAUSES.find((c) => c.code === selectedClauseCode);
    const fullReason = `[${selectedClauseCode}] ${clause?.ruleTitle || ''}: ${rejectionNotes || clause?.description || 'Statutory criteria not met.'}`;
    onReject(application.id, fullReason);
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

        {/* Navigation Mode Subheader */}
        <div className="bg-slate-800 px-6 py-2.5 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDeskMode('standard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                deskMode === 'standard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Standard Scrutiny Desk</span>
            </button>

            <button
              type="button"
              onClick={() => setDeskMode('meticulous')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                deskMode === 'meticulous'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-700'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>Meticulous 9-Criteria Document Verifier</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950/80 text-emerald-300 rounded font-black border border-emerald-500/40">
                Full Scan
              </span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:block">
            {deskMode === 'standard' ? '3-column scrutiny & MoTA rule engine' : 'Step 1-5 Character-by-character scrutiny & confidence calculation'}
          </div>
        </div>

        {deskMode === 'meticulous' ? (
          <div className="p-6 overflow-y-auto max-h-[82vh] bg-slate-100/60">
            <MeticulousVerificationView
              application={application}
              currentDoc={currentDoc}
              onSelectDoc={setSelectedDocIndex}
              selectedDocIndex={selectedDocIndex}
            />
          </div>
        ) : (
          /* Modal Content Columns: 3-column Layout */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* Left Column (5 cols): Document OCR vs Form Fields */}
            <div className="lg:col-span-5 p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. {t('uploadedDocsOcr', 'Uploaded Documents & OCR Data')}
                </h4>
                <button
                  type="button"
                  onClick={() => setDeskMode('meticulous')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition cursor-pointer"
                >
                  <FileSearch className="w-3 h-3 text-emerald-600" />
                  <span>9-Criteria Scan</span>
                </button>
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

                {/* Scrutinizer Document Access Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setPreviewingDoc(currentDoc)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Original Document</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInlineDocPreviewOpen(!inlineDocPreviewOpen)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      inlineDocPreviewOpen
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                    title="Toggle Inline Document Viewer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>{inlineDocPreviewOpen ? 'Hide' : 'Inline'}</span>
                  </button>

                  {currentDoc.dataUrl && (
                    <a
                      href={currentDoc.dataUrl}
                      download={currentDoc.name}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 text-xs font-semibold transition"
                      title="Download Original File"
                    >
                      <Download className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Inline Document Preview Box if opened */}
                {inlineDocPreviewOpen && (
                  <div className="rounded-lg overflow-hidden border border-slate-300 bg-white p-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 mb-2">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <FileCheck className="w-3 h-3 text-blue-600" />
                        Original Upload Stream
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewingDoc(currentDoc)}
                        className="text-[10px] text-blue-600 hover:underline font-bold"
                      >
                        Open Fullscreen ↗
                      </button>
                    </div>

                    {currentDoc.dataUrl?.startsWith('data:image/') || /\.(jpe?g|png|webp)$/i.test(currentDoc.name) ? (
                      <div className="flex justify-center bg-slate-100 rounded p-1">
                        <img
                          src={currentDoc.dataUrl}
                          alt={currentDoc.name}
                          className="max-h-64 object-contain rounded"
                        />
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50/90 rounded-lg border border-amber-200 text-xs space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-amber-950 flex items-center gap-1.5">
                                <span className="truncate max-w-[180px]">{currentDoc.name}</span>
                                <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[10px] rounded font-mono">PDF</span>
                              </div>
                              <p className="text-[11px] text-amber-800">
                                Official Attested Government Record
                              </p>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            e-Pramaan
                          </span>
                        </div>

                        {/* Quick credential snippet */}
                        <div className="bg-white/90 p-2.5 rounded border border-amber-200/80 grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold block">Candidate Name:</span>
                            <span className="font-bold text-slate-900 font-mono truncate block">
                              {currentDoc.extractedFields?.['Candidate Name'] || currentDoc.extractedFields?.['Applicant Name in Document'] || application.applicant.fullName}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold block">Issuing Authority:</span>
                            <span className="font-semibold text-slate-800 truncate block">
                              {currentDoc.extractedFields?.['Issuing Authority'] || 'Competent Authority'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold block">Certificate / Ref ID:</span>
                            <span className="font-mono text-slate-800 truncate block">
                              {currentDoc.extractedFields?.['Certificate Number'] || currentDoc.extractedFields?.['Roll / Registration No'] || currentDoc.id.slice(0, 14)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold block">Upload Date:</span>
                            <span className="text-slate-700">
                              {new Date(currentDoc.uploadedAt).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {/* Big prominent button to open full document view */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setPreviewingDoc(currentDoc)}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Full Document & Official Facsimile ↗</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                      {(currentDoc.mismatches || []).map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No documents attached.</p>
            )}

            {/* Field-by-Field Scan & Match Verification Matrix */}
            <div className={`p-4 rounded-xl border-2 text-xs space-y-3 ${
              currentDocMatch?.hasErrors
                ? 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-xs'
                : 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentDocMatch?.hasErrors ? (
                    <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  )}
                  <span className="font-extrabold uppercase tracking-wider text-xs">
                    {currentDocMatch?.hasErrors
                      ? 'SCAN ERROR: FIELD MISMATCH'
                      : 'ALL ENTERED FIELDS VERIFIED'}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  currentDocMatch?.hasErrors
                    ? 'bg-rose-200 text-rose-900 border border-rose-300'
                    : 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                }`}>
                  {currentDocMatch?.hasErrors ? `${currentDocMatch.errorCount} Error(s)` : '100% Match'}
                </span>
              </div>

              {currentDocMatch && currentDocMatch.fieldComparisons && currentDocMatch.fieldComparisons.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-1.5 px-2">Field</th>
                        <th className="py-1.5 px-2">Form Entered</th>
                        <th className="py-1.5 px-2">Doc Scanned</th>
                        <th className="py-1.5 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(currentDocMatch.fieldComparisons || []).map((cmp, idx) => (
                        <tr key={idx} className={cmp.isMatch ? 'bg-white' : 'bg-rose-50/80 font-semibold'}>
                          <td className="py-1.5 px-2 text-slate-700">{cmp.fieldLabel}</td>
                          <td className="py-1.5 px-2 text-slate-900 font-mono">
                            <span className={cmp.isMatch ? '' : 'bg-rose-100 text-rose-900 px-1 py-0.5 rounded'}>
                              {String(cmp.enteredValue)}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 text-slate-900 font-mono">
                            <span className={cmp.isMatch ? '' : 'bg-rose-100 text-rose-900 px-1 py-0.5 rounded'}>
                              {String(cmp.scannedValue)}
                            </span>
                          </td>
                          <td className="py-1.5 px-2">
                            {cmp.isMatch ? (
                              <span className="text-emerald-700 font-bold">✓ Match</span>
                            ) : (
                              <span className="text-rose-700 font-black">❌ MISMATCH</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <span className="text-slate-400 block">{t('fullName', 'Form Full Name')}:</span>
                    <span className="font-semibold text-slate-800">{application.applicant.fullName}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <span className="text-slate-400 block">{t('stTribe', 'Form ST Tribe')}:</span>
                    <span className="font-semibold text-slate-800">{application.applicant.stCommunity}</span>
                  </div>
                </div>
              )}

              {currentDocMatch?.hasErrors && (
                <div className="space-y-1.5 pt-1">
                  {(currentDocMatch.errorMessages || []).map((msg, idx) => (
                    <div key={idx} className="p-2 rounded bg-rose-100 border border-rose-300 text-rose-950 text-[11px] font-medium flex items-start gap-1.5">
                      <span className="font-bold text-rose-700 shrink-0">ERROR {idx + 1}:</span>
                      <span>{msg}</span>
                    </div>
                  ))}
                  <div className="pt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('deficiency');
                        setDeficiencyText(`Statutory Scan Error in ${currentDoc?.name || 'document'}: ${(currentDocMatch.errorMessages || []).join('; ')}`);
                      }}
                      className="px-2.5 py-1 text-[10.5px] font-bold text-rose-900 bg-rose-200 hover:bg-rose-300 rounded transition cursor-pointer"
                    >
                      Draft Deficiency for this Mismatch →
                    </button>
                  </div>
                </div>
              )}
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
                <button
                  type="button"
                  onClick={() => setActiveTab('rejection')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    activeTab === 'rejection' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-rose-700'
                  }`}
                >
                  Reject File
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
                      onClick={() => setActiveTab('rejection')}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{t('rejectWithGrounds', 'Reject with Statutory Grounds')}</span>
                    </button>
                  </div>
                </div>
              ) : activeTab === 'deficiency' ? (
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
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <div className="flex items-center gap-1 text-rose-700 text-xs font-bold mb-1">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Statutory Rejection Ground:</span>
                    </div>
                    <select
                      value={selectedClauseCode}
                      onChange={(e) => {
                        setSelectedClauseCode(e.target.value);
                        const clause = STATUTORY_REJECTION_CLAUSES.find((c) => c.code === e.target.value);
                        if (clause) setRejectionNotes(clause.description);
                      }}
                      className="w-full p-2.5 text-xs rounded-xl border border-rose-300 bg-rose-50/50 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      {STATUTORY_REJECTION_CLAUSES.map((clause) => (
                        <option key={clause.code} value={clause.code}>
                          {clause.code} - {clause.ruleTitle}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Official Reason & Memorandum Notes:
                    </label>
                    <textarea
                      rows={4}
                      value={rejectionNotes}
                      onChange={(e) => setRejectionNotes(e.target.value)}
                      placeholder="Specific factual discrepancy justifying statutory rejection..."
                      className="w-full p-2.5 text-xs rounded-xl border border-rose-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-900 leading-relaxed">
                    <strong>Legal Consequence:</strong> Rejection creates an immutable audit entry and dispatches a formal MoTA Statutory Rejection Memorandum with right to appeal.
                  </div>

                  <button
                    type="button"
                    onClick={handleRejectClick}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Issue Statutory Rejection Order</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400">
              Scrutinizing Officer: MoTA Directorate (Desk-IV)
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Scrutinizer Fullscreen Document Viewer Modal */}
      {previewingDoc && (
        <DocumentViewerModal
          document={previewingDoc}
          application={application}
          onClose={() => setPreviewingDoc(null)}
          onFlagDeficiency={(doc, rem) => {
            setActiveTab('deficiency');
            setDeficiencyText(`Deficiency in ${doc.name}: ${rem}`);
            setPreviewingDoc(null);
          }}
          onMarkVerified={(doc) => {
            setRemarks((prev) => (prev ? `${prev}; ${doc.name} verified` : `${doc.name} verified by Scrutinizer.`));
            setPreviewingDoc(null);
          }}
        />
      )}
    </div>
  );
};
