import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Check, Sparkles, Users } from "lucide-react";

interface Option {
  value: string | number;
  label: string;
  emoji?: string;
  description?: string;
  badge?: string; // e.g. "Free", "Booked"
  badgeColor?: string;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select Option",
  label,
  icon,
  searchable = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  return (
    <div ref={containerRef} className="relative w-full font-sans">
      {/* Dropdown Button / Input field */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#FAF9F6] border py-3 px-4 text-[#1A1A1A] text-sm outline-none cursor-pointer rounded-xl transition-all duration-200 flex items-center justify-between select-none shadow-sm ${
          isOpen
            ? "border-[#6366F1] ring-2 ring-[#6366F1]/10"
            : "border-black/10 hover:border-black/20"
        }`}
      >
        <div className="flex flex-col items-start text-left flex-1 min-w-0">
          {label && (
            <span className="text-[10px] uppercase tracking-wider text-black/40 font-bold mb-0.5">
              {label}
            </span>
          )}
          {searchable && isOpen ? (
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder={selectedOption ? selectedOption.label : placeholder}
              className="w-full bg-transparent border-none p-0 text-sm text-[#1A1A1A] font-medium outline-none placeholder-black/30"
              autoFocus
            />
          ) : (
            <span className="font-semibold text-[#1A1A1A] truncate flex items-center gap-1.5">
              {selectedOption?.emoji && (
                <span className="text-base">{selectedOption.emoji}</span>
              )}
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 pl-2 border-l border-black/5 ml-2 text-black/40">
          {icon}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-[#6366F1]" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* Floating Dropdown options list */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 z-50 bg-white border border-black/10 shadow-2xl p-2 rounded-2xl max-h-[280px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-xs text-center text-black/40 font-medium">
              No options found
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 flex items-center justify-between cursor-pointer mb-0.5 last:mb-0 ${
                    isSelected
                      ? "bg-[#EEF2FF] text-[#6366F1]"
                      : "text-black/80 hover:bg-black/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {opt.emoji && (
                      <span className="text-base shrink-0 select-none">
                        {opt.emoji}
                      </span>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className={`${isSelected ? "font-bold" : "font-medium"} truncate`}>
                        {opt.label}
                      </span>
                      {opt.description && (
                        <span className="text-[10px] text-black/40 font-normal truncate mt-0.5">
                          {opt.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {opt.badge && (
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          opt.badgeColor || "bg-black/5 text-black/60"
                        }`}
                      >
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-[#6366F1]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
