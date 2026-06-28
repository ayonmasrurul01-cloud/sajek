import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar, Info } from "lucide-react";

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  minDate?: string; // YYYY-MM-DD format
  placeholder?: string;
  label: string;
  bookedDates?: string[]; // Array of fully booked YYYY-MM-DD strings to show dot indicators
  isCheckOutPicker?: boolean;
  inputClassName?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_SHORT = ["Mo", "Tu", "We", "Th", "Fr", "Sat", "Su"];

// Helper to convert date to YYYY-MM-DD string with local time representation
export const toYmdString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Helper to convert date to "Jan 6, 2022" format
export const toReadableString = (ymdStr: string): string => {
  if (!ymdStr) return "";
  const parts = ymdStr.split("-");
  if (parts.length !== 3) return ymdStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  if (isNaN(year) || isNaN(monthIdx) || isNaN(day)) return ymdStr;
  
  const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${shortMonths[monthIdx]} ${day}, ${year}`;
};

export default function CustomDatePicker({
  value,
  onChange,
  minDate,
  placeholder = "Select Date",
  label,
  bookedDates = [],
  isCheckOutPicker = false,
  inputClassName,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current date values
  const initialDate = value ? new Date(value) : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-indexed
  const [selectedYmd, setSelectedYmd] = useState(value || toYmdString(new Date()));
  const [inputValue, setInputValue] = useState(toReadableString(value || toYmdString(new Date())));

  // Keep internal selection state in sync with parent value
  useEffect(() => {
    if (value) {
      setSelectedYmd(value);
      setInputValue(toReadableString(value));
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside listener to close calendar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset calendar month view to current selected value
        const d = new Date(selectedYmd);
        if (!isNaN(d.getTime())) {
          setCurrentYear(d.getFullYear());
          setCurrentMonth(d.getMonth());
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedYmd]);

  // Calendar generation logic
  const getDaysInMonthGrid = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    // Convert getDay() so Monday is 0, Sunday is 6
    const dayOfWeek = firstDayOfMonth.getDay();
    const firstDayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: { day: number; year: number; month: number; isCurrentMonth: boolean; ymd: string }[] = [];

    // Previous month padding
    for (let i = firstDayOffset - 1; i >= 0; i--) {
      const prevMonthDay = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const ymd = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(prevMonthDay).padStart(2, "0")}`;
      cells.push({
        day: prevMonthDay,
        year: prevYear,
        month: prevMonth,
        isCurrentMonth: false,
        ymd
      });
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const ymd = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      cells.push({
        day: i,
        year: currentYear,
        month: currentMonth,
        isCurrentMonth: true,
        ymd
      });
    }

    // Next month padding to fill grid of 42 cells (6 rows)
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const ymd = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      cells.push({
        day: i,
        year: nextYear,
        month: nextMonth,
        isCurrentMonth: false,
        ymd
      });
    }

    return cells;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (ymd: string) => {
    // Check if day is disabled (prior to minDate)
    if (minDate && ymd < minDate) return;
    setSelectedYmd(ymd);
    setInputValue(toReadableString(ymd));
  };

  const handleToday = () => {
    const todayStr = toYmdString(new Date());
    if (minDate && todayStr < minDate) {
      // If today is disabled, select minDate instead
      setSelectedYmd(minDate);
      setInputValue(toReadableString(minDate));
      const d = new Date(minDate);
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
    } else {
      setSelectedYmd(todayStr);
      setInputValue(toReadableString(todayStr));
      const today = new Date();
      setCurrentYear(today.getFullYear());
      setCurrentMonth(today.getMonth());
    }
  };

  const handleCancel = () => {
    // Revert to original prop value
    setSelectedYmd(value);
    setInputValue(toReadableString(value));
    setIsOpen(false);
  };

  const handleApply = () => {
    onChange(selectedYmd);
    setIsOpen(false);
  };

  // Check if a date in YYYY-MM-DD has any booking indicator dot
  const hasBookedDot = (ymd: string) => {
    return bookedDates.includes(ymd);
  };

  const cells = getDaysInMonthGrid();

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Target input wrapper with polished display state */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={inputClassName || "w-full bg-[#FAF9F6] border border-black/10 py-3.5 px-4 text-[#1A1A1A] font-sans text-sm outline-none cursor-pointer rounded-xl hover:border-black/20 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20 transition-all duration-200 flex items-center justify-between"}
      >
        <span className={value ? "" : "opacity-40"}>
          {value ? toReadableString(value) : placeholder}
        </span>
        <Calendar className="w-4 h-4 text-gold shrink-0 ml-2" />
      </div>

      {/* Dropdown Calendar Card (Matches custom mock design exactly) */}
      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 bg-white border border-black/10 shadow-2xl p-5 w-[310px] sm:w-[328px] rounded-3xl animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Header Month Navigation */}
          <div className="flex items-center justify-between pb-3.5 border-b border-black/5 mb-3.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 text-black/50 hover:text-[#1A1A1A] hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-sans font-semibold text-sm text-[#1A1A1A]">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 text-black/50 hover:text-[#1A1A1A] hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mini Input & Today Row */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 bg-[#FAF9F6] border border-black/10 px-3 py-2 rounded-xl text-xs font-sans text-[#1A1A1A] outline-none font-medium">
              {toReadableString(selectedYmd)}
            </div>
            <button
              type="button"
              onClick={handleToday}
              className="px-4 py-2 border border-black/10 text-[#1A1A1A] hover:bg-black/5 text-xs font-semibold rounded-xl transition-all font-sans cursor-pointer"
            >
              Today
            </button>
          </div>

          {/* Days of Week Row */}
          <div className="grid grid-cols-7 text-center gap-y-1 mb-2">
            {DAYS_SHORT.map((d) => (
              <span key={d} className="text-[11px] font-semibold text-black/40 py-1 font-sans">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid (42 cells) */}
          <div className="grid grid-cols-7 text-center gap-y-1.5 gap-x-1 mb-4">
            {cells.map((cell, idx) => {
              const isSelected = cell.ymd === selectedYmd;
              const isDisabled = minDate ? cell.ymd < minDate : false;
              const isBooked = hasBookedDot(cell.ymd);

              let textClass = "text-black/80 hover:bg-black/5";
              if (!cell.isCurrentMonth) {
                textClass = "text-black/25 hover:bg-black/5";
              }
              if (isDisabled) {
                textClass = "text-black/15 cursor-not-allowed pointer-events-none";
              }

              return (
                <button
                  key={`${cell.ymd}-${idx}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(cell.ymd)}
                  className={`relative w-8 h-8 sm:w-9 sm:h-9 text-xs font-medium rounded-full font-sans transition-all flex flex-col items-center justify-center cursor-pointer ${
                    isSelected
                      ? "bg-[#6366F1] text-white shadow-md shadow-indigo-200" // Matches exactly the bright indigo/purple selected color in user mockup
                      : textClass
                  }`}
                >
                  <span className={isSelected ? "font-bold" : ""}>{cell.day}</span>
                  {/* Small dots for booked dates */}
                  {isBooked && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 bg-[#6366F1] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Actions (Cancel / Apply) */}
          <div className="flex gap-2.5 pt-3.5 border-t border-black/5">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2.5 border border-black/10 hover:bg-black/5 text-xs font-semibold text-black/70 font-sans rounded-xl transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 py-2.5 bg-[#6366F1] hover:bg-[#5356E2] text-white text-xs font-semibold font-sans rounded-xl shadow-md transition-all cursor-pointer text-center"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
