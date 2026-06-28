import React, { useState, useEffect } from "react";
import { X, CalendarRange, User, Mail, Phone, ShieldCheck, CreditCard, Sparkles, Check, Send, Smartphone } from "lucide-react";
import { Cottage, Booking } from "../types";
import { INITIAL_COTTAGES } from "../utils";
import CustomDatePicker from "./CustomDatePicker";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCottageId?: string;
  onBookingSuccess: (newBooking: Booking) => void;
  user?: any;
  bookings?: Booking[];
}

export default function BookingModal({
  isOpen,
  onClose,
  preselectedCottageId = "tarasha",
  onBookingSuccess,
  user,
  bookings = [],
}: BookingModalProps) {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [step, setStep] = useState(1);
  const [selectedCottageId, setSelectedCottageId] = useState(preselectedCottageId);
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [guests, setGuests] = useState(2);

  // Guest Details
  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [notes, setAdminNotes] = useState("");

  useEffect(() => {
    if (user) {
      if (!name) setName(user.displayName || "");
      if (!email) setEmail(user.email || "");
    }
  }, [user]);

  // Payment Setup
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "card">("bkash");
  const [amountPaidType, setAmountPaidType] = useState<"deposit" | "full">("deposit");

  // bKash States
  const [bkashNumber, setBkashNumber] = useState("");
  const [trxId, setTrxId] = useState("");

  // Card States
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Error/Loading States
  const [errorMsg, setErrorMsg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedCottage = INITIAL_COTTAGES.find((c) => c.id === selectedCottageId) || INITIAL_COTTAGES[0];

  // Calculate array of booked dates for the selected cottage category
  const getBookedDatesArray = () => {
    const booked: string[] = [];
    bookings.forEach((b) => {
      if (b.status === "cancelled") return;
      if (b.cottageId !== selectedCottageId) return;

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

  // Calculate pricing split into Weekday and Weekend nights
  const [nightsInfo, setNightsInfo] = useState({
    totalNights: 1,
    weekdayNights: 1,
    weekendNights: 0,
    totalCost: 0,
    requiredDeposit: 3060,
  });

  useEffect(() => {
    if (!checkIn || !checkOut) return;
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (start >= end) {
      return;
    }

    let current = new Date(start);
    let weekdays = 0;
    let weekends = 0;
    let totalNights = 0;

    while (current < end) {
      const day = current.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
      // Weekend definition: Friday & Saturday (based on Sajek resort packages in HTML)
      if (day === 5 || day === 6) {
        weekends++;
      } else {
        weekdays++;
      }
      totalNights++;
      current.setDate(current.getDate() + 1);
    }

    // Pricing
    const isPoolVilla = selectedCottage.id.includes("villa") || selectedCottage.id.includes("bashonti");
    let totalCost = 0;

    if (isPoolVilla) {
      // Flat rate for Pool Villa
      totalCost = totalNights * selectedCottage.weekdayPrice;
    } else {
      totalCost = weekdays * selectedCottage.weekdayPrice + weekends * selectedCottage.weekendPrice;
    }

    // Required deposit is flat 3,060 tk per cottage per night (per Sajek rules)
    const requiredDeposit = totalNights * 3060;

    setNightsInfo({
      totalNights,
      weekdayNights: weekdays,
      weekendNights: weekends,
      totalCost,
      requiredDeposit,
    });
  }, [checkIn, checkOut, selectedCottageId]);

  const handleNextStep = () => {
    setErrorMsg("");
    if (step === 1) {
      if (new Date(checkIn) >= new Date(checkOut)) {
        setErrorMsg("Check-out date must be after the check-in date.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!name.trim()) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setErrorMsg("Please enter a valid email address.");
        return;
      }
      if (!phone.trim()) {
        setErrorMsg("Please enter your phone number.");
        return;
      }
      setStep(3);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsProcessing(true);

    // Validate Payment
    if (paymentMethod === "bkash") {
      if (!bkashNumber || bkashNumber.length < 11) {
        setErrorMsg("Please enter a valid bKash wallet number (11 digits).");
        setIsProcessing(false);
        return;
      }
      if (!trxId.trim()) {
        setErrorMsg("Please enter the bKash Transaction ID from your confirmation message.");
        setIsProcessing(false);
        return;
      }
    } else {
      if (cardNumber.replace(/\s/g, "").length < 16) {
        setErrorMsg("Please enter a valid 16-digit card number.");
        setIsProcessing(false);
        return;
      }
      if (!cardHolder.trim()) {
        setErrorMsg("Please enter the cardholder's name.");
        setIsProcessing(false);
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMsg("Please enter expiry in MM/YY format.");
        setIsProcessing(false);
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMsg("Please enter CVV code.");
        setIsProcessing(false);
        return;
      }
    }

    // Process Booking Success
    setTimeout(() => {
      const amountPaid = amountPaidType === "full" ? nightsInfo.totalCost : nightsInfo.requiredDeposit;
      const paymentStatus = amountPaid >= nightsInfo.totalCost ? "paid" : "partial";

      const newBooking: Booking = {
        id: `MP-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        cottageId: selectedCottage.id,
        cottageName: selectedCottage.name,
        checkIn,
        checkOut,
        adults: guests > 2 ? 2 : guests,
        children: guests > 2 ? guests - 2 : 0,
        totalAmount: nightsInfo.totalCost,
        amountPaid,
        paymentMethod,
        paymentStatus,
        status: "confirmed", // Mark as verified on instant verification ID
        transactionId: paymentMethod === "bkash" ? trxId.toUpperCase() : `VISA_${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString().split("T")[0],
        adminNotes: notes,
        userId: user?.uid || "anonymous",
      };

      onBookingSuccess(newBooking);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#1b1b19] border border-gold/25 shadow-2xl overflow-hidden my-8 max-h-[95vh] flex flex-col font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold/10 bg-earth/10">
          <div>
            <h2 className="font-serif text-2xl tracking-wide text-white">Cottage Reservation Wizard</h2>
            <div className="flex items-center gap-1.5 mt-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step ? "w-6 bg-gold" : s < step ? "w-2.5 bg-gold/50" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
              <span className="text-[10px] text-white/50 uppercase tracking-widest ml-2">
                Step {step} of 3
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border border-gold/10 text-white/60 hover:text-gold hover:border-gold transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="bg-red-950/80 border border-red-500/20 text-red-200 text-xs px-4 py-3 rounded-none font-sans flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: SELECT SANCTUARY & DATES */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Select Cottage Sanctuary</label>
                <select
                  value={selectedCottageId}
                  onChange={(e) => setSelectedCottageId(e.target.value)}
                  className="w-full bg-white/5 border border-gold/15 py-3.5 px-4 text-white font-sans text-sm focus:border-gold outline-none cursor-pointer"
                >
                  {INITIAL_COTTAGES.map((c) => (
                    <option key={c.id} value={c.id} className="bg-ink text-white">
                      {c.name} (৳{c.weekdayPrice}/night)
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Check-In Date</label>
                  <CustomDatePicker
                    value={checkIn}
                    onChange={(newCheckIn) => {
                      setCheckIn(newCheckIn);
                      if (new Date(newCheckIn) >= new Date(checkOut)) {
                        setCheckOut(new Date(new Date(newCheckIn).getTime() + 86400000).toISOString().split("T")[0]);
                      }
                    }}
                    minDate={todayStr}
                    label="Check-In"
                    bookedDates={bookedDates}
                    inputClassName="w-full bg-white/5 border border-gold/15 py-3.5 px-4 text-white font-sans text-sm focus-within:border-gold outline-none flex items-center justify-between cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Check-Out Date</label>
                  <CustomDatePicker
                    value={checkOut}
                    onChange={(newCheckOut) => setCheckOut(newCheckOut)}
                    minDate={checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split("T")[0] : todayStr}
                    label="Check-Out"
                    bookedDates={bookedDates}
                    isCheckOutPicker={true}
                    inputClassName="w-full bg-white/5 border border-gold/15 py-3.5 px-4 text-white font-sans text-sm focus-within:border-gold outline-none flex items-center justify-between cursor-pointer"
                  />
                </div>
              </div>

              {/* Guest selection count */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Total Stay Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full bg-white/5 border border-gold/15 py-3.5 px-4 text-white font-sans text-sm focus:border-gold outline-none cursor-pointer"
                >
                  <option value={1} className="bg-ink text-white">1 Guest</option>
                  <option value={2} className="bg-ink text-white">2 Guests</option>
                  <option value={3} className="bg-ink text-white">3 Guests</option>
                  {selectedCottage.id.includes("villa") && (
                    <option value={4} className="bg-ink text-white">4 Guests</option>
                  )}
                </select>
              </div>

              {/* Real-time Pricing details card */}
              <div className="bg-[#242422] border border-gold/10 p-5 mt-6 space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-gold font-bold font-sans flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-gold shrink-0 animate-pulse" />
                  Live Pricing Calculation
                </h4>
                <div className="space-y-2 text-xs text-white/70">
                  <div className="flex justify-between">
                    <span>Total Nights:</span>
                    <span className="text-white font-bold">{nightsInfo.totalNights} Night(s)</span>
                  </div>
                  {nightsInfo.weekdayNights > 0 && (
                    <div className="flex justify-between">
                      <span>Weekday rate ({nightsInfo.weekdayNights} night(s)):</span>
                      <span className="text-white font-medium">৳{(nightsInfo.weekdayNights * selectedCottage.weekdayPrice).toLocaleString()}</span>
                    </div>
                  )}
                  {nightsInfo.weekendNights > 0 && (
                    <div className="flex justify-between">
                      <span>Weekend rate ({nightsInfo.weekendNights} night(s)):</span>
                      <span className="text-white font-medium">৳{(nightsInfo.weekendNights * selectedCottage.weekendPrice).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/5 pt-2 text-sm text-white font-bold">
                    <span>Grand Total:</span>
                    <span className="text-gold">৳{nightsInfo.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-gold/10 pt-2 text-xs text-gold/80 italic font-sans flex-col gap-1 sm:flex-row sm:items-center">
                    <span>Required Deposit (bKash standard):</span>
                    <span className="font-bold text-white bg-gold/15 px-2 py-1 border border-gold/15">
                      ৳{nightsInfo.requiredDeposit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: GUEST PERSONAL INFORMATION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gold font-bold flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gold" />
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter full name (matching NID)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl py-3.5 px-4 text-white font-sans text-sm outline-none placeholder:text-white/20"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gold font-bold flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gold" />
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="name@example.com (for automated confirmations)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl py-3.5 px-4 text-white font-sans text-sm outline-none placeholder:text-white/20"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gold font-bold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gold" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+880 1XXXX-XXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl py-3.5 px-4 text-white font-sans text-sm outline-none placeholder:text-white/20"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Special Requests / Admin Notes</label>
                <textarea
                  placeholder="E.g., early check-in arrival request, child sheets, or dietary choices"
                  value={notes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl py-3 px-4 text-white font-sans text-sm outline-none resize-none placeholder:text-white/20"
                />
              </div>
            </div>
          )}

          {/* STEP 3: INTEGRATED PAYMENT PROCESSING */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Payment Methods selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bkash")}
                  className={`py-3 px-4 flex items-center justify-center gap-2 border font-sans text-xs uppercase tracking-widest font-semibold transition-all ${
                    paymentMethod === "bkash"
                      ? "bg-gold text-ink border-gold"
                      : "bg-white/5 text-white/70 border-white/10 hover:border-gold/50"
                  }`}
                >
                  <Smartphone className="w-4 h-4 shrink-0" />
                  BKash Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`py-3 px-4 flex items-center justify-center gap-2 border font-sans text-xs uppercase tracking-widest font-semibold transition-all ${
                    paymentMethod === "card"
                      ? "bg-gold text-ink border-gold"
                      : "bg-white/5 text-white/70 border-white/10 hover:border-gold/50"
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  Credit / Debit Card
                </button>
              </div>

              {/* Amount paid category */}
              <div className="p-4 bg-white/5 border border-gold/10 space-y-2">
                <span className="block text-[9px] uppercase tracking-widest text-gold font-bold">Choose Payment Amount</span>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                    <input
                      type="radio"
                      name="amountType"
                      checked={amountPaidType === "deposit"}
                      onChange={() => setAmountPaidType("deposit")}
                      className="accent-gold cursor-pointer"
                    />
                    <span>Pay Required Advance (৳{nightsInfo.requiredDeposit.toLocaleString()})</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                    <input
                      type="radio"
                      name="amountType"
                      checked={amountPaidType === "full"}
                      onChange={() => setAmountPaidType("full")}
                      className="accent-gold cursor-pointer"
                    />
                    <span>Pay Grand Total (৳{nightsInfo.totalCost.toLocaleString()})</span>
                  </label>
                </div>
              </div>

              {/* BKASH DETAILED STEP-BY-STEP */}
              {paymentMethod === "bkash" && (
                <div className="space-y-4 border border-gold/15 p-5 bg-gold/5 animate-fade-in">
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-widest text-gold font-bold">BKash personal payment procedure</h4>
                    <p className="text-xs text-white/70 leading-relaxed font-sans">
                      1. Open your bKash wallet and click <strong className="text-white">Send Money</strong>.<br />
                      2. Transfer the payment to bKash Number <strong className="text-gold font-bold select-all">01815-761065</strong>.<br />
                      3. Input the exact verified transaction details below for real-time dashboard ledger validation.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gold/15 pt-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Your bKash Number</label>
                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={bkashNumber}
                        onChange={(e) => setBkashNumber(e.target.value)}
                        className="w-full bg-[#171715] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl py-2.5 px-3 text-white font-sans text-xs outline-none placeholder:text-white/20"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold">bKash Transaction ID (TrxID)</label>
                      <input
                        type="text"
                        placeholder="E.g., 9F84J9A1L"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        className="w-full bg-[#171715] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl py-2.5 px-3 text-white font-sans text-xs outline-none uppercase placeholder:text-white/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CARD DETAILED STEP-BY-STEP WITH 3D MIRROR CARD */}
              {paymentMethod === "card" && (
                <div className="space-y-5 animate-fade-in">
                  {/* Virtual card mirror representation */}
                  <div className="perspective-1000 flex justify-center py-2">
                    <div
                      className={`relative w-72 h-44 rounded-2xl bg-gradient-to-br from-[#d4af37] via-[#a3814b] to-[#1e1e1e] text-white p-5 flex flex-col justify-between shadow-2xl transition-all duration-500 transform-style-3d cursor-pointer ${
                        isCardFlipped ? "rotate-y-180" : ""
                      }`}
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                      title="Click to flip card"
                    >
                      {/* Front of Card */}
                      <div className="absolute inset-0 p-5 flex flex-col justify-between backface-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-sans uppercase tracking-widest text-white/70">
                            Meghpunji VIP Club
                          </span>
                          <span className="text-sm font-serif italic text-gold font-bold">VISA</span>
                        </div>
                        {/* Chip & Number */}
                        <div>
                          <div className="w-8 h-6 bg-yellow-200/20 border border-yellow-200/30 rounded-md mb-2 shrink-0" />
                          <span className="font-mono text-base tracking-widest block font-sans">
                            {cardNumber || "•••• •••• •••• ••••"}
                          </span>
                        </div>
                        {/* Name & Expiry */}
                        <div className="flex justify-between items-end text-xs">
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-white/50">Holder</span>
                            <span className="font-medium tracking-wide block truncate w-36 uppercase font-sans">
                              {cardHolder || "MASRURUL ISLAM"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-white/50">Expiry</span>
                            <span className="font-medium block font-sans">{cardExpiry || "MM/YY"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Back of Card */}
                      <div className="absolute inset-0 rounded-2xl bg-[#1e1e1e] border border-gold/20 flex flex-col justify-between backface-hidden rotate-y-180 p-5">
                        <div className="w-full h-8 bg-black -mx-5 mt-2" />
                        <div className="flex justify-end gap-2 items-center text-xs pt-4">
                          <span className="block text-[8px] uppercase text-white/40 font-sans">CVV</span>
                          <div className="bg-white text-ink font-mono px-2 py-1 rounded font-bold">
                            {cardCvv || "•••"}
                          </div>
                        </div>
                        <p className="text-[6px] text-white/40 leading-tight">
                          This is a luxury simulated card processed instantly using the 3D payments gateway at Meghpunji Resort Sajek.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card input forms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gold/15 pt-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Card Number</label>
                      <input
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\s?/g, "").replace(/(\d{4})/g, "$1 ").trim();
                          setCardNumber(val);
                        }}
                        onFocus={() => setIsCardFlipped(false)}
                        className="w-full bg-[#171715] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl py-2.5 px-3 text-white font-sans text-xs outline-none placeholder:text-white/20"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="E.g., MASRURUL ISLAM"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        onFocus={() => setIsCardFlipped(false)}
                        className="w-full bg-[#171715] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl py-2.5 px-3 text-white font-sans text-xs outline-none uppercase placeholder:text-white/20"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Expiry Date (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length > 2) {
                            val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                          }
                          setCardExpiry(val);
                        }}
                        onFocus={() => setIsCardFlipped(false)}
                        className="w-full bg-[#171715] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl py-2.5 px-3 text-white font-sans text-xs outline-none placeholder:text-white/20"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold">CVV Security Code</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                        onFocus={() => setIsCardFlipped(true)}
                        onBlur={() => setIsCardFlipped(false)}
                        className="w-full bg-[#171715] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl py-2.5 px-3 text-white font-sans text-xs outline-none placeholder:text-white/20"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between p-6 border-t border-gold/10 bg-earth/5">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                setErrorMsg("");
                setStep(step - 1);
              }}
              className="px-6 py-2.5 border border-gold/20 text-gold text-xs uppercase tracking-widest hover:bg-gold/5"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              id="wizard-next-step"
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-gold text-ink text-xs uppercase tracking-widest font-sans font-bold hover:opacity-90"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              id="wizard-submit"
              onClick={handleBookingSubmit}
              disabled={isProcessing}
              className="px-6 py-2.5 bg-gold text-ink text-xs uppercase tracking-widest font-sans font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-ink border-t-transparent rounded-full animate-spin shrink-0" />
                  Processing Stay...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-ink shrink-0" />
                  Confirm Reservation
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
