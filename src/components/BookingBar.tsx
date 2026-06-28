import React, { useState, useEffect } from "react";
import { CalendarRange, Users, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { INITIAL_COTTAGES, isCottageAvailable } from "../utils";
import { Booking } from "../types";
import CustomDatePicker from "./CustomDatePicker";
import CustomSelect from "./CustomSelect";

interface BookingBarProps {
  bookings: Booking[];
  searchCheckIn: string;
  searchCheckOut: string;
  searchCottageId: string;
  searchGuests: number;
  showOnlyAvailable: boolean;
  onParamsChange: (params: {
    checkIn: string;
    checkOut: string;
    cottageId: string;
    guests: number;
    showOnlyAvailable: boolean;
  }) => void;
  onCheckAvailability: (params: {
    checkIn: string;
    checkOut: string;
    cottageId: string;
    guests: number;
  }) => void;
}

export default function BookingBar({
  bookings,
  searchCheckIn,
  searchCheckOut,
  searchCottageId,
  searchGuests,
  showOnlyAvailable,
  onParamsChange,
  onCheckAvailability,
}: BookingBarProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(searchCheckIn);
  const [checkOut, setCheckOut] = useState(searchCheckOut);
  const [cottageId, setCottageId] = useState(searchCottageId);
  const [guests, setGuests] = useState(searchGuests);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync internal states with parent props if they change
  useEffect(() => {
    setCheckIn(searchCheckIn);
  }, [searchCheckIn]);

  useEffect(() => {
    setCheckOut(searchCheckOut);
  }, [searchCheckOut]);

  useEffect(() => {
    setCottageId(searchCottageId);
  }, [searchCottageId]);

  useEffect(() => {
    setGuests(searchGuests);
  }, [searchGuests]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setErrorMsg("Please select both check-in and check-out dates.");
      return;
    }
    if (new Date(checkIn) >= new Date(checkOut)) {
      setErrorMsg("Check-out date must be after check-in date.");
      return;
    }
    setErrorMsg("");
    onCheckAvailability({ checkIn, checkOut, cottageId, guests });
  };

  const handleParamChange = (updates: {
    checkIn?: string;
    checkOut?: string;
    cottageId?: string;
    guests?: number;
    showOnlyAvailable?: boolean;
  }) => {
    const nextParams = {
      checkIn: updates.checkIn !== undefined ? updates.checkIn : checkIn,
      checkOut: updates.checkOut !== undefined ? updates.checkOut : checkOut,
      cottageId: updates.cottageId !== undefined ? updates.cottageId : cottageId,
      guests: updates.guests !== undefined ? updates.guests : guests,
      showOnlyAvailable: updates.showOnlyAvailable !== undefined ? updates.showOnlyAvailable : showOnlyAvailable,
    };
    onParamsChange(nextParams);
  };

  // Calculate live count of available cottages
  const availableCount = INITIAL_COTTAGES.filter((c) =>
    isCottageAvailable(c.id, checkIn, checkOut, bookings)
  ).length;

  // Calculate array of booked dates for the selected cottage category
  const getBookedDatesArray = () => {
    const booked: string[] = [];
    bookings.forEach((b) => {
      if (b.status === "cancelled") return;
      if (cottageId !== "any" && b.cottageId !== cottageId) return;

      const start = new Date(b.checkIn);
      const end = new Date(b.checkOut);
      const current = new Date(start);

      while (current < end) {
        const ymd = current.toISOString().split("T")[0];
        if (!booked.includes(ymd)) {
          booked.push(ymd);
        }
        current.setDate(current.getDate() + 1);
      }
    });
    return booked;
  };

  const bookedDates = getBookedDatesArray();

  return (
    <div className="relative z-20 max-w-6xl mx-auto px-4 -mt-10 sm:-mt-14">
      <form
        onSubmit={handleSearch}
        className="bg-white border border-black/10 shadow-2xl p-6 lg:p-8 flex flex-col gap-6 rounded-3xl transition-all duration-300 hover:shadow-gold/5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
          {/* Check-In */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold font-sans flex items-center gap-1.5">
              <CalendarRange className="w-3.5 h-3.5 text-gold" />
              Check-In Date
            </label>
            <CustomDatePicker
              value={checkIn}
              onChange={(newCheckIn) => {
                setCheckIn(newCheckIn);
                let newCheckOut = checkOut;
                if (new Date(newCheckIn) >= new Date(checkOut)) {
                  const nextDay = new Date(new Date(newCheckIn).getTime() + 86400000);
                  newCheckOut = nextDay.toISOString().split("T")[0];
                  setCheckOut(newCheckOut);
                }
                handleParamChange({ checkIn: newCheckIn, checkOut: newCheckOut });
              }}
              minDate={todayStr}
              label="Check-In"
              bookedDates={bookedDates}
            />
          </div>

          {/* Check-Out */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold font-sans flex items-center gap-1.5">
              <CalendarRange className="w-3.5 h-3.5 text-gold" />
              Check-Out Date
            </label>
            <CustomDatePicker
              value={checkOut}
              onChange={(newCheckOut) => {
                setCheckOut(newCheckOut);
                handleParamChange({ checkOut: newCheckOut });
              }}
              minDate={checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split("T")[0] : todayStr}
              label="Check-Out"
              bookedDates={bookedDates}
              isCheckOutPicker={true}
            />
          </div>

          {/* Cottage Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold font-sans flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Cottage Sanctuary
            </label>
            <CustomSelect
              value={cottageId}
              onChange={(val) => {
                setCottageId(val);
                handleParamChange({ cottageId: val });
              }}
              options={[
                { value: "any", label: "Any Cottage Type", emoji: "🏕️", description: "Show all available retreats" },
                ...INITIAL_COTTAGES.map((c) => {
                  const isAvailable = isCottageAvailable(c.id, checkIn, checkOut, bookings);
                  let emoji = "🏡";
                  if (c.id === "tarasha") emoji = "✨";
                  else if (c.id === "purbasha") emoji = "🌅";
                  else if (c.id === "rodela") emoji = "☀️";
                  else if (c.id === "meghla") emoji = "☁️";
                  else if (c.id === "nilima") emoji = "🌌";
                  else if (c.id === "chandrima_eco") emoji = "🌙";
                  else if (c.id === "bashonti_villa") emoji = "🏰";

                  return {
                    value: c.id,
                    label: c.name,
                    emoji,
                    description: `${c.type} • Max ${c.maxGuests} Guests`,
                    badge: isAvailable ? "Free" : "Booked",
                    badgeColor: isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
                  };
                })
              ]}
              placeholder="Select Cottage"
              searchable={true}
            />
          </div>

          {/* Guests Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold font-sans flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gold" />
              Total Guests
            </label>
            <CustomSelect
              value={guests}
              onChange={(val) => {
                const numVal = Number(val);
                setGuests(numVal);
                handleParamChange({ guests: numVal });
              }}
              options={[
                { value: 1, label: "1 Guest", emoji: "👤", description: "Solo traveler" },
                { value: 2, label: "2 Guests", emoji: "👥", description: "Perfect for couples" },
                { value: 3, label: "3 Guests", emoji: "👪", description: "Small family stay" },
                { value: 4, label: "4 Guests (Villa Only)", emoji: "🏰", description: "Exclusive villa package" },
              ]}
              placeholder="Select Guests"
            />
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              id="bar-check-btn"
              className="w-full py-4 bg-[#1A1A1A] text-white font-sans font-semibold text-xs uppercase tracking-widest hover:bg-black active:scale-[0.98] transition-all shadow-lg rounded-xl flex items-center justify-center gap-2"
            >
              Check Availability
            </button>
          </div>
        </div>

        {/* Live availability toggle switch & helper stats row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-black/5">
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOnlyAvailable}
                onChange={(e) => {
                  const val = e.target.checked;
                  handleParamChange({ showOnlyAvailable: val });
                }}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-black/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black/15 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold" />
              <span className="ml-3 text-xs font-sans font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                Show only available cottages
                {availableCount > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 border border-green-200 text-green-700 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    {availableCount} available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 border border-red-200 text-red-700">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    fully booked
                  </span>
                )}
              </span>
            </label>
          </div>

          <div className="text-[10px] font-mono text-black/40 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>Secured live validation across Sajek booking pools</span>
          </div>
        </div>
      </form>

      {/* Date Errors display */}
      {errorMsg && (
        <div className="mt-2 bg-red-50 border border-red-200 text-red-800 text-xs px-4 py-2.5 flex items-center gap-2 font-sans rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
