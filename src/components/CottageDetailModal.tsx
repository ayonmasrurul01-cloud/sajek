import React, { useState } from "react";
import { X, Check, Star, ShieldAlert, Award, Gift, Clock } from "lucide-react";
import { Cottage } from "../types";

interface CottageDetailModalProps {
  cottage: Cottage | null;
  onClose: () => void;
  onBook: (cottageId: string) => void;
}

export default function CottageDetailModal({ cottage, onClose, onBook }: CottageDetailModalProps) {
  if (!cottage) return null;

  const [activePhoto, setActivePhoto] = useState(cottage.image);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#FAF9F6] border border-black/10 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col rounded-3xl">
        {/* Header Title with X Close button */}
        <div className="flex items-center justify-between p-6 border-b border-black/5 bg-[#F0EEE9]">
          <div>
            <h2 className="font-serif text-2xl tracking-wide text-[#1A1A1A] font-light">{cottage.name}</h2>
            <p className="text-xs text-gold font-semibold uppercase tracking-[0.2em] -mt-0.5">{cottage.type}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full border border-black/10 text-black/60 hover:text-[#1A1A1A] hover:border-black transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-8 font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gallery Left Column */}
            <div className="space-y-3">
              <div className="aspect-[4/3] w-full overflow-hidden bg-black/5 border border-black/10 rounded-2xl">
                <img
                  src={activePhoto}
                  alt={cottage.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all"
                />
              </div>
              {/* Thumbnails Row */}
              <div className="grid grid-cols-4 gap-2">
                {cottage.gallery.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(photo)}
                    className={`aspect-[4/3] overflow-hidden bg-black/5 border transition-all rounded-xl ${
                      activePhoto === photo ? "border-gold scale-95" : "border-black/5 hover:border-black/20"
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Specs Right Column */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-serif text-gold font-bold">
                    ৳{cottage.weekdayPrice.toLocaleString()} / night
                  </span>
                  <div className="flex items-center gap-1 text-gold">
                    <span className="text-sm font-bold text-[#1A1A1A] font-sans mr-1">{cottage.rating}.0</span>
                    {[...Array(cottage.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-black/70 leading-relaxed font-sans">
                  {cottage.description}
                </p>

                {/* Specs List */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-black/5">
                  <div className="bg-white border border-black/5 p-3 rounded-2xl">
                    <span className="block text-[9px] uppercase tracking-widest text-black/40">Max Occupancy:</span>
                    <span className="text-xs text-[#1A1A1A] font-medium">{cottage.maxGuests} Adults + 1 Child</span>
                  </div>
                  <div className="bg-white border border-black/5 p-3 rounded-2xl">
                    <span className="block text-[9px] uppercase tracking-widest text-black/40">Bed Setup:</span>
                    <span className="text-xs text-[#1A1A1A] font-medium">1 Premium Couple Bed</span>
                  </div>
                </div>
              </div>

              {/* Instant Action */}
              <button
                id="modal-book-instant"
                onClick={() => onBook(cottage.id)}
                className="w-full py-4 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest font-sans font-semibold hover:bg-black active:scale-95 transition-all text-center rounded-full"
              >
                Book This Cottage Now
              </button>
            </div>
          </div>

          {/* Premium Tab Panels equivalent (Aesthetic specs, Rules, packages) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-black/10">
            {/* Left Specs List */}
            <div className="space-y-4">
              <h4 className="text-sm uppercase tracking-widest text-gold font-bold font-sans flex items-center gap-2">
                <Award className="w-4 h-4 text-gold shrink-0" />
                Sanctuary Amenities
              </h4>
              <ul className="space-y-2.5 text-xs text-black/80">
                {cottage.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Packages and Rules */}
            <div className="space-y-6">
              {cottage.packages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm uppercase tracking-widest text-gold font-bold font-sans flex items-center gap-2">
                    <Gift className="w-4 h-4 text-gold shrink-0" />
                    Included Complementary Package
                  </h4>
                  <div className="bg-white border border-black/10 p-4 rounded-3xl">
                    <h5 className="text-xs font-bold text-gold uppercase tracking-wider mb-1">
                      {cottage.packages[0].name}
                    </h5>
                    <p className="text-xs text-black/60 mb-2 leading-relaxed">
                      {cottage.packages[0].description}
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-black/80">
                      {cottage.packages[0].features.map((pf, j) => (
                        <li key={j} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-gold rounded-full" />
                          {pf}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Policies and CheckIn details */}
              <div className="space-y-3 bg-[#F0EEE9] p-4 border border-black/5 rounded-2xl">
                <h4 className="text-xs uppercase tracking-widest text-black/70 font-semibold font-sans flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
                  Check-In & Stay Policies
                </h4>
                <div className="space-y-2 text-xs text-black/60">
                  <div className="flex justify-between">
                    <span>Check-In Time:</span>
                    <span className="text-[#1A1A1A] font-medium">11:30 AM onwards</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-Out Time:</span>
                    <span className="text-[#1A1A1A] font-medium">09:30 AM sharp</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-gold/80 italic border-t border-black/10 pt-2 flex items-start gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      Advance payment of 3,060 tk via bKash personal 01815-761065 within 24 hours of booking is required.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Reviews Section */}
          <div className="space-y-4 pt-6 border-t border-black/10">
            <h4 className="text-sm uppercase tracking-widest text-gold font-bold font-sans">
              Reviews from our valuable visitors
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cottage.reviews.map((rev, i) => (
                <div key={i} className="bg-white p-4 border border-black/5 rounded-2xl flex flex-col justify-between">
                  <div className="flex items-center gap-0.5 text-gold mb-2.5">
                    {[...Array(rev.rating)].map((_, starIdx) => (
                      <Star key={starIdx} className="w-3 h-3 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-xs italic text-black/70 leading-relaxed font-sans mb-4">
                    "{rev.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-10 bg-gold/10 border border-gold/20 flex items-center justify-center font-serif text-sm text-gold rounded-lg">
                      {rev.avatar}
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-black font-sans">{rev.author}</span>
                      <span className="block text-[10px] text-black/40 uppercase tracking-widest font-sans">
                        Verified Guest · {rev.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
