import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Download, 
  CreditCard, 
  Search, 
  RefreshCw, 
  ArrowUpRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Application, DeficiencyNotice, DocumentUpload } from '../types/scholarship';
import { simulateOCRExtraction } from '../services/ocrService';
import { useLanguage } from '../context/LanguageContext';
import { Avatar } from './Avatar';

interface StatusTrackerProps {
  applications: Application[];
  selectedAppId?: string;
  onSelectApplication: (id: string) => void;
  onResolveDeficiency: (appId: string, defId: string, replacementDoc: DocumentUpload) => void;
  isOnline: boolean;
  onToast: (type: 'success' | 'warning' | 'info', title: string, message: string) => void;
}

export const StatusTracker: React.FC<StatusTrackerProps> = ({
  applications,
  selectedAppId,
  onSelectApplication,
  onResolveDeficiency,
  isOnline,
  onToast,
}) => {
  const { t } = useLanguage();
  const currentApp = applications.find((a) => a.id === selectedAppId) || applications[0];
  const [resolvingDefId, setResolvingDefId] = useState<string | null>(null);
  const [isUploadingCorrection, setIsUploadingCorrection] = useState(false);
  const [showSanctionLetter, setShowSanctionLetter] = useState(false);

  if (!currentApp) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500">{t('noAppsFound')}</p>
      </div>
    );
  }

  const stages = [
    {
      id: 'step1',
      name: t('stageSubmitted'),
      date: currentApp.submittedAt ? new Date(currentApp.submittedAt).toLocaleDateString() : 'Pending',
      done: true,
      desc: t('stageSubmittedDesc'),
    },
    {
      id: 'step2',
      name: t('stageOcr'),
      date: currentApp.status !== 'draft' ? 'Automated in 4.2s' : 'Queued',
      done: currentApp.status !== 'draft',
      desc: t('stageOcrDesc'),
    },
    {
      id: 'step3',
      name: t('stageScrutiny'),
      date: currentApp.scrutiny?.reviewedAt
        ? new Date(currentApp.scrutiny.reviewedAt).toLocaleDateString()
        : currentApp.status === 'flagged_deficiency'
        ? t('deficiencyNoticeHeading')
        : 'In Review',
      done: ['approved', 'merit_listed', 'dbt_active'].includes(currentApp.status),
      active: ['in_scrutiny', 'flagged_deficiency', 'ocr_verified'].includes(currentApp.status),
      flagged: currentApp.status === 'flagged_deficiency',
      desc: currentApp.scrutiny?.remarks || t('stageScrutinyDesc'),
    },
    {
      id: 'step4',
      name: t('stageMerit'),
      date: ['merit_listed', 'approved', 'dbt_active'].includes(currentApp.status) ? 'Ranked' : 'Pending',
      done: ['merit_listed', 'approved', 'dbt_active'].includes(currentApp.status),
      desc: t('stageMeritDesc'),
    },
    {
      id: 'step5',
      name: t('stageDbt'),
      date: currentApp.status === 'dbt_active' ? t('disbursed') : 'Awaiting Sanction',
      done: currentApp.status === 'dbt_active',
      desc: t('stageDbtDesc'),
    },
  ];

  const handleCorrectionUpload = async (def: DeficiencyNotice) => {
    setIsUploadingCorrection(true);
    onToast('info', 'Processing Document', 'AI OCR scanning replacement document...');

    setTimeout(async () => {
      const ocrRes = await simulateOCRExtraction({
        docType: (def.field as any) || 'caste_certificate',
        fileName: `Rectified_${def.field}_Digitally_Signed.pdf`,
        applicantName: currentApp.applicant.fullName,
        stCommunity: currentApp.applicant.stCommunity,
      });

      const replacementDoc: DocumentUpload = {
        id: `doc_corr_${Date.now()}`,
        type: (def.field as any) || 'caste_certificate',
        name: `Rectified_${def.field}_Digitally_Signed.pdf`,
        size: 924000,
        uploadedAt: new Date().toISOString(),
        ocrStatus: 'verified',
        ocrConfidence: 98,
        extractedFields: ocrRes.extractedFields,
      };

      onResolveDeficiency(currentApp.id, def.id, replacementDoc);
      setIsUploadingCorrection(false);
      setResolvingDefId(null);
      onToast('success', 'Deficiency Resolved', 'Corrected document verified by AI OCR and forwarded to Scrutiny Officer.');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Application Switcher Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar
            type={currentApp.applicant.gender === 'female' ? 'scholar_female' : 'scholar_male'}
            name={currentApp.applicant.fullName}
            role="applicant"
            size="md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {currentApp.scheme} Scheme
              </span>
              <span className="text-sm font-bold text-slate-900">
                {currentApp.applicationNumber}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-800 mt-1">
              {currentApp.applicant.fullName} ({currentApp.applicant.stCommunity} Tribe)
            </h3>
            <p className="text-xs text-slate-500">
              {currentApp.academic.institutionName || currentApp.academic.foreignUniversityName} • {currentApp.academic.qualifyingDegree}
            </p>
          </div>
        </div>

        {/* Switch Application Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">{t('viewCandidate')}</label>
          <select
            value={currentApp.id}
            onChange={(e) => onSelectApplication(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.applicationNumber} - {app.applicant.fullName} ({app.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Deficiency Alert Banner if Active */}
      {currentApp.status === 'flagged_deficiency' && currentApp.deficiencies && currentApp.deficiencies.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                  {t('actionRequired')}
                </span>
                <span className="text-xs text-slate-500">MoTA Scrutiny Desk</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-1">
                {t('deficiencyNoticeHeading')}
              </h4>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                {t('deficiencyNoticeDesc')}
              </p>

              {/* Deficiency items */}
              <div className="mt-4 space-y-3">
                {currentApp.deficiencies.map((def) => (
                  <div key={def.id} className="p-4 rounded-xl bg-white border border-orange-200">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-900">{def.title}</h5>
                      <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        {t('criticalDeficiency')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {def.description}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Issued: {new Date(def.issuedAt).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCorrectionUpload(def)}
                        disabled={isUploadingCorrection}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingCorrection ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{t('scanViaOcr')}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{t('uploadDigitallyAttested')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Timeline Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span>{t('timelineTitle')}</span>
          <span className="text-xs font-normal text-slate-400">• {t('motaTracking')}</span>
        </h4>

        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {stages.map((stage, idx) => {
            return (
              <div key={stage.id} className="relative flex items-start gap-4">
                {/* Node icon */}
                <div
                  className={`absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    stage.done
                      ? 'bg-emerald-600 text-white'
                      : stage.flagged
                      ? 'bg-orange-500 text-white ring-4 ring-orange-100'
                      : stage.active
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {stage.done ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : stage.flagged ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h5 className="text-xs font-bold text-slate-900">{stage.name}</h5>
                    <span className="text-[11px] font-medium text-slate-500">{stage.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Provisional Award / Sanction Letter Preview (If Approved or DBT Active) */}
      {(['approved', 'merit_listed', 'dbt_active'].includes(currentApp.status)) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {t('sanctionGranted')}
                </span>
                <span className="text-xs text-slate-500">
                  Order No: MoTA/SCH/2025/SANCTION-{currentApp.scheme}-881
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                {t('awardLetterHeading')}
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setShowSanctionLetter(!showSanctionLetter)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{showSanctionLetter ? t('hideAwardLetter') : t('viewAwardLetter')}</span>
            </button>
          </div>

          {/* Letter Viewer Card */}
          {showSanctionLetter && (
            <div className="mt-6 p-6 sm:p-8 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 text-xs text-slate-800 font-serif leading-relaxed">
              <div className="text-center pb-4 border-b border-slate-300 mb-6">
                <p className="font-bold text-sm tracking-wide text-slate-900">GOVERNMENT OF INDIA</p>
                <p className="font-semibold text-xs text-slate-700">MINISTRY OF TRIBAL AFFAIRS</p>
                <p className="text-[11px] text-slate-500 font-sans">Shastri Bhawan, New Delhi - 110001</p>
                <p className="text-xs font-bold text-blue-900 font-sans mt-2">
                  SANCTION ORDER & PROVISIONAL AWARD LETTER ({currentApp.scheme})
                </p>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <p>
                  <strong>To:</strong> {currentApp.applicant.fullName}, S/o or D/o {currentApp.applicant.fatherName},<br />
                  ST Community: <strong>{currentApp.applicant.stCommunity}</strong>, Domicile: {currentApp.applicant.state}
                </p>
                <p>
                  I am directed to convey the sanction of the President of India for award of{' '}
                  <strong>{currentApp.scheme === 'NFST' ? 'National Fellowship for ST Students (NFST)' : 'National Overseas Scholarship (NOS)'}</strong> for the academic session 2025-2026.
                </p>

                <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1.5 font-mono text-[11px]">
                  <div>• Application No: <strong>{currentApp.applicationNumber}</strong></div>
                  <div>• Course/Degree: <strong>{currentApp.academic.targetProgram} ({currentApp.academic.qualifyingDegree})</strong></div>
                  <div>• Institution: <strong>{currentApp.academic.institutionName || currentApp.academic.foreignUniversityName}</strong></div>
                  <div>• Merit Score: <strong>{currentApp.aiAnalysis?.meritScore || 92}/100 (Merit Rank Approved)</strong></div>
                  <div>
                    • Financial Assistance: <strong>
                      {currentApp.scheme === 'NFST'
                        ? '₹37,000 / month JRF + HRA + Contingency Grant (₹20,500/year)'
                        : 'Tuition Fee Covered + Maintenance Allowance (£9,900 / $15,400 per annum) + Medical'}
                    </strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 italic">
                  This sanction is issued in accordance with DBT guidelines. Disbursements will be made electronically through PFMS into the validated bank account.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DBT Disbursement Tracker (Tranches) */}
      {currentApp.dbtDisbursements && currentApp.dbtDisbursements.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{t('dbtLog')}</h4>
                <p className="text-xs text-slate-500">{t('directDisbursementTo')} •••• {currentApp.bankDetails.accountNumber.slice(-4)}</p>
              </div>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {t('aadhaarActive')}
            </span>
          </div>

          <div className="space-y-3">
            {currentApp.dbtDisbursements.map((tranche) => (
              <div
                key={tranche.trancheNumber}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {t('tranche')} #{tranche.trancheNumber}: {tranche.description}
                    </span>
                    {tranche.status === 'disbursed' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {t('disbursed')}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {t('pfmsCleared')}
                      </span>
                    )}
                  </div>
                  {tranche.utrNumber && (
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      UTR No: {tranche.utrNumber} • Disbursed: {tranche.disbursedDate}
                    </p>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-sm font-bold text-slate-900">
                    ₹{tranche.amount.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[11px] text-slate-400">{t('sbiGateway')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
