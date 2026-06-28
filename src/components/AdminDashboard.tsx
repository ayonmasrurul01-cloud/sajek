import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Bed,
  Users,
  Mail,
  Search,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  AlertCircle,
  RefreshCw,
  Plus,
  ShieldCheck,
  ClipboardList,
  Contact,
  DollarSign,
  Sliders,
  Send
} from "lucide-react";
import { Booking, Cottage, EmailLog } from "../types";
import { INITIAL_COTTAGES, generateAutomatedEmail } from "../utils";

interface AdminDashboardProps {
  bookings: Booking[];
  emailLogs: EmailLog[];
  onUpdateBooking: (updated: Booking) => void;
  onAddLog: (log: EmailLog) => void;
  onOpenBooking: () => void;
}

export default function AdminDashboard({
  bookings,
  emailLogs,
  onUpdateBooking,
  onAddLog,
  onOpenBooking,
}: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<"calendar" | "bookings" | "guests" | "emails" | "inventory" | "broadcast">("calendar");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Manual broadcast states
  const [manualRecipient, setManualRecipient] = useState("");
  const [manualSubject, setManualSubject] = useState("");
  const [manualBody, setManualBody] = useState("");
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  // Cottage custom statuses and surcharges stored in localstorage
  const [cottageSettings, setCottageSettings] = useState<{ [id: string]: { status: string; surcharge: number; notes: string } }>(() => {
    const saved = localStorage.getItem("meghpunji_cottage_settings");
    if (saved) return JSON.parse(saved);
    const defaults: { [id: string]: { status: string; surcharge: number; notes: string } } = {};
    INITIAL_COTTAGES.forEach((c) => {
      defaults[c.id] = { status: "Active", surcharge: 0, notes: "Fully operational" };
    });
    return defaults;
  });

  const handleUpdateCottageSetting = (id: string, status: string, surcharge: number, notes: string) => {
    const next = { ...cottageSettings, [id]: { status, surcharge, notes } };
    setCottageSettings(next);
    localStorage.setItem("meghpunji_cottage_settings", JSON.stringify(next));
  };

  const handleSendManualEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRecipient || !manualSubject || !manualBody) return;

    const newLog: EmailLog = {
      id: "EM-" + Math.floor(1000 + Math.random() * 9000),
      bookingId: "MANUAL-BROADCAST",
      recipientEmail: manualRecipient,
      subject: manualSubject,
      body: manualBody,
      sentAt: new Date().toISOString(),
      status: "sent",
      templateType: "check_in"
    };
    onAddLog(newLog);

    setManualRecipient("");
    setManualSubject("");
    setManualBody("");
    setSendSuccess("Notification logged and broadcast simulated successfully!");
    setTimeout(() => setSendSuccess(null), 4000);
  };

  // Generate date columns for the calendar matrix (Next 8 days)
  const calendarDates = useMemo(() => {
    const list: string[] = [];
    const today = new Date();
    for (let i = -1; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      list.push(d.toISOString().split("T")[0]);
    }
    return list;
  }, []);

  // ANALYTICS CALCULATIONS
  const stats = useMemo(() => {
    const totalRev = bookings.reduce((sum, b) => b.status !== "cancelled" ? sum + b.amountPaid : sum, 0);
    const confirmedCount = bookings.filter((b) => b.status === "confirmed" || b.status === "checked_in").length;
    const occupancyRate = Math.round((confirmedCount / (INITIAL_COTTAGES.length * 2)) * 100);

    const pendingPayments = bookings.filter((b) => b.paymentStatus !== "paid" && b.status !== "cancelled").length;
    const guestCount = new Set(bookings.map((b) => b.customerEmail.toLowerCase())).size;

    return {
      totalRev,
      occupancyRate,
      pendingPayments,
      guestCount,
    };
  }, [bookings]);

  // Guest directory helper (unique guest aggregates)
  const guestsList = useMemo(() => {
    const map = new Map<string, { name: string; email: string; phone: string; stays: number; spent: number; notes: string; bookings: Booking[] }>();
    bookings.forEach((b) => {
      const emailKey = b.customerEmail.toLowerCase().trim();
      const existing = map.get(emailKey);
      if (existing) {
        existing.stays += 1;
        existing.spent += b.amountPaid;
        existing.bookings.push(b);
        if (b.adminNotes && !existing.notes.includes(b.adminNotes)) {
          existing.notes += " " + b.adminNotes;
        }
      } else {
        map.set(emailKey, {
          name: b.customerName,
          email: b.customerEmail,
          phone: b.customerPhone,
          stays: 1,
          spent: b.amountPaid,
          notes: b.adminNotes || "",
          bookings: [b],
        });
      }
    });
    return Array.from(map.values());
  }, [bookings]);

  // Filters bookings list based on search/status
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.cottageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customerPhone.includes(searchQuery) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || b.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  // Helper: check booking on calendar
  const getBookingForCell = (cottageId: string, date: string) => {
    return bookings.find((b) => {
      if (b.status === "cancelled") return false;
      const start = new Date(b.checkIn);
      const end = new Date(b.checkOut);
      const current = new Date(date);
      return current >= start && current < end && b.cottageId === cottageId;
    });
  };

  // ACTIONS HANDLERS
  const handleVerifyPayment = (booking: Booking) => {
    const updated: Booking = {
      ...booking,
      paymentStatus: "paid",
      amountPaid: booking.totalAmount, // Mark as fully paid
      status: booking.status === "pending" ? "confirmed" : booking.status,
    };
    onUpdateBooking(updated);

    // Trigger automated payment confirmed email log
    const emailLog = generateAutomatedEmail(updated, "payment_received");
    onAddLog(emailLog);
  };

  const handleCheckIn = (booking: Booking) => {
    const updated: Booking = { ...booking, status: "checked_in" };
    onUpdateBooking(updated);

    // Trigger welcome check-in email log
    const emailLog = generateAutomatedEmail(updated, "check_in");
    onAddLog(emailLog);
  };

  const handleCheckOut = (booking: Booking) => {
    const updated: Booking = { ...booking, status: "checked_out" };
    onUpdateBooking(updated);

    // Trigger thank you checkout email log
    const emailLog = generateAutomatedEmail(updated, "check_out");
    onAddLog(emailLog);
  };

  const handleCancelBooking = (booking: Booking) => {
    const updated: Booking = { ...booking, status: "cancelled" };
    onUpdateBooking(updated);
  };

  return (
    <section className="py-12 bg-[#171715] min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Title bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gold/15 pb-6">
          <div>
            <h1 className="text-3xl font-serif font-light flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-gold" />
              Sajek Reservation Dashboard
            </h1>
            <p className="text-xs text-gold/70 tracking-widest uppercase mt-1">
              Real-time property ledgers, guest profiles, & notification triggers
            </p>
          </div>
          <button
            onClick={onOpenBooking}
            className="flex items-center justify-center gap-2 bg-gold text-ink font-sans font-bold text-xs uppercase tracking-widest px-5 py-3 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-gold/5 shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            Add Reservation
          </button>
        </div>

        {/* ANALYTICS METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1f1f1d] border border-gold/10 p-5 flex items-center gap-4">
            <div className="p-3 bg-gold/15 text-gold border border-gold/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-white/40">Total Revenue Received</span>
              <span className="text-2xl font-serif text-white font-bold">৳{stats.totalRev.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-[#1f1f1d] border border-gold/10 p-5 flex items-center gap-4">
            <div className="p-3 bg-gold/15 text-gold border border-gold/20 flex items-center justify-center">
              <Bed className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-white/40">Occupancy Estimate</span>
              <span className="text-2xl font-serif text-white font-bold">{stats.occupancyRate}%</span>
            </div>
          </div>

          <div className="bg-[#1f1f1d] border border-gold/10 p-5 flex items-center gap-4">
            <div className="p-3 bg-gold/15 text-gold border border-gold/20 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-white/40">Unique Guest Profiles</span>
              <span className="text-2xl font-serif text-white font-bold">{stats.guestCount} Guest(s)</span>
            </div>
          </div>

          <div className="bg-[#1f1f1d] border border-gold/10 p-5 flex items-center gap-4">
            <div className="p-3 bg-red-950/20 text-red-400 border border-red-900/30 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-white/40">Pending Payments Alerts</span>
              <span className="text-2xl font-serif text-red-400 font-bold">{stats.pendingPayments} Stay(s)</span>
            </div>
          </div>
        </div>

        {/* SUBTAB CONTROLS */}
        <div className="flex border-b border-white/5 space-x-1 sm:space-x-4">
          <button
            onClick={() => setActiveSubTab("calendar")}
            className={`px-4 py-3 text-xs uppercase tracking-widest font-sans font-bold transition-all border-b-2 ${
              activeSubTab === "calendar" ? "border-gold text-gold" : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
            Reservation Matrix Grid
          </button>
          <button
            onClick={() => setActiveSubTab("bookings")}
            className={`px-4 py-3 text-xs uppercase tracking-widest font-sans font-bold transition-all border-b-2 ${
              activeSubTab === "bookings" ? "border-gold text-gold" : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 inline mr-1.5" />
            Reservations Ledger ({bookings.length})
          </button>
          <button
            onClick={() => setActiveSubTab("guests")}
            className={`px-4 py-3 text-xs uppercase tracking-widest font-sans font-bold transition-all border-b-2 ${
              activeSubTab === "guests" ? "border-gold text-gold" : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <Contact className="w-3.5 h-3.5 inline mr-1.5" />
            Guest Directory
          </button>
          <button
            onClick={() => setActiveSubTab("emails")}
            className={`px-4 py-3 text-xs uppercase tracking-widest font-sans font-bold transition-all border-b-2 ${
              activeSubTab === "emails" ? "border-gold text-gold" : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <Mail className="w-3.5 h-3.5 inline mr-1.5" />
            Automated Logs
          </button>
          <button
            onClick={() => setActiveSubTab("inventory")}
            className={`px-4 py-3 text-xs uppercase tracking-widest font-sans font-bold transition-all border-b-2 ${
              activeSubTab === "inventory" ? "border-gold text-gold" : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 inline mr-1.5" />
            Cottages & Rates
          </button>
          <button
            onClick={() => setActiveSubTab("broadcast")}
            className={`px-4 py-3 text-xs uppercase tracking-widest font-sans font-bold transition-all border-b-2 ${
              activeSubTab === "broadcast" ? "border-gold text-gold" : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <Send className="w-3.5 h-3.5 inline mr-1.5" />
            Manual Broadcast
          </button>
        </div>

        {/* MATRIX TAB PANEL */}
        {activeSubTab === "calendar" && (
          <div className="space-y-4 animate-fade-in bg-[#1e1e1c] border border-gold/10 p-6 overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-serif text-white font-semibold">Cottage Calendar Matrix (8-Day Window)</h3>
              <div className="flex items-center gap-3 text-[10px] uppercase font-sans">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-yellow-600/30 border border-yellow-500/50 rounded-sm" /> Pending deposit</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-800/30 border border-emerald-500/50 rounded-sm" /> Confirmed / Paid</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-cyan-800/30 border border-cyan-500/50 rounded-sm" /> Checked In</span>
              </div>
            </div>

            <table className="w-full text-xs font-sans min-w-[700px] border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-3 text-left font-semibold uppercase tracking-wider text-white/40 w-44">Sanctuary</th>
                  {calendarDates.map((date) => {
                    const parsed = new Date(date);
                    const isToday = date === new Date().toISOString().split("T")[0];
                    return (
                      <th key={date} className={`py-3 text-center border-l border-white/5 ${isToday ? "bg-gold/10 text-gold" : "text-white/70"}`}>
                        <div className="font-bold">{parsed.toLocaleDateString("en-GB", { weekday: "short" })}</div>
                        <div className="text-[10px] font-light text-white/50">{parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {INITIAL_COTTAGES.map((cottage) => (
                  <tr key={cottage.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-4 font-serif text-sm text-white font-medium">{cottage.name}</td>
                    {calendarDates.map((date) => {
                      const b = getBookingForCell(cottage.id, date);
                      return (
                        <td key={date} className="p-1 border-l border-white/5 text-center min-w-[80px]">
                          {b ? (
                            <div
                              onClick={() => setActiveSubTab("bookings")}
                              className={`p-1.5 text-[10px] text-center truncate cursor-pointer transition-all duration-200 border ${
                                b.status === "pending"
                                  ? "bg-yellow-950/40 border-yellow-500/30 text-yellow-300 hover:border-yellow-500"
                                  : b.status === "checked_in"
                                  ? "bg-cyan-950/40 border-cyan-500/30 text-cyan-300 hover:border-cyan-500"
                                  : "bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:border-emerald-500"
                              }`}
                              title={`${b.customerName} (${b.id}) - ${b.checkIn} to ${b.checkOut}`}
                            >
                              <div className="font-bold truncate">{b.customerName}</div>
                              <div className="opacity-65 text-[8px] tracking-wide truncate">{b.status.toUpperCase().replace("_", " ")}</div>
                            </div>
                          ) : (
                            <span className="text-white/20 select-none">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* BOOKINGS LEDGER TAB PANEL */}
        {activeSubTab === "bookings" && (
          <div className="space-y-4 animate-fade-in bg-[#1e1e1c] border border-gold/10 p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-white/5 pb-4">
              <div className="relative w-full sm:max-w-xs">
                <Search className="w-4 h-4 text-gold absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search bookings ledger..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl py-2.5 pl-9 pr-4 text-white text-xs font-sans outline-none placeholder:text-white/30"
                />
              </div>

              {/* Status Filters */}
              <div className="flex gap-2">
                {["all", "pending", "confirmed", "checked_in", "checked_out", "cancelled"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-semibold border ${
                      statusFilter === st
                        ? "bg-gold text-ink border-gold"
                        : "bg-white/5 text-white/50 border-white/5 hover:border-gold/30"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings list Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 uppercase tracking-wider text-[10px] text-left">
                    <th className="py-3">Booking ID</th>
                    <th className="py-3">Customer</th>
                    <th className="py-3">Cottage</th>
                    <th className="py-3">Dates</th>
                    <th className="py-3">Paid Ledger</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-white/30 italic">
                        No bookings found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 text-left">
                        <td className="py-4 font-mono font-bold text-gold">{b.id}</td>
                        <td className="py-4">
                          <div className="font-semibold text-white">{b.customerName}</div>
                          <div className="text-[10px] text-white/40">{b.customerPhone}</div>
                        </td>
                        <td className="py-4">{b.cottageName}</td>
                        <td className="py-4 font-mono text-[10px] text-white/70">
                          {b.checkIn} → {b.checkOut}
                        </td>
                        <td className="py-4">
                          <div className="font-bold">৳{b.amountPaid.toLocaleString()} / ৳{b.totalAmount.toLocaleString()}</div>
                          <div
                            className={`inline-block text-[8px] uppercase tracking-widest font-bold font-sans ${
                              b.paymentStatus === "paid" ? "text-emerald-400" : "text-yellow-400 animate-pulse"
                            }`}
                          >
                            {b.paymentStatus.toUpperCase()}
                          </div>
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2 py-1 text-[8px] uppercase tracking-widest font-bold border ${
                              b.status === "confirmed"
                                ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-300"
                                : b.status === "checked_in"
                                ? "bg-cyan-950/30 border-cyan-500/20 text-cyan-300"
                                : b.status === "checked_out"
                                ? "bg-white/5 border-white/20 text-white/40"
                                : b.status === "cancelled"
                                ? "bg-red-950/30 border-red-500/20 text-red-300"
                                : "bg-yellow-950/30 border-yellow-500/20 text-yellow-300"
                            }`}
                          >
                            {b.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-1.5">
                          {/* Payment Trigger */}
                          {b.paymentStatus !== "paid" && b.status !== "cancelled" && (
                            <button
                              id={`verify-pay-${b.id}`}
                              onClick={() => handleVerifyPayment(b)}
                              className="px-2 py-1 bg-emerald-700/20 border border-emerald-600/30 text-emerald-400 hover:bg-emerald-600 hover:text-ink text-[10px] uppercase font-bold tracking-wider"
                              title="Verify full payment and trigger confirmation notification"
                            >
                              Verify Pay
                            </button>
                          )}

                          {/* CheckIn triggers */}
                          {b.status === "confirmed" && (
                            <button
                              id={`checkin-${b.id}`}
                              onClick={() => handleCheckIn(b)}
                              className="px-2 py-1 bg-cyan-700/20 border border-cyan-600/30 text-cyan-400 hover:bg-cyan-600 hover:text-ink text-[10px] uppercase font-bold tracking-wider"
                            >
                              Check-In
                            </button>
                          )}

                          {/* CheckOut triggers */}
                          {b.status === "checked_in" && (
                            <button
                              id={`checkout-${b.id}`}
                              onClick={() => handleCheckOut(b)}
                              className="px-2 py-1 bg-amber-700/20 border border-amber-600/30 text-amber-400 hover:bg-amber-600 hover:text-ink text-[10px] uppercase font-bold tracking-wider"
                            >
                              Check-Out
                            </button>
                          )}

                          {/* Cancellation triggers */}
                          {b.status !== "cancelled" && b.status !== "checked_out" && (
                            <button
                              id={`cancel-${b.id}`}
                              onClick={() => handleCancelBooking(b)}
                              className="px-2 py-1 bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-500 hover:text-ink text-[10px] uppercase font-bold tracking-wider"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GUESTS DIRECTORY PANEL */}
        {activeSubTab === "guests" && (
          <div className="space-y-4 animate-fade-in bg-[#1e1e1c] border border-gold/10 p-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-sm font-serif text-white font-semibold">Active Guest CRM Ledger</h3>
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-gold absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search guest logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl py-2.5 pl-9 pr-4 text-white text-xs font-sans outline-none placeholder:text-white/30"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 uppercase tracking-wider text-[10px]">
                    <th className="py-3">Guest Contact</th>
                    <th className="py-3">Loyalty Stays</th>
                    <th className="py-3">Financial Value</th>
                    <th className="py-3">Administrative / VIP Notes</th>
                    <th className="py-3 text-right">Stay Status</th>
                  </tr>
                </thead>
                <tbody>
                  {guestsList
                    .filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.email.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((g, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-4">
                          <div className="font-semibold text-white">{g.name}</div>
                          <div className="text-[10px] text-white/50">{g.email}</div>
                          <div className="text-[10px] text-gold/80 font-mono">{g.phone}</div>
                        </td>
                        <td className="py-4 font-bold text-white">{g.stays} Stay(s)</td>
                        <td className="py-4 font-bold text-gold">৳{g.spent.toLocaleString()}</td>
                        <td className="py-4 max-w-xs truncate text-white/60 italic" title={g.notes}>
                          {g.notes || "No administrative notes recorded yet."}
                        </td>
                        <td className="py-4 text-right">
                          <span className="text-[10px] font-sans font-medium text-emerald-400 bg-emerald-950/30 px-2.5 py-1 border border-emerald-500/20">
                            VIP Client
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AUTOMATED EMAIL LOGS PANEL */}
        {activeSubTab === "emails" && (
          <div className="space-y-4 animate-fade-in bg-[#1e1e1c] border border-gold/10 p-6">
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-sm font-serif text-white font-semibold">Automated SMTP Email Delivery Logs</h3>
              <p className="text-[10px] text-white/50 mt-1">
                Visualizing automated emails delivered to guest email targets in real-time on reservation checkout, payment receipts, or confirmed bookings.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 uppercase tracking-wider text-[10px]">
                    <th className="py-3">Log ID</th>
                    <th className="py-3">Recipient Email</th>
                    <th className="py-3">Subject Line</th>
                    <th className="py-3">Delivery Timestamp</th>
                    <th className="py-3 text-right">SMTP Status</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-white/30 italic">
                        No email logs generated yet. Submit a booking or update booking check-in status to trigger automated confirmations.
                      </td>
                    </tr>
                  ) : (
                    emailLogs.map((log) => (
                      <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-4 font-mono font-bold text-gold">{log.id}</td>
                        <td className="py-4 font-sans text-white/80">{log.recipientEmail || "admin@gmail.com"}</td>
                        <td className="py-4 text-white font-medium max-w-sm truncate" title={log.subject}>
                          {log.subject}
                        </td>
                        <td className="py-4 text-[10px] text-white/50 font-mono">
                          {new Date(log.sentAt).toLocaleString()}
                        </td>
                        <td className="py-4 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/20">
                            Sent & Delivered
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COTTAGES & RATES MANAGER PANEL */}
        {activeSubTab === "inventory" && (
          <div className="space-y-6 animate-fade-in bg-[#1e1e1c] border border-gold/10 p-6">
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-sm font-serif text-white font-semibold">Cottage Operational Rates & Maintenance Settings</h3>
              <p className="text-[10px] text-white/50 mt-1">
                Dynamically mark Sajek cottages for repair/maintenance or configure special seasonal premium surcharges.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {INITIAL_COTTAGES.map((c) => {
                const setting = cottageSettings[c.id] || { status: "Active", surcharge: 0, notes: "" };
                return (
                  <div key={c.id} className="p-5 bg-white/[0.02] border border-white/5 hover:border-gold/10 transition-all rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                        <Bed className="w-4 h-4 text-gold" />
                        {c.name}
                      </h4>
                      <p className="text-[10px] text-white/40 font-mono mt-0.5">Base Price: ৳{c.weekdayPrice.toLocaleString()}/night</p>
                    </div>

                    {/* Operational Status */}
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-wider text-white/45">Operational Status</label>
                      <select
                        value={setting.status}
                        onChange={(e) => handleUpdateCottageSetting(c.id, e.target.value, setting.surcharge, setting.notes)}
                        className="w-full bg-[#171715] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl px-3 py-2 text-xs font-sans text-white outline-none"
                      >
                        <option value="Active">Active & Available</option>
                        <option value="Maintenance">Under Maintenance (Offline)</option>
                        <option value="Premium Surcharge">Special Surcharge Active</option>
                      </select>
                    </div>

                    {/* Premium Surcharge */}
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-wider text-white/45">Seasonal Surcharge (৳)</label>
                      <input
                        type="number"
                        min="0"
                        value={setting.surcharge}
                        onChange={(e) => handleUpdateCottageSetting(c.id, setting.status, parseInt(e.target.value) || 0, setting.notes)}
                        className="w-full bg-[#171715] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl px-3 py-2 text-xs font-sans text-white outline-none placeholder:text-white/20"
                        placeholder="e.g. 1500"
                      />
                    </div>

                    {/* Maintenance / Admin Notes */}
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-wider text-white/45">Internal Repair Notes</label>
                      <input
                        type="text"
                        value={setting.notes}
                        onChange={(e) => handleUpdateCottageSetting(c.id, setting.status, setting.surcharge, e.target.value)}
                        className="w-full bg-[#171715] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl px-3 py-2 text-xs font-sans text-white outline-none placeholder:text-white/20"
                        placeholder="Notes on cottage condition"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MANUAL BROADCAST SYSTEM PANEL */}
        {activeSubTab === "broadcast" && (
          <div className="space-y-6 animate-fade-in bg-[#1e1e1c] border border-gold/10 p-6">
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-sm font-serif text-white font-semibold">Manual SMS & SMTP Broadcast Notification Center</h3>
              <p className="text-[10px] text-white/50 mt-1">
                Send emergency check-in notices, road condition alerts, or peak weather conditions straight to any guest's email ledger record.
              </p>
            </div>

            {sendSuccess && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl animate-fade-in flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {sendSuccess}
              </div>
            )}

            <form onSubmit={handleSendManualEmail} className="space-y-4 max-w-xl">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider text-white/60">Recipient Guest Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={manualRecipient}
                    onChange={(e) => setManualRecipient(e.target.value)}
                    className="flex-grow bg-[#171715] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl px-4 py-3 text-xs font-sans text-white outline-none placeholder:text-white/20"
                    placeholder="guest@gmail.com"
                  />
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setManualRecipient(e.target.value);
                      }
                    }}
                    className="bg-[#171715] border border-white/10 rounded-xl px-3 text-xs font-sans text-white outline-none max-w-[150px]"
                  >
                    <option value="">Select Guest...</option>
                    {guestsList.map((g, i) => (
                      <option key={i} value={g.email}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider text-white/60">Broadcast Subject Line</label>
                <input
                  type="text"
                  required
                  value={manualSubject}
                  onChange={(e) => setManualSubject(e.target.value)}
                  className="w-full bg-[#171715] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl px-4 py-3 text-xs font-sans text-white outline-none placeholder:text-white/20"
                  placeholder="e.g. Sajek Cloud Alert & Travel Advisory"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider text-white/60">Message Body / Notice</label>
                <textarea
                  required
                  rows={5}
                  value={manualBody}
                  onChange={(e) => setManualBody(e.target.value)}
                  className="w-full bg-[#171715] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl px-4 py-3 text-xs font-sans text-white outline-none placeholder:text-white/20 resize-none"
                  placeholder="Type reservation update or weather status notice here..."
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-gold text-ink font-sans font-bold text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-gold/5 flex items-center justify-center gap-2 rounded-xl"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch & Log Broadcast
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
