'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/** Parse "15 Jan 2018" | "Jan 2018" | "2018" */
function parseDate(value: string): { day: number | null; month: number | null; year: number | null } {
  if (!value) return { day: null, month: null, year: null };
  const parts = value.trim().split(' ');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const mi = MONTHS.indexOf(parts[1]);
    const year = parseInt(parts[2]);
    if (!isNaN(day) && mi !== -1 && !isNaN(year)) return { day, month: mi, year };
  }
  if (parts.length === 2) {
    const mi = MONTHS.indexOf(parts[0]);
    const year = parseInt(parts[1]);
    if (mi !== -1 && !isNaN(year)) return { day: null, month: mi, year };
  }
  if (parts.length === 1) {
    const year = parseInt(parts[0]);
    if (!isNaN(year)) return { day: null, month: null, year };
  }
  return { day: null, month: null, year: null };
}

function formatDate(day: number | null, month: number | null, year: number | null): string {
  if (year === null) return '';
  if (month === null) return String(year);
  if (day === null) return `${MONTHS[month]} ${year}`;
  return `${day} ${MONTHS[month]} ${year}`;
}

export default function DatePicker({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'year' | 'month' | 'day'>('year');

  const parsed = parseDate(value);

  const [selYear, setSelYear] = useState<number | null>(parsed.year);
  const [selMonth, setSelMonth] = useState<number | null>(parsed.month);
  const [yearPage, setYearPage] = useState(() => {
    const base = parsed.year ?? new Date().getFullYear();
    return Math.floor(base / 12) * 12;
  });

  const ref = useRef<HTMLDivElement>(null);

  // Sync internal state when value changes externally
  useEffect(() => {
    const p = parseDate(value);
    setSelYear(p.year);
    setSelMonth(p.month);
    if (p.year !== null) setYearPage(Math.floor(p.year / 12) * 12);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openPicker = () => {
    setView('year');
    setOpen(true);
  };

  const handleSelectYear = (y: number) => {
    setSelYear(y);
    setYearPage(Math.floor(y / 12) * 12);
    setView('month');
  };

  const handleSelectMonth = (mi: number) => {
    setSelMonth(mi);
    setView('day');
  };

  const handleSelectDay = (day: number) => {
    onChange(formatDate(day, selMonth, selYear));
    setOpen(false);
  };

  const handleYearOnly = () => {
    if (selYear !== null) { onChange(formatDate(null, null, selYear)); setOpen(false); }
  };

  const handleMonthOnly = () => {
    if (selYear !== null && selMonth !== null) { onChange(formatDate(null, selMonth, selYear)); setOpen(false); }
  };

  const years = Array.from({ length: 12 }, (_, i) => yearPage + i);
  const totalDays = selYear !== null && selMonth !== null ? daysInMonth(selYear, selMonth) : 31;
  const firstDow = selYear !== null && selMonth !== null ? new Date(selYear, selMonth, 1).getDay() : 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={openPicker}
        className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-left flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all"
      >
        <Calendar className="w-4 h-4 text-[#f5c542] shrink-0" />
        <span className={value ? 'text-white text-sm' : 'text-white/20 text-sm'}>
          {value || placeholder || 'Select date'}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(''); setSelYear(null); setSelMonth(null); }}
            className="ml-auto text-white/20 hover:text-white/60 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 w-72 bg-[#111116] border border-white/10 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150">

          {/* ── YEAR VIEW ── */}
          {view === 'year' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setYearPage(p => p - 12)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-white font-bold text-sm">{yearPage} – {yearPage + 11}</span>
                <button type="button" onClick={() => setYearPage(p => p + 12)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {years.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => handleSelectYear(y)}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                      selYear === y ? 'bg-[#f5c542] text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
              {selYear !== null && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleYearOnly}
                    className="w-full py-2 rounded-lg text-xs font-bold text-white/40 hover:bg-white/5 hover:text-white transition-all"
                  >
                    Use year only ({selYear})
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── MONTH VIEW ── */}
          {view === 'month' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setView('year')} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView('year')}
                  className="text-white font-bold text-sm hover:text-[#f5c542] transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                >
                  {selYear}
                </button>
                <div className="w-7" />
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {MONTHS.map((m, i) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectMonth(i)}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                      selMonth === i ? 'bg-[#f5c542] text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleMonthOnly}
                  className="w-full py-2 rounded-lg text-xs font-bold text-white/40 hover:bg-white/5 hover:text-white transition-all"
                >
                  Use month only
                </button>
              </div>
            </>
          )}

          {/* ── DAY VIEW ── */}
          {view === 'day' && selYear !== null && selMonth !== null && (
            <>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setView('month')} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView('month')}
                  className="text-white font-bold text-sm hover:text-[#f5c542] transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                >
                  {MONTHS_FULL[selMonth]} {selYear}
                </button>
                <div className="w-7" />
              </div>
              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 mb-1">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                  <span key={d} className="text-center text-[10px] font-bold text-white/20 py-1">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {/* Empty cells for offset */}
                {Array.from({ length: firstDow }).map((_, i) => <span key={`e${i}`} />)}
                {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
                  const isSelected = parsed.day === day && parsed.month === selMonth && parsed.year === selYear;
                  const isToday = day === new Date().getDate() && selMonth === new Date().getMonth() && selYear === new Date().getFullYear();
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#f5c542] text-black font-bold'
                          : isToday
                          ? 'border border-[#f5c542]/40 text-[#f5c542]'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleMonthOnly}
                  className="w-full py-2 rounded-lg text-xs font-bold text-white/40 hover:bg-white/5 hover:text-white transition-all"
                >
                  Use month only
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
