'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
  className?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthSelector({
  selectedMonth,
  selectedYear,
  onMonthChange,
  className = '',
}: MonthSelectorProps) {
  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = currentDate.getFullYear();

  // Check if a given month/year is in the future
  const isFutureMonth = (month: number, year: number): boolean => {
    if (year > currentYear) return true;
    if (year === currentYear && month > currentMonth) return true;
    return false;
  };

  const handlePrevious = () => {
    if (selectedMonth === 1) {
      onMonthChange(12, selectedYear - 1);
    } else {
      onMonthChange(selectedMonth - 1, selectedYear);
    }
  };

  const handleNext = () => {
    let nextMonth = selectedMonth;
    let nextYear = selectedYear;

    if (selectedMonth === 12) {
      nextMonth = 1;
      nextYear = selectedYear + 1;
    } else {
      nextMonth = selectedMonth + 1;
    }

    // Only allow navigation if the next month is not in the future
    if (!isFutureMonth(nextMonth, nextYear)) {
      onMonthChange(nextMonth, nextYear);
    }
  };

  // Check if next month button should be disabled
  const isNextDisabled = (() => {
    let nextMonth = selectedMonth;
    let nextYear = selectedYear;

    if (selectedMonth === 12) {
      nextMonth = 1;
      nextYear = selectedYear + 1;
    } else {
      nextMonth = selectedMonth + 1;
    }

    return isFutureMonth(nextMonth, nextYear);
  })();

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <button
        onClick={handlePrevious}
        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition-all duration-200"
        aria-label="Previous month"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <div className="flex items-center gap-3">
        <select
          value={selectedMonth}
          onChange={(e) => {
            const newMonth = parseInt(e.target.value);
            // Only allow selection if the month is not in the future
            if (!isFutureMonth(newMonth, selectedYear)) {
              onMonthChange(newMonth, selectedYear);
            }
          }}
          className="px-4 py-2 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
          aria-label="Select month"
        >
          {MONTHS.map((month, index) => {
            const monthValue = index + 1;
            const isDisabled = isFutureMonth(monthValue, selectedYear);
            return (
              <option key={month} value={monthValue} disabled={isDisabled}>
                {month}
              </option>
            );
          })}
        </select>
        
        <select
          value={selectedYear}
          onChange={(e) => {
            const newYear = parseInt(e.target.value);
            // When year changes, check if current month is valid for new year
            if (isFutureMonth(selectedMonth, newYear)) {
              // If current month is in future for new year, set to current month
              onMonthChange(currentMonth, newYear);
            } else {
              onMonthChange(selectedMonth, newYear);
            }
          }}
          className="px-4 py-2 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
          aria-label="Select year"
        >
          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i)
            .filter((year) => year <= currentYear)
            .map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
        </select>
      </div>
      
      <button
        onClick={handleNext}
        disabled={isNextDisabled}
        className={`p-2 rounded-lg transition-all duration-200 ${
          isNextDisabled
            ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
        }`}
        aria-label="Next month"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}