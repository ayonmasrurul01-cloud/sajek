import React from "react";
import { Star, Users, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { Cottage, Booking } from "../types";
import { isCottageAvailable } from "../utils";

interface CottageCardProps {
  key?: string;
  cottage: Cottage;
  onExplore: (cottage: Cottage) => void;
  onBook: (cottageId: string) => void;
  checkIn?: string;
  checkOut?: string;
  bookings?: Booking[];
}

export default function CottageCard({ cottage, onExplore, onBook, checkIn, checkOut, bookings }: CottageCardProps) {
  const isVilla = cottage.id.includes("villa") || cottage.id.includes("bashonti");
  const hasAvailabilityCheck = checkIn && checkOut && bookings;
  const isAvailable = hasAvailabilityCheck ? isCottageAvailable(cottage.id, checkIn!, checkOut!, bookings!) : true;

  return (
    <div
      onClick={() => onExplore(cottage)}
      className="group relative bg-white border border-black/5 rounded-3xl overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-300 hover:border-black/10 hover:shadow-xl"
    >
      {/* Badge container */}
      <div className="absolute top-4 left-4 z-10 flex gap-1.5 items-center">
        <div className="bg-[#1A1A1A] px-3 py-1 text-[9px] uppercase tracking-widest text-white font-semibold font-sans rounded-full">
          {cottage.type}
        </div>
        
        {hasAvailabilityCheck && (
          <div className={`px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold rounded-full font-sans border flex items-center gap-1 ${
            isAvailable
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-green-500" : "bg-red-500"}`} />
            {isAvailable ? "Available" : "Fully Booked"}
          </div>
        )}
      </div>

      {/* Image wrapper */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#FAF9F6]">
        <img
          src={cottage.image}
          alt={cottage.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-95 group-hover:brightness-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent opacity-80" />
      </div>

      {/* Info Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif text-2xl font-light text-[#1A1A1A] group-hover:text-gold transition-colors">
              {cottage.name}
            </h3>
            {/* Stars */}
            <div className="flex items-center gap-0.5 text-gold">
              {[...Array(cottage.rating)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-gold text-gold shrink-0" />
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-black/50 font-sans line-clamp-2 leading-relaxed mb-4">
            {cottage.description}
          </p>

          {/* Features list */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {cottage.features.slice(0, 3).map((feat, idx) => (
              <span
                key={idx}
                className="text-[9px] font-sans px-2.5 py-1 bg-black/5 border border-black/5 text-black/70 rounded-full"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing and Action row */}
        <div className="pt-4 border-t border-black/5 flex items-center justify-between">
          <div>
            <span className="block text-[8px] uppercase tracking-widest text-black/40 font-sans">
              From Rate:
            </span>
            <span className="font-serif text-lg font-bold text-[#1A1A1A]">
              ৳{cottage.weekdayPrice.toLocaleString()}{" "}
              <span className="text-[10px] text-black/40 font-sans font-light uppercase tracking-normal">
                / night
              </span>
            </span>
          </div>

          <button
            id={`book-${cottage.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onBook(cottage.id);
            }}
            className="flex items-center justify-center w-10 h-10 border border-black/10 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 rounded-full group-hover:border-black"
            title="Book stay immediately"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
