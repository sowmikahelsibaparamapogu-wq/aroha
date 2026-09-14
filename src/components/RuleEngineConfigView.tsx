import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle, 
  Code, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { SchemeRuleConfig, SchemeType } from '../types/scholarship';
import { DEFAULT_SCHEME_RULES } from '../services/ruleEngine';
import { useLanguage } from '../context/LanguageContext';

interface RuleEngineConfigViewProps {
  currentRules: Record<SchemeType, SchemeRuleConfig>;
  onUpdateRules: (rules: Record<SchemeType, SchemeRuleConfig>) => void;
  onReevaluateAll: () => void;
  onToast: (type: 'success' | 'warning' | 'info', title: string, message: string) => void;
}

export const RuleEngineConfigView: React.FC<RuleEngineConfigViewProps> = ({
  currentRules,
  onUpdateRules,
  onReevaluateAll,
  onToast,
}) => {
  const { t } = useLanguage();
  const [activeScheme, setActiveScheme] = useState<SchemeType>('NFST');
  const [localRules, setLocalRules] = useState<Record<SchemeType, SchemeRuleConfig>>(() => {
    return currentRules || DEFAULT_SCHEME_RULES;
  });
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    if (currentRules) {
      setLocalRules(currentRules);
    }
  }, [currentRules]);

  const activeConfig: SchemeRuleConfig = localRules?.[activeScheme] || DEFAULT_SCHEME_RULES[activeScheme];
  const eligibility = activeConfig?.eligibility || DEFAULT_SCHEME_RULES[activeScheme].eligibility;
  const scoringWeights = activeConfig?.scoringWeights || DEFAULT_SCHEME_RULES[activeScheme].scoringWeights;
  const totalWeight = (scoringWeights.academicMerit || 0) + 
                      (scoringWeights.entranceOrUniversityRank || 0) + 
                      (scoringWeights.sopOrResearchProposal || 0);

  const handleWeightChange = (key: keyof SchemeRuleConfig['scoringWeights'], val: number) => {
    setLocalRules((prev) => {
      const currentSchemeConfig = prev[activeScheme] || DEFAULT_SCHEME_RULES[activeScheme];
      return {
        ...prev,
        [activeScheme]: {
          ...currentSchemeConfig,
          scoringWeights: {
            ...currentSchemeConfig.scoringWeights,
            [key]: val,
          },
        },
      };
    });
  };

  const handleCutoffChange = (
    field: 'minQualifyingPercentage' | 'maxIncomeLimit' | 'maxForeignUniversityQsRank',
    val: number | null
  ) => {
    setLocalRules((prev) => {
      const currentSchemeConfig = prev[activeScheme] || DEFAULT_SCHEME_RULES[activeScheme];
      return {
        ...prev,
        [activeScheme]: {
          ...currentSchemeConfig,
          eligibility: {
            ...currentSchemeConfig.eligibility,
            [field]: val,
          },
        },
      };
    });
  };

  const handleSave = () => {
    onUpdateRules(localRules);
    onToast('success', t('ruleConfigSaved', 'Rule Configuration Saved'), `${t('updatedCriteria', 'Updated')} ${activeScheme} ${t('statutoryCriteriaWeights', 'statutory criteria & weights.')}`);
  };

  const handleReset = () => {
    setLocalRules(DEFAULT_SCHEME_RULES);
    onUpdateRules(DEFAULT_SCHEME_RULES);
    onToast('info', t('rulesReset', 'Rules Reset'), t('restoredRulesMessage', 'Restored official MoTA standard scheme rules.'));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t('ruleEngineTitle', 'Configurable MoTA Policy & AI Scoring Engine')}</h3>
            <p className="text-xs text-slate-500">
              {t('ruleEngineSubtitle', 'Parametric rule configuration for statutory eligibility thresholds and merit weighting')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowJson(!showJson)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showJson ? t('interactiveUi', 'Interactive UI') : t('viewRawJson', 'View Raw JSON')}</span>
          </button>

          <button
            type="button"
            onClick={onReevaluateAll}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('reEvaluateAll', 'Re-Evaluate All Applications')}</span>
          </button>
        </div>
      </div>

      {/* Scheme Tab Selector */}
      <div className="flex p-1 bg-slate-100 rounded-xl max-w-sm border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveScheme('NFST')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
            activeScheme === 'NFST' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
          }`}
        >
          NFST ({t('nationalFellowship', 'National Fellowship')})
        </button>
        <button
          type="button"
          onClick={() => setActiveScheme('NOS')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
            activeScheme === 'NOS' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
          }`}
        >
          NOS ({t('nationalOverseas', 'National Overseas')})
        </button>
      </div>

      {showJson ? (
        <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl font-mono text-xs overflow-x-auto shadow-sm">
          <pre>{JSON.stringify(activeConfig, null, 2)}</pre>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statutory Eligibility Thresholds */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              1. {t('statutoryThresholds', 'Statutory Eligibility Thresholds')}
            </h4>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>{t('minQualifyingScore', 'Minimum Qualifying Degree Score (%):')}</span>
                <span className="text-blue-600 font-bold">{eligibility.minQualifyingPercentage}%</span>
              </div>
              <input
                type="range"
                min="45"
                max="75"
                step="1"
                value={eligibility.minQualifyingPercentage}
                onChange={(e) => handleCutoffChange('minQualifyingPercentage', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {t('cutoffAggregateDesc', 'Official MoTA statutory cutoff is 55.0% aggregate for Scheduled Tribe candidates.')}
              </p>
            </div>

            {activeScheme === 'NOS' && (
              <>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                    <span>{t('annualFamilyIncomeCeiling', 'Annual Family Income Ceiling:')}</span>
                    <span className="text-blue-600 font-bold">
                      ₹{eligibility.maxIncomeLimit?.toLocaleString('en-IN') || t('noLimit', 'No Limit')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="1500000"
                    step="50000"
                    value={eligibility.maxIncomeLimit || 800000}
                    onChange={(e) => handleCutoffChange('maxIncomeLimit', Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {t('nosIncomeCeilingDesc', 'NOS Statutory ceiling: ₹8,00,000 per annum total family income.')}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                    <span>{t('maxQsRanking', 'Maximum QS World Ranking:')}</span>
                    <span className="text-blue-600 font-bold">{t('top', 'Top')} {eligibility.maxForeignUniversityQsRank || 500}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={eligibility.maxForeignUniversityQsRank || 500}
                    onChange={(e) => handleCutoffChange('maxForeignUniversityQsRank', Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {t('admissionQsDesc', 'Candidate must secure unconditional admission in top 500 QS global institutions.')}
                  </p>
                </div>
              </>
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800">{t('mandatoryDocsConfigured', 'Mandatory Documents Configured:')}</span>
              <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                {(eligibility.mandatoryDocs || []).map((d) => (
                  <li key={d}>{d.replace(/_/g, ' ').toUpperCase()}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Merit Scoring Weights */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. {t('meritWeightDist', 'Merit Scoring Weight Distribution')}
              </h4>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                totalWeight === 100 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {t('totalWeight', 'Total:')} {totalWeight}% {totalWeight === 100 ? '✓' : '(Target: 100%)'}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>{t('academicDegreeWeight', 'Qualifying Academic Degree Weight:')}</span>
                <span className="text-blue-600 font-bold">{scoringWeights.academicMerit}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                step="5"
                value={scoringWeights.academicMerit}
                onChange={(e) => handleWeightChange('academicMerit', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {activeScheme === 'NFST' ? (
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                  <span>{t('ugcNetScoreWeight', 'UGC-NET / CSIR-NET Score Weight:')}</span>
                  <span className="text-blue-600 font-bold">
                    {scoringWeights.entranceOrUniversityRank}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  step="5"
                  value={scoringWeights.entranceOrUniversityRank}
                  onChange={(e) => handleWeightChange('entranceOrUniversityRank', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                  <span>{t('qsRankingWeight', 'QS World Ranking Weight:')}</span>
                  <span className="text-blue-600 font-bold">
                    {scoringWeights.entranceOrUniversityRank}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  step="5"
                  value={scoringWeights.entranceOrUniversityRank}
                  onChange={(e) => handleWeightChange('entranceOrUniversityRank', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            )}

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>{t('sopProposalWeight', 'Research Proposal / SOP Weight:')}</span>
                <span className="text-blue-600 font-bold">{scoringWeights.sopOrResearchProposal}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={scoringWeights.sopOrResearchProposal}
                onChange={(e) => handleWeightChange('sopOrResearchProposal', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('resetToDefault', 'Reset to MoTA Default')}</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t('applySaveRules', 'Apply & Save Rules')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
