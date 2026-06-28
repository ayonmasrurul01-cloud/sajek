import React, { useState, useEffect } from "react";
import { ChevronDown, CloudSun, MapPin, Eye } from "lucide-react";

interface HeroProps {
  onOpenBooking: () => void;
  onExploreStays: () => void;
}

const BACKGROUNDS = [
  "https://www.meghpunji.com/uploads/0000/7/2025/10/04/megh-polli-resort-entrance.jpg",
  "https://www.meghpunji.com/uploads/0000/7/2025/10/04/megh-polli-resort-cloudy-view.jpg",
  "https://www.meghpunji.com/uploads/0000/7/2025/10/04/megh-punjii-resort.jpg"
];

export default function Hero({ onOpenBooking, onExploreStays }: HeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % BACKGROUNDS.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[92vh] min-h-[640px] flex items-end overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {BACKGROUNDS.map((bg, idx) => (
          <div
            key={bg}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out scale-[1.03] ${
              idx === activeSlide ? "opacity-100 scale-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `linear-gradient(to top, rgba(26,26,24,0.92) 0%, rgba(26,26,24,0.4) 50%, rgba(26,26,24,0.1) 100%), url(${bg})`
            }}
          />
        ))}
      </div>

      {/* Floating Elevation Tag */}
      <div className="absolute top-28 right-8 z-10 hidden lg:flex items-center gap-2 px-4 py-2 bg-[#1A1A1A]/80 border border-white/10 backdrop-blur-md rounded-full text-xs font-sans text-gold">
        <CloudSun className="w-4 h-4" />
        <span>Sajek Union · 1,800 Ft Elevation</span>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6 animate-fade-in">
            <span className="h-[1px] w-8 bg-gold" />
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold font-sans">
              Meghpunji Resort Sajek
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-5xl sm:text-7xl font-extralight tracking-tight leading-[1.08] text-white mb-6">
            Where the clouds <br />
            <span className="italic text-gold font-light font-serif">come to rest.</span>
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base text-white/70 font-sans leading-relaxed mb-10 max-w-lg">
            Experience Bangladesh\'s first eco-mud house cottages and private pool villas, perched gracefully above the Mizoram hillside. Wake up wrapped inside a gentle ocean of fog.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <button
              id="hero-book-now"
              onClick={onOpenBooking}
              className="px-8 py-4 bg-white text-[#1A1A1A] text-xs uppercase tracking-widest font-sans font-semibold hover:bg-[#FAF9F6] active:scale-95 transition-all shadow-xl rounded-full"
            >
              Reserve a Cottage
            </button>
            <button
              id="hero-explore"
              onClick={onExploreStays}
              className="px-8 py-4 border border-white/30 text-white text-xs uppercase tracking-widest font-sans font-semibold hover:bg-white/10 hover:border-white transition-all flex items-center justify-center gap-2 rounded-full"
            >
              <Eye className="w-3.5 h-3.5 text-gold" />
              Explore Stays
            </button>
          </div>
        </div>
      </div>

      {/* Bottom sliding dots indicator */}
      <div className="absolute bottom-10 right-8 z-10 hidden sm:flex items-center gap-2">
        {BACKGROUNDS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === activeSlide ? "w-8 bg-gold" : "w-1.5 bg-white/40"
            }`}
            title={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Bounce scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-white/40 select-none animate-bounce-slow">
        <span className="text-[10px] uppercase tracking-widest font-sans">Scroll</span>
        <ChevronDown className="w-4 h-4 text-gold" />
      </div>
    </section>
  );
}
