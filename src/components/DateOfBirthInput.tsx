import React, { useState, useEffect, useRef } from 'react';
import { Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { SchemeType } from '../types/scholarship';

interface DateOfBirthInputProps {
  value: string;
  onChange: (value: string) => void;
  scheme?: SchemeType;
  required?: boolean;
  label?: string;
}

const MONTHS = [
  { value: '01', label: '01 - Jan' },
  { value: '02', label: '02 - Feb' },
  { value: '03', label: '03 - Mar' },
  { value: '04', label: '04 - Apr' },
  { value: '05', label: '05 - May' },
  { value: '06', label: '06 - Jun' },
  { value: '07', label: '07 - Jul' },
  { value: '08', label: '08 - Aug' },
  { value: '09', label: '09 - Sep' },
  { value: '10', label: '10 - Oct' },
  { value: '11', label: '11 - Nov' },
  { value: '12', label: '12 - Dec' },
];

// Generate years from current year - 15 down to 1960
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 15 - 1959 }, (_, i) => String(CURRENT_YEAR - 15 - i));

// Days 01 to 31
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

export const DateOfBirthInput: React.FC<DateOfBirthInputProps> = ({
  value,
  onChange,
  scheme,
  required = true,
  label = 'Date of Birth',
}) => {
  // Parsing helper
  const parseDob = (raw: string): { day: string; month: string; year: string } => {
    if (!raw) return { day: '', month: '', year: '' };
    const clean = raw.trim();

    // Standard YYYY-MM-DD
    if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts[0]?.length === 4) {
        return {
          year: parts[0],
          month: (parts[1] || '').padStart(2, '0'),
          day: (parts[2] || '').padStart(2, '0'),
        };
      }
      if (parts[2]?.length === 4) {
        return {
          day: (parts[0] || '').padStart(2, '0'),
          month: (parts[1] || '').padStart(2, '0'),
          year: parts[2],
        };
      }
    }

    // DD/MM/YYYY or YYYY/MM/DD
    if (clean.includes('/')) {
      const parts = clean.split('/');
      if (parts[2]?.length === 4) {
        return {
          day: (parts[0] || '').padStart(2, '0'),
          month: (parts[1] || '').padStart(2, '0'),
          year: parts[2],
        };
      }
      if (parts[0]?.length === 4) {
        return {
          year: parts[0],
          month: (parts[1] || '').padStart(2, '0'),
          day: (parts[2] || '').padStart(2, '0'),
        };
      }
    }

    return { day: '', month: '', year: '' };
  };

  const parsed = parseDob(value);
  const [day, setDay] = useState(parsed.day || '15');
  const [month, setMonth] = useState(parsed.month || '01');
  const [year, setYear] = useState(parsed.year || '2000');
  
  // Format for typing in text mode: DD/MM/YYYY
  const [manualText, setManualText] = useState(
    parsed.day && parsed.month && parsed.year ? `${parsed.day}/${parsed.month}/${parsed.year}` : ''
  );
  
  const [inputMode, setInputMode] = useState<'dropdown' | 'manual'>('dropdown');
  const nativeDateRef = useRef<HTMLInputElement>(null);

  // Synchronize when value changes externally (e.g. preset loaded or draft restored)
  useEffect(() => {
    const p = parseDob(value);
    if (p.year && p.month && p.day) {
      setDay(p.day);
      setMonth(p.month);
      setYear(p.year);
      setManualText(`${p.day}/${p.month}/${p.year}`);
    }
  }, [value]);

  const updateDate = (newDay: string, newMonth: string, newYear: string) => {
    setDay(newDay);
    setMonth(newMonth);
    setYear(newYear);

    if (newDay && newMonth && newYear) {
      const iso = `${newYear}-${newMonth.padStart(2, '0')}-${newDay.padStart(2, '0')}`;
      setManualText(`${newDay.padStart(2, '0')}/${newMonth.padStart(2, '0')}/${newYear}`);
      onChange(iso);
    }
  };

  // Handle manual typed input (supports DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD)
  const handleManualTextChange = (text: string) => {
    setManualText(text);

    // Auto clean digits and separators
    const trimmed = text.trim();
    const p = parseDob(trimmed);
    if (p.year && p.month && p.day && p.year.length === 4) {
      const dNum = parseInt(p.day, 10);
      const mNum = parseInt(p.month, 10);
      const yNum = parseInt(p.year, 10);
      if (dNum >= 1 && dNum <= 31 && mNum >= 1 && mNum <= 12 && yNum >= 1950 && yNum <= CURRENT_YEAR) {
        setDay(p.day);
        setMonth(p.month);
        setYear(p.year);
        onChange(`${p.year}-${p.month.padStart(2, '0')}-${p.day.padStart(2, '0')}`);
      }
    }
  };

  // Calculate age from day, month, year
  const calculateAge = () => {
    if (!day || !month || !year) return null;
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;

    const today = new Date();
    let age = today.getFullYear() - y;
    const monthDiff = today.getMonth() + 1 - m;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) {
      age--;
    }
    return age;
  };

  const age = calculateAge();
  const isNosCeilingExceeded = scheme === 'NOS' && age !== null && age > 35;

  // Month label lookup
  const monthName = MONTHS.find((m) => m.value === month)?.label.split(' - ')[1] || '';

  return (
    <div className="space-y-2">
      {/* Label and Mode Switch */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="flex items-center gap-1.5 text-[11px] bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setInputMode('dropdown')}
            className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
              inputMode === 'dropdown'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Day / Month / Year
          </button>
          <button
            type="button"
            onClick={() => setInputMode('manual')}
            className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
              inputMode === 'manual'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Type / Calendar
          </button>
        </div>
      </div>

      {/* Mode A: Day / Month / Year Selectors */}
      {inputMode === 'dropdown' ? (
        <div className="grid grid-cols-12 gap-2">
          {/* Day (3 cols) */}
          <div className="col-span-3">
            <select
              value={day}
              onChange={(e) => updateDate(e.target.value, month, year)}
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white font-medium cursor-pointer"
              title="Select Day of Birth"
            >
              <option value="">Day</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Month (4 cols) */}
          <div className="col-span-4">
            <select
              value={month}
              onChange={(e) => updateDate(day, e.target.value, year)}
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white font-medium cursor-pointer"
              title="Select Month of Birth"
            >
              <option value="">Month</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year (4 cols) */}
          <div className="col-span-4">
            <select
              value={year}
              onChange={(e) => updateDate(day, month, e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white font-medium cursor-pointer"
              title="Select Year of Birth"
            >
              <option value="">Year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Native Picker Icon Trigger (1 col) */}
          <div className="col-span-1 flex items-center justify-center">
            <button
              type="button"
              onClick={() => nativeDateRef.current?.showPicker ? nativeDateRef.current.showPicker() : nativeDateRef.current?.focus()}
              className="w-full h-[34px] flex items-center justify-center rounded-xl border border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition cursor-pointer"
              title="Open Calendar Picker"
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
            <input
              ref={nativeDateRef}
              type="date"
              max={`${CURRENT_YEAR - 15}-12-31`}
              min="1950-01-01"
              value={year && month && day ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : ''}
              onChange={(e) => {
                if (e.target.value) {
                  const p = parseDob(e.target.value);
                  if (p.year && p.month && p.day) {
                    updateDate(p.day, p.month, p.year);
                  }
                }
              }}
              className="sr-only"
              aria-hidden="true"
            />
          </div>
        </div>
      ) : (
        /* Mode B: Direct Text Entry & Calendar Input */
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={manualText}
              onChange={(e) => handleManualTextChange(e.target.value)}
              placeholder="DD/MM/YYYY or YYYY-MM-DD"
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white font-mono"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick HTML5 Date Picker button */}
          <div className="relative shrink-0">
            <input
              type="date"
              max={`${CURRENT_YEAR - 15}-12-31`}
              min="1950-01-01"
              value={year && month && day ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : ''}
              onChange={(e) => {
                if (e.target.value) {
                  const p = parseDob(e.target.value);
                  if (p.year && p.month && p.day) {
                    updateDate(p.day, p.month, p.year);
                  }
                }
              }}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer font-medium"
            />
          </div>
        </div>
      )}

      {/* Status / Age Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[11px]">
        {day && month && year ? (
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Born: <strong>{day} {monthName} {year}</strong>
              {age !== null && (
                <span className="ml-1 text-slate-600">
                  (Age: <strong>{age} years</strong>)
                </span>
              )}
            </span>
          </div>
        ) : (
          <span className="text-slate-400 text-[11px]">
            Please enter your date of birth
          </span>
        )}

        {/* Scheme Eligibility Notice */}
        {scheme === 'NOS' ? (
          isNosCeilingExceeded ? (
            <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              <AlertCircle className="w-3 h-3" />
              <span>Age exceeds 35-yr ceiling for NOS</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <Clock className="w-3 h-3" />
              <span>Age within NOS ceiling (≤ 35 yrs as of 1 July 2025)</span>
            </span>
          )
        ) : null}
      </div>
    </div>
  );
};
