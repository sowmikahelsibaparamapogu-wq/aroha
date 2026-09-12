import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Application, SchemeType, ApplicationStatus } from '../types/scholarship';
import { useLanguage } from '../context/LanguageContext';
import { Avatar } from './Avatar';

interface ScrutinyQueueProps {
  applications: Application[];
  onOpenScrutiny: (app: Application) => void;
}

export const ScrutinyQueue: React.FC<ScrutinyQueueProps> = ({
  applications,
  onOpenScrutiny,
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [schemeFilter, setSchemeFilter] = useState<'ALL' | SchemeType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ApplicationStatus>('ALL');
  const [onlyFlagged, setOnlyFlagged] = useState(false);

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.stCommunity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.state.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesScheme = schemeFilter === 'ALL' || app.scheme === schemeFilter;
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesFlag = !onlyFlagged || app.aiAnalysis?.requiresHumanReview || app.status === 'flagged_deficiency';

    return matchesSearch && matchesScheme && matchesStatus && matchesFlag;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchCandidatePlaceholder')}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={schemeFilter}
            onChange={(e) => setSchemeFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white cursor-pointer"
          >
            <option value="ALL">{t('allSchemes')}</option>
            <option value="NFST">{t('nfstTab')}</option>
            <option value="NOS">{t('nosTab')}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white cursor-pointer"
          >
            <option value="ALL">{t('allStatuses')}</option>
            <option value="in_scrutiny">{t('inScrutinyStatus')}</option>
            <option value="flagged_deficiency">{t('flaggedMismatch')}</option>
            <option value="ocr_verified">{t('aiVerified')}</option>
            <option value="approved">{t('verifiedApproved')}</option>
            <option value="merit_listed">{t('meritSelected')}</option>
            <option value="dbt_active">{t('dbtDisbursed')}</option>
          </select>

          <button
            type="button"
            onClick={() => setOnlyFlagged(!onlyFlagged)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
              onlyFlagged
                ? 'bg-orange-50 text-orange-800 border-orange-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
            <span>{t('humanReviewQueue')}</span>
          </button>
        </div>
      </div>

      {/* Scrutiny Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{t('scrutinyQueueTitle')}</h3>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {filteredApps.length} {t('allApplications')}
            </span>
          </div>
          <span className="text-xs text-slate-400">MoTA National Tribal Portal</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-5">{t('candidateTribeHeader')}</th>
                <th className="py-3 px-5">{t('schemeTrackHeader')}</th>
                <th className="py-3 px-5">{t('aiConfidenceHeader')}</th>
                <th className="py-3 px-5">{t('ruleEvalHeader')}</th>
                <th className="py-3 px-5">{t('statusHeader')}</th>
                <th className="py-3 px-5 text-right">{t('actionHeader')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => {
                const confidence = app.aiAnalysis?.overallConfidence || 85;
                const requiresReview = app.aiAnalysis?.requiresHumanReview;
                const hasDeficiency = app.status === 'flagged_deficiency';

                return (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onOpenScrutiny(app)}
                  >
                    {/* Candidate */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          type={app.applicant.gender === 'female' ? 'scholar_female' : 'scholar_male'}
                          name={app.applicant.fullName}
                          role="applicant"
                          size="sm"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{app.applicant.fullName}</div>
                          <div className="text-[11px] text-slate-500">
                            {app.applicant.stCommunity} Tribe • {app.applicant.state}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {app.applicationNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Scheme */}
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-blue-700">{app.scheme}</div>
                      <div className="text-[11px] text-slate-600 truncate max-w-[200px]">
                        {app.academic.targetProgram} ({app.academic.qualifyingDegree})
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                        {app.academic.institutionName || app.academic.foreignUniversityName}
                      </div>
                    </td>

                    {/* AI OCR Confidence */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            confidence >= 90
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : confidence >= 70
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          {confidence}% {t('confidence')}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {app.documents?.length || 0} {t('docsParsed')}
                      </div>
                    </td>

                    {/* Rule Evaluation */}
                    <td className="py-3.5 px-5">
                      {requiresReview || hasDeficiency ? (
                        <div className="flex items-start gap-1.5 text-orange-700 font-semibold text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span>{t('requiresHumanReview')}</span>
                            {app.aiAnalysis?.flags && app.aiAnalysis.flags.length > 0 && (
                              <p className="text-[10px] text-slate-500 font-normal truncate max-w-[220px]">
                                {app.aiAnalysis.flags[0]}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('allRulesCleared')}</span>
                        </div>
                      )}
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-5">
                      {app.status === 'dbt_active' ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                          {t('dbtDisbursed')}
                        </span>
                      ) : app.status === 'approved' || app.status === 'merit_listed' ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                          {t('meritSelected')}
                        </span>
                      ) : app.status === 'flagged_deficiency' ? (
                        <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-bold">
                          {t('flaggedMismatch')}
                        </span>
                      ) : app.status === 'in_scrutiny' ? (
                        <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-bold">
                          {t('requiresHumanReview')}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                          {t('aiVerified')}
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenScrutiny(app);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition cursor-pointer"
                      >
                        <span>{t('scrutinizeBtn')}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
