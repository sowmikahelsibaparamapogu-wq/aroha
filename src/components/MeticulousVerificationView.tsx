import React, { useState } from 'react';
import {
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Calculator,
  ShieldAlert,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Scale,
  Eye,
  Database,
  Search,
  Filter,
  ArrowRight,
  RotateCcw,
  X
} from 'lucide-react';
import { Application, DocumentUpload } from '../types/scholarship';
import {
  executeMeticulousVerification,
  VerificationReport,
  MasterRecord,
  MASTER_REGISTRY_DATA
} from '../services/meticulousVerifier';
import { DocumentViewerModal } from './DocumentViewerModal';

interface MeticulousVerificationViewProps {
  application: Application;
  currentDoc?: DocumentUpload;
  onSelectDoc?: (index: number) => void;
  selectedDocIndex?: number;
}

export const MeticulousVerificationView: React.FC<MeticulousVerificationViewProps> = ({
  application,
  currentDoc,
  onSelectDoc,
  selectedDocIndex = 0,
}) => {
  const activeDoc = currentDoc || application.documents[selectedDocIndex] || application.documents[0];
  const [selectedMasterRecord, setSelectedMasterRecord] = useState<MasterRecord | undefined>(undefined);
  
  const [report, setReport] = useState<VerificationReport>(() =>
    executeMeticulousVerification(application, activeDoc, selectedMasterRecord)
  );
  
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showJsonRaw, setShowJsonRaw] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [scenarioFilter, setScenarioFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const runVerification = (master?: MasterRecord) => {
    setIsScanning(true);
    setTimeout(() => {
      setReport(executeMeticulousVerification(application, activeDoc, master));
      setIsScanning(false);
    }, 400);
  };

  const handleScanAgain = () => {
    runVerification(selectedMasterRecord);
  };

  const handleSelectMasterRecord = (rec: MasterRecord) => {
    setSelectedMasterRecord(rec);
    runVerification(rec);
    setShowMasterModal(false);
  };

  const handleResetMasterRecord = () => {
    setSelectedMasterRecord(undefined);
    runVerification(undefined);
  };

  const handleCopyJson = () => {
    const jsonOutput = {
      pages_or_sections_read: report.pages_or_sections_read,
      read_issues: report.read_issues,
      category_scores: report.category_scores,
      overall_confidence: report.overall_confidence,
      confidence_calculation: report.confidence_calculation,
      red_flags_triggered: report.red_flags_triggered,
      recommendation: report.recommendation,
      summary: report.summary,
    };
    navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const jsonPayload = {
    pages_or_sections_read: report.pages_or_sections_read,
    read_issues: report.read_issues,
    category_scores: report.category_scores,
    overall_confidence: report.overall_confidence,
    confidence_calculation: report.confidence_calculation,
    red_flags_triggered: report.red_flags_triggered,
    recommendation: report.recommendation,
    summary: report.summary,
  };

  // Filter 100 master records
  const filteredRecords = MASTER_REGISTRY_DATA.filter(r => {
    const matchesScenario = scenarioFilter === 'all' || r.test_scenario === scenarioFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q ||
      r.full_name.toLowerCase().includes(q) ||
      r.fathers_name.toLowerCase().includes(q) ||
      r.unique_id_number.includes(q) ||
      r.category_certificate_number.toLowerCase().includes(q) ||
      r.bank_account_number.includes(q) ||
      r.domicile_state.toLowerCase().includes(q);
    return matchesScenario && matchesQuery;
  });

  return (
    <div className="space-y-4 text-slate-800">
      {/* Header bar with controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900 text-white rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <FileSearch className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold tracking-tight">Meticulous 9-Criteria Document Verifier</h4>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                MoTA Protocol
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Character-by-character section scrutiny • Strict deduction matrix • Weighted confidence score
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Master DB Trigger Button */}
          <button
            type="button"
            onClick={() => setShowMasterModal(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs border ${
              selectedMasterRecord
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Inspect 100-Record Statutory Master Reference Database"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Master Registry (100 Records)</span>
            {selectedMasterRecord && (
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowViewer(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
            title="Inspect Original Document File"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Inspect File</span>
          </button>

          <button
            type="button"
            onClick={handleScanAgain}
            disabled={isScanning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Reading Character-by-Character...' : 'Re-Scan Document'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'JSON Copied' : 'Copy JSON'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowJsonRaw(!showJsonRaw)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-semibold cursor-pointer"
          >
            {showJsonRaw ? 'Visual View' : '{ } Raw JSON'}
          </button>
        </div>
      </div>

      {/* Override Master Record Active Banner */}
      {selectedMasterRecord && (
        <div className="flex items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold">Active Master Cross-Validation:</span>{' '}
              Record #{selectedMasterRecord.record_id} —{' '}
              <strong className="text-amber-900">{selectedMasterRecord.full_name}</strong>{' '}
              (UID: {selectedMasterRecord.unique_id_number}, Cert: {selectedMasterRecord.category_certificate_number}, Scenario:{' '}
              <span className="px-1.5 py-0.5 rounded bg-amber-200 font-mono font-bold text-[10px]">
                {selectedMasterRecord.test_scenario}
              </span>)
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetMasterRecord}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-amber-900 font-bold text-[11px] transition cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Master Record</span>
          </button>
        </div>
      )}

      {/* Target Document Switcher if application has multiple */}
      {application.documents.length > 1 && onSelectDoc && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Select Document:
          </span>
          {application.documents.map((d, idx) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                onSelectDoc(idx);
                setReport(executeMeticulousVerification(application, d, selectedMasterRecord));
              }}
              className={`px-3 py-1.5 rounded-xl border font-bold whitespace-nowrap transition cursor-pointer text-xs ${
                idx === selectedDocIndex
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      )}

      {/* RAW JSON VIEW */}
      {showJsonRaw ? (
        <div className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-[600px] border border-slate-800">
          <pre>{JSON.stringify(jsonPayload, null, 2)}</pre>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Executive Recommendation Banner */}
          <div className={`p-4 rounded-2xl border ${
            report.recommendation === 'Approve'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : report.recommendation === 'Manual review'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    report.recommendation === 'Approve'
                      ? 'bg-emerald-200 text-emerald-900'
                      : report.recommendation === 'Manual review'
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-rose-200 text-rose-900'
                  }`}>
                    Recommendation: {report.recommendation}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    Target: <strong className="text-slate-900">{report.document_name}</strong>
                  </span>
                  {report.matched_master_record && (
                    <span className="text-[10.5px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      Matched Master ID #{report.matched_master_record.record_id}
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-slate-700">
                  {report.summary}
                </p>
              </div>

              {/* Confidence Score Pill */}
              <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-xs text-center shrink-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Confidence</div>
                <div className={`text-2xl font-black ${
                  report.overall_confidence >= 85
                    ? 'text-emerald-700'
                    : report.overall_confidence >= 60
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}>
                  {report.overall_confidence}%
                </div>
              </div>
            </div>

            {/* Red Flags if any */}
            {report.red_flags_triggered.length > 0 && (
              <div className="mt-3 pt-3 border-t border-rose-200/80">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs mb-1">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Red-Flag Indicators Triggered (Category 9 capped at 30/100):</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-xs text-rose-900 font-medium">
                  {report.red_flags_triggered.map((rf, i) => (
                    <li key={i}>{rf}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* STEP 1: Mandatory Full Read Log */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                  1
                </span>
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Step 1: Mandatory Full Read & Coverage Confirmation
                </h5>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Full Coverage Verified (Character-by-Character)
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Sections processed in sequential reading order from first character to last. Native machine text vs. OCR noted.
            </p>

            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              {report.pages_or_sections_read.map((sec, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-800 font-medium text-[11px]">{sec}</span>
                </div>
              ))}
            </div>

            {report.read_issues.length > 0 && (
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1.5 text-amber-800 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Read / OCR Integrity Notes:</span>
                </div>
                <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                  {report.read_issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* STEP 2: The 9 Criteria Breakdown */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                  2
                </span>
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Step 2: Evaluation Against 9 Criteria (Weights & Deductions)
                </h5>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Total Weight: 100
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {report.category_scores.map((cat, idx) => {
                const hasIssues = cat.issues_found.length > 0;

                return (
                  <div
                    key={cat.category}
                    className={`p-3 rounded-xl border transition ${
                      hasIssues
                        ? cat.score <= 30
                          ? 'bg-rose-50/70 border-rose-200'
                          : 'bg-amber-50/70 border-amber-200'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-slate-400">#{idx + 1}</span>
                        <span className="text-xs font-bold text-slate-800">{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                          Wt: {cat.weight}
                        </span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                          cat.score >= 85
                            ? 'bg-emerald-100 text-emerald-800'
                            : cat.score >= 60
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {cat.score}/100
                        </span>
                      </div>
                    </div>

                    {/* Issues / Deductions details */}
                    {hasIssues ? (
                      <div className="mt-2 space-y-1.5">
                        {cat.issues_found.map((issue, iIdx) => (
                          <div
                            key={iIdx}
                            className="bg-white/90 p-2 rounded-lg border border-slate-200/80 text-[11px] text-slate-800 leading-snug"
                          >
                            <div className="flex justify-between items-center text-rose-700 font-bold mb-0.5 text-[10px]">
                              <span>Deduction:</span>
                              <span>-{issue.points_deducted} pts</span>
                            </div>
                            <div className="font-mono text-[10.5px] text-slate-900 bg-slate-50 p-1.5 rounded border border-slate-200">
                              "{issue.detail}"
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-1.5 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>No deductions. Full compliance (100/100).</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 4: Mathematical Calculation breakdown */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                4
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Calculator className="w-3.5 h-3.5 text-emerald-700" />
                <span>Step 4: Overall Confidence Weighted-Sum Mathematical Proof</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900 text-emerald-300 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase mb-1">// Formula: Σ (category_score × category_weight) / 100</div>
              <div>{report.confidence_calculation}</div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Threshold: Approve</span>
                <span className="font-bold text-emerald-700">≥ 85.0%</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Threshold: Manual Review</span>
                <span className="font-bold text-amber-700">60.0% – 84.9%</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Threshold: Reject</span>
                <span className="font-bold text-rose-700">&lt; 60.0%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Master Reference Database (100 Records) Modal */}
      {showMasterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Statutory National Reference Master Database</h3>
                  <p className="text-[11px] text-slate-400">
                    100 Standard Master Records for Cross-Document Validation (Step 2, Criterion 6)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMasterModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All Records (100)' },
                  { id: 'clean', label: 'Clean (55)' },
                  { id: 'expired_cert', label: 'Expired Cert (10)' },
                  { id: 'blacklisted', label: 'Blacklisted (5)' },
                  { id: 'over_income', label: 'Over Income (5)' },
                  { id: 'revoked_cert', label: 'Revoked Cert (5)' },
                  { id: 'not_seeded', label: 'Not Seeded (5)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setScenarioFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition cursor-pointer ${
                      scenarioFilter === f.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, UID, cert #..."
                  className="w-full pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500 bg-white"
                />
              </div>
            </div>

            {/* Records List Table */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="text-[11px] text-slate-500 font-medium mb-1">
                Showing {filteredRecords.length} of 100 master records. Select any record to simulate cross-document validation against the current document:
              </div>

              <div className="space-y-2">
                {filteredRecords.map((r) => {
                  const isSelected = selectedMasterRecord?.record_id === r.record_id;

                  return (
                    <div
                      key={r.record_id}
                      className={`p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            #{r.record_id}
                          </span>
                          <strong className="text-xs text-slate-900">{r.full_name}</strong>
                          <span className="text-[11px] text-slate-500">s/o {r.fathers_name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.test_scenario === 'clean'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.test_scenario === 'expired_cert'
                              ? 'bg-amber-100 text-amber-800'
                              : r.test_scenario === 'revoked_cert' || r.test_scenario === 'blacklisted'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {r.test_scenario}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-[11px] text-slate-600 font-mono">
                          <div>UID: <span className="text-slate-800">{r.unique_id_number}</span></div>
                          <div>Cert: <span className="text-slate-800">{r.category_certificate_number} ({r.category_certificate_status})</span></div>
                          <div>Income: <span className="text-slate-800">₹{r.income_certificate_amount.toLocaleString()}</span></div>
                          <div>Bank: <span className="text-slate-800">{r.bank_account_number} ({r.aadhaar_seeding_status})</span></div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectMasterRecord(r)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 inline-flex items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <span>{isSelected ? 'Currently Active' : 'Cross-Validate'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                Statutory Central Registry Schema: MoTA NSP Data Engine
              </span>
              <button
                type="button"
                onClick={() => setShowMasterModal(false)}
                className="px-3 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrutinizer Document Viewer Modal */}
      {showViewer && (
        <DocumentViewerModal
          document={activeDoc}
          application={application}
          onClose={() => setShowViewer(false)}
        />
      )}
    </div>
  );
};
