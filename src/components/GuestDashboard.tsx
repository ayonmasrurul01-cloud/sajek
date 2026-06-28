import React, { useState, useMemo } from "react";
import {
  CloudSun,
  Clock,
  Wifi,
  Coffee,
  Compass,
  HelpCircle,
  Send,
  CheckCircle,
  TrendingUp,
  X,
  User,
  Mail,
  Phone,
  DollarSign,
  AlertCircle,
  Calendar,
  Lock
} from "lucide-react";
import { Booking, EmailLog } from "../types";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";

interface GuestDashboardProps {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
  };
  bookings: Booking[];
  emailLogs: EmailLog[];
  onRefreshData: () => void;
}

export default function GuestDashboard({
  user,
  bookings,
  emailLogs,
  onRefreshData,
}: GuestDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "notifications" | "support">("overview");

  // Local state for payment modal
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "card">("bkash");
  const [transactionId, setTransactionId] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Local state for support request
  const [supportPhone, setSupportPhone] = useState("");
  const [supportMsg, setSupportMsg] = useState("");
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);

  // Filter bookings belonging to this guest
  const guestBookings = useMemo(() => {
    return bookings.filter(
      (b) => b.userId === user.uid || (user.email && b.customerEmail.toLowerCase() === user.email.toLowerCase())
    );
  }, [bookings, user]);

  // Filter notification emails sent to this guest
  const guestNotifications = useMemo(() => {
    return emailLogs.filter(
      (log) => user.email && log.recipientEmail.toLowerCase() === user.email.toLowerCase()
    );
  }, [emailLogs, user]);

  // Guest loyalty tier
  const loyaltyTier = useMemo(() => {
    const activeCount = guestBookings.filter((b) => b.status !== "cancelled").length;
    if (activeCount >= 3) {
      return {
        name: "VIP Cloud Walker",
        color: "text-amber-400 bg-amber-950/40 border-amber-500/20",
        perk: "Access to private plunge pools & 15% discount on all next reservations."
      };
    } else if (activeCount >= 1) {
      return {
        name: "Mist Explorer",
        color: "text-cyan-400 bg-cyan-950/40 border-cyan-500/20",
        perk: "Priority sunset deck access & complimentary high tea platter."
      };
    } else {
      return {
        name: "Sunset Wanderer",
        color: "text-white/60 bg-white/5 border-white/10",
        perk: "Early check-in option when available."
      };
    }
  }, [guestBookings]);

  // Simulated Weather
  const weather = useMemo(() => {
    return {
      temp: "22°C",
      humidity: "88%",
      cloudSeaProb: "95%",
      status: "High Humidity Morning - Spectacular Cloud Sea Predicted",
    };
  }, []);

  // Handle Mock Payment submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingBooking || !transactionId.trim()) return;

    setIsSubmittingPayment(true);
    try {
      const path = `bookings/${payingBooking.id}`;
      const bookingRef = doc(db, "bookings", payingBooking.id);
      
      // Update the state to partially paid or fully paid
      const updatedFields = {
        transactionId: transactionId.trim(),
        paymentMethod: paymentMethod,
        paymentStatus: "paid" as const, // In a simulation we assume successful payment
        amountPaid: payingBooking.totalAmount, // mark as fully paid
        status: "confirmed" as const, // auto-confirm on payment simulation
      };

      await updateDoc(bookingRef, updatedFields);
      setPayingBooking(null);
      setTransactionId("");
      onRefreshData();
      alert("Payment successful! Our reservation managers will verify your transaction ID shortly.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${payingBooking?.id}`);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Handle Support Request Submission
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMsg.trim()) return;

    setIsSubmittingSupport(true);
    try {
      const contactId = `CNT-${Math.floor(100000 + Math.random() * 900000)}`;
      await addDoc(collection(db, "contacts"), {
        id: contactId,
        name: user.displayName || user.email?.split("@")[0] || "Guest",
        email: user.email || "",
        phone: supportPhone || "Not provided",
        message: supportMsg,
        createdAt: new Date().toISOString(),
      });
      setSupportPhone("");
      setSupportMsg("");
      setSupportSubmitted(true);
      setTimeout(() => setSupportSubmitted(false), 4000);
      onRefreshData();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "contacts");
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  return (
    <section className="py-12 bg-[#1A1A18] min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gold/15 pb-6">
          <div>
            <h1 className="text-3xl font-serif font-light flex items-center gap-2">
              <User className="w-8 h-8 text-gold" />
              My Guest Portal
            </h1>
            <p className="text-xs text-gold/70 tracking-widest uppercase mt-1">
              Track reservation status, upload deposits, view local guides, & alerts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold border rounded-full ${loyaltyTier.color}`}>
              Tier: {loyaltyTier.name}
            </span>
          </div>
        </div>

        {/* Overview Stats & Weather */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#242422] border border-gold/10 p-5 space-y-3">
            <span className="block text-[10px] uppercase tracking-widest text-white/40">Profile Summary</span>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-4 h-4 text-gold shrink-0" />
                <span>My Bookings: {guestBookings.length} Total</span>
              </div>
              <p className="text-[10px] text-gold/70 italic mt-1 font-serif">
                Perk: {loyaltyTier.perk}
              </p>
            </div>
          </div>

          <div className="bg-[#242422] border border-gold/10 p-5 space-y-2">
            <span className="block text-[10px] uppercase tracking-widest text-white/40">Sajek Weather & Clouds</span>
            <div className="flex items-center gap-3">
              <CloudSun className="w-10 h-10 text-gold shrink-0" />
              <div>
                <div className="text-xl font-bold">{weather.temp}</div>
                <div className="text-[10px] text-white/50">Humidity: {weather.humidity} | Cloud Sea: {weather.cloudSeaProb}</div>
              </div>
            </div>
            <p className="text-[10px] text-emerald-400 font-medium leading-relaxed">
              {weather.status}
            </p>
          </div>

          <div className="bg-[#242422] border border-gold/10 p-5 space-y-3">
            <span className="block text-[10px] uppercase tracking-widest text-white/40">Resort Wi-Fi & Gate</span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-gold shrink-0" />
                <span>SSID: <strong className="font-mono">Meghpunji_Guest_WiFi</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gold shrink-0" />
                <span>Pass: <strong className="font-mono">MeghpunjiGuestCloud</strong></span>
              </div>
              <p className="text-[9px] text-white/40">
                Resort gates remain locked to non-residents for maximum safety and privacy.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex border-b border-white/5 space-x-1 sm:space-x-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 text-xs uppercase tracking-widest font-sans font-bold transition-all border-b-2 ${
              activeTab === "overview" ? "border-gold text-gold" : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            Stay Guide & Info
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-3 text-xs uppercase tracking-widest font-sans font-bold transition-all border-b-2 ${
              activeTab === "bookings" ? "border-gold text-gold" : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            My Reservations ({guestBookings.length})
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-3 text-xs uppercase tracking-widest font-sans font-bold transition-all border-b-2 ${
              activeTab === "notifications" ? "border-gold text-gold" : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            My Notifications ({guestNotifications.length})
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`px-4 py-3 text-xs uppercase tracking-widest font-sans font-bold transition-all border-b-2 ${
              activeTab === "support" ? "border-gold text-gold" : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            Concierge Help Desk
          </button>
        </div>

        {/* TABS VIEW PANEL */}
        <div className="bg-[#21211f] border border-gold/10 p-6">
          
          {/* stay guide panel */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/5 pb-4">
                <h3 className="text-base font-serif text-white font-medium">Your Stay Experience above 1,800 Feet</h3>
                <p className="text-xs text-white/50 mt-1">Important details, guide contacts, and schedule timelines for Meghpunji guests.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="flex items-center gap-2 text-gold">
                    <Coffee className="w-5 h-5" />
                    <h4 className="text-xs uppercase font-bold tracking-wider">Dining & Tea Service</h4>
                  </div>
                  <ul className="text-xs text-white/70 space-y-2 list-disc pl-4 font-sans leading-relaxed">
                    <li><strong>Morning Tea:</strong> Served directly on your private cottage balcony at 07:00 AM daily.</li>
                    <li><strong>Complimentary Breakfast:</strong> Traditional Sajek Khichuri, fried egg, and coffee served 08:00 AM – 09:30 AM in the glasshouse dining deck.</li>
                    <li><strong>Late Night Tea Flasks:</strong> Available on-demand by calling front desk before 10:00 PM.</li>
                  </ul>
                </div>

                <div className="space-y-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="flex items-center gap-2 text-gold">
                    <Compass className="w-5 h-5" />
                    <h4 className="text-xs uppercase font-bold tracking-wider">Trekking & Tour Guides</h4>
                  </div>
                  <ul className="text-xs text-white/70 space-y-2 list-disc pl-4 font-sans leading-relaxed">
                    <li><strong>Konglak Para Hike:</strong> The highest point in Sajek. Scheduled treks daily at 05:30 AM (Sunrise view) & 04:30 PM (Sunset view).</li>
                    <li><strong>Alutila Cave & Stone Forest:</strong> Day tours can be arranged via 4x4 Chander Gari on-site.</li>
                    <li><strong>Authorized Guides:</strong> Contact Front Desk to pair with authorized indigenous hill guides.</li>
                  </ul>
                </div>

                <div className="space-y-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="flex items-center gap-2 text-gold">
                    <HelpCircle className="w-5 h-5" />
                    <h4 className="text-xs uppercase font-bold tracking-wider">Eco-Cottage Rules</h4>
                  </div>
                  <ul className="text-xs text-white/70 space-y-2 list-disc pl-4 font-sans leading-relaxed">
                    <li><strong>Water Use:</strong> Geyser heating runs completely on IPS solar power, please preserve water.</li>
                    <li><strong>Check Out strictly:</strong> 09:30 AM to allow proper sanitization before next arrivals.</li>
                    <li><strong>Zero Noise Zone:</strong> Loud music or speakers strictly prohibited on balconies after 10:00 PM to respect wilderness serenity.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* bookings ledger panel */}
          {activeTab === "bookings" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-base font-serif text-white font-medium">My Reservations Ledger</h3>
                  <p className="text-xs text-white/50 mt-1">Manage and upload deposits for your booked sanctuaries.</p>
                </div>
              </div>

              {guestBookings.length === 0 ? (
                <div className="py-12 text-center text-white/30 italic">
                  You don't have any bookings matching your email or account UID yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {guestBookings.map((b) => (
                    <div key={b.id} className="bg-white/[0.02] border border-gold/15 p-5 rounded-xl space-y-4 relative overflow-hidden">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="block text-[10px] font-mono text-gold font-bold">{b.id}</span>
                          <h4 className="font-serif text-lg font-medium text-white">{b.cottageName}</h4>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold border ${
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
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-sans text-white/70 border-y border-white/5 py-3">
                        <div>
                          <span className="block text-[9px] text-white/40 uppercase">Check-In</span>
                          <span className="font-semibold">{b.checkIn}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-white/40 uppercase">Check-Out</span>
                          <span className="font-semibold">{b.checkOut}</span>
                        </div>
                        <div className="pt-2">
                          <span className="block text-[9px] text-white/40 uppercase">Guests</span>
                          <span>{b.adults} Adults {b.children > 0 ? `, ${b.children} Children` : ""}</span>
                        </div>
                        <div className="pt-2">
                          <span className="block text-[9px] text-white/40 uppercase">Billing Ledger</span>
                          <span className="font-bold text-gold">৳{b.amountPaid.toLocaleString()} / ৳{b.totalAmount.toLocaleString()}</span>
                          <span className="block text-[8px] uppercase tracking-wider text-white/50">{b.paymentStatus}</span>
                        </div>
                      </div>

                      {b.transactionId && (
                        <div className="text-[10px] bg-white/5 p-2 rounded border border-white/5 flex justify-between items-center font-mono">
                          <span className="text-white/40">Transaction ID:</span>
                          <span className="text-gold font-bold">{b.transactionId}</span>
                        </div>
                      )}

                      {/* Pay Button / Actions */}
                      <div className="flex gap-2">
                        {b.paymentStatus !== "paid" && b.status !== "cancelled" && (
                          <button
                            onClick={() => setPayingBooking(b)}
                            className="w-full py-2 bg-gold text-ink text-xs uppercase tracking-widest font-bold hover:opacity-90 active:scale-95 transition-all text-center"
                          >
                            Upload bKash/Card Deposit
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* alerts and email logs */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/5 pb-4">
                <h3 className="text-base font-serif text-white font-medium">My Notification Records</h3>
                <p className="text-xs text-white/50 mt-1">Real-time alerts and digital logs sent to your verified inbox.</p>
              </div>

              {guestNotifications.length === 0 ? (
                <div className="py-12 text-center text-white/30 italic">
                  No automated notification logs found for your email address. Complete a booking or update payment to trigger automated letters.
                </div>
              ) : (
                <div className="space-y-4">
                  {guestNotifications.map((log) => (
                    <div key={log.id} className="p-4 bg-white/[0.02] border border-white/10 rounded-xl space-y-3 text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/5 pb-2">
                        <div>
                          <span className="text-xs font-mono text-gold font-semibold">[{log.id}]</span>
                          <h4 className="text-sm font-semibold text-white mt-0.5">{log.subject}</h4>
                        </div>
                        <span className="text-[10px] text-white/40 font-mono">
                          {new Date(log.sentAt).toLocaleString()}
                        </span>
                      </div>
                      <pre className="text-xs text-white/70 font-sans whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto bg-[#1A1A18] p-3 border border-white/5 rounded">
                        {log.body}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Concierge Support Form */}
          {activeTab === "support" && (
            <div className="max-w-xl mx-auto space-y-6 animate-fade-in py-4 text-left">
              <div className="border-b border-white/5 pb-4">
                <h3 className="text-base font-serif text-white font-medium">Submit Concierge Desk Message</h3>
                <p className="text-xs text-white/50 mt-1">Send a direct message to the Sajek reservation and room management desk.</p>
              </div>

              {supportSubmitted ? (
                <div className="p-5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-xl text-center space-y-2 animate-fade-in">
                  <CheckCircle className="w-10 h-10 mx-auto text-emerald-400" />
                  <h4 className="text-sm font-bold">Message Transmitted!</h4>
                  <p className="text-xs opacity-80">Our Sajek mountain managers will contact you via your email or phone shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="space-y-4 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="block text-white/60 text-[10px] uppercase tracking-wider">Contact Phone (Optional)</label>
                    <input
                      type="tel"
                      placeholder="+880 1XXX-XXXXXX"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl p-3 text-white outline-none placeholder:text-white/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-white/60 text-[10px] uppercase tracking-wider font-semibold">Concierge Query / Message *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Ask about tour guides, transport, extra pillows, early check-in or request billing verification..."
                      value={supportMsg}
                      onChange={(e) => setSupportMsg(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl p-3 text-white outline-none resize-none placeholder:text-white/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingSupport}
                    className="w-full bg-gold text-ink font-bold py-3 uppercase tracking-widest text-[10px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmittingSupport ? "Sending..." : "Submit Support Request"}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Payment Upload Modal */}
      {payingBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#242422] border border-gold/20 p-6 max-w-md w-full relative space-y-6 animate-fade-in text-left">
            <button
              onClick={() => setPayingBooking(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-gold font-bold">RESERVATION LEDGER DEPOSIT</span>
              <h3 className="text-xl font-serif font-light text-white mt-1">Upload Payment / Transaction ID</h3>
              <p className="text-xs text-white/50 mt-1">Cottage: {payingBooking.cottageName}</p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs font-sans">
              
              {/* Payment Method selector */}
              <div className="space-y-1">
                <label className="block text-white/60 text-[10px] uppercase tracking-wider">Deposit Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bkash")}
                    className={`py-3 border text-center font-bold uppercase tracking-wider ${
                      paymentMethod === "bkash" ? "bg-pink-900/20 border-pink-500 text-pink-300" : "bg-transparent border-white/10 text-white/50"
                    }`}
                  >
                    bKash Wallet
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`py-3 border text-center font-bold uppercase tracking-wider ${
                      paymentMethod === "card" ? "bg-blue-900/20 border-blue-500 text-blue-300" : "bg-transparent border-white/10 text-white/50"
                    }`}
                  >
                    Credit Card
                  </button>
                </div>
              </div>

              {/* Amount Info */}
              <div className="p-3 bg-white/5 border border-white/5 flex justify-between items-center">
                <span>Total Amount Due:</span>
                <span className="font-bold text-gold">৳{payingBooking.totalAmount.toLocaleString()}</span>
              </div>

              {paymentMethod === "bkash" ? (
                <div className="p-3 bg-pink-950/20 border border-pink-900/30 text-[11px] text-pink-200 leading-relaxed">
                  Please send an advance deposit of <strong>৳3,060</strong> or full payment <strong>৳{payingBooking.totalAmount.toLocaleString()}</strong> to our official bKash personal wallet number: <strong>01815-761065</strong>, then input the transaction ID below.
                </div>
              ) : (
                <div className="p-3 bg-blue-950/20 border border-blue-900/30 text-[11px] text-blue-200 leading-relaxed">
                  Complete simulated credit/debit card secure verification. Input your mock payment transaction token or random ID below.
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-white/60 text-[10px] uppercase tracking-wider font-semibold">Transaction ID / Payment Code *</label>
                <input
                  type="text"
                  required
                  placeholder={paymentMethod === "bkash" ? "e.g. BKASH_TRX981A" : "e.g. CARD_TOKEN_9901"}
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 rounded-xl p-3 text-white outline-none font-mono placeholder:text-white/20"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingPayment}
                className="w-full bg-gold text-ink font-bold py-3 uppercase tracking-widest text-[10px] hover:opacity-90 transition-opacity"
              >
                {isSubmittingPayment ? "Submitting Deposit..." : "Submit Transaction Deposit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
