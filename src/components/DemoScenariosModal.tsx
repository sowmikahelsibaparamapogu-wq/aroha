import React from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  WifiOff, 
  FileText, 
  Award,
  CreditCard
} from 'lucide-react';
import { UserRole } from '../types/scholarship';
import { useLanguage } from '../context/LanguageContext';

interface DemoScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenarioId: string) => void;
}

export const DemoScenariosModal: React.FC<DemoScenariosModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'scenario_name_mismatch',
      title: 'Scenario: Document Name Mismatch Error (Jemimah Khasi / Lapang)',
      category: 'AI OCR & Scrutiny Flow',
      description: 'Candidate registered as "Jemimah Khasi", but the attached ST Certificate OCR reads "Jemimah Lapang". Tests AI entity discrepancy detection and Scrutiny Desk resolution.',
      badge: 'AI Document Discrepancy',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertTriangle,
      role: 'applicant',
    },
    {
      id: 'scenario_clean_nfst',
      title: 'Scenario A: Clean NFST Ph.D Application',
      category: 'Applicant Flow',
      description: 'Pre-fills Sowmika Helsiba (Gond Tribe, Adilabad). High UGC-NET percentile (98.4%), verified ST documents, and 95% AI OCR confidence.',
      badge: 'Auto-Passed AI Pre-Check',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      role: 'applicant',
    },
    {
      id: 'scenario_deficiency_nos',
      title: 'Scenario B: NOS Overseas with Deficiency Notice',
      category: 'Scrutiny & Resolution Flow',
      description: 'Loads Birsa Dev Munda (Munda Tribe, Jharkhand) applying for Oxford. Has name mismatch on certificate; view the deficiency alert and upload replacement.',
      badge: 'Deficiency Notice Issued',
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: AlertTriangle,
      role: 'applicant',
    },
    {
      id: 'scenario_scrutiny_desk',
      title: 'Scenario C: Admin Scrutiny & Verification Desk',
      category: 'Admin Portal',
      description: 'Open the MoTA Verification Desk to inspect side-by-side document OCR entities, run rule engine checks, approve or dispatch deficiency notice.',
      badge: 'Human-in-the-Loop',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: FileText,
      role: 'admin',
    },
    {
      id: 'scenario_merit_ranking',
      title: 'Scenario D: National Merit Ranking & Gazette',
      category: 'Selection Roster',
      description: 'View the autonomous merit scoring roster across NFST (750 slots) & NOS (20 slots) with real-time 30% female quota tracking.',
      badge: 'Dynamic Scoring Engine',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Award,
      role: 'admin',
    },
    {
      id: 'scenario_dbt_disbursed',
      title: 'Scenario E: Post-Selection PFMS DBT & Sanction Order',
      category: 'Post-Award & DBT',
      description: 'Inspect official MoTA Presidential Sanction Order and electronic PFMS direct bank transfer log with UTR transaction IDs.',
      badge: 'Active DBT Stipend',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CreditCard,
      role: 'applicant',
    },
    {
      id: 'scenario_offline_test',
      title: 'Scenario F: Tribal Area Offline-First PWA Demo',
      category: 'PWA Resilience',
      description: 'Switches the prototype into Offline Mode to demonstrate local IndexedDB form persistence, document queuing, and auto-sync upon reconnection.',
      badge: 'Offline-First (IndexedDB)',
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: WifiOff,
      role: 'applicant',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-xs text-white shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{t('demoModalTitle', 'AROHA Guided Evaluation Scenarios')}</h3>
              <p className="text-xs text-slate-400">
                {t('demoModalSubtitle', 'Instantly jump to realistic MoTA scholarship workflows and test cases')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3 max-h-[75vh] overflow-y-auto">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            return (
              <div
                key={sc.id}
                onClick={() => {
                  onSelectScenario(sc.id);
                  onClose();
                }}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 group-hover:text-blue-700 transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {sc.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.badgeColor}`}>
                          {sc.badge}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 group-hover:text-blue-700 transition">
                        {sc.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {sc.description}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition flex-shrink-0 mt-2" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
