import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  RefreshCw, 
  Languages, 
  Smartphone,
  ChevronDown,
  Palette,
  LogOut,
  User,
  Key,
  GraduationCap,
  ArrowRightLeft
} from 'lucide-react';
import { UserRole, AuthUser } from '../types/scholarship';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { LanguageCode, SUPPORTED_LANGUAGES, getTranslation } from '../utils/translations';
import { useLanguage } from '../context/LanguageContext';
import { Avatar } from './Avatar';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isOnline: boolean;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  lastSyncedText: string;
  isSyncing: boolean;
  onManualSync: () => void;
  onOpenDemoScenarios: () => void;
  lang?: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentUser?: AuthUser | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  tribalAmbience?: boolean;
  onToggleAmbience?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  isOnline,
  isSimulatedOffline,
  onToggleSimulatedOffline,
  lastSyncedText,
  isSyncing,
  onManualSync,
  onOpenDemoScenarios,
  lang: propLang,
  onLanguageChange,
  currentUser,
  onOpenAuth,
  onLogout,
  tribalAmbience,
  onToggleAmbience,
}) => {
  const { lang: contextLang, t } = useLanguage();
  const activeLang = propLang || contextLang;
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === activeLang) || SUPPORTED_LANGUAGES[0];

  return (
    <header id="main-header" className="bg-white border-b border-emerald-900/15 sticky top-0 z-40 shadow-xs">
      {/* Top micro-bar for Government of India / MoTA credentials with Forest Green theme */}
      <div className="bg-emerald-950 text-emerald-200 text-xs px-4 sm:px-8 py-1.5 flex items-center justify-between border-b border-emerald-900">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-emerald-100">{t('motaHeader')}</span>
          <span className="hidden sm:inline text-emerald-600">•</span>
          <span className="hidden sm:inline text-emerald-300/80">{t('motaTagline')}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-400/80 text-[11px] hidden md:inline">{t('govtSchemes', 'Govt Schemes:')}</span>
          <span className="bg-emerald-900/90 text-emerald-200 border border-emerald-700/60 px-2 py-0.5 rounded text-[11px] font-semibold">
            {t('nfstSlots')}
          </span>
          <span className="bg-amber-950/80 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded text-[11px] font-semibold">
            {t('nosSlots')}
          </span>
        </div>
      </div>

      {/* Main navigation & controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Forest Emblem */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 p-2 text-white shadow-md flex items-center justify-center border border-emerald-600/50">
            {/* Sacred Forest Tree & Sun Tribal Emblem */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-amber-300">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              <path d="m19 12-4-4 4-4" />
              <path d="m5 12 4 4-4 4" />
            </svg>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-stone-950 shadow-xs">
              AI
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-emerald-950">
                {t('portalName')}
              </h1>
              <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-300">
                {t('versionBadge')}
              </span>
            </div>
            <p className="text-xs text-emerald-800/80 font-medium hidden sm:block">
              {t('portalSubtitle')}
            </p>
          </div>
        </div>

        {/* Center/Right: Language Selector, Role Switcher & Utility actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Multilingual Selector Dropdown */}
          <div className="relative">
            <button
              id="language-selector-btn"
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100 transition cursor-pointer"
              title="Change Portal Language"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-700" />
              <span>{currentLangObj.nativeName}</span>
              <ChevronDown className={`w-3 h-3 text-emerald-600 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-emerald-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 border-b border-emerald-100">
                  {t('selectLanguage', 'Select Language')}
                </div>
                {SUPPORTED_LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      onLanguageChange(item.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition cursor-pointer ${
                      activeLang === item.code
                        ? 'bg-emerald-100 text-emerald-950 font-bold'
                        : 'text-slate-700 hover:bg-emerald-50'
                    }`}
                  >
                    <span>{item.nativeName}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Demo Persona Launcher */}
          <button
            id="demo-scenarios-btn"
            type="button"
            onClick={onOpenDemoScenarios}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 hover:bg-amber-100 transition cursor-pointer"
            title="Load realistic candidate personas and test cases"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">{t('demoScenarios')}</span>
          </button>

          {/* Offline Mode Simulator Toggle */}
          <button
            id="toggle-offline-btn"
            type="button"
            onClick={onToggleSimulatedOffline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              !isOnline
                ? 'bg-orange-50 text-orange-800 border-orange-300 hover:bg-orange-100'
                : 'bg-emerald-50/50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
            }`}
            title="Toggle offline state to test PWA offline queue and auto-sync"
          >
            {!isOnline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                <span className="font-semibold">{t('simulatedOffline')}</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('online')}</span>
              </>
            )}
          </button>

          {/* Sync Trigger / Last Synced info */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-50/40 border border-emerald-200 text-xs text-emerald-900">
            <button
              type="button"
              onClick={onManualSync}
              disabled={isSyncing || !isOnline}
              className="hover:text-emerald-700 transition-colors disabled:opacity-40 cursor-pointer"
              title="Click to force background sync"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-700' : ''}`} />
            </button>
            <span className="text-[11px]">
              {isSyncing ? t('syncing') : lastSyncedText}
            </span>
          </div>

          {/* PWA Install Button */}
          {isInstallable && !isInstalled && (
            <button
              id="pwa-install-header-btn"
              type="button"
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('installApp')}</span>
            </button>
          )}

          {/* iOS Safari Guide Button */}
          {isIOS && !isInstalled && (
            <button
              type="button"
              onClick={() => setShowIOSPrompt(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-300 text-emerald-900 hover:bg-emerald-50"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('installIos', 'Install iOS')}</span>
            </button>
          )}

          {/* Tribal Atmosphere Background Toggle */}
          {onToggleAmbience && (
            <button
              id="toggle-tribal-ambience-btn"
              type="button"
              onClick={onToggleAmbience}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                tribalAmbience
                  ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-2xs font-bold'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              }`}
              title="Toggle authentic tribal photographic background cover atmosphere"
            >
              <Palette className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden lg:inline">{tribalAmbience ? '🌾 Tribal Atmosphere: Active' : '🌾 Tribal Atmosphere: Off'}</span>
            </button>
          )}

          {/* Active Dedicated Portal Badge (Switching removed during session per user request; portal chosen at start) */}
          <div className="flex items-center p-1 bg-emerald-950/10 rounded-2xl border border-emerald-900/15">
            {currentRole === 'applicant' ? (
              <div 
                id="active-application-portal-badge"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold shadow-xs"
                title="Active: Scheduled Tribe Candidate Application Portal"
              >
                <GraduationCap className="w-4 h-4 text-amber-300" />
                <span>Application Portal</span>
                <span className="hidden sm:inline text-[10px] px-2 py-0.5 bg-emerald-950/70 text-emerald-200 rounded-full font-medium">
                  ST Scholars
                </span>
              </div>
            ) : (
              <div 
                id="active-scrutiny-portal-badge"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-800 text-white text-xs font-bold shadow-xs"
                title="Active: MoTA Statutory Scrutiny & Verification Desk"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Scrutiny Portal</span>
                <span className="hidden sm:inline text-[10px] px-2 py-0.5 bg-amber-950/70 text-amber-200 rounded-full font-medium">
                  MoTA Officials
                </span>
              </div>
            )}
          </div>

          {/* Authenticated User Profile Pill & Portal Switcher with Graphical Avatar */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-2xl bg-emerald-900/10 hover:bg-emerald-900/15 border border-emerald-800/20 text-xs transition cursor-pointer"
                title="View logged-in profile or switch user"
              >
                <Avatar
                  type={currentUser.avatarType}
                  name={currentUser.name}
                  role={currentUser.role}
                  size="xs"
                />
                <div className="text-left hidden md:block">
                  <div className="font-bold text-emerald-950 text-[11px] leading-tight truncate max-w-[110px]">
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div className="text-[9px] text-emerald-700 font-medium">
                    {currentUser.role === 'admin' ? 'MoTA Officer' : 'ST Candidate'}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-emerald-700" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-emerald-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-emerald-100">
                    <div className="text-xs font-bold text-emerald-950">{currentUser.name}</div>
                    <div className="text-[10px] text-emerald-700 truncate">{currentUser.email}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {currentUser.designation || currentUser.identifier}
                    </div>
                  </div>

                  <div className="p-1.5 space-y-1">
                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Sign Out & Select Portal</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition cursor-pointer"
                title="Sign in with Admin or Applicant credentials"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Portal Login</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* iOS Install Prompt Dialog */}
      {showIOSPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-emerald-300">
            <h3 className="text-base font-bold text-emerald-950">{t('installArohaIos', 'Install AROHA on iPhone / iPad')}</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              1. {t('iosStep1', 'Tap the Share icon at the bottom of Safari.')}<br />
              2. {t('iosStep2', 'Scroll down and choose Add to Home Screen.')}<br />
              3. {t('iosStep3', 'You can now launch AROHA with full offline PWA functionality!')}
            </p>
            <button
              type="button"
              onClick={() => setShowIOSPrompt(false)}
              className="mt-4 w-full rounded-xl bg-emerald-800 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
            >
              {t('done', 'Done')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
