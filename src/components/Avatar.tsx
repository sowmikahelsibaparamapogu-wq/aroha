import React from 'react';

export type AvatarType = 
  | 'scholar_female'
  | 'scholar_male'
  | 'scholar_researcher'
  | 'scholar_fresh'
  | 'officer_senior'
  | 'officer_director'
  | 'officer_finance'
  | 'officer_default';

interface AvatarProps {
  type?: AvatarType | string;
  name?: string;
  role?: 'applicant' | 'admin';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export const Avatar: React.FC<AvatarProps> = ({
  type,
  name = 'User',
  role = 'applicant',
  size = 'md',
  className = '',
}) => {
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // Render stylized graphical vector avatars (no real human photos)
  const renderGraphic = () => {
    switch (type) {
      case 'scholar_female':
        // Stylized Female ST Scholar Avatar
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="50" fill="url(#grad_female)" />
            <circle cx="50" cy="50" r="46" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="4 3" />
            {/* Shoulders */}
            <path d="M 22 88 C 24 66, 76 66, 78 88 Z" fill="#047857" />
            <path d="M 36 88 L 50 72 L 64 88 Z" fill="#fbbf24" />
            {/* Neck & Face */}
            <rect x="44" y="52" width="12" height="16" rx="4" fill="#d97706" />
            <circle cx="50" cy="42" r="16" fill="#f59e0b" />
            {/* Hair */}
            <path d="M 32 40 C 32 26, 68 26, 68 40 C 68 46, 64 52, 64 52 C 60 48, 62 40, 58 40 C 54 40, 52 46, 50 46 C 48 46, 46 40, 42 40 C 38 40, 40 48, 36 52 C 36 52, 32 46, 32 40 Z" fill="#1f2937" />
            {/* Traditional Tribal Earring Accents */}
            <circle cx="33" cy="46" r="2.5" fill="#f59e0b" />
            <circle cx="67" cy="46" r="2.5" fill="#f59e0b" />
            {/* Graduation Mortarboard Hat */}
            <polygon points="50,16 76,26 50,36 24,26" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" />
            <rect x="40" y="28" width="20" height="7" fill="#047857" />
            <line x1="72" y1="26" x2="74" y2="42" stroke="#facc15" strokeWidth="2" />
            <circle cx="74" cy="43" r="2.5" fill="#facc15" />
            <defs>
              <linearGradient id="grad_female" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#065f46" />
                <stop offset="1" stopColor="#022c22" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'scholar_male':
        // Stylized Male ST Scholar (NOS Oxford Candidate)
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="50" fill="url(#grad_male)" />
            <circle cx="50" cy="50" r="46" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4 3" />
            {/* Suit & Robe */}
            <path d="M 22 88 C 24 64, 76 64, 78 88 Z" fill="#0c4a6e" />
            <path d="M 42 66 L 50 88 L 58 66 Z" fill="#f8fafc" />
            <polygon points="50,70 54,82 50,88 46,82" fill="#0284c7" />
            {/* Face & Neck */}
            <rect x="44" y="50" width="12" height="16" rx="4" fill="#b45309" />
            <circle cx="50" cy="40" r="16" fill="#d97706" />
            {/* Hair */}
            <path d="M 33 36 C 33 24, 67 24, 67 36 C 65 30, 58 26, 50 26 C 42 26, 35 30, 33 36 Z" fill="#111827" />
            {/* Mortarboard */}
            <polygon points="50,14 78,25 50,35 22,25" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="40" y="27" width="20" height="7" fill="#075985" />
            <line x1="74" y1="25" x2="76" y2="40" stroke="#facc15" strokeWidth="2" />
            <circle cx="76" cy="41" r="2.5" fill="#facc15" />
            <defs>
              <linearGradient id="grad_male" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#082f49" />
                <stop offset="1" stopColor="#0f172a" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'scholar_researcher':
        // Stylized Researcher Scholar (Khasi/NEHU)
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="50" fill="url(#grad_researcher)" />
            <circle cx="50" cy="50" r="46" stroke="#a78bfa" strokeWidth="2.5" strokeDasharray="3 3" />
            {/* Lab Coat / Attire */}
            <path d="M 22 88 C 24 65, 76 65, 78 88 Z" fill="#4c1d95" />
            <path d="M 38 72 L 50 88 L 62 72 Z" fill="#ede9fe" />
            {/* Face */}
            <circle cx="50" cy="42" r="16" fill="#f59e0b" />
            <path d="M 32 38 C 32 26, 68 26, 68 38 C 66 32, 58 28, 50 28 C 42 28, 34 32, 32 38 Z" fill="#18181b" />
            {/* Research Flask Glyph */}
            <polygon points="50,12 60,26 50,30 40,26" fill="#8b5cf6" />
            <circle cx="50" cy="20" r="3" fill="#fbbf24" />
            <defs>
              <linearGradient id="grad_researcher" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2e1065" />
                <stop offset="1" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'scholar_fresh':
        // Fresh ST Scholar
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="50" fill="url(#grad_fresh)" />
            <circle cx="50" cy="50" r="46" stroke="#34d399" strokeWidth="2" />
            <path d="M 24 88 C 26 68, 74 68, 76 88 Z" fill="#065f46" />
            <circle cx="50" cy="46" r="16" fill="#d97706" />
            {/* Leaf/Plant Glyph for tribal agroforestry */}
            <path d="M 50 22 C 60 16, 62 30, 50 36 C 38 30, 40 16, 50 22 Z" fill="#10b981" />
            <line x1="50" y1="24" x2="50" y2="35" stroke="#047857" strokeWidth="1.5" />
            <defs>
              <linearGradient id="grad_fresh" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#064e3b" />
                <stop offset="1" stopColor="#022c22" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'officer_senior':
        // Senior Scrutiny Officer (Dr. Soren, IES)
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="50" fill="url(#grad_officer)" />
            <circle cx="50" cy="50" r="46" stroke="#f59e0b" strokeWidth="2.5" />
            {/* Official Uniform & Collar */}
            <path d="M 22 88 C 24 64, 76 64, 78 88 Z" fill="#1e293b" />
            <path d="M 44 68 L 50 88 L 56 68 Z" fill="#f8fafc" />
            <polygon points="50,72 53,82 50,86 47,82" fill="#dc2626" />
            {/* Official Seal / Gold Emblem Badge */}
            <polygon points="50,18 64,26 64,42 50,50 36,42 36,26" fill="#d97706" stroke="#fbbf24" strokeWidth="2" />
            <circle cx="50" cy="34" r="7" fill="#fbbf24" />
            <path d="M 47 34 L 49 37 L 54 31" stroke="#78350f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Stars */}
            <circle cx="50" cy="24" r="2" fill="#fff" />
            <circle cx="43" cy="38" r="1.5" fill="#fff" />
            <circle cx="57" cy="38" r="1.5" fill="#fff" />
            <defs>
              <linearGradient id="grad_officer" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0f172a" />
                <stop offset="1" stopColor="#1e293b" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'officer_director':
        // Director of Scholarships & Merit Board (Deepa Lakra)
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="50" fill="url(#grad_director)" />
            <circle cx="50" cy="50" r="46" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="5 3" />
            {/* Attire */}
            <path d="M 22 88 C 24 64, 76 64, 78 88 Z" fill="#78350f" />
            <path d="M 38 72 L 50 88 L 62 72 Z" fill="#fef3c7" />
            {/* Director Rosette / Merit Board Star */}
            <circle cx="50" cy="34" r="14" fill="#b45309" stroke="#fbbf24" strokeWidth="2" />
            <polygon points="50,23 53,30 61,31 55,36 57,44 50,40 43,44 45,36 39,31 47,30" fill="#fde047" />
            <polygon points="45,45 42,56 48,51" fill="#dc2626" />
            <polygon points="55,45 58,56 52,51" fill="#dc2626" />
            <defs>
              <linearGradient id="grad_director" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#451a03" />
                <stop offset="1" stopColor="#1c1917" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'officer_finance':
        // PFMS DBT Comptroller (Vikram Rathod)
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="50" fill="url(#grad_finance)" />
            <circle cx="50" cy="50" r="46" stroke="#10b981" strokeWidth="2.5" />
            {/* Suit */}
            <path d="M 22 88 C 24 64, 76 64, 78 88 Z" fill="#1e1b4b" />
            <path d="M 44 68 L 50 88 L 56 68 Z" fill="#e0e7ff" />
            <polygon points="50,72 53,82 50,86 47,82" fill="#10b981" />
            {/* Digital DBT Vault Shield & Rupee Glyph */}
            <polygon points="50,18 66,25 66,42 50,52 34,42 34,25" fill="#065f46" stroke="#34d399" strokeWidth="2" />
            <text x="50" y="39" textAnchor="middle" fill="#facc15" fontSize="18" fontWeight="bold" fontFamily="sans-serif">₹</text>
            <defs>
              <linearGradient id="grad_finance" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1e1b4b" />
                <stop offset="1" stopColor="#0f172a" />
              </linearGradient>
            </defs>
          </svg>
        );

      default:
        // Generic Role-Specific Geometric Graphic
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="50" fill={role === 'admin' ? '#1e293b' : '#064e3b'} />
            <circle cx="50" cy="50" r="46" stroke={role === 'admin' ? '#f59e0b' : '#34d399'} strokeWidth="2" />
            {role === 'admin' ? (
              // Admin Statutory Emblem
              <g transform="translate(25, 25) scale(0.5)">
                <polygon points="50,10 85,25 85,65 50,90 15,65 15,25" fill="#d97706" stroke="#fbbf24" strokeWidth="4" />
                <circle cx="50" cy="45" r="16" fill="#fef3c7" />
                <path d="M 42 45 L 48 51 L 60 38" stroke="#047857" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            ) : (
              // Applicant Scholar Cap Emblem
              <g transform="translate(20, 20) scale(0.6)">
                <polygon points="50,15 90,32 50,50 10,32" fill="#047857" stroke="#34d399" strokeWidth="3" />
                <rect x="35" y="38" width="30" height="12" rx="4" fill="#065f46" />
                <line x1="82" y1="32" x2="84" y2="60" stroke="#fbbf24" strokeWidth="3" />
                <circle cx="84" cy="62" r="4" fill="#fbbf24" />
              </g>
            )}
            <text x="50" y="82" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
              {name ? name.slice(0, 2).toUpperCase() : (role === 'admin' ? 'GOV' : 'ST')}
            </text>
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 shadow-sm ${sizeClass} ${className}`}
      title={name}
    >
      {renderGraphic()}
    </div>
  );
};
