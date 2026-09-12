import React, { useState } from 'react';
import { Sparkles, X, ExternalLink, Info, Award, MapPin, Users, Palette, Compass } from 'lucide-react';
import { LanguageCode, getTranslation } from '../utils/translations';
import { useLanguage } from '../context/LanguageContext';

interface TribalArtItem {
  id: string;
  title: string;
  nativeTitle: string;
  tribe: string;
  state: string;
  colorScheme: string;
  borderAccent: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  culturalStory: string;
  visualType: 'warli' | 'gond' | 'santhal' | 'dokra' | 'saura' | 'pithora';
  motifs: string[];
}

interface TribalHeritageGalleryProps {
  lang?: LanguageCode;
}

export const TribalHeritageGallery: React.FC<TribalHeritageGalleryProps> = ({ lang: propLang }) => {
  const { lang: contextLang, t: contextT } = useLanguage();
  const currentLang = propLang || contextLang;
  const [selectedArt, setSelectedArt] = useState<TribalArtItem | null>(null);

  const t = (key: string, fallback?: string) => {
    if (contextT) return contextT(key, fallback);
    return getTranslation(key, currentLang) || fallback || key;
  };

  const tribalArtList: TribalArtItem[] = [
    {
      id: 'warli',
      title: 'Warli Folk Painting',
      nativeTitle: 'वारली भित्तिचित्र',
      tribe: 'Warli & Malkhar Koli',
      state: 'Maharashtra & Gujarat',
      colorScheme: 'from-amber-900 via-orange-950 to-red-950',
      borderAccent: 'border-amber-600/40',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeText: 'Tarpa Dance & Circle of Life',
      description: 'Sacred rhythmic wall paintings created using white rice paste, gum, and bamboo twigs on red-ochre mud backgrounds depicting harmony between humans, sacred trees, and wildlife.',
      culturalStory: 'Warli art dates back thousands of years. Its iconic Tarpa dance features men and women interlocking arms in a spiraling circle representing the eternal cycle of birth and seasons, with no single leader at the head. MoTA recognizes Warli master artisans under national fellowship schemes.',
      visualType: 'warli',
      motifs: ['Tarpa Horn Musician', 'Spiraling Circle Dance', 'Sun & Moon Deities', 'Peacock in Paddy Fields'],
    },
    {
      id: 'gond',
      title: 'Pardhan Gond Painting',
      nativeTitle: 'गोंडी पारंपरिक चित्रकला',
      tribe: 'Gond & Pardhan',
      state: 'Madhya Pradesh & Adilabad (Telangana)',
      colorScheme: 'from-emerald-900 via-teal-950 to-green-950',
      borderAccent: 'border-emerald-500/40',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      badgeText: 'Sacred Mahua & Animal Totems',
      description: 'Polychromatic visionary art where every space is filled with intricate dots, lines, and scales. Each Gond clan family possesses a unique signature patterning style.',
      culturalStory: 'According to Gond belief, viewing a good painting brings good luck and wards off misfortune. The sacred Mahua and Saja trees form the central axis connecting the ancestral underground, human forest life, and the celestial sky. The Gond community represents one of the largest beneficiaries under NFST fellowship grants.',
      visualType: 'gond',
      motifs: ['Tree of Life (Mahua)', 'Mystic Blue Deer', 'Polka-Dot Peacock', 'Sacred Fish of Narmada'],
    },
    {
      id: 'santhal',
      title: 'Santhal Scroll & Village Art',
      nativeTitle: 'ᱥᱟᱱᱛᱟᱲ ᱪᱤᱛᱟᱹᱨ ᱟᱨ ᱞᱟᱠᱪᱟᱨ',
      tribe: 'Santhal (Kherwal)',
      state: 'Jharkhand, Odisha & West Bengal',
      colorScheme: 'from-rose-900 via-red-950 to-amber-950',
      borderAccent: 'border-rose-500/40',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      badgeText: 'Karam Festival & Mandar Beats',
      description: 'Vibrant portrayals of village community harmony, flute musicians, Mandar drummers, Sarhul flower offerings, and traditional red-bordered Panchhi attire.',
      culturalStory: 'The Santhals have preserved a deep egalitarian community structure. Their paintings, often drawn on home entrances (Jadu Patua), celebrate Baha (flower fest) and Karam. Santhal scholars, like pioneering Ol Chiki educator Pandit Raghunath Murmu, inspire thousands of tribal researchers funded by AROHA.',
      visualType: 'santhal',
      motifs: ['Mandar & Tamak Drums', 'Tiryo (Bamboo Flute)', 'Baha Mahua Blossoms', 'Red-Bordered Panchhi'],
    },
    {
      id: 'dokra',
      title: 'Dokra Non-Ferrous Bell Metal Craft',
      nativeTitle: 'बस्तर ढोकरा धातु शिल्प',
      tribe: 'Ghadwa & Maria Gond',
      state: 'Bastar (Chhattisgarh) & Odisha',
      colorScheme: 'from-yellow-900 via-amber-950 to-stone-900',
      borderAccent: 'border-yellow-600/40',
      badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-300',
      badgeText: '4,000-Year-Old Lost-Wax Technique',
      description: 'Ancient Indus Valley-descended Cire-Perdue (lost-wax) metal casting technique using pure beeswax coils, river clay, and molten bell metal alloy.',
      culturalStory: 'Dokra crafts are prized worldwide for their organic primitive elegance, with wire-textured surfaces representing tribal deities, galloping forest horses, elephants, and ritual lamps. In Bastar, each Dokra artifact is completely unique since the clay mold must be broken to release the molten metal sculpture.',
      visualType: 'dokra',
      motifs: ['Bastar Forest Horse', 'Tribal Horn Blower', 'Diya Oil Lamp Bearer', 'Beeswax Wire Coils'],
    },
    {
      id: 'saura',
      title: 'Saura Idital Sacred Wall Art',
      nativeTitle: 'ସୌରା ଇଡିତାଲ୍ କଳା',
      tribe: 'Saura (Lanjia Saura)',
      state: 'Rayagada & Gajapati (Odisha)',
      colorScheme: 'from-teal-900 via-cyan-950 to-emerald-950',
      borderAccent: 'border-teal-500/40',
      badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
      badgeText: 'Ancestral Idital Dedication',
      description: 'Geometric symbolic icons framed within fish-bone borders dedicated to ancestral spirits (Idital), capturing forest foraging, elephants, and community gatherings.',
      culturalStory: 'Unlike purely decorative paintings, Saura Iditals are sacred visual prayers drawn by Kudangs (tribal priests) on home walls. They mark major milestones like bountiful paddy harvests or child blessings. The stick figures with triangular torsos capture the spirit of collective tribal solidarity.',
      visualType: 'saura',
      motifs: ['Fish-Bone Geometric Border', 'Ancestral Tree of Kinship', 'Forest Elephant Herd', 'Grain Carrier Procession'],
    },
    {
      id: 'pithora',
      title: 'Pithora Sacred Wall Frescoes',
      nativeTitle: 'पिथोरा देव भित्तिचित्र',
      tribe: 'Rathwa & Bhil',
      state: 'Chhota Udepur (Gujarat) & MP',
      colorScheme: 'from-orange-900 via-amber-950 to-stone-950',
      borderAccent: 'border-orange-500/40',
      badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
      badgeText: 'Pithora Baba Equine Fresco',
      description: 'Ceremonial wall murals painted exclusively by Lakhara master painters, centering sacred blue and red horses of Baba Pithora, celestial deities, and harvest grains.',
      culturalStory: 'Pithora is a consecrated ritual of Thanksgiving performed by Rathwa tribal families when wishes are fulfilled. The entire living room wall is purified with cow dung and Mahua liquor before sacred horses are painted with songs chanted all night by Badva shamans.',
      visualType: 'pithora',
      motifs: ['Pithora Baba Sacred Horse', 'Rani Kajal Totem', 'Farmer with Wooden Plough', 'Sun & Morning Star'],
    },
  ];

  // Helper to render authentic tribal SVG art motifs
  const renderTribalArtMotif = (type: TribalArtItem['visualType']) => {
    switch (type) {
      case 'warli':
        return (
          <svg viewBox="0 0 200 140" className="w-full h-36 drop-shadow-md">
            <rect width="200" height="140" fill="#78281f" rx="10" />
            {/* Sun & Moon */}
            <circle cx="28" cy="24" r="9" fill="#fcf9f2" />
            <path d="M 28 8 L 28 12 M 28 36 L 28 40 M 12 24 L 16 24 M 40 24 L 44 24" stroke="#fcf9f2" strokeWidth="2" strokeLinecap="round" />
            <path d="M 172 18 A 8 8 0 1 1 164 26 A 7 7 0 0 0 172 18 Z" fill="#fcf9f2" />
            {/* Sacred Tree */}
            <path d="M 35 125 L 35 85 M 35 105 L 18 90 M 35 95 L 50 82 M 35 85 L 20 70 M 35 80 L 48 68 M 35 70 L 35 60" stroke="#fcf9f2" strokeWidth="2.5" strokeLinecap="round" />
            {/* Tarpa Player Center */}
            <circle cx="100" cy="62" r="5" fill="#fcf9f2" />
            <polygon points="100,67 94,82 106,82" fill="#fcf9f2" />
            <polygon points="100,97 94,82 106,82" fill="#fcf9f2" />
            <path d="M 100 97 L 94 116 M 100 97 L 106 116" stroke="#fcf9f2" strokeWidth="2.5" strokeLinecap="round" />
            {/* Tarpa Horn Instrument */}
            <path d="M 100 70 Q 115 65 122 50 Q 128 40 135 38" stroke="#fcf9f2" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Circle Dancers around Tarpa */}
            {[
              { cx: 70, cy: 68 }, { cx: 82, cy: 45 }, { cx: 118, cy: 45 }, { cx: 130, cy: 68 },
              { cx: 122, cy: 92 }, { cx: 78, cy: 92 }, { cx: 60, cy: 80 }, { cx: 140, cy: 80 }
            ].map((p, i) => (
              <g key={i}>
                <circle cx={p.cx} cy={p.cy - 12} r="3.5" fill="#fcf9f2" />
                <polygon points={`${p.cx},${p.cy - 8} ${p.cx - 4},${p.cy} ${p.cx + 4},${p.cy}`} fill="#fcf9f2" />
                <polygon points={`${p.cx},${p.cy + 8} ${p.cx - 4},${p.cy} ${p.cx + 4},${p.cy}`} fill="#fcf9f2" />
                <path d={`M ${p.cx} ${p.cy + 8} L ${p.cx - 3} ${p.cy + 18} M ${p.cx} ${p.cy + 8} L ${p.cx + 3} ${p.cy + 18}`} stroke="#fcf9f2" strokeWidth="2" strokeLinecap="round" />
                <path d={`M ${p.cx - 4} ${p.cy - 4} Q ${p.cx} ${p.cy - 8} ${p.cx + 4} ${p.cy - 4}`} stroke="#fcf9f2" strokeWidth="1.5" fill="none" />
              </g>
            ))}
            {/* Traditional Warli bottom triangular border */}
            <path d="M 5 133 L 15 125 L 25 133 L 35 125 L 45 133 L 55 125 L 65 133 L 75 125 L 85 133 L 95 125 L 105 133 L 115 125 L 125 133 L 135 125 L 145 133 L 155 125 L 165 133 L 175 125 L 185 133 L 195 125" stroke="#fcf9f2" strokeWidth="2" fill="none" />
          </svg>
        );

      case 'gond':
        return (
          <svg viewBox="0 0 200 140" className="w-full h-36 drop-shadow-md">
            <defs>
              <linearGradient id="gondGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#064e3b" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
            </defs>
            <rect width="200" height="140" fill="url(#gondGrad)" rx="10" />
            {/* Gond Stylized Peacock with Polychromatic Feather Patterns */}
            <path d="M 55 110 C 60 70 80 40 120 45 C 140 48 155 65 150 90 C 145 110 110 125 55 110 Z" fill="#0284c7" />
            {/* Gond dot patterns */}
            {[...Array(16)].map((_, i) => (
              <circle key={i} cx={75 + (i % 5) * 14} cy={60 + Math.floor(i / 5) * 14} r="2.5" fill="#f59e0b" />
            ))}
            {[...Array(12)].map((_, i) => (
              <circle key={i} cx={80 + (i % 4) * 15} cy={65 + Math.floor(i / 4) * 15} r="1.5" fill="#ec4899" />
            ))}
            {/* Long Graceful Neck */}
            <path d="M 120 45 C 125 30 135 22 145 20 C 150 20 155 24 153 28 C 145 32 135 40 130 50" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="147" cy="23" r="2" fill="#fde047" />
            {/* Crown Plumes */}
            <path d="M 148 20 Q 155 12 162 14 M 147 19 Q 152 9 157 9 M 146 19 Q 148 10 150 8" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            {/* Flowing Tail Feathers */}
            <path d="M 55 110 C 35 105 20 80 15 50 C 30 65 45 85 55 110 Z" fill="#10b981" />
            <path d="M 50 115 C 30 115 15 95 10 70 C 25 85 40 100 50 115 Z" fill="#f59e0b" />
            {/* Gond Fine Dashes */}
            <path d="M 22 62 L 26 66 M 26 70 L 30 74 M 30 78 L 34 82 M 34 86 L 38 90" stroke="#fcf9f2" strokeWidth="1.5" strokeLinecap="round" />
            {/* Sacred Saja Leaves at bottom */}
            <path d="M 10 130 Q 30 120 50 132 Q 70 120 90 132 Q 110 120 130 132 Q 150 120 170 132 Q 190 120 200 130" stroke="#34d399" strokeWidth="3" fill="none" />
          </svg>
        );

      case 'santhal':
        return (
          <svg viewBox="0 0 200 140" className="w-full h-36 drop-shadow-md">
            <rect width="200" height="140" fill="#881337" rx="10" />
            {/* Sarhul Sun */}
            <circle cx="100" cy="22" r="10" fill="#fbbf24" />
            <circle cx="100" cy="22" r="14" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            {/* Santhal Village Dancers with Mandar drum */}
            {/* Musician playing Mandar drum */}
            <g transform="translate(45, 45)">
              <circle cx="15" cy="10" r="5" fill="#fef08a" />
              {/* Turban */}
              <path d="M 10 8 Q 15 4 20 8" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
              {/* Torso */}
              <path d="M 15 15 L 15 42" stroke="#fef08a" strokeWidth="4" strokeLinecap="round" />
              {/* Legs */}
              <path d="M 15 42 L 8 62 M 15 42 L 22 62" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" />
              {/* Mandar Drum hung across chest */}
              <ellipse cx="16" cy="30" rx="12" ry="7" fill="#78350f" stroke="#fbbf24" strokeWidth="1.5" transform="rotate(-15 16 30)" />
              <line x1="8" y1="26" x2="24" y2="34" stroke="#fde68a" strokeWidth="1.5" />
            </g>
            {/* Santhal Dancers Holding Hands in Panchhi Red-White Saree */}
            {[
              { x: 95, y: 45, hairFlower: true },
              { x: 125, y: 45, hairFlower: true },
              { x: 155, y: 45, hairFlower: true },
            ].map((d, i) => (
              <g key={i} transform={`translate(${d.x}, ${d.y})`}>
                <circle cx="12" cy="10" r="4.5" fill="#fef08a" />
                {/* Hair Bun & Red Hibiscus Flower */}
                <circle cx="17" cy="9" r="3" fill="#18181b" />
                <circle cx="19" cy="8" r="2" fill="#ef4444" />
                {/* Traditional Panchhi Saree with red border */}
                <polygon points="12,15 4,38 20,38" fill="#ffffff" />
                <path d="M 4 38 L 20 38" stroke="#dc2626" strokeWidth="2.5" />
                {/* Lower Skirt */}
                <polygon points="12,38 2,58 22,58" fill="#ffffff" />
                <path d="M 2 58 L 22 58" stroke="#dc2626" strokeWidth="2.5" />
                {/* Interlocked Dancing Arms */}
                <path d="M -2 22 L 12 24 L 26 22" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
                {/* Anklet Feet */}
                <line x1="8" y1="58" x2="7" y2="68" stroke="#fef08a" strokeWidth="2" />
                <line x1="16" y1="58" x2="17" y2="68" stroke="#fef08a" strokeWidth="2" />
              </g>
            ))}
            {/* Bottom Tribal Geometric Band */}
            <path d="M 10 130 L 25 122 L 40 130 L 55 122 L 70 130 L 85 122 L 100 130 L 115 122 L 130 130 L 145 122 L 160 130 L 175 122 L 190 130" stroke="#fde047" strokeWidth="2" fill="none" />
          </svg>
        );

      case 'dokra':
        return (
          <svg viewBox="0 0 200 140" className="w-full h-36 drop-shadow-md">
            <defs>
              <linearGradient id="dokraMetal" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#451a03" />
                <stop offset="100%" stopColor="#1c1917" />
              </linearGradient>
            </defs>
            <rect width="200" height="140" fill="url(#dokraMetal)" rx="10" />
            {/* Bastar Dokra Cast Bell Metal Horse */}
            <g transform="translate(30, 20)">
              {/* Head & Mane */}
              <path d="M 40 30 Q 50 15 65 18 Q 75 22 75 32 Q 65 38 52 40 Z" fill="#d97706" stroke="#fbbf24" strokeWidth="1.5" />
              {/* Ears */}
              <path d="M 68 18 L 74 8 M 64 16 L 68 7" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
              {/* Elongated Dokra Tubular Neck with Wax Coils */}
              <path d="M 45 35 L 35 70 L 48 70 L 52 40 Z" fill="#b45309" stroke="#f59e0b" strokeWidth="1.5" />
              {/* Coil grooves */}
              {[...Array(6)].map((_, i) => (
                <line key={i} x1="38" y1={42 + i * 5} x2="50" y2={42 + i * 5} stroke="#fef08a" strokeWidth="1" />
              ))}
              {/* Horse Body */}
              <rect x="35" y="65" width="75" height="18" rx="8" fill="#d97706" stroke="#fbbf24" strokeWidth="1.5" />
              {/* Dokra Patterned Saddle */}
              <rect x="55" y="62" width="28" height="22" rx="4" fill="#92400e" stroke="#fef08a" strokeWidth="1" strokeDasharray="2 2" />
              {/* Tribal Rider on Horse */}
              <circle cx="68" cy="45" r="5" fill="#fbbf24" />
              <line x1="68" y1="50" x2="68" y2="65" stroke="#fbbf24" strokeWidth="3" />
              <path d="M 68 55 L 50 48" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
              {/* Legs with stylized hoops */}
              <line x1="45" y1="83" x2="40" y2="108" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="55" y1="83" x2="52" y2="108" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="95" y1="83" x2="98" y2="108" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="105" y1="83" x2="110" y2="108" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
              {/* Curled Dokra Tail */}
              <path d="M 110 70 Q 125 75 125 85 Q 125 95 118 92" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
            {/* Traditional Dokra border */}
            <line x1="10" y1="132" x2="190" y2="132" stroke="#d97706" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        );

      case 'saura':
        return (
          <svg viewBox="0 0 200 140" className="w-full h-36 drop-shadow-md">
            <rect width="200" height="140" fill="#134e4a" rx="10" />
            {/* Saura Fish-Bone Outer Border Frame */}
            <rect x="8" y="8" width="184" height="124" fill="none" stroke="#f0fdf4" strokeWidth="2" />
            <path d="M 14 14 L 20 20 M 24 14 L 30 20 M 34 14 L 40 20 M 44 14 L 50 20 M 54 14 L 60 20 M 140 14 L 146 20 M 150 14 L 156 20 M 160 14 L 166 20" stroke="#f0fdf4" strokeWidth="1.5" />
            {/* Sacred Saura Tree of Ancestors */}
            <g transform="translate(100, 30)">
              <line x1="0" y1="75" x2="0" y2="10" stroke="#f0fdf4" strokeWidth="3" />
              <line x1="0" y1="30" x2="-25" y2="15" stroke="#f0fdf4" strokeWidth="2" />
              <line x1="0" y1="30" x2="25" y2="15" stroke="#f0fdf4" strokeWidth="2" />
              <line x1="0" y1="45" x2="-35" y2="30" stroke="#f0fdf4" strokeWidth="2" />
              <line x1="0" y1="45" x2="35" y2="30" stroke="#f0fdf4" strokeWidth="2" />
              <line x1="0" y1="60" x2="-45" y2="45" stroke="#f0fdf4" strokeWidth="2" />
              <line x1="0" y1="60" x2="45" y2="45" stroke="#f0fdf4" strokeWidth="2" />
              {/* Triangular birds on tree branches */}
              <polygon points="-25,15 -32,10 -25,8" fill="#f0fdf4" />
              <polygon points="25,15 32,10 25,8" fill="#f0fdf4" />
              <polygon points="-35,30 -42,25 -35,23" fill="#f0fdf4" />
              <polygon points="35,30 42,25 35,23" fill="#f0fdf4" />
            </g>
            {/* Saura Distinctive Triangular Stick Figures with Pot on Head */}
            {[
              { x: 35, y: 70 },
              { x: 55, y: 70 },
              { x: 145, y: 70 },
              { x: 165, y: 70 }
            ].map((s, i) => (
              <g key={i} transform={`translate(${s.x}, ${s.y})`}>
                <circle cx="0" cy="0" r="3.5" fill="#f0fdf4" />
                {/* Pot/Offering on Head */}
                <ellipse cx="0" cy="-6" rx="4" ry="2.5" fill="#fef08a" />
                {/* Triangular Chest & Pelvis */}
                <polygon points="0,4 -5,14 5,14" fill="#f0fdf4" />
                <polygon points="0,24 -5,14 5,14" fill="#f0fdf4" />
                <line x1="0" y1="24" x2="-4" y2="36" stroke="#f0fdf4" strokeWidth="2" strokeLinecap="round" />
                <line x1="0" y1="24" x2="4" y2="36" stroke="#f0fdf4" strokeWidth="2" strokeLinecap="round" />
              </g>
            ))}
          </svg>
        );

      case 'pithora':
        return (
          <svg viewBox="0 0 200 140" className="w-full h-36 drop-shadow-md">
            <rect width="200" height="140" fill="#7c2d12" rx="10" />
            {/* Celestial Sun and Moon */}
            <circle cx="30" cy="25" r="9" fill="#facc15" />
            <path d="M 175 18 A 8 8 0 0 1 165 32 A 9 9 0 0 0 175 18 Z" fill="#f8fafc" />
            {/* Baba Pithora Sacred Equine (Red & White Horse) */}
            <g transform="translate(50, 30)">
              {/* Horse Head & Ears */}
              <polygon points="25,25 10,28 15,35 28,32" fill="#38bdf8" />
              <polygon points="25,22 28,14 31,23" fill="#facc15" />
              {/* Arched Neck */}
              <path d="M 28 25 Q 40 30 45 45 L 35 48 Q 28 35 22 32 Z" fill="#38bdf8" />
              {/* Body */}
              <rect x="40" y="42" width="55" height="24" rx="8" fill="#f8fafc" stroke="#dc2626" strokeWidth="2" />
              {/* Decorative Pithora saddle cloth */}
              <rect x="52" y="44" width="22" height="18" fill="#dc2626" />
              <circle cx="63" cy="53" r="4" fill="#facc15" />
              {/* Divine Rider Baba Pithora */}
              <circle cx="63" cy="30" r="5" fill="#fde047" />
              <line x1="63" y1="35" x2="63" y2="44" stroke="#fde047" strokeWidth="3" />
              <path d="M 63 38 L 48 34" stroke="#fde047" strokeWidth="2" />
              {/* Horse Strong Legs */}
              <line x1="46" y1="66" x2="42" y2="92" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="56" y1="66" x2="54" y2="92" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="82" y1="66" x2="84" y2="92" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="90" y1="66" x2="94" y2="92" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
              {/* Bushy Tail */}
              <path d="M 95 48 Q 115 55 110 75" stroke="#facc15" strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>
            {/* Pithora sacred grain border */}
            <path d="M 10 130 Q 30 124 50 130 Q 70 124 90 130 Q 110 124 130 130 Q 150 124 170 130 Q 190 124 198 130" stroke="#fde047" strokeWidth="2" fill="none" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <section id="tribal-heritage-showcase" className="mt-10 mb-6">
      {/* Traditional Tribal Pattern Border Ribbon */}
      <div className="w-full h-3 bg-gradient-to-r from-emerald-800 via-amber-600 to-emerald-900 rounded-t-2xl shadow-xs overflow-hidden flex items-center justify-around opacity-90">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 bg-amber-200 rotate-45 transform"></div>
        ))}
      </div>

      <div className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-stone-900 text-white rounded-b-2xl p-6 sm:p-8 shadow-xl border border-emerald-800/60">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-emerald-800/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                {t('culturalHeritageBadge', 'Cultural Heritage & GI Artistry')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>{t('galleryTitle')}</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h2>
            <p className="text-xs text-emerald-200/80 max-w-2xl leading-relaxed">
              {t('gallerySubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-800/60 border border-emerald-700/60 px-3.5 py-2 rounded-xl text-xs text-emerald-100">
            <Palette className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="font-semibold">{t('masterTraditionsFeatured', '6 Master Tribal Traditions Featured')}</span>
          </div>
        </div>

        {/* Art Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-6">
          {tribalArtList.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArt(art)}
              className="group bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-700/40 hover:border-amber-400/60 rounded-2xl p-4 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Artwork Visual Motif */}
                <div className="rounded-xl overflow-hidden mb-3.5 border border-emerald-800/60 group-hover:border-amber-400/40 transition">
                  {renderTribalArtMotif(art.visualType)}
                </div>

                {/* Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${art.badgeBg}`}>
                    {art.badgeText}
                  </span>
                  <span className="text-[11px] font-medium text-amber-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {art.state.split('&')[0]}
                  </span>
                </div>

                {/* Title & Native Title */}
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {art.title}
                </h3>
                <p className="text-xs text-emerald-300 font-medium mb-2">
                  {art.nativeTitle}
                </p>

                {/* Short snippet */}
                <p className="text-xs text-emerald-100/75 line-clamp-2 leading-relaxed">
                  {art.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-emerald-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-300 text-[11px]">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold">{art.tribe}</span>
                </div>

                <span className="text-amber-400 font-semibold text-xs group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>{t('viewDetails')}</span>
                  <span>→</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Modal for Selected Tribal Art Details */}
      {selectedArt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-600/50 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-white my-8">
            {/* Modal Header with Art Artwork */}
            <div className="relative p-6 bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 border-b border-emerald-800">
              <button
                type="button"
                onClick={() => setSelectedArt(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/40 hover:bg-black/70 text-slate-300 hover:text-white transition cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-w-md">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${selectedArt.badgeBg}`}>
                  {selectedArt.badgeText}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                  {selectedArt.title}
                </h3>
                <p className="text-sm font-semibold text-amber-300">
                  {selectedArt.nativeTitle}
                </p>
              </div>

              {/* Large Artwork Motif */}
              <div className="mt-4 rounded-xl overflow-hidden border border-emerald-700/60 shadow-lg">
                {renderTribalArtMotif(selectedArt.visualType)}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto text-xs text-slate-300 leading-relaxed">
              {/* Tribe and Geography Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {t('tribalCommunity')}
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5">{selectedArt.tribe}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {t('stateOrigin')}
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5">{selectedArt.state}</p>
                </div>
              </div>

              {/* Cultural Significance & Folklore */}
              <div>
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5 mb-1.5">
                  <Compass className="w-4 h-4" />
                  {t('culturalHeritageLivingTradition', 'Cultural Heritage & Living Tradition')}
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  {selectedArt.culturalStory}
                </p>
              </div>

              {/* Key Traditional Motifs */}
              <div>
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5 mb-2">
                  <Award className="w-4 h-4" />
                  {t('recognizedTraditionalMotifs', 'Recognized Traditional Motifs')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedArt.motifs.map((motif, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-900/60 border border-emerald-700/60 text-emerald-200 text-xs font-medium"
                    >
                      ✦ {motif}
                    </span>
                  ))}
                </div>
              </div>

              {/* MoTA Scholarship Connection */}
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-200/90 text-xs">
                <span className="font-bold text-amber-300 block mb-1">
                  {t('motaFellowshipConnection', 'MoTA Fellowship Connection:')}
                </span>
                {t('motaFellowshipResearchText', 'Scholars under NFST and NOS are actively conducting Ph.D. and Master\'s field research documenting indigenous art forms, ethno-botany, tribal languages, and Intellectual Property / GI-Tag protections for tribal cooperatives.')}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-emerald-950 border-t border-emerald-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedArt(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition cursor-pointer"
              >
                {t('closeModal')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
