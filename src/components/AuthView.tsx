import React, { useState } from 'react';
import { 
  ShieldCheck, 
  GraduationCap, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Key, 
  Globe, 
  Sparkles, 
  ChevronRight,
  UserCheck,
  Building2
} from 'lucide-react';
import { AuthUser, UserRole } from '../types/scholarship';
import { DEMO_APPLICANTS, DEMO_ADMINS } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../utils/translations';
import { Avatar } from './Avatar';

interface AuthViewProps {
  onLogin: (user: AuthUser) => void;
  onExploreAsGuest: (role: UserRole) => void;
  initialTab?: UserRole;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onExploreAsGuest, initialTab = 'applicant' }) => {
  const { lang, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<UserRole>(initialTab);

  // Form input states
  const [applicantIdentifier, setApplicantIdentifier] = useState('NFST/2025/0812');
  const [applicantPassword, setApplicantPassword] = useState('••••••••••••');
  
  const [adminIdentifier, setAdminIdentifier] = useState('soren.r@mota.gov.in');
  const [adminPasscode, setAdminPasscode] = useState('••••••••••••');
  const [adminDesk, setAdminDesk] = useState('Desk-IV (Statutory Scrutiny)');

  const [rememberMe, setRememberMe] = useState(true);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Authenticate from form inputs
  const handleApplicantFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = DEMO_APPLICANTS.find(
      (a) => a.identifier.toLowerCase() === applicantIdentifier.trim().toLowerCase() ||
             a.email.toLowerCase() === applicantIdentifier.trim().toLowerCase()
    );

    if (matched) {
      onLogin(matched);
    } else {
      const customUser: AuthUser = {
        id: `user_${Date.now()}`,
        role: 'applicant',
        name: applicantIdentifier.includes('@') ? applicantIdentifier.split('@')[0] : 'ST Applicant',
        email: applicantIdentifier.includes('@') ? applicantIdentifier : 'applicant@tribal.gov.in',
        identifier: applicantIdentifier.trim() || 'NFST/2025/CUSTOM',
        designation: 'ST Fellow / Candidate',
        community: 'Scheduled Tribe',
        state: 'All India',
        scheme: applicantIdentifier.toUpperCase().includes('NOS') ? 'NOS' : 'NFST',
        avatarType: 'scholar_male',
      };
      onLogin(customUser);
    }
  };

  const handleAdminFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = DEMO_ADMINS.find(
      (a) => a.identifier.toLowerCase() === adminIdentifier.trim().toLowerCase() ||
             a.email.toLowerCase() === adminIdentifier.trim().toLowerCase()
    );

    if (matched) {
      onLogin(matched);
    } else {
      const customAdmin: AuthUser = {
        id: `admin_${Date.now()}`,
        role: 'admin',
        name: adminIdentifier.includes('@') ? adminIdentifier.split('@')[0] : 'MoTA Scrutiny Officer',
        email: adminIdentifier.includes('@') ? adminIdentifier : 'admin@mota.gov.in',
        identifier: adminIdentifier.trim() || 'MOTA-OFFICER',
        designation: adminDesk || 'Desk Scrutiny Officer',
        department: 'Ministry of Tribal Affairs, Shastri Bhawan',
        avatarType: 'officer_male',
      };
      onLogin(customAdmin);
    }
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden font-sans text-slate-900">
      {/* Real Tribal Photographic Cover Background Layer with Soft Light Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1609137144822-45e3f436d6c7?auto=format&fit=crop&w=2400&q=85"
          alt="Indian Indigenous Folk Art and Cultural Motifs"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-95 contrast-105 saturate-120 opacity-30"
        />
        {/* Crisp White Translucent Wash Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-[#F8FAF9]/92 to-white/96 backdrop-blur-[1.5px]" />
        
        {/* Subtle Decorative Geometric Tribal Border Motif */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-800 via-amber-500 to-emerald-800 shadow-xs" />
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-emerald-700 to-amber-600 shadow-xs" />
      </div>

      {/* Top Bar: Official Branding & Multilingual Switcher */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-800 text-amber-300 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-emerald-900 rounded-[14px] flex items-center justify-center">
              <span className="text-xl font-black text-amber-300">अ</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-emerald-900 uppercase">
                {t('motaHeader', 'Ministry of Tribal Affairs')}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 font-bold">
                Govt. of India
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>AROHA</span>
              <span className="text-emerald-800 font-semibold text-xs sm:text-sm">
                • {t('portalSubtitle', 'Tribal Scholarship & Fellowship Management System')}
              </span>
            </h1>
          </div>
        </div>

        {/* Language Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <span>{currentLangObj.nativeName}</span>
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-100">
                {t('selectLanguage', 'Select Language')}
              </div>
              {SUPPORTED_LANGUAGES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code);
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition cursor-pointer ${
                    lang === item.code
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.nativeName}</span>
                  <span className="text-[10px] text-slate-400">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col justify-center">
        {/* Cultural Welcome Header & Clear Question At Start */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>National Tribal Fellowship & Higher Education Mission</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            Which portal would you like to access?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
            Select your designated portal below to proceed with your authentication credentials.
          </p>
        </div>

        {/* PRIMARY PORTAL SELECTION AT START: Two Distinct Choice Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto w-full mb-6">
          {/* Option 1: Application Portal */}
          <button
            type="button"
            onClick={() => setActiveTab('applicant')}
            className={`relative text-left p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-xs ${
              activeTab === 'applicant'
                ? 'bg-white border-emerald-700 shadow-md ring-2 ring-emerald-600/20'
                : 'bg-white/80 hover:bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            {activeTab === 'applicant' && (
              <div className="absolute top-3.5 right-3.5 flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Selected</span>
              </div>
            )}
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="text-base font-extrabold text-slate-900">Application Portal</div>
            <div className="text-xs font-semibold text-emerald-800 mt-0.5">For ST Scholars & Fellowship Candidates</div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
              Submit fresh fellowship applications, upload caste certificates, resolve deficiency notices, and track PFMS DBT disbursements.
            </p>
          </button>

          {/* Option 2: Scrutiny Portal */}
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`relative text-left p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-xs ${
              activeTab === 'admin'
                ? 'bg-white border-amber-700 shadow-md ring-2 ring-amber-600/20'
                : 'bg-white/80 hover:bg-white border-slate-200 hover:border-amber-300'
            }`}
          >
            {activeTab === 'admin' && (
              <div className="absolute top-3.5 right-3.5 flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                <span>Selected</span>
              </div>
            )}
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-base font-extrabold text-slate-900">Scrutiny Portal</div>
            <div className="text-xs font-semibold text-amber-800 mt-0.5">For MoTA Scrutiny Officers & Verifiers</div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
              Inspect AI-OCR document discrepancies, review queue eligibility, allocate merit rankings, and manage statutory scheme rules.
            </p>
          </button>
        </div>

        {/* Crisp White Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl max-w-4xl mx-auto w-full">
          {activeTab === 'applicant' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Applicant Form */}
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                    <h3 className="text-base font-bold text-slate-900">ST Candidate Login Desk</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Sign in with your AROHA Application ID or registered email/mobile.
                  </p>
                </div>

                <form onSubmit={handleApplicantFormSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Application ID / Registered Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={applicantIdentifier}
                        onChange={(e) => setApplicantIdentifier(e.target.value)}
                        placeholder="e.g. NFST/2025/0812 or email"
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Password / Aadhaar OTP / DOB
                      </label>
                      <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] text-emerald-700 font-medium hover:underline">
                        Forgot ID?
                      </a>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={applicantPassword}
                        onChange={(e) => setApplicantPassword(e.target.value)}
                        placeholder="Enter password or Aadhaar OTP"
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                      />
                      <span>Remember on this device</span>
                    </label>
                    <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      PFMS & DigiLocker Synced
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/20 transition cursor-pointer mt-2"
                  >
                    <span>Login to Candidate Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Need to submit a fresh application?</span>
                  <button
                    type="button"
                    onClick={() => {
                      const fresh = DEMO_APPLICANTS.find((a) => a.id === 'user_fresh') || DEMO_APPLICANTS[0];
                      onLogin(fresh);
                    }}
                    className="text-emerald-800 font-bold hover:underline cursor-pointer"
                  >
                    Register New ST Scholar
                  </button>
                </div>
              </div>

              {/* Right Column: Instant 1-Click Demo Credentials */}
              <div className="lg:col-span-6 bg-[#F8FAF9] rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Quick Demo One-Click Access
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Pre-seeded cases</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Select any candidate persona below to immediately test live verification, deficiency resolution, or DBT flows:
                </p>

                <div className="space-y-2">
                  {DEMO_APPLICANTS.map((applicant) => (
                    <button
                      key={applicant.id}
                      type="button"
                      onClick={() => onLogin(applicant)}
                      className="w-full text-left p-3 rounded-xl bg-white hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-400 transition flex items-center justify-between group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          type={applicant.avatarType}
                          name={applicant.name}
                          role="applicant"
                          size="md"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition flex items-center gap-1.5">
                            <span>{applicant.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold border border-emerald-200">
                              {applicant.scheme}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-600 font-medium">
                            {applicant.community} Tribe • {applicant.state}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                            {applicant.department || applicant.designation}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Admin Form */}
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
                    <h3 className="text-base font-bold text-slate-900">Ministry Scrutiny Officer Login</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Official Directorate of Tribal Welfare access for document verification and DBT sanctions.
                  </p>
                </div>

                <form onSubmit={handleAdminFormSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Government Email / NIC ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={adminIdentifier}
                        onChange={(e) => setAdminIdentifier(e.target.value)}
                        placeholder="e.g. officer@mota.gov.in or NIC ID"
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Officer Passcode / 2FA Security Key
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Key className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={adminPasscode}
                        onChange={(e) => setAdminPasscode(e.target.value)}
                        placeholder="Enter 2FA Key or Passcode"
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assigned Desk & Role Jurisdiction
                    </label>
                    <select
                      value={adminDesk}
                      onChange={(e) => setAdminDesk(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-600 rounded-xl text-xs text-slate-900 outline-none transition cursor-pointer"
                    >
                      <option value="Desk-IV (Statutory Scrutiny)">Desk-IV (Statutory Scrutiny & OCR Verification)</option>
                      <option value="Merit Allocation Board">National Merit Committee & 30% Women ST Quota</option>
                      <option value="DBT Comptroller Desk">PFMS DBT Disbursement & Aadhaar Bridge Authority</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-800 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-900/20 transition cursor-pointer mt-2"
                  >
                    <span>Sign In to MoTA Scrutiny Desk</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Official Government Network Protected</span>
                  <span className="text-amber-800 font-bold">MoTA Shastri Bhawan</span>
                </div>
              </div>

              {/* Right Column: Instant 1-Click Demo Admin Accounts */}
              <div className="lg:col-span-6 bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                    Authorized MoTA Official Profiles
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">One-Click Testing</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Select an official desk persona to review applications, inspect AI OCR discrepancies, or adjust statutory rule weights:
                </p>

                <div className="space-y-2">
                  {DEMO_ADMINS.map((admin) => (
                    <button
                      key={admin.id}
                      type="button"
                      onClick={() => onLogin(admin)}
                      className="w-full text-left p-3 rounded-xl bg-white hover:bg-amber-50/80 border border-slate-200 hover:border-amber-400 transition flex items-center justify-between group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          type={admin.avatarType}
                          name={admin.name}
                          role="admin"
                          size="md"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition flex items-center gap-1.5">
                            <span>{admin.name}</span>
                          </div>
                          <div className="text-[10px] text-amber-800 font-semibold">
                            {admin.designation}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                            {admin.department}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 transition transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Explore as Guest for Selected Portal */}
        <div className="mt-5 text-center flex items-center justify-center gap-4 text-xs text-slate-600">
          <span>Just exploring?</span>
          {activeTab === 'applicant' ? (
            <button
              type="button"
              onClick={() => onExploreAsGuest('applicant')}
              className="text-emerald-800 hover:text-emerald-900 font-bold hover:underline cursor-pointer"
            >
              Enter Application Portal as Guest Scholar →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onExploreAsGuest('admin')}
              className="text-amber-800 hover:text-amber-900 font-bold hover:underline cursor-pointer"
            >
              Enter Scrutiny Portal as Guest Officer →
            </button>
          )}
        </div>
      </main>

      {/* Footer: Statutory Footnote & Cultural Tribute */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-600 bg-white/70 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <span>© 2025 Ministry of Tribal Affairs (MoTA), Government of India</span>
          <span>•</span>
          <span className="text-emerald-800 font-semibold">National Tribal Welfare Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Celebrating Indigenous Artistry & Heritage:</span>
          <span className="text-emerald-800 font-medium">Warli • Gond • Santhal • Dokra • Saura</span>
        </div>
      </footer>
    </div>
  );
};
