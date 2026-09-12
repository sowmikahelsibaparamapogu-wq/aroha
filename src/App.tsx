import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FileEdit, 
  Search, 
  BookOpen, 
  ShieldCheck, 
  BarChart3, 
  Award, 
  Sliders, 
  HelpCircle,
  Database,
  Sparkles,
  RotateCcw,
  GraduationCap
} from 'lucide-react';
import { 
  Application, 
  UserRole, 
  SchemeType, 
  SchemeRuleConfig, 
  DeficiencyNotice, 
  DocumentUpload,
  AuthUser
} from './types/scholarship';
import { StorageEngine } from './services/storage';
import { DEFAULT_SCHEME_RULES, evaluateApplication } from './services/ruleEngine';
import { SEEDED_APPLICATIONS, INITIAL_SYSTEM_STATS } from './services/mockData';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { AuthService, DEMO_APPLICANTS, DEMO_ADMINS } from './services/authService';

// Components
import { Header } from './components/Header';
import { AuthView } from './components/AuthView';
import { TribalCoverBanner } from './components/TribalCoverBanner';
import { OfflineBanner } from './components/OfflineBanner';
import { ToastContainer, ToastMessage } from './components/Toast';
import { MultiStepForm } from './components/MultiStepForm';
import { StatusTracker } from './components/StatusTracker';
import { SchemeGuidelines } from './components/SchemeGuidelines';
import { ScrutinyQueue } from './components/ScrutinyQueue';
import { ScrutinyModal } from './components/ScrutinyModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { MeritRankingView } from './components/MeritRankingView';
import { RuleEngineConfigView } from './components/RuleEngineConfigView';
import { DemoScenariosModal } from './components/DemoScenariosModal';
import { TribalHeritageGallery } from './components/TribalHeritageGallery';
import { ArohaMitraBot } from './components/ArohaMitraBot';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const { isOnline, realOnline, isSimulatedOffline, toggleSimulatedOffline } = useNetworkStatus();

  // Language & Localization State
  const { lang, setLang, t } = useLanguage();

  // Primary State
  const [role, setRole] = useState<UserRole>('applicant');
  const [applicantTab, setApplicantTab] = useState<'apply' | 'track' | 'guidelines'>('apply');
  const [adminTab, setAdminTab] = useState<'scrutiny' | 'analytics' | 'merit' | 'rules'>('scrutiny');

  // Authentication & Tribal Atmosphere State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => AuthService.getCurrentUser());
  const [authViewTab, setAuthViewTab] = useState<UserRole>('applicant');
  const [showAuthScreen, setShowAuthScreen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('aroha_current_auth_user');
    } catch {
      return true;
    }
  });
  const [tribalAmbience, setTribalAmbience] = useState<boolean>(true);

  // Data State
  const [applications, setApplications] = useState<Application[]>([]);
  const [rules, setRules] = useState<Record<SchemeType, SchemeRuleConfig>>(DEFAULT_SCHEME_RULES);
  const [selectedAppId, setSelectedAppId] = useState<string>('app_101');
  const [scrutinyModalApp, setScrutinyModalApp] = useState<Application | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Offline & Sync Engine State
  const [queuedDocsCount, setQueuedDocsCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncedText, setLastSyncedText] = useState('Last synced: Just now');
  const isSyncingRef = useRef(false);
  const wasOfflineRef = useRef(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'warning' | 'info', title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initialize DB on mount
  useEffect(() => {
    const initData = async () => {
      const storedApps = await StorageEngine.getApplications();
      setApplications(storedApps);

      const queued = await StorageEngine.getQueuedDocuments();
      setQueuedDocsCount(queued.length);
    };

    initData();
  }, []);

  // Background sync handler when reconnecting or manually triggered
  const triggerSync = useCallback(async (options?: { showToast?: boolean }) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);
    setSyncProgress(20);

    const queued = await StorageEngine.getQueuedDocuments();
    const queuedCount = queued.length;
    setQueuedDocsCount(queuedCount);

    setTimeout(async () => {
      setSyncProgress(60);
      // Process queued documents
      if (queuedCount > 0) {
        await StorageEngine.clearQueuedDocuments();
        setQueuedDocsCount(0);
      }

      setTimeout(() => {
        setSyncProgress(100);
        setIsSyncing(false);
        isSyncingRef.current = false;
        setLastSyncedText(`Last synced: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
        
        // Only show toast if explicitly requested (e.g. manual click or when coming back online)
        const shouldShow = options?.showToast ?? true;
        if (shouldShow) {
          addToast(
            'success',
            'Synced with MoTA Database',
            queuedCount > 0 
              ? `${queuedCount} queued document(s) uploaded and synchronized.`
              : 'All offline applications, document queues, and scrutiny logs are up to date.'
          );
        }
      }, 500);
    }, 800);
  }, [addToast]);

  // When network transitions from offline to online, auto-sync once
  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
    } else if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      triggerSync({ showToast: true });
    }
  }, [isOnline, triggerSync]);

  // Handle new submission
  const handleApplicationSubmitted = (newApp: Application) => {
    setApplications((prev) => [newApp, ...prev.filter((a) => a.id !== newApp.id)]);
    setSelectedAppId(newApp.id);
    setApplicantTab('track');
  };

  // Resolve Deficiency
  const handleResolveDeficiency = async (appId: string, defId: string, replacementDoc: DocumentUpload) => {
    const updated = applications.map((app) => {
      if (app.id !== appId) return app;

      const updatedDocs = [...app.documents, replacementDoc];
      const updatedDefs = app.deficiencies?.filter((d) => d.id !== defId) || [];

      return {
        ...app,
        documents: updatedDocs,
        deficiencies: updatedDefs,
        status: updatedDefs.length === 0 ? ('in_scrutiny' as const) : app.status,
        updatedAt: new Date().toISOString(),
      };
    });

    setApplications(updated);
    await StorageEngine.saveApplications(updated);
  };

  // Scrutiny modal actions
  const handleApproveFromScrutiny = async (appId: string, remarks: string) => {
    const updated = applications.map((app) => {
      if (app.id !== appId) return app;
      return {
        ...app,
        status: 'approved' as const,
        scrutiny: {
          verifiedBy: 'MoTA Scrutiny Officer (Desk-IV)',
          reviewedAt: new Date().toISOString(),
          decision: 'approved' as const,
          remarks,
        },
        updatedAt: new Date().toISOString(),
      };
    });

    setApplications(updated);
    await StorageEngine.saveApplications(updated);
    addToast('success', 'Application Approved', `Application #${applications.find((a) => a.id === appId)?.applicationNumber} approved for Merit Roster.`);
  };

  const handleIssueDeficiencyFromScrutiny = async (appId: string, notice: DeficiencyNotice) => {
    const updated = applications.map((app) => {
      if (app.id !== appId) return app;
      return {
        ...app,
        status: 'flagged_deficiency' as const,
        deficiencies: [...(app.deficiencies || []), notice],
        scrutiny: {
          verifiedBy: 'MoTA Scrutiny Officer (Desk-IV)',
          reviewedAt: new Date().toISOString(),
          decision: 'deficiency_issued' as const,
          remarks: notice.description,
        },
        updatedAt: new Date().toISOString(),
      };
    });

    setApplications(updated);
    await StorageEngine.saveApplications(updated);
    addToast('warning', 'Deficiency Notice Dispatched', `Deficiency alert forwarded to candidate dashboard and registered email.`);
  };

  const handleRejectFromScrutiny = async (appId: string, reason: string) => {
    const updated = applications.map((app) => {
      if (app.id !== appId) return app;
      return {
        ...app,
        status: 'rejected' as const,
        scrutiny: {
          verifiedBy: 'MoTA Scrutiny Officer (Desk-IV)',
          reviewedAt: new Date().toISOString(),
          decision: 'rejected' as const,
          remarks: reason,
        },
        updatedAt: new Date().toISOString(),
      };
    });

    setApplications(updated);
    await StorageEngine.saveApplications(updated);
    addToast('info', 'Application Rejected', `Application marked as rejected on statutory grounds.`);
  };

  // Re-evaluate all applications with updated rules
  const handleReevaluateAll = async () => {
    const updated = applications.map((app) => {
      const evaluation = evaluateApplication(app, rules[app.scheme]);
      return {
        ...app,
        aiAnalysis: {
          overallConfidence: evaluation.overallConfidence,
          eligibilityPassed: evaluation.passed,
          requiresHumanReview: evaluation.requiresHumanReview,
          flags: evaluation.flags,
          riskScore: evaluation.riskScore,
          meritScore: evaluation.meritScore,
          verifiedFieldsCount: evaluation.verifiedFieldsCount,
          totalFieldsCount: evaluation.totalFieldsCount,
          summary: evaluation.summary,
        },
      };
    });

    setApplications(updated);
    await StorageEngine.saveApplications(updated);
    addToast('success', 'Re-Evaluation Completed', `Re-assessed ${updated.length} applications against modified policy weights.`);
  };

  // Reset database back to default mock data
  const handleResetData = async () => {
    await StorageEngine.saveApplications(SEEDED_APPLICATIONS);
    await StorageEngine.clearAllDrafts();
    await StorageEngine.clearQueuedDocuments();
    setApplications(SEEDED_APPLICATIONS);
    setSelectedAppId('app_101');
    addToast('info', 'Database Reset', 'Restored initial MoTA benchmark dataset.');
  };

  // Quick Demo Scenario Switcher
  const handleSelectScenario = (scenarioId: string) => {
    switch (scenarioId) {
      case 'scenario_name_mismatch':
        setRole('applicant');
        setApplicantTab('apply');
        addToast(
          'warning',
          'Loaded Document Name Mismatch Scenario',
          'Form preset configured with candidate Jemimah Khasi and ST Certificate "Jemimah Lapang" discrepancy.'
        );
        break;

      case 'scenario_clean_nfst':
        setRole('applicant');
        setSelectedAppId('app_101');
        setApplicantTab('track');
        addToast('success', 'Loaded Scenario A', 'Viewing Sowmika Helsiba (Clean NFST candidate with verified credentials).');
        break;

      case 'scenario_deficiency_nos':
        setRole('applicant');
        setSelectedAppId('app_102');
        setApplicantTab('track');
        addToast('warning', 'Loaded Scenario B', 'Viewing Birsa Dev Munda with active Deficiency Notice for resolution.');
        break;

      case 'scenario_scrutiny_desk':
        setRole('admin');
        setAdminTab('scrutiny');
        const targetApp = applications.find((a) => a.id === 'app_102') || applications[0];
        setScrutinyModalApp(targetApp);
        addToast('info', 'Loaded Scenario C', 'Opened MoTA Scrutiny Desk for side-by-side OCR entity verification.');
        break;

      case 'scenario_merit_ranking':
        setRole('admin');
        setAdminTab('merit');
        addToast('info', 'Loaded Scenario D', 'National Merit Roster with dynamic ranking and 30% female quota.');
        break;

      case 'scenario_dbt_disbursed':
        setRole('applicant');
        setSelectedAppId('app_104');
        setApplicantTab('track');
        addToast('success', 'Loaded Scenario E', 'Viewing Jemimah Khasi with active PFMS DBT tranches & Sanction Order.');
        break;

      case 'scenario_offline_test':
        setRole('applicant');
        setApplicantTab('apply');
        if (isOnline) {
          toggleSimulatedOffline();
        }
        addToast('warning', 'Simulated Offline Mode Activated', 'PWA IndexedDB storage active. Forms can be filled and queued without network.');
        break;

      default:
        break;
    }
  };

  // Handle quick navigation from AROHA Mitra bot
  const handleBotNavigate = (targetTab: 'apply' | 'track' | 'guidelines' | 'scrutiny' | 'merit') => {
    if (targetTab === 'apply' || targetTab === 'track' || targetTab === 'guidelines') {
      setRole('applicant');
      setApplicantTab(targetTab);
    } else if (targetTab === 'scrutiny' || targetTab === 'merit') {
      setRole('admin');
      setAdminTab(targetTab);
    }
  };

  // Authentication Handlers
  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    AuthService.setCurrentUser(user);
    setRole(user.role);
    if (user.role === 'applicant') {
      if (user.associatedAppId) {
        setSelectedAppId(user.associatedAppId);
        setApplicantTab('track');
      } else {
        setApplicantTab('apply');
      }
    } else {
      setAdminTab('scrutiny');
    }
    setShowAuthScreen(false);
    addToast(
      'success',
      `Authenticated: ${user.name}`,
      `Signed in to ${user.role === 'admin' ? 'MoTA Official Scrutiny Portal' : 'ST Candidate Fellowship Desk'}.`
    );
  };

  const handleExploreAsGuest = (selectedRole: UserRole) => {
    const guestUser: AuthUser = selectedRole === 'admin' ? DEMO_ADMINS[0] : DEMO_APPLICANTS[0];
    setCurrentUser(guestUser);
    AuthService.setCurrentUser(guestUser);
    setRole(selectedRole);
    setShowAuthScreen(false);
    addToast(
      'info',
      'Guest Explorer Mode',
      `Active as ${selectedRole === 'admin' ? 'MoTA Scrutiny Officer' : 'ST Candidate Scholar'}.`
    );
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setAuthViewTab(role);
    setShowAuthScreen(true);
    addToast('info', 'Signed Out', 'Returned to AROHA Portal Authentication Gateway.');
  };

  const handleOpenAuth = (targetTab?: UserRole) => {
    setAuthViewTab(targetTab || role);
    setShowAuthScreen(true);
  };

  // Dedicated role and portal switcher ensuring complete portal separation
  const handleRoleChange = (newRole: UserRole) => {
    if (newRole !== role) {
      setRole(newRole);
      if (newRole === 'admin') {
        const defaultAdmin = DEMO_ADMINS[0];
        setCurrentUser(defaultAdmin);
        AuthService.setCurrentUser(defaultAdmin);
        setAdminTab('scrutiny');
        addToast(
          'info',
          'Switched to Scrutiny Portal',
          `Welcome, ${defaultAdmin.name}. Viewing MoTA Statutory Scrutiny Desk.`
        );
      } else {
        const defaultApplicant = DEMO_APPLICANTS[0];
        setCurrentUser(defaultApplicant);
        AuthService.setCurrentUser(defaultApplicant);
        setSelectedAppId(defaultApplicant.associatedAppId || 'app_101');
        setApplicantTab('track');
        addToast(
          'info',
          'Switched to Application Portal',
          `Welcome, ${defaultApplicant.name}. Viewing ST Candidate Fellowship Desk.`
        );
      }
    }
  };

  // Starting Screen: Authentication Gateway with separate Admin & Applicant tabs
  if (showAuthScreen) {
    return (
      <>
        <AuthView
          onLogin={handleLogin}
          onExploreAsGuest={handleExploreAsGuest}
          initialTab={authViewTab}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F5] text-slate-900 flex flex-col font-sans antialiased relative selection:bg-amber-200 selection:text-amber-900">
      {/* Real Tribal Photographic Cover Background Layer */}
      {tribalAmbience && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1609137144822-45e3f436d6c7?auto=format&fit=crop&w=2400&q=80"
            alt="Indian Tribal Heritage Texture"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-8 filter brightness-95 contrast-125 saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/10 via-transparent to-amber-950/15" />
        </div>
      )}

      {/* Primary Navigation & Emblem Bar */}
      <Header
        currentRole={role}
        onRoleChange={handleRoleChange}
        isOnline={isOnline}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulatedOffline={toggleSimulatedOffline}
        lastSyncedText={lastSyncedText}
        isSyncing={isSyncing}
        onManualSync={triggerSync}
        onOpenDemoScenarios={() => setIsDemoModalOpen(true)}
        lang={lang}
        onLanguageChange={setLang}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        tribalAmbience={tribalAmbience}
        onToggleAmbience={() => setTribalAmbience(!tribalAmbience)}
      />

      {/* Offline Status & Progress Banner */}
      <OfflineBanner
        isOnline={isOnline}
        isSyncing={isSyncing}
        syncProgress={syncProgress}
        queuedDocsCount={queuedDocsCount}
        onSyncNow={triggerSync}
        onToggleBackOnline={toggleSimulatedOffline}
      />

      {/* Sub-navigation Tabs in Green Forest Theme - Dedicated to Active Portal */}
      <div className="bg-white border-b border-emerald-900/15 shadow-2xs relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-2.5">
            {role === 'applicant' ? (
              <div className="flex items-center gap-2">
                {/* Application Portal Scope Badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-900/10 text-emerald-950 text-xs font-extrabold uppercase tracking-wide mr-1 shrink-0 border border-emerald-800/15">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Application Desk:</span>
                </div>

                <button
                  type="button"
                  onClick={() => setApplicantTab('apply')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    applicantTab === 'apply'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-emerald-950 hover:text-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  <FileEdit className="w-4 h-4" />
                  <span>{t('tabNewApp')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setApplicantTab('track')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    applicantTab === 'track'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-emerald-950 hover:text-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>{t('tabTrack')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setApplicantTab('guidelines')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    applicantTab === 'guidelines'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-emerald-950 hover:text-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{t('tabGuidelines')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Scrutiny Portal Scope Badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-900/10 text-amber-950 text-xs font-extrabold uppercase tracking-wide mr-1 shrink-0 border border-amber-800/15">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Scrutiny Desk:</span>
                </div>

                <button
                  type="button"
                  onClick={() => setAdminTab('scrutiny')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    adminTab === 'scrutiny'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'text-amber-950 hover:text-amber-800 hover:bg-amber-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('tabScrutiny')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab('analytics')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    adminTab === 'analytics'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'text-amber-950 hover:text-amber-800 hover:bg-amber-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>{t('tabAnalytics')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab('merit')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    adminTab === 'merit'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'text-amber-950 hover:text-amber-800 hover:bg-amber-50'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>{t('tabMerit')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab('rules')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    adminTab === 'rules'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'text-amber-950 hover:text-amber-800 hover:bg-amber-50'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>{t('tabRules')}</span>
                </button>
              </div>
            )}

            {/* Micro Reset Data button */}
            <div className="flex items-center gap-2 pl-4">
              <button
                type="button"
                onClick={handleResetData}
                className="text-[11px] font-semibold text-emerald-800/70 hover:text-emerald-900 transition flex items-center gap-1 cursor-pointer"
                title="Reset sample applications to initial seed state"
              >
                <RotateCcw className="w-3 h-3 text-emerald-700" />
                <span className="hidden sm:inline">{t('resetSeed')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {/* Real Tribal Cultural Photographic Cover Banner */}
        <TribalCoverBanner
          currentUser={currentUser}
          currentRole={role}
          tribalAmbience={tribalAmbience}
          onToggleAmbience={() => setTribalAmbience(!tribalAmbience)}
          onOpenHeritageGallery={() => {
            const el = document.getElementById('tribal-heritage-showcase');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
        {role === 'applicant' ? (
          <>
            {applicantTab === 'apply' && (
              <MultiStepForm
                isOnline={isOnline}
                onSubmitSuccess={handleApplicationSubmitted}
                onToast={addToast}
              />
            )}

            {applicantTab === 'track' && (
              <StatusTracker
                applications={applications}
                selectedAppId={selectedAppId}
                onSelectApplication={setSelectedAppId}
                onResolveDeficiency={handleResolveDeficiency}
                isOnline={isOnline}
                onToast={addToast}
              />
            )}

            {applicantTab === 'guidelines' && <SchemeGuidelines />}
          </>
        ) : (
          <>
            {adminTab === 'scrutiny' && (
              <ScrutinyQueue
                applications={applications}
                onOpenScrutiny={(app) => setScrutinyModalApp(app)}
              />
            )}

            {adminTab === 'analytics' && (
              <AnalyticsDashboard stats={INITIAL_SYSTEM_STATS} />
            )}

            {adminTab === 'merit' && (
              <MeritRankingView
                applications={applications}
                onOpenApplication={(app) => setScrutinyModalApp(app)}
              />
            )}

            {adminTab === 'rules' && (
              <RuleEngineConfigView
                currentRules={rules}
                onUpdateRules={setRules}
                onReevaluateAll={handleReevaluateAll}
                onToast={addToast}
              />
            )}
          </>
        )}

        {/* Colorful Indigenous Tribal Art & Heritage Gallery at the bottom */}
        <TribalHeritageGallery lang={lang} />
      </main>

      {/* Scrutiny Detail Modal */}
      {scrutinyModalApp && (
        <ScrutinyModal
          application={scrutinyModalApp}
          onClose={() => setScrutinyModalApp(null)}
          onApprove={handleApproveFromScrutiny}
          onIssueDeficiency={handleIssueDeficiencyFromScrutiny}
          onReject={handleRejectFromScrutiny}
        />
      )}

      {/* Demo Preset Scenarios Modal */}
      <DemoScenariosModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectScenario={handleSelectScenario}
      />

      {/* Floating Micro-Interaction Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Interactive Conversational Assistant Bot (AROHA Mitra) */}
      <ArohaMitraBot lang={lang} onNavigateTab={handleBotNavigate} />

      {/* Green Forest Theme Footer with MoTA Credentials & Tribal Accent */}
      <footer className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-emerald-200 border-t border-emerald-900 mt-auto py-6 text-xs">
        {/* Decorative tribal motif pattern band */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="flex items-center justify-between opacity-30 text-[10px] tracking-widest text-amber-300">
            <span>◆ ❖ ◈ ❖ ◆</span>
            <span className="hidden sm:inline">WARLI • GOND • SANTHAL • DOKRA • SAURA • PITHORA</span>
            <span>◆ ❖ ◈ ❖ ◆</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-amber-400 text-sm tracking-wider">AROHA</span>
            <span className="text-emerald-300">•</span>
            <span className="font-semibold text-white">{t('motaHeader')}</span>
            <span className="text-emerald-400/80 text-[11px] hidden md:inline">| Government of India</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-emerald-300/80 text-[11px]">
            <span className="bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700/60 text-emerald-200 font-semibold">{t('nfstSlots')}</span>
            <span>•</span>
            <span className="bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/60 text-amber-300 font-semibold">{t('nosSlots')}</span>
            <span>•</span>
            <span className="text-emerald-200">PFMS DBT Live</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
