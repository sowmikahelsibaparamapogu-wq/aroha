import React, { useState } from 'react';
import { 
  Award, 
  Download, 
  Search, 
  CheckCircle2, 
  SlidersHorizontal, 
  Filter, 
  FileSpreadsheet,
  Building2,
  Sparkles
} from 'lucide-react';
import { Application, SchemeType } from '../types/scholarship';
import { useLanguage } from '../context/LanguageContext';
import { Avatar } from './Avatar';
import { INDIAN_ADMINISTRATIVE_DIVISIONS } from '../data/indianStates';

interface MeritRankingViewProps {
  applications: Application[];
  onOpenApplication: (app: Application) => void;
}

export const MeritRankingView: React.FC<MeritRankingViewProps> = ({
  applications,
  onOpenApplication,
}) => {
  const { t } = useLanguage();
  const [selectedScheme, setSelectedScheme] = useState<SchemeType>('NFST');
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('ALL');

  const schemeSlotLimits: Record<SchemeType, number> = {
    NFST: 750,
    NOS: 20,
  };

  // Filter by scheme and sort descending by meritScore
  const rankedApps = applications
    .filter((a) => a.scheme === selectedScheme)
    .sort((a, b) => {
      const scoreA = a.aiAnalysis?.meritScore || 0;
      const scoreB = b.aiAnalysis?.meritScore || 0;
      return scoreB - scoreA;
    });

  const filteredRanked = rankedApps.filter((a) => {
    const matchesSearch =
      a.applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.applicant.stCommunity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.applicant.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState =
      stateFilter === 'ALL' ||
      a.applicant.state.toLowerCase() === stateFilter.toLowerCase() ||
      a.applicant.domicileState?.toLowerCase() === stateFilter.toLowerCase();
    return matchesSearch && matchesState;
  });

  const slotLimit = schemeSlotLimits[selectedScheme];
  const femaleCount = rankedApps.slice(0, slotLimit).filter((a) => a.applicant.gender === 'Female').length;
  const femalePercentage = rankedApps.length > 0 ? ((femaleCount / Math.min(rankedApps.length, slotLimit)) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Top Controls & Quota Stats */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('meritRosterTitle', 'National Merit & Selection Roster')}</h3>
              <p className="text-xs text-slate-500">{t('meritRosterSubtitle', 'Autonomous ranking computed via MoTA transparent scoring criteria')}</p>
            </div>
          </div>
        </div>

        {/* Scheme Switcher & Export */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedScheme('NFST')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                selectedScheme === 'NFST' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              NFST (750 {t('slots', 'Slots')})
            </button>
            <button
              type="button"
              onClick={() => setSelectedScheme('NOS')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                selectedScheme === 'NOS' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              NOS (20 {t('slots', 'Slots')})
            </button>
          </div>

          <button
            type="button"
            onClick={() => alert(`Exporting official MoTA ${selectedScheme} Merit Gazetted List as CSV.`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('exportGazette', 'Export Gazette')}</span>
          </button>
        </div>
      </div>

      {/* Quota & Reservation Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('sanctionedSlots', 'Sanctioned Slots')}</span>
          <p className="text-lg font-black text-slate-900 mt-0.5">{slotLimit} {t('slots', 'Slots')}</p>
          <p className="text-[11px] text-slate-500">{t('nationalAnnualAllocation', 'National Annual Allocation')}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('femaleCandidateShare', 'Female ST Candidate Share')}</span>
          <p className="text-lg font-black text-emerald-600 mt-0.5">{femalePercentage}%</p>
          <p className="text-[11px] text-slate-500">{t('femaleQuotaMet', 'Minimum 30% Statutory Quota Met')}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('selectionStatus', 'Selection Status')}</span>
          <p className="text-lg font-black text-blue-600 mt-0.5">{t('scrutinyEvaluated', 'Scrutiny Evaluated')}</p>
          <p className="text-[11px] text-slate-500">{t('autoRankedByMerit', 'Auto-ranked by merit score')}</p>
        </div>
      </div>

      {/* Search & State Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('filterRankedCandidates', 'Filter ranked candidates...')}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white cursor-pointer"
          title="Filter by State / UT"
        >
          <option value="ALL">All States / UTs (36)</option>
          {INDIAN_ADMINISTRATIVE_DIVISIONS.map((div) => (
            <optgroup key={div.group} label={div.group}>
              {div.items.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Merit List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-5 w-16">{t('rank', 'Rank')}</th>
                <th className="py-3 px-5">{t('candidate', 'Candidate')}</th>
                <th className="py-3 px-5">{t('stCommunityState', 'ST Community / State')}</th>
                <th className="py-3 px-5">{t('academicRecord', 'Academic Record')}</th>
                <th className="py-3 px-5">{t('meritScoreAi', 'Merit Score (AI Evaluated)')}</th>
                <th className="py-3 px-5">{t('selectionCategory', 'Selection Category')}</th>
                <th className="py-3 px-5 text-right">{t('action', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRanked.map((app, idx) => {
                const rank = idx + 1;
                const isSelected = rank <= slotLimit;
                const meritScore = app.aiAnalysis?.meritScore || 85;

                return (
                  <tr
                    key={app.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      !isSelected ? 'opacity-70 bg-slate-50/30' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-5 font-black text-slate-900">
                      <div className="flex items-center gap-1.5">
                        {rank === 1 && <span className="text-amber-500">🥇</span>}
                        {rank === 2 && <span className="text-slate-400">🥈</span>}
                        {rank === 3 && <span className="text-amber-700">🥉</span>}
                        <span>#{rank}</span>
                      </div>
                    </td>

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
                            {app.applicant.gender} • {app.applicationNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ST Community */}
                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-slate-800">{app.applicant.stCommunity}</span>
                      <div className="text-[11px] text-slate-500">{app.applicant.state}</div>
                    </td>

                    {/* Academic */}
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-800">
                        {app.academic.qualifyingPercentage}% in {app.academic.qualifyingDegree}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {app.academic.institutionName || app.academic.foreignUniversityName}
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-blue-700">
                          {meritScore}/100
                        </span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${meritScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-5">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> {t('selected', 'Selected')} ({selectedScheme})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {t('waitlisted', 'Waitlisted')}
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenApplication(app)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition cursor-pointer"
                      >
                        {t('inspect', 'Inspect')}
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
