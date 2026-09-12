import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  CreditCard, 
  Award, 
  ShieldCheck, 
  AlertCircle,
  BarChart3,
  Building2,
  FileCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { SystemStats } from '../types/scholarship';
import { useLanguage } from '../context/LanguageContext';

interface AnalyticsDashboardProps {
  stats: SystemStats;
}

const COLORS = ['#2563EB', '#F97316', '#10B981', '#6366F1', '#EC4899', '#8B5CF6'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ stats }) => {
  const { t } = useLanguage();

  // Funnel Data
  const funnelData = [
    { stage: t('registeredStage', 'Registered'), count: stats.totalApplications, fill: '#3B82F6' },
    { stage: t('aiVerifiedStage', 'AI Verified'), count: stats.aiPreVerifiedCount, fill: '#2563EB' },
    { stage: t('scrutinyClearedStage', 'Scrutiny Cleared'), count: stats.approvedCount + stats.meritListedCount, fill: '#6366F1' },
    { stage: t('meritRankedStage', 'Merit Ranked'), count: stats.meritListedCount, fill: '#F97316' },
    { stage: t('dbtDisbursedStage', 'DBT Disbursed'), count: stats.dbtActiveCount, fill: '#10B981' },
  ];

  // Scheme Breakdown
  const schemePieData = [
    { name: 'NFST (National Fellowship)', value: stats.schemeBreakdown.NFST },
    { name: 'NOS (Overseas Study)', value: stats.schemeBreakdown.NOS },
  ];

  // State-wise ST Distribution
  const stateDistributionData = Object.entries(stats.stateDistribution).map(([state, count]) => ({
    state,
    count,
  }));

  // Timeline / Processing time benchmark
  const timeComparisonData = [
    { metric: 'Avg Scrutiny (Days)', Manual2023: 42, AROHA_AI: 3.8 },
    { metric: 'Deficiency Clearance (Days)', Manual2023: 28, AROHA_AI: 2.1 },
    { metric: 'Disbursement Cycle (Days)', Manual2023: 65, AROHA_AI: 6.4 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Applications */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('totalStApplications', 'Total ST Applications')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {stats.totalApplications.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +24% YoY
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            NFST: {stats.schemeBreakdown.NFST} • NOS: {stats.schemeBreakdown.NOS}
          </p>
        </div>

        {/* Card 2: AI OCR Pre-verification */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('aiOcrPreCheck', 'AI OCR Pre-Check')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">
              {stats.aiPreVerifiedPercentage}%
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              ({stats.aiPreVerifiedCount} {t('automated', 'automated')})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {t('avgOcrConfidence', 'Avg OCR Confidence')}: 94.8%
          </p>
        </div>

        {/* Card 3: Processing Time Saved */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('avgTurnaround', 'Avg Turnaround')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {stats.averageProcessingDays} {t('days', 'Days')}
            </span>
            <span className="text-[11px] font-bold text-emerald-600">
              {t('ninetyPercentFaster', '91% faster')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {t('reducedFromManual', 'Reduced from 42 days manual review')}
          </p>
        </div>

        {/* Card 4: DBT Disbursed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('pfmsDbtDisbursed', 'PFMS DBT Disbursed')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">
              ₹{(stats.dbtTotalDisbursedInr / 10000000).toFixed(2)} {t('crore', 'Cr')}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {t('active', 'Active')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats.dbtActiveCount} {t('scholarsFundedDirect', 'ST scholars funded direct to bank')}
          </p>
        </div>
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Funnel Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{t('funnelTitle', 'Application Progression Funnel')}</h4>
              <p className="text-xs text-slate-500">{t('funnelSubtitle', 'From initial portal registration to DBT bank transfer')}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
              2025-26 {t('cycle', 'Cycle')}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip
                  formatter={(value: any) => [`${value} Candidates`, t('count', 'Count')]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scheme Distribution & Quota Gauge (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-slate-900">{t('schemeSeatAllocation', 'Scheme Seat Allocation')}</h4>
              <span className="text-xs text-slate-400">{t('statutoryCaps', 'Statutory Caps')}</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">NFST: 750 Annual Slots • NOS: 20 Annual Slots</p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={schemePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    <Cell fill="#2563EB" />
                    <Cell fill="#F97316" />
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Statutory Quotas Tracking */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">{t('femaleParticipation', 'ST Female Candidate Participation:')}</span>
              <span className="font-bold text-emerald-600">38.4% ({t('exceedsMandate', 'Exceeds 30% statutory mandate')})</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '38.4%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* State-wise Distribution & Processing Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* State ST Distribution (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{t('geographicalDistribution', 'Geographical Distribution (Top ST States)')}</h4>
              <p className="text-xs text-slate-500">{t('geoSubtitle', 'Applicant domicile representation across tribal corridors')}</p>
            </div>
            <span className="text-xs text-slate-400">{t('allIndia', 'All India')}</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="state" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Benchmark Comparison (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{t('efficiencyBenchmark', 'Processing Efficiency Benchmark')}</h4>
              <p className="text-xs text-slate-500">{t('benchmarkSubtitle', 'Manual Portal (2023) vs AROHA AI Workflow (2025)')}</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              10x {t('faster', 'Faster')}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between font-bold text-slate-800">
                <span>{t('appToScrutiny', 'Application to Scrutiny:')}</span>
                <span className="text-emerald-600">3.8 {t('days', 'Days')} (vs 42 {t('days', 'Days')})</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {t('appToScrutinyDesc', 'AI OCR instantly classifies documents, flags mismatches, and queues clean applications.')}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between font-bold text-slate-800">
                <span>{t('deficiencyResolution', 'Deficiency Resolution:')}</span>
                <span className="text-emerald-600">2.1 {t('days', 'Days')} (vs 28 {t('days', 'Days')})</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {t('deficiencyResolutionDesc', 'Direct SMS/portal alerts enable students to upload replacements from mobile offline.')}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between font-bold text-slate-800">
                <span>{t('auditTrailRti', 'Audit Trail & RTI Readiness:')}</span>
                <span className="text-blue-600">100% {t('deterministic', 'Deterministic')}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {t('auditTrailRtiDesc', 'Every score, rule check, and committee remark has a cryptographically logged timestamp.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
