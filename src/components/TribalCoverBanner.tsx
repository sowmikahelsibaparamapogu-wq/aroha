import React, { useState } from 'react';
import { Sparkles, Palette, Award, Compass, ChevronDown, ChevronUp, MapPin, Users, HeartHandshake } from 'lucide-react';
import { AuthUser, UserRole } from '../types/scholarship';
import { useLanguage } from '../context/LanguageContext';

interface TribalCoverBannerProps {
  currentUser: AuthUser | null;
  currentRole: UserRole;
  tribalAmbience: boolean;
  onToggleAmbience: () => void;
  onOpenHeritageGallery: () => void;
}

export const TribalCoverBanner: React.FC<TribalCoverBannerProps> = ({
  currentUser,
  currentRole,
  tribalAmbience,
  onToggleAmbience,
  onOpenHeritageGallery,
}) => {
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-3xl mb-6 shadow-xl border border-amber-900/30 group">
      {/* Real Photographic Tribal Art & Heritage Background Cover */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1609137144822-45e3f436d6c7?auto=format&fit=crop&w=2000&q=85"
          alt="Traditional Indian Tribal Heritage and Living Indigenous Art"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-50 contrast-110 saturate-125 transition-transform duration-700 group-hover:scale-102"
        />
        {/* Layered Rich Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/85 to-amber-950/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-emerald-950/90" />
        
        {/* Top & Bottom Tribal Border Accents */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400 opacity-80" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 opacity-80" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-5 sm:p-7 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Persona Context & Cultural Title */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Indigenous Heritage & Higher Education Gateway</span>
              </span>

              {currentUser?.community && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-800/60 border border-emerald-600/40 text-emerald-200 text-[11px] font-semibold">
                  <Users className="w-3 h-3 text-emerald-300" />
                  <span>{currentUser.community} Tribe ({currentUser.state || 'India'})</span>
                </span>
              )}

              <span className="text-[11px] bg-stone-900/60 text-stone-300 px-2 py-0.5 rounded-md border border-stone-700/50">
                MoTA Statutory Oversight
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>National Tribal Scholars & Fellowship Mission</span>
            </h2>

            {!isCollapsed && (
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Celebrating the vibrant cultures, languages, and indigenous knowledge of over 705 Scheduled Tribes across India. Providing transparent AI-assisted merit screening, direct DBT fellowship disbursements, and statutory overseas research opportunities.
              </p>
            )}
          </div>

          {/* Right: Quick Action Buttons & Ambience Toggle */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
            {/* Tribal Ambience Toggle */}
            <button
              type="button"
              onClick={onToggleAmbience}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all backdrop-blur-md cursor-pointer ${
                tribalAmbience
                  ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-950/40'
                  : 'bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60'
              }`}
              title="Toggle authentic tribal photographic cover atmosphere across the interface"
            >
              <Palette className="w-4 h-4 text-amber-900 sm:text-inherit" />
              <span>{tribalAmbience ? '🌾 Tribal Cover: Active' : '🌾 Tribal Cover: Classic'}</span>
            </button>

            {/* Explore Tribal Art Traditions */}
            <button
              type="button"
              onClick={onOpenHeritageGallery}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-950/70 hover:bg-amber-900 text-amber-200 border border-amber-700/60 transition backdrop-blur-md cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>GI Art & Cultural Gallery</span>
            </button>

            {/* Collapse / Expand toggle */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 transition cursor-pointer"
              title={isCollapsed ? 'Expand banner' : 'Collapse banner'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Highlight Badges when expanded */}
        {!isCollapsed && (
          <div className="mt-4 pt-4 border-t border-emerald-800/40 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-emerald-950/50 border border-emerald-800/40 rounded-xl p-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <div>
                <div className="font-bold text-white text-[11px]">750 NFST Fellowships</div>
                <div className="text-[10px] text-emerald-300">Ph.D. & M.Phil Scholars</div>
              </div>
            </div>

            <div className="bg-emerald-950/50 border border-emerald-800/40 rounded-xl p-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <div>
                <div className="font-bold text-white text-[11px]">20 Global NOS Slots</div>
                <div className="text-[10px] text-emerald-300">Oxford, Cambridge, Imperial</div>
              </div>
            </div>

            <div className="bg-emerald-950/50 border border-emerald-800/40 rounded-xl p-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <div>
                <div className="font-bold text-white text-[11px]">30% Women ST Quota</div>
                <div className="text-[10px] text-amber-300">Statutory Gender Parity</div>
              </div>
            </div>

            <div className="bg-emerald-950/50 border border-emerald-800/40 rounded-xl p-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <div>
                <div className="font-bold text-white text-[11px]">PFMS Aadhaar DBT</div>
                <div className="text-[10px] text-teal-300">Direct Account Transfer</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
