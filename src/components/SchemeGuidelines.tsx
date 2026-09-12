import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  ExternalLink, 
  Download, 
  ShieldCheck, 
  Building2, 
  FileText,
  DollarSign
} from 'lucide-react';
import { SchemeType } from '../types/scholarship';
import { useLanguage } from '../context/LanguageContext';

export const SchemeGuidelines: React.FC = () => {
  const { t } = useLanguage();
  const [selectedScheme, setSelectedScheme] = useState<SchemeType>('NFST');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Scheme Selector Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t('officialGuidelines')}</h3>
              <p className="text-xs text-slate-500">{t('ministrySubtitle')}</p>
            </div>
          </div>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedScheme('NFST')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              selectedScheme === 'NFST' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
            }`}
          >
            {t('nfstTab')}
          </button>
          <button
            type="button"
            onClick={() => setSelectedScheme('NOS')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              selectedScheme === 'NOS' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
            }`}
          >
            {t('nosTab')}
          </button>
        </div>
      </div>

      {selectedScheme === 'NFST' ? (
        <div className="space-y-6">
          {/* NFST Overview */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">
                {t('nfstHeading')}
              </h4>
              <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                {t('slotsAnnually')}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              NFST provides financial support to Scheduled Tribe (ST) students to pursue regular, full-time M.Phil and Ph.D. degrees in Science, Humanities, Social Science, and Engineering & Technology at UGC-recognized Indian Universities and Premier Institutes (IITs, NITs, IIMs, Central Universities).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase">{t('jrfFellowship')}</span>
                <p className="text-base font-bold text-slate-900 mt-1">₹37,000 / month</p>
                <p className="text-[11px] text-slate-500">{t('jrfDuration')}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase">{t('srfFellowship')}</span>
                <p className="text-base font-bold text-slate-900 mt-1">₹42,000 / month</p>
                <p className="text-[11px] text-slate-500">{t('srfDuration')}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase">{t('annualContingency')}</span>
                <p className="text-base font-bold text-slate-900 mt-1">₹20,500 / year</p>
                <p className="text-[11px] text-slate-500">{t('contingencyDesc')}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <h5 className="font-bold text-slate-800">{t('keyStatutoryConditions')}</h5>
              <ul className="space-y-1.5 text-slate-600 pl-4 list-disc">
                <li>Candidate must belong to a notified Scheduled Tribe (ST) under Constitution Order.</li>
                <li>Qualifying Degree: Minimum 55% aggregate in Post-Graduate (Master's) examinations.</li>
                <li>Selection is determined strictly on the basis of UGC-NET / CSIR-NET percentile score.</li>
                <li>Statutory Quota: Minimum 30% of total fellowship slots are reserved for ST female candidates.</li>
                <li>Disbursement via PFMS directly to Aadhaar-seeded bank account on the 1st of every month.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* NOS Overview */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">
                National Overseas Scholarship for ST Candidates (NOS)
              </h4>
              <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-full">
                {t('nosSlotsAnnually')}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              NOS provides financial assistance to meritorious Scheduled Tribe candidates selected for pursuing Master's level courses, Ph.D., and Post-Doctoral research programmes in recognized accredited institutions across USA, UK, Germany, Canada, Australia, and other global destinations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase">{t('tuitionFee')}</span>
                <p className="text-base font-bold text-slate-900 mt-1">{t('covered100')}</p>
                <p className="text-[11px] text-slate-500">{t('tuitionFeeDesc')}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase">{t('annualMaintenance')}</span>
                <p className="text-base font-bold text-slate-900 mt-1">£9,900 / $15,400</p>
                <p className="text-[11px] text-slate-500">{t('annualMaintenanceDesc')}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase">{t('airfareVisa')}</span>
                <p className="text-base font-bold text-slate-900 mt-1">{t('economyCovered')}</p>
                <p className="text-[11px] text-slate-500">{t('airfareVisaDesc')}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <h5 className="font-bold text-slate-800">{t('keyStatutoryConditions')}</h5>
              <ul className="space-y-1.5 text-slate-600 pl-4 list-disc">
                <li>Qualifying aggregate score: At least 55% marks in qualifying degree.</li>
                <li>Family Income: Total annual family income must not exceed ₹8,00,000 per annum.</li>
                <li>Institution Tier: Must possess unconditional offer letter from top 500 QS World Ranked universities.</li>
                <li>Age Limit: Below 35 years as on 1st July of the application cycle.</li>
                <li>Quota: At least 33% (1/3rd) slots are reserved for ST female candidates.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
