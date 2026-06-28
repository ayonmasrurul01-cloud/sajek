import React, { useState, useEffect } from "react";
import {
  Trees,
  Phone,
  Mail,
  MapPin,
  Star,
  Award,
  Video,
  ShieldCheck,
  Send,
  CloudSun,
  Utensils,
  Sun,
  Flame,
  UserCheck,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import BookingBar from "./components/BookingBar";
import CottageCard from "./components/CottageCard";
import CottageDetailModal from "./components/CottageDetailModal";
import BookingModal from "./components/BookingModal";
import AdminDashboard from "./components/AdminDashboard";
import EmailVisualizer from "./components/EmailVisualizer";
import LoginModal from "./components/LoginModal";
import GuestDashboard from "./components/GuestDashboard";
import { Cottage, Booking, EmailLog } from "./types";
import {
  INITIAL_COTTAGES,
  getInitialBookings,
  saveBookingsToStorage,
  getStoredEmailLogs,
  saveEmailLog,
  generateAutomatedEmail,
  isCottageAvailable
} from "./utils";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, getDoc, setDoc } from "firebase/firestore";

const GALLERY_IMAGES = [
  {
    url: "https://www.meghpunji.com/uploads/0000/7/2025/10/04/megh-polli-resort-cloudy-view.jpg",
    title: "Spectacular Cloud Ocean View"
  },
  {
    url: "https://www.meghpunji.com/uploads/0000/7/2025/10/04/chandrima-cottage-feature.jpg",
    title: "Chandrima Cottage"
  },
  {
    url: "https://www.meghpunji.com/uploads/0000/7/2025/10/04/meghla-cottage-feature.jpg",
    title: "Meghla Sanctuary"
  },
  {
    url: "https://www.meghpunji.com/uploads/0000/7/2025/10/04/nilima-cottage-feature.jpg",
    title: "Nilima Cottage View"
  },
  {
    url: "https://www.meghpunji.com/uploads/0000/7/2025/10/04/purbasha-feature.jpg",
    title: "Purbasha Balcony"
  },
  {
    url: "https://www.meghpunji.com/uploads/0000/7/2025/09/21/tarasha-meghpunji-resort.jpg",
    title: "Tarasha Glass cottage"
  },
  {
    url: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
    title: "Sunrise at Sajek"
  },
  {
    url: "https://www.meghpunji.com/uploads/0000/7/2025/10/04/meghpolli-bashonti-cottage-rooms.jpg",
    title: "Cosy interiors"
  }
];

export default function App() {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem("meghpunji_sandbox_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(() => {
    const saved = localStorage.getItem("meghpunji_sandbox_user");
    if (saved) {
      const u = JSON.parse(saved);
      return u.email?.toLowerCase() === "admin@gmail.com" || 
             u.email?.toLowerCase().includes("admin");
    }
    return false;
  });
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("meghpunji_sandbox_user");
    if (saved) {
      const u = JSON.parse(saved);
      return u.email?.toLowerCase() === "admin@gmail.com" || 
             u.email?.toLowerCase().includes("admin");
    }
    return false;
  });
  const [currentTab, setCurrentTab] = useState<string>(() => {
    const saved = localStorage.getItem("meghpunji_sandbox_user");
    if (saved) {
      const u = JSON.parse(saved);
      const isAdmin = u.email?.toLowerCase() === "admin@gmail.com" || 
                      u.email?.toLowerCase().includes("admin");
      return isAdmin ? "admin" : "dashboard";
    }
    return "home";
  });

  // Core Data States (synchronized with Firestore and localStorage fallback)
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  // Auth States
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Modal / Interaction States
  const [selectedCottage, setSelectedCottage] = useState<Cottage | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [preselectedCottageId, setPreselectedCottageId] = useState("tarasha");

  // Controlled BookingBar search states
  const [searchCheckIn, setSearchCheckIn] = useState(new Date().toISOString().split("T")[0]);
  const [searchCheckOut, setSearchCheckOut] = useState(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
  const [searchCottageId, setSearchCottageId] = useState("any");
  const [searchGuests, setSearchGuests] = useState(2);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Email Notification Visualizer State (holds the most recently sent automated email)
  const [activeNotificationEmail, setActiveNotificationEmail] = useState<EmailLog | null>(null);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // newsletter states
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  // Photo gallery active lightbox image state
  const [activeGalleryImg, setActiveGalleryImg] = useState<string | null>(null);

  // About story modal state
  const [showAboutModal, setShowAboutModal] = useState(false);

  // 1. Listen to Auth State changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Clear any sandbox state since real firebase auth is active now
        localStorage.removeItem("meghpunji_sandbox_user");
        setUser(currentUser);
        // Check if user is registered in /admins collection
        const adminDocRef = doc(db, "admins", currentUser.uid);
        try {
          const adminSnap = await getDoc(adminDocRef);
          const isUserAnAdmin = 
            adminSnap.exists() || 
            currentUser.email?.toLowerCase() === "admin@gmail.com" || 
            currentUser.email?.toLowerCase().includes("admin");
          
          if (isUserAnAdmin && !adminSnap.exists()) {
            try {
              await setDoc(adminDocRef, {
                uid: currentUser.uid,
                email: currentUser.email?.toLowerCase().trim() || "",
                role: "admin",
                createdAt: new Date().toISOString()
              });
              console.log("Automatically bootstrapped admin document in Firestore.");
            } catch (dbErr) {
              console.warn("Failed to automatically bootstrap admin document:", dbErr);
            }
          }
          setIsUserAdmin(!!isUserAnAdmin);
          if (isUserAnAdmin) {
            setIsAdminMode(true);
          }
        } catch (err) {
          console.warn("Could not query admin collection status, defaulting to role check:", err);
          const isUserAnAdmin = 
            currentUser.email?.toLowerCase() === "admin@gmail.com" || 
            currentUser.email?.toLowerCase().includes("admin");
          setIsUserAdmin(isUserAnAdmin);
          if (isUserAnAdmin) {
            setIsAdminMode(true);
          }
        }
      } else {
        // If sandbox user is active, ignore auth state reset
        const isSandbox = localStorage.getItem("meghpunji_sandbox_user");
        if (isSandbox) {
          const u = JSON.parse(isSandbox);
          setUser(u);
          const isUserAnAdmin = 
            u.email?.toLowerCase() === "admin@gmail.com" || 
            u.email?.toLowerCase().includes("admin");
          setIsUserAdmin(isUserAnAdmin);
          if (isUserAnAdmin) {
            setIsAdminMode(true);
          }
          return;
        }
        setUser(null);
        setIsUserAdmin(false);
        setIsAdminMode(false);
        if (currentTab === "dashboard") {
          setCurrentTab("home");
        }
      }
    });
    return unsubscribe;
  }, [currentTab]);

  // 2. Subscribe to real-time collections (with security context)
  useEffect(() => {
    let unsubscribeBookings = () => {};
    let unsubscribeEmails = () => {};

    if (user) {
      if (isUserAdmin) {
        // Admin: Subscribe to all records
        unsubscribeBookings = onSnapshot(collection(db, "bookings"), (snapshot) => {
          const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
          docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setBookings(docs);
        }, (err) => {
          console.error("Firestore admin bookings subscription error:", err);
          // Fallback to local storage if subscription fails (e.g. sandbox mode)
          const loadedBookings = getInitialBookings();
          setBookings(loadedBookings);
          handleFirestoreError(err, OperationType.LIST, "bookings");
        });

        unsubscribeEmails = onSnapshot(collection(db, "email_logs"), (snapshot) => {
          const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmailLog));
          docs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
          setEmailLogs(docs);
        }, (err) => {
          console.error("Firestore admin email_logs subscription error:", err);
          // Fallback to local storage if subscription fails (e.g. sandbox mode)
          const loadedLogs = getStoredEmailLogs();
          setEmailLogs(loadedLogs);
          handleFirestoreError(err, OperationType.LIST, "email_logs");
        });
      } else {
        // Guest: Only query their own records (aligns with firestore.rules safely)
        const qBookings = query(
          collection(db, "bookings"),
          where("userId", "==", user.uid)
        );
        unsubscribeBookings = onSnapshot(qBookings, (snapshot) => {
          const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
          docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setBookings(docs);
        }, (err) => {
          console.error("Firestore guest bookings subscription error:", err);
          handleFirestoreError(err, OperationType.LIST, "bookings");
        });

        const qEmails = query(
          collection(db, "email_logs"),
          where("recipientEmail", "==", user.email || "")
        );
        unsubscribeEmails = onSnapshot(qEmails, (snapshot) => {
          const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmailLog));
          docs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
          setEmailLogs(docs);
        }, (err) => {
          console.error("Firestore guest email_logs subscription error:", err);
          handleFirestoreError(err, OperationType.LIST, "email_logs");
        });
      }
    } else {
      // Offline/Anonymous Mode: use localStorage fallback
      const loadedBookings = getInitialBookings();
      setBookings(loadedBookings);

      const loadedLogs = getStoredEmailLogs();
      setEmailLogs(loadedLogs);
    }

    return () => {
      unsubscribeBookings();
      unsubscribeEmails();
    };
  }, [user, isUserAdmin]);

  // Update a booking's status or details
  const handleUpdateBooking = async (updated: Booking) => {
    // Always update local state first for instant responsiveness
    const nextBookings = bookings.map((b) => (b.id === updated.id ? updated : b));
    setBookings(nextBookings);
    saveBookingsToStorage(nextBookings);

    try {
      const isSandbox = localStorage.getItem("meghpunji_sandbox_user");
      if (isSandbox) {
        return; // Handled locally
      }
      await setDoc(doc(db, "bookings", updated.id), updated);
    } catch (err) {
      console.warn("Could not write update to Firestore:", err);
    }
  };

  // Add a new SMTP delivered email log
  const handleAddEmailLog = async (log: EmailLog) => {
    // Always update local state first
    saveEmailLog(log);
    setEmailLogs((prev) => [log, ...prev]);
    setActiveNotificationEmail(log);

    try {
      const isSandbox = localStorage.getItem("meghpunji_sandbox_user");
      if (isSandbox) {
        return; // Handled locally
      }
      await setDoc(doc(db, "email_logs", log.id), log);
    } catch (err) {
      console.warn("Could not write email log to Firestore:", err);
    }
  };

  // Process a new reservation checkout
  const handleNewBookingCreated = async (newBooking: Booking) => {
    // Hide Wizard
    setIsBookingOpen(false);

    // Always update local state first for instant responsiveness
    const nextBookings = [newBooking, ...bookings];
    setBookings(nextBookings);
    saveBookingsToStorage(nextBookings);

    const emailLog = generateAutomatedEmail(newBooking, "confirmation");
    saveEmailLog(emailLog);
    setEmailLogs((prev) => [emailLog, ...prev]);
    setActiveNotificationEmail(emailLog);

    if (user && !isAdminMode) {
      setCurrentTab("dashboard");
    }

    try {
      const isSandbox = localStorage.getItem("meghpunji_sandbox_user");
      if (isSandbox) {
        return; // Handled locally
      }

      // 1. Write booking to Firestore
      await setDoc(doc(db, "bookings", newBooking.id), newBooking);

      // 2. Write email confirmation to Firestore
      await setDoc(doc(db, "email_logs", emailLog.id), emailLog);
    } catch (err) {
      console.warn("Failed to persist new booking to Firestore (already saved locally):", err);
    }
  };

  const handleOpenBookingForCottage = (cottageId: string) => {
    setPreselectedCottageId(cottageId);
    setSelectedCottage(null);
    setIsBookingOpen(true);
  };

  const handleBarCheckAvailability = (params: { checkIn: string; checkOut: string; cottageId: string; guests: number }) => {
    setSearchCheckIn(params.checkIn);
    setSearchCheckOut(params.checkOut);
    setSearchCottageId(params.cottageId);
    setSearchGuests(params.guests);

    if (params.cottageId !== "any") {
      setPreselectedCottageId(params.cottageId);
    } else {
      setPreselectedCottageId("tarasha");
    }
    setIsBookingOpen(true);
  };

  const handleParamsChange = (params: {
    checkIn: string;
    checkOut: string;
    cottageId: string;
    guests: number;
    showOnlyAvailable: boolean;
  }) => {
    setSearchCheckIn(params.checkIn);
    setSearchCheckOut(params.checkOut);
    setSearchCottageId(params.cottageId);
    setSearchGuests(params.guests);
    setShowOnlyAvailable(params.showOnlyAvailable);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;
    setContactSubmitted(true);

    try {
      const contactId = `CNT-${Math.floor(100000 + Math.random() * 900000)}`;
      await setDoc(doc(db, "contacts", contactId), {
        id: contactId,
        name: contactName,
        email: contactEmail,
        phone: contactPhone || "",
        message: contactMsg,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Could not post message to Firestore:", err);
    }

    setTimeout(() => {
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setContactMsg("");
      setContactSubmitted(false);
      alert("Thank you! Your message has been transmitted to our Sajek reservation team.");
    }, 1000);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubmitted(true);

    try {
      const subId = `SUB-${Math.floor(100000 + Math.random() * 900000)}`;
      await setDoc(doc(db, "newsletters", subId), {
        id: subId,
        email: newsletterEmail,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Could not post subscription to Firestore:", err);
    }

    setTimeout(() => {
      setNewsletterEmail("");
      setNewsletterSubmitted(false);
      alert("Subscribed! You will now receive seasonal cloudy forecasts and weekday discounts.");
    }, 1000);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("meghpunji_sandbox_user");
      setUser(null);
      setIsUserAdmin(false);
      setIsAdminMode(false);
      setCurrentTab("home");
    } catch (err) {
      console.error("Sign out failure:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] selection:bg-[#1A1A1A] selection:text-[#FAF9F6] font-sans flex flex-col justify-between">
      {/* Dynamic Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        isAdminMode={isAdminMode}
        setIsAdminMode={setIsAdminMode}
        onOpenBooking={() => handleOpenBookingForCottage("tarasha")}
        user={user}
        isUserAdmin={isUserAdmin}
        onOpenLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="flex-grow pt-20">
        {isAdminMode ? (
          /* ADMIN PORTAL */
          <div className="animate-fade-in">
            <AdminDashboard
              bookings={bookings}
              emailLogs={emailLogs}
              onUpdateBooking={handleUpdateBooking}
              onAddLog={handleAddEmailLog}
              onOpenBooking={() => handleOpenBookingForCottage("tarasha")}
            />
          </div>
        ) : (
          /* GUEST PORTAL TAB SYSTEM */
          <div className="animate-fade-in">
            {/* Guest Dashboard Tab */}
            {currentTab === "dashboard" && user && (
              <GuestDashboard
                user={user}
                bookings={bookings}
                emailLogs={emailLogs}
                onRefreshData={() => {}}
              />
            )}

            {/* Tab 1: HOME */}
            {currentTab === "home" && (
              <div className="space-y-24 pb-20">
                {/* Hero Showcase */}
                <Hero
                  onOpenBooking={() => handleOpenBookingForCottage("tarasha")}
                  onExploreStays={() => setCurrentTab("cottages")}
                />

                {/* Reservation Bar */}
                <BookingBar
                  bookings={bookings}
                  searchCheckIn={searchCheckIn}
                  searchCheckOut={searchCheckOut}
                  searchCottageId={searchCottageId}
                  searchGuests={searchGuests}
                  showOnlyAvailable={showOnlyAvailable}
                  onParamsChange={handleParamsChange}
                  onCheckAvailability={handleBarCheckAvailability}
                />

                {/* About Section matching the requested design exactly */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative py-12 lg:py-20 overflow-hidden lg:overflow-visible">
                  {/* Curvy background dotted path with paper airplane */}
                  <div className="absolute inset-0 pointer-events-none z-0 hidden lg:block overflow-visible">
                    <svg className="absolute w-[120%] h-[120%] -left-10 -top-10" viewBox="0 0 1400 650" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path 
                        d="M-40,150 C250,550 500,580 580,480 C650,380 750,220 950,300 C1100,360 1250,150 1450,180" 
                        stroke="#F0701C" 
                        strokeWidth="1.5" 
                        strokeDasharray="6 6" 
                        className="opacity-25"
                      />
                      {/* Stylized Paper Airplane */}
                      <g transform="translate(580, 480) rotate(-25) scale(1.2)">
                        <path 
                          d="M0,0 L18,-6 L6,18 L4,7 L0,0 Z M4,7 L18,-6 L6,18" 
                          fill="#F0701C" 
                          stroke="#F0701C"
                          strokeWidth="1"
                          strokeLinejoin="round"
                          className="opacity-60"
                        />
                      </g>
                    </svg>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
                    {/* Left content column */}
                    <div className="space-y-8 text-left">
                      <h2 className="font-serif text-5xl sm:text-6xl font-semibold text-[#1A1A1A] leading-tight tracking-tight">
                        About Us
                      </h2>
                      <div className="space-y-6 text-black/70 font-sans text-[15px] leading-relaxed">
                        <p>
                          At Meghpunji, we believe travel is more than reaching a destination—it’s about the moments you collect along the way. Whether you're seeking adventure, relaxation, or deep connection with nature, we design beautiful wooden and bamboo eco-friendly sanctuaries around what truly matters to you.
                        </p>
                        <p>
                          With unmatched high-altitude mountain hospitality, spectacular panoramic balconies viewing the Sajek cloud ocean, and a deep-rooted passion for nature, we make your escape above the clouds effortless, inspiring, and unforgettable.
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => setShowAboutModal(true)}
                          className="px-8 py-3.5 bg-[#F0701C] hover:bg-[#D95F12] text-white font-sans font-semibold uppercase tracking-widest text-xs rounded-full transition-all duration-300 shadow-lg shadow-[#F0701C]/25 hover:shadow-xl hover:shadow-[#F0701C]/40 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                        >
                          More about
                        </button>
                      </div>
                    </div>

                    {/* Right column with premium overlapping image stack */}
                    <div className="relative flex justify-center lg:justify-end items-center py-10 lg:py-0">
                      <div className="relative w-full max-w-[420px] aspect-[4/3] sm:aspect-square flex items-center justify-center">
                        {/* Back straight photo - Sajek High Peaks */}
                        <div className="absolute w-[75%] aspect-[4/5] rounded-[24px] overflow-hidden shadow-2xl border-4 border-white z-10 -translate-x-10 -translate-y-4">
                          <img
                            src="https://www.meghpunji.com/uploads/0000/7/2025/10/04/megh-polli-resort-cloudy-view.jpg"
                            alt="Meghpunji Majestic Mountain View"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Front rotated photo - Overlapping adventure photo */}
                        <div className="absolute w-[68%] aspect-[4/5] rounded-[24px] overflow-hidden shadow-2xl border-4 border-white z-20 translate-x-12 translate-y-12 rotate-[8deg] hover:rotate-[4deg] transition-transform duration-500 group">
                          <img
                            src="https://images.unsplash.com/photo-1486916856992-e4db22c8df33?auto=format&fit=crop&w=800&q=80"
                            alt="Sajek Explorer Nature Journey"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Elegant Metrics Row matching mockup exactly */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 pt-16 border-t border-black/5 mt-16 text-center lg:text-left relative z-10">
                    <div className="space-y-1.5">
                      <div className="font-serif text-4xl sm:text-5xl font-semibold text-[#1A1A1A]">
                        10,000<span className="text-[#F0701C] font-light">+</span>
                      </div>
                      <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-black/50 font-sans font-semibold">
                        Happy Travelers
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="font-serif text-4xl sm:text-5xl font-semibold text-[#1A1A1A]">
                        50<span className="text-[#F0701C] font-light">+</span>
                      </div>
                      <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-black/50 font-sans font-semibold">
                        Destinations
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="font-serif text-4xl sm:text-5xl font-semibold text-[#1A1A1A]">
                        98<span className="text-[#F0701C] font-light">%</span>
                      </div>
                      <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-black/50 font-sans font-semibold">
                        Satisfaction Rate
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="font-serif text-4xl sm:text-5xl font-semibold text-[#1A1A1A]">
                        15<span className="text-[#F0701C] font-light">+</span>
                      </div>
                      <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-black/50 font-sans font-semibold">
                        Years Experience
                      </div>
                    </div>
                  </div>
                </section>

                {/* Cottages Preview Slider/List */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">Our Accommodations</p>
                      <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1A1A] mt-1">
                        Select your mountain sanctuary
                      </h2>
                    </div>
                    <button
                      onClick={() => setCurrentTab("cottages")}
                      className="text-xs uppercase tracking-widest text-[#1A1A1A] font-semibold border-b border-black pb-1 hover:text-gold hover:border-gold transition-colors font-sans self-start"
                    >
                      View All 7 Sanctuaries →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(() => {
                      const filtered = INITIAL_COTTAGES.filter((cottage) => {
                        // Guest capacity check
                        if (searchGuests > cottage.maxGuests) return false;
                        // Cottage selection check
                        if (searchCottageId !== "any" && searchCottageId !== cottage.id) return false;
                        // Availability check if toggled
                        if (showOnlyAvailable) {
                          return isCottageAvailable(cottage.id, searchCheckIn, searchCheckOut, bookings);
                        }
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 px-6 text-center bg-white border border-black/10 rounded-3xl space-y-4 max-w-xl mx-auto shadow-sm">
                            <p className="font-serif text-xl text-[#1A1A1A] font-light">No Available Cottage Found</p>
                            <p className="text-xs text-black/50 max-w-md mx-auto leading-relaxed">
                              All cottages matching your criteria are fully booked or have a lower guest capacity for your dates (<strong>{searchCheckIn}</strong> to <strong>{searchCheckOut}</strong>).
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setShowOnlyAvailable(false);
                                setSearchCottageId("any");
                                setSearchGuests(2);
                              }}
                              className="px-6 py-2.5 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-widest font-semibold hover:bg-black transition-all rounded-xl shadow-md"
                            >
                              Reset Search Criteria
                            </button>
                          </div>
                        );
                      }

                      // Show filtered cottages (or slice to 3 on home page if no filter is active)
                      const displayCottages = showOnlyAvailable || searchCottageId !== "any" ? filtered : filtered.slice(0, 3);
                      return displayCottages.map((cottage) => (
                        <CottageCard
                          key={cottage.id}
                          cottage={cottage}
                          onExplore={setSelectedCottage}
                          onBook={handleOpenBookingForCottage}
                          checkIn={searchCheckIn}
                          checkOut={searchCheckOut}
                          bookings={bookings}
                        />
                      ));
                    })()}
                  </div>
                </section>

                {/* Virtual Tour section matching video tour in HTML */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="bg-white border border-black/10 p-8 text-center space-y-6 relative overflow-hidden rounded-3xl">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black/[0.03] font-serif text-7xl font-bold select-none pointer-events-none">
                      SAJEK VALLEY
                    </div>
                    <div className="relative z-10 max-w-lg mx-auto space-y-4">
                      <div className="inline-flex p-3 rounded-full bg-black/5 text-[#1A1A1A] border border-black/10 mb-2">
                        <Video className="w-6 h-6" />
                      </div>
                      <h3 className="font-serif text-2xl text-[#1A1A1A] font-light">Have a virtual tour above the clouds</h3>
                      <p className="text-xs text-black/50 leading-relaxed font-sans">
                        Take a visual stroll through our tranquil walkways, inspect the handmade mud walls, stand on the custom love shape balcony, and fly over Sajek's misty horizon.
                      </p>
                      <button
                        onClick={() => alert("Simulating Virtual Reality flight over Ruilui para & Meghpunji Resort Sajek...")}
                        className="px-6 py-2.5 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-widest font-sans font-semibold hover:bg-black transition-colors rounded-full"
                      >
                        Play Drone Tour Flight
                      </button>
                    </div>
                  </div>
                </section>

                {/* Testimonials Review Slider with Photo Gallery */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
                  <div className="text-center max-w-5xl mx-auto space-y-8">
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">Resort Photo Gallery</p>
                      <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1A1A]">Captured Moments Above the Clouds</h2>
                    </div>

                    {/* Interactive Grid Photo Gallery */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      {GALLERY_IMAGES.map((img, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setActiveGalleryImg(img.url)}
                          className="relative aspect-square overflow-hidden rounded-2xl bg-black/5 border border-black/5 group cursor-zoom-in shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <img 
                            src={img.url} 
                            alt={img.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <span className="text-[10px] text-white font-sans font-semibold uppercase tracking-widest">{img.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-10 border-t border-black/5">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">Visitor Voices</p>
                      <h2 className="font-serif text-3xl font-light text-[#1A1A1A] mt-1">Reviews from our valuable visitors</h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div className="bg-white border border-black/5 p-6 space-y-4 rounded-2xl shadow-sm">
                      <div className="flex gap-0.5 text-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                        ))}
                      </div>
                      <p className="text-xs text-black/70 italic leading-relaxed font-sans">
                        "Meghpunji members are very nice and gentle. Resort is locked so that outside people can’t get in. Resort view from the cottages are amazing. Recomanded one day stat try this Resort. A perfect place to spend some time alone in the mountains."
                      </p>
                      <div className="flex items-center gap-3 pt-2 border-t border-black/5">
                        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center font-serif text-xs text-gold font-semibold">
                          P
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-[#1A1A1A]">Pankaj Sarker</span>
                          <span className="block text-[9px] text-black/40 uppercase tracking-widest">Verified Guest</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-black/5 p-6 space-y-4 rounded-2xl shadow-sm">
                      <div className="flex gap-0.5 text-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                        ))}
                      </div>
                      <p className="text-xs text-black/70 italic leading-relaxed font-sans">
                        "One of the best resorts in Sajek Valley. Its well secured, decorated and most importantly you can spend quality time with your loved ones. We stayed at their chandrima cottage. We tried their complementary breakfast (khichuri and egg) which was good. Recommended👍"
                      </p>
                      <div className="flex items-center gap-3 pt-2 border-t border-black/5">
                        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center font-serif text-xs text-gold font-semibold">
                          N
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-[#1A1A1A]">N.S.R. Arnob</span>
                          <span className="block text-[9px] text-black/40 uppercase tracking-widest">Verified Guest</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-black/5 p-6 space-y-4 rounded-2xl shadow-sm">
                      <div className="flex gap-0.5 text-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                        ))}
                      </div>
                      <p className="text-xs text-black/70 italic leading-relaxed font-sans">
                        "The staff is very friendly and gentle. The resort is locked so that outside people can’t get in. The view from the cottages are amazing. Recommended!"
                      </p>
                      <div className="flex items-center gap-3 pt-2 border-t border-black/5">
                        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center font-serif text-xs text-gold font-semibold">
                          N
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-[#1A1A1A]">Nipu Nurunnabi</span>
                          <span className="block text-[9px] text-black/40 uppercase tracking-widest">Verified Guest</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Local Area Map Placeholder matching Osm engine */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-6">
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">Directions</p>
                    <h3 className="font-serif text-2xl font-light text-[#1A1A1A]">Sajek Valley, Ruilui Para</h3>
                    <p className="text-xs text-black/60 leading-relaxed">
                      Sajek sits at 1,800 feet above sea level bordering Mizoram, India. Access to our resort is completely secured inside Ruilui para center, ensuring maximum safety. Click plan trip to call our support line to schedule private transport arrangement.
                    </p>
                    <div className="space-y-2 text-xs text-black/80">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gold shrink-0" />
                        <span>Sajek Union, Baghaichhari, Rangamati District, Bangladesh</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gold shrink-0" />
                        <span>Hotline Reservation Verification: +880 1815-761065</span>
                      </div>
                    </div>
                  </div>

                  {/* Simulated elegant vector map mockup */}
                  <div className="h-60 bg-white border border-black/10 relative overflow-hidden flex items-center justify-center rounded-2xl group">
                    <div className="absolute inset-0 w-full h-full">
                      <iframe
                        src="https://maps.google.com/maps?q=Meghpunji%20Resort%20Sajek&t=&z=16&ie=UTF8&iwloc=&output=embed"
                        className="w-full h-full border-0 grayscale-[10%] contrast-[105%] hover:grayscale-0 transition-all duration-500"
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        title="Meghpunji Resort Interactive Google Map"
                      ></iframe>
                    </div>
                    {/* Floating top-left info badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm border border-black/10 rounded-xl p-2 z-10 pointer-events-none shadow-sm flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gold/15 flex items-center justify-center font-serif text-xs text-gold font-bold">
                        M
                      </div>
                      <div>
                        <span className="block text-[9px] font-semibold text-[#1A1A1A] uppercase tracking-wider">Meghpunji Resort</span>
                        <span className="block text-[8px] text-black/50">Sajek Valley, Rangamati</span>
                      </div>
                    </div>

                    {/* Floating bottom-right link button */}
                    <div className="absolute bottom-3 right-3 z-10">
                      <a
                        href="https://maps.app.goo.gl/sMNibLyFFemrdG2C9"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] hover:bg-gold hover:text-white text-white font-sans font-semibold text-[9px] uppercase tracking-wider transition-all duration-300 shadow-md rounded-xl border border-white/10"
                      >
                        <ExternalLink className="w-3 h-3 text-gold" />
                        Open Google Maps
                      </a>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Tab 2: COTTAGES */}
            {currentTab === "cottages" && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">Resort Catalog</p>
                  <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#1A1A1A] leading-tight">
                    Explore all 7 unique cottages
                  </h1>
                  <p className="text-xs text-black/50 leading-relaxed font-sans">
                    Every sanctuary has been angled precisely to present the cloud ocean differently. Select a cottage below to see galleries, specs, policies, or book immediately.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(() => {
                    const filtered = INITIAL_COTTAGES.filter((cottage) => {
                      if (searchGuests > cottage.maxGuests) return false;
                      if (searchCottageId !== "any" && searchCottageId !== cottage.id) return false;
                      if (showOnlyAvailable) {
                        return isCottageAvailable(cottage.id, searchCheckIn, searchCheckOut, bookings);
                      }
                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 px-6 text-center bg-white border border-black/10 rounded-3xl space-y-4 max-w-xl mx-auto shadow-sm">
                          <p className="font-serif text-xl text-[#1A1A1A] font-light">No Available Cottage Found</p>
                          <p className="text-xs text-black/50 max-w-md mx-auto leading-relaxed">
                            No sanctuaries match your active dates (<strong>{searchCheckIn}</strong> to <strong>{searchCheckOut}</strong>) and capacity requirements.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setShowOnlyAvailable(false);
                              setSearchCottageId("any");
                              setSearchGuests(2);
                            }}
                            className="px-6 py-2.5 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-widest font-semibold hover:bg-black transition-all rounded-xl shadow-md"
                          >
                            Show All 7 Sanctuaries
                          </button>
                        </div>
                      );
                    }

                    return filtered.map((cottage) => (
                      <CottageCard
                        key={cottage.id}
                        cottage={cottage}
                        onExplore={setSelectedCottage}
                        onBook={handleOpenBookingForCottage}
                        checkIn={searchCheckIn}
                        checkOut={searchCheckOut}
                        bookings={bookings}
                      />
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Tab 3: PACKAGES COMPARISON TABLE */}
            {currentTab === "packages" && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">Rates COMPARISON</p>
                  <h1 className="font-serif text-4xl font-light text-[#1A1A1A] leading-tight">
                    Weekday vs Weekend rates comparison
                  </h1>
                  <p className="text-xs text-black/50 font-sans">
                    Rates are displayed in Bangladeshi Taka (৳). Discounts are valid until 30th June 2026.
                  </p>
                </div>

                {/* Clean comparisons grid */}
                <div className="bg-white border border-black/10 p-6 rounded-2xl shadow-sm overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm font-sans min-w-[600px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-black/10 text-gold uppercase tracking-[0.2em] text-[10px] font-semibold">
                        <th className="py-4">Sanctuary Name</th>
                        <th className="py-4">Configuration</th>
                        <th className="py-4">Weekdays (Sun - Thu)</th>
                        <th className="py-4">Weekends (Fri - Sat)</th>
                        <th className="py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {INITIAL_COTTAGES.map((c) => (
                        <tr key={c.id} className="border-b border-black/5 hover:bg-black/[0.01] font-sans">
                          <td className="py-4 font-serif text-base text-[#1A1A1A] font-medium">{c.name}</td>
                          <td className="py-4 text-black/70">1 Couple Bed ({c.maxGuests} Guests)</td>
                          <td className="py-4 font-semibold text-[#1A1A1A]">৳{c.weekdayPrice.toLocaleString()}</td>
                          <td className="py-4 font-semibold text-[#1A1A1A]">৳{c.weekendPrice.toLocaleString()}</td>
                          <td className="py-4 text-right">
                            <button
                              id={`pack-book-${c.id}`}
                              onClick={() => handleOpenBookingForCottage(c.id)}
                              className="px-4 py-1.5 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-widest font-semibold hover:bg-black font-sans rounded-full transition-colors"
                            >
                              Reserve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* General package descriptors matching HTML exactly */}
                <div className="bg-[#F0EEE9] border border-black/5 p-6 rounded-3xl space-y-4 max-w-3xl mx-auto">
                  <h3 className="font-serif text-xl text-[#1A1A1A] font-light">Couple Package Includes (for 2) - 1 Night 2 Days</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-black/80 font-sans">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                      <span>One eco couple cottage with a couple bed for 2 persons</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                      <span>Charming Interior constructed of wood, bamboo, and glass</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                      <span>Large & spacious private balcony</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                      <span>Breathtaking Infinity view of Mizoram hillside</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                      <span>Complimentary Breakfast, Welcome Drinks, and Tea</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                      <span>Tiled washroom with geyser hot water & high commode</span>
                    </li>
                  </ul>
                  <p className="text-[11px] text-black/40 italic pt-2 border-t border-black/10">
                    *** Children Policy: Below 05 years no charges will be added. Stay is completely secure.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 4: CONTACT US */}
            {currentTab === "contact" && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold font-sans">Get In Touch</p>
                  <h1 className="font-serif text-4xl font-light text-[#1A1A1A] leading-tight">
                    We'd love to hear from you
                  </h1>
                  <p className="text-xs text-black/50 leading-relaxed font-sans">
                    Send us a message and our resort concierge desk will respond to your queries as soon as possible.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto pt-6">
                  {/* Left Contact Form Form */}
                  <form onSubmit={handleContactSubmit} className="space-y-4 bg-white border border-black/10 p-6 rounded-3xl shadow-sm">
                    <h3 className="font-serif text-xl text-[#1A1A1A] font-light border-b border-black/5 pb-2.5 mb-4">
                      Transmit a Secure Message
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold">Your Name *</label>
                      <input
                        type="text"
                        placeholder="Enter full name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-black/10 py-3 px-4 text-[#1A1A1A] text-xs font-sans outline-none focus:border-black rounded-xl"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold">Your Email Address *</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-black/10 py-3 px-4 text-[#1A1A1A] text-xs font-sans outline-none focus:border-black rounded-xl"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+880"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-black/10 py-3 px-4 text-[#1A1A1A] text-xs font-sans outline-none focus:border-black rounded-xl"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold">Your Message *</label>
                      <textarea
                        rows={4}
                        placeholder="Describe your query or request custom packages..."
                        value={contactMsg}
                        onChange={(e) => setContactMsg(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-black/10 py-3 px-4 text-[#1A1A1A] text-xs font-sans outline-none focus:border-black resize-none rounded-xl"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      id="contact-submit-btn"
                      className="w-full py-3 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest font-sans font-semibold hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2 rounded-full"
                    >
                      <Send className="w-4 h-4 text-white shrink-0" />
                      Send Message
                    </button>
                  </form>

                  {/* Right Address card */}
                  <div className="space-y-6">
                    <div className="bg-[#1A1A1A] text-white rounded-3xl p-6 shadow-xl space-y-4">
                      <h4 className="font-serif text-2xl text-gold font-light">Meghpunji Resort</h4>
                      <p className="text-xs text-white/70 leading-relaxed">
                        Perched atop Ruilui para hilltop with continuous panoramic view of Chittagong Hill Tracts and surrounding valleys of Mizoram.
                      </p>
                      <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          <span>Sajek, Rangamati, Chattogram Division, Bangladesh</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Phone className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          <span> concierges: +880 1815-761065 (Verify bKash advance pay)</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Mail className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          <span>meghpunjiresort@gmail.com</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-[#F0EEE9] border border-black/5 rounded-2xl">
                      <span className="block text-[8px] uppercase tracking-widest text-black/40 mb-1">bKash Merchant Pay:</span>
                      <span className="block text-sm font-bold text-black font-mono">bKash personal: 01815-761065</span>
                      <p className="text-[10px] text-gold/80 italic mt-1 font-sans">
                        Pay advance of at least 3,060 tk per cottage night within 24 hours of reserving to protect reservation from auto cancellation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Element */}
      <footer className="bg-[#FAF9F6] border-t border-black/10 py-12 text-center text-xs text-black/50 space-y-6 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setCurrentTab("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <Trees className="w-5 h-5 text-gold shrink-0" />
            <span className="font-serif text-lg tracking-[0.2em] text-[#1A1A1A]">
              MEGHPUNJI<span className="text-gold font-light">.</span>
            </span>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-6 text-[11px] uppercase tracking-widest text-black/60 font-semibold">
            <button onClick={() => { setCurrentTab("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-gold transition-colors">Home</button>
            <button onClick={() => { setCurrentTab("cottages"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-[#1A1A1A] transition-colors">Cottages</button>
            <button onClick={() => { setCurrentTab("packages"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-[#1A1A1A] transition-colors">Packages</button>
            <button onClick={() => { setCurrentTab("contact"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-[#1A1A1A] transition-colors">Contact</button>
          </div>

          {/* Socials */}
          <div className="flex gap-4 text-xs font-semibold text-gold">
            <a href="https://www.facebook.com/MeghpunjiResort" target="_blank" rel="noopener noreferrer" className="hover:underline">Facebook</a>
            <a href="https://www.youtube.com/@meghpunjiresort386" target="_blank" rel="noopener noreferrer" className="hover:underline">YouTube</a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-black/5 pt-6 text-[10px] flex flex-col sm:flex-row justify-between items-center gap-4 text-black/30">
          <span>Copyright © 2026 Meghpunji Resort, Sajek Valley, Rangamati, Bangladesh. All rights reserved.</span>
          <span className="text-gold/50 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            develop by Stack Dev
          </span>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Cottage Detail Modal */}
      <CottageDetailModal
        cottage={selectedCottage}
        onClose={() => setSelectedCottage(null)}
        onBook={handleOpenBookingForCottage}
      />

      {/* 2. Reservation Wizard Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        preselectedCottageId={preselectedCottageId}
        onBookingSuccess={handleNewBookingCreated}
        user={user}
        bookings={bookings}
      />

      {/* 3. Sliding Automated Email Confirmation Popup */}
      <EmailVisualizer
        emailLog={activeNotificationEmail}
        onClose={() => setActiveNotificationEmail(null)}
      />

      {/* 4. Login and Registration Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onAuthSuccess={(user, isAdmin) => {
            setUser(user);
            setIsUserAdmin(isAdmin);
            if (isAdmin) {
              setIsAdminMode(true);
              setCurrentTab("admin");
            } else {
              setCurrentTab("dashboard");
            }
          }}
        />
      )}

      {/* 5. Photo Gallery Lightbox Modal */}
      {activeGalleryImg && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in cursor-zoom-out"
          onClick={() => setActiveGalleryImg(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors p-2 text-xl font-mono"
            onClick={() => setActiveGalleryImg(null)}
          >
            ✕
          </button>
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <img 
              src={activeGalleryImg} 
              alt="Gallery Preview"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* 6. About Us Interactive Story Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl relative border border-black/5 animate-scale-up max-h-[90vh] flex flex-col">
            
            {/* Header Banner */}
            <div className="relative h-48 sm:h-56 bg-black flex-shrink-0">
              <img 
                src="https://www.meghpunji.com/uploads/0000/7/2025/10/04/megh-polli-resort-cloudy-view.jpg" 
                alt="Meghpunji Banner"
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
              <button 
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white/90 hover:text-white transition-colors flex items-center justify-center font-mono text-lg"
                onClick={() => setShowAboutModal(false)}
              >
                ✕
              </button>
              <div className="absolute bottom-6 left-6 text-white text-left">
                <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Our Heritage & Story</span>
                <h3 className="font-serif text-2xl sm:text-3xl font-light mt-1 text-white">Above the Clouds in Sajek</h3>
              </div>
            </div>

            {/* Scrollable Story content */}
            <div className="p-6 sm:p-8 overflow-y-auto text-left space-y-6 font-sans text-sm text-black/80 leading-relaxed max-h-[calc(90vh-14rem)]">
              <p>
                Founded on the dream of creating an authentic, harmonious escape close to heaven, 
                <strong className="text-gold"> Meghpunji Resort</strong> sits at the highest point of Sajek Valley in Ruilui Para, Rangamati. 
                Our resort is meticulously engineered using regional materials like local bamboo, mature teak wood, and natural mud blocks, preserving 
                the ecological heritage and design ethics of the Chittagong Hill Tracts.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-gold/5 border border-gold/10 space-y-1">
                  <h4 className="font-serif font-bold text-gold text-sm uppercase tracking-wide">Nature First Architecture</h4>
                  <p className="text-xs text-black/70">Our eco-cottages seamlessly integrate with the mountainside, maximizing cross-ventilation, panoramic sunrises, and direct valley drafts.</p>
                </div>
                <div className="p-4 rounded-2xl bg-gold/5 border border-gold/10 space-y-1">
                  <h4 className="font-serif font-bold text-gold text-sm uppercase tracking-wide">Premium Mountain Comfort</h4>
                  <p className="text-xs text-black/70">Enjoy premium features like continuous solar water heaters, organic breakfast spreads, private glass balconies, and locally sourced welcome beverages.</p>
                </div>
              </div>

              <p>
                Every morning, as you step out onto your private balcony, you will find yourself overlooking a magnificent white sea of fluffy clouds spreading 
                to the Horizon. It’s an immersive experience designed to disconnect you from busy city lives and reconnect you with the natural heartbeat of the world.
              </p>
              
              <div className="pt-2 flex justify-between items-center text-xs text-black/40 border-t border-black/5">
                <span>Location: Ruilui Para, Sajek Valley, Rangamati</span>
                <span className="font-bold text-gold">Meghpunji Resort</span>
              </div>
            </div>

            {/* Footer action */}
            <div className="p-4 sm:p-6 bg-[#FAF9F6] border-t border-black/5 flex justify-end flex-shrink-0">
              <button 
                className="px-6 py-2.5 bg-gold hover:bg-gold-dark text-[#1A1A1A] font-semibold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-gold/10"
                onClick={() => setShowAboutModal(false)}
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
