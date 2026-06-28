import { Booking, Cottage, EmailLog } from "./types";

export const INITIAL_COTTAGES = [
  {
    id: "tarasha",
    name: "Tarasha Cottage",
    type: "Eco Mud Cottage",
    weekdayPrice: 6000,
    weekendPrice: 6000,
    maxGuests: 2,
    image: "https://www.meghpunji.com/uploads/0000/7/2025/09/21/tarasha-meghpunji-resort.jpg",
    gallery: [
      "https://www.meghpunji.com/uploads/0000/7/2025/09/21/tarasha-meghpunji-resort.jpg",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
    ],
    rating: 5,
    description: "Tarasha cottage features a unique stargazing structure. With glass panes optimized to display the clear, unpolluted night skies of Sajek Valley directly from your couple bed, it offers romance and comfort on another level.",
    features: ["Stargazing glass panes", "Natural mud thermal insulation", "Private suspended balcony", "Complimentary authentic tea service"],
    rules: ["Check In: 11:30 AM", "Check Out: 09:30 AM", "Payment: 3,060 tk per night required within 24 hours of booking."],
    packages: [
      {
        name: "Stargazer Romance",
        description: "Optimized for nights under the Sajek constellations.",
        features: ["Late-night tea flask", "Sajek Constellation map", "Premium local fruit platter"]
      }
    ],
    reviews: [
      { author: "Razia Begum", rating: 5, text: "The mud cottage stays naturally cool even in the heat, the balcony view is jaw-dropping, and the staff feel like hosts.", avatar: "R", date: "June 2025" }
    ]
  },
  {
    id: "purbasha",
    name: "Purbasha Cottage",
    type: "Eco Mud Cottage",
    weekdayPrice: 5500,
    weekendPrice: 6000,
    maxGuests: 2,
    image: "https://www.meghpunji.com/uploads/0000/7/2025/10/04/purbasha-feature.jpg",
    gallery: [
      "https://www.meghpunji.com/uploads/0000/7/2025/10/04/purbasha-feature.jpg",
      "https://www.meghpunji.com/uploads/0000/7/2025/09/21/purbasha-interior-to-outside-view.jpg",
      "https://www.meghpunji.com/uploads/0000/7/2025/09/21/purbasha-washroom.jpg"
    ],
    rating: 5,
    description: "Purbasha Cottage captures the early morning sunrise spectacularly. Designed as a traditional eco-friendly hut structure but packed with modern luxury fittings and spacious walk-in shower rooms.",
    features: ["Perfect sunrise exposure", "Bamboo-lined insulated walls", "Completely private path entrance", "Geyser and organic toiletries"],
    rules: ["Check In: 11:30 AM", "Check Out: 09:30 AM", "Modifications permitted 5 days prior to date."],
    packages: [
      {
        name: "Purbasha Sunrise Deal",
        description: "For early risers who want to photograph the sun climbing above the cloud ocean.",
        features: ["Early-access sunrise deck guides", "Premium morning hot tea tray"]
      }
    ],
    reviews: [
      { author: "Nipu Nurunnabi", rating: 5, text: "The staff is very friendly and gentle. The resort is locked so outside people can't enter. Recommended!", avatar: "N", date: "May 2025" }
    ]
  },
  {
    id: "rodela",
    name: "Rodela Cottage",
    type: "Eco Mud Cottage",
    weekdayPrice: 5500,
    weekendPrice: 6000,
    maxGuests: 2,
    image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
    ],
    rating: 5,
    description: "Rodela represents warmth and sunshine. Perched at an optimized angle to catch the afternoon golden hour, this cottage is perfect for relaxing on your spacious balcony watching the sky turn pink and amber.",
    features: ["Sunset / golden hour views", "Spacious bedside styling", "IPS solar backup power", "Organic cotton towels"],
    rules: ["Check In: 11:30 AM", "Check Out: 09:30 AM", "Cancellation: Advance payment non-refundable."],
    packages: [
      {
        name: "Golden Hour Escape",
        description: "Unwind with high-tea on the balcony as mountain shades merge.",
        features: ["High tea local pastries basket", "Complimentary check-out extension (if available)"]
      }
    ],
    reviews: [
      { author: "Pankaj Sarker", rating: 5, text: "Meghpunji members are very nice and gentle. The resort view is amazing. A perfect place to spend alone time.", avatar: "P", date: "May 2025" }
    ]
  },
  {
    id: "meghla",
    name: "Meghla Cottage",
    type: "Eco Mud Cottage",
    weekdayPrice: 5500,
    weekendPrice: 6000,
    maxGuests: 2,
    image: "https://www.meghpunji.com/uploads/0000/7/2025/10/04/meghla-cottage-feature.jpg",
    gallery: [
      "https://www.meghpunji.com/uploads/0000/7/2025/10/04/meghla-cottage-feature.jpg",
      "https://www.meghpunji.com/uploads/0000/7/2025/10/04/meghla-cottage-interior-view.jpg"
    ],
    rating: 5,
    description: "Meghla cottage comprises 1 couple Bed, 1 Bedside Table, 1 stand fan, 1 infinity love shaped balcony. Furnished with wood and bamboo aesthetics. The spacious washroom features geyser heating, high commode, and full standard toiletries.",
    features: ["Wood and glass eco mud architecture", "Stunning valley view balcony", "Geyser heating & water", "Zero light pollution constellations view"],
    rules: ["Check In: 11:30 AM", "Check Out: 09:30 AM", "Advance Payment: At least 3,060 tk via bKash required within 24 hours."],
    packages: [
      {
        name: "Couple Cloud Package",
        description: "Cozy retreat inside the clouds with natural temperature control.",
        features: ["Complimentary Breakfast", "Welcome Specialty Drinks", "Morning Tea Tray"]
      }
    ],
    reviews: [
      { author: "MD. RAZI SAIFULLAH", rating: 5, text: "The weather was beautiful. Best view in Sajek. Staff are very friendly.", avatar: "M", date: "May 2025" }
    ]
  },
  {
    id: "nilima",
    name: "Nilima Cottage",
    type: "Eco Mud Cottage",
    rating: 5,
    weekdayPrice: 6000,
    weekendPrice: 6000,
    maxGuests: 2,
    image: "https://www.meghpunji.com/uploads/0000/7/2025/10/04/nilima-cottage-feature.jpg",
    gallery: [
      "https://www.meghpunji.com/uploads/0000/7/2025/10/04/nilima-cottage-feature.jpg",
      "https://www.meghpunji.com/uploads/0000/7/2025/10/04/nilima-cottage-interior.jpg",
      "https://www.meghpunji.com/uploads/0000/7/2025/10/04/nilima-cottage-washroom-open-window.jpg"
    ],
    description: "Nilima cottage offers a premium stay with beautiful wood-panel craftsmanship, full-size windows looking into the clouds, and a spacious balcony. The bathroom features an openable cloud window allowing you to wash with views of the mountain treetops.",
    features: ["Unique bathroom with valley window", "Plush couple bed configuration", "Warm romantic lighting design", "Complimentary mineral water and tea"],
    rules: ["Check In: 11:30 AM", "Check Out: 09:30 AM", "Payment: BKash advance payment required to finalize dates."],
    packages: [
      {
        name: "Blue Sky Sanctuary",
        description: "Immersive eco-stay with panoramic vistas.",
        features: ["Breakfast, welcome juices, and afternoon tea tray"]
      }
    ],
    reviews: [
      { author: "Sadia Rahman", rating: 5, text: "No resort has matched the combination of setting, design, and genuine warmth of service. Simply exceptional.", avatar: "S", date: "March 2025" }
    ]
  },
  {
    id: "chandrima_eco",
    name: "Chandrima Cottage",
    type: "Eco Mud Cottage",
    rating: 5,
    weekdayPrice: 6000,
    weekendPrice: 6000,
    maxGuests: 2,
    image: "https://www.meghpunji.com/uploads/0000/7/2025/10/04/chandrima-cottage-feature.jpg",
    gallery: [
      "https://www.meghpunji.com/uploads/0000/7/2025/10/04/chandrima-cottage-feature.jpg",
      "https://www.meghpunji.com/uploads/0000/7/2025/10/04/chandrima-cottage-room-exterior-side-view.jpg"
    ],
    description: "Chandrima cottage comprises 1 couple Bed, 1 Bedside Table, 1 stand fan, 1 infinity love shaped balcony. The room is furnished with an almirah and 1 large mirror. Our modern-fittings spacious bathroom is equipped with standard toiletries as well as all the amenities.",
    features: ["1 Couple Bed, 1 Bedside Table", "Love shaped infinity balcony", "Equipped with standard toiletries", "Full infinity hill view of Mizoram"],
    rules: ["Check In: 11:30 AM", "Check Out: 09:30 AM", "bKash advance payment required to finalize dates."],
    packages: [
      {
        name: "Love Infinity Package",
        description: "Romance on top of Sajek with love-inspired sunset setup.",
        features: ["Complimentary Breakfast and Morning Tea", "Special love shape cake tray"]
      }
    ],
    reviews: [
      { author: "N.S.R. Arnob", rating: 5, text: "Highly secured, decorated, and perfect for quality time. Recommended! 👍", avatar: "A", date: "June 2025" }
    ]
  },
  {
    id: "bashonti_villa",
    name: "Bashonti Pool Villa",
    type: "Pool Villa",
    rating: 5,
    weekdayPrice: 15000,
    weekendPrice: 15000,
    maxGuests: 4,
    image: "https://www.meghpunji.com/uploads/0000/7/2025/10/04/meghpolli-bashonti-cottage-rooms.jpg",
    gallery: [
      "https://www.meghpunji.com/uploads/0000/7/2025/10/04/meghpolli-bashonti-cottage-rooms.jpg",
      "https://www.meghpunji.com/uploads/0000/7/2025/10/04/megh-punjii-resort.jpg"
    ],
    description: "Private Bashonti pool villa features a breathtaking private plunge pool and an elevated deck looking into the clouds. Perfect for small families or high-luxury travelers.",
    features: ["Private infinity pool", "Luxury wood panels and glass", "Up to 4 guests with supplementary setup", "Full-stack breakfast and tea include"],
    rules: ["Check In: 11:30 AM", "Check Out: 09:30 AM", "No diving in pool.", "50% bKash verification required."],
    packages: [
      {
        name: "Sajek Royal Retreat",
        description: "The ultimate luxury package available in the region.",
        features: ["Private chef service support", "Plunge pool sunset dinner"]
      }
    ],
    reviews: [
      { author: "Arif Hossain", rating: 5, text: "Pure magic. Elevated private villa that looks over the entire Sajek cloud sea.", avatar: "A", date: "April 2025" }
    ]
  }
];

// Helper to pre-populate dummy bookings
export const getInitialBookings = (): Booking[] => {
  const stored = localStorage.getItem("meghpunji_bookings");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse bookings", e);
    }
  }

  // Generate some realistic dummy bookings spanning current, future and past dates
  const today = new Date();
  const formatOffset = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const dummy: Booking[] = [
    {
      id: "MP-9841",
      customerName: "Masrurul Islam",
      customerEmail: "ayon@gmail.com",
      customerPhone: "+880 1815-761065",
      cottageId: "bashonti",
      cottageName: "Bashonti Pool Villa",
      checkIn: formatOffset(1),
      checkOut: formatOffset(3),
      adults: 2,
      children: 1,
      totalAmount: 30000,
      amountPaid: 15000,
      paymentMethod: "bkash",
      paymentStatus: "partial",
      status: "confirmed",
      transactionId: "BKASH_TRX981A",
      createdAt: formatOffset(-2),
      adminNotes: "Regular VIP guest. Requested extra child pillows."
    },
    {
      id: "MP-7412",
      customerName: "Dr. Pankaj Sarker",
      customerEmail: "pankaj.sarker@hospital.org",
      customerPhone: "+880 1711-223344",
      cottageId: "chandrima",
      cottageName: "Chandrima Cottage",
      checkIn: formatOffset(-4),
      checkOut: formatOffset(-2),
      adults: 2,
      children: 0,
      totalAmount: 12000,
      amountPaid: 12000,
      paymentMethod: "card",
      paymentStatus: "paid",
      status: "checked_out",
      transactionId: "TXN_CARD_88741",
      createdAt: formatOffset(-10),
      adminNotes: "Checked out successfully. Praised the love shape balcony."
    },
    {
      id: "MP-3205",
      customerName: "Sadia Rahman",
      customerEmail: "sadia.rahman@gmail.com",
      customerPhone: "+880 1988-123456",
      cottageId: "nilima",
      cottageName: "Nilima Cottage",
      checkIn: formatOffset(0), // Today
      checkOut: formatOffset(1), // Tomorrow
      adults: 2,
      children: 0,
      totalAmount: 6000,
      amountPaid: 6000,
      paymentMethod: "bkash",
      paymentStatus: "paid",
      status: "checked_in",
      transactionId: "BKASH_TRX002P",
      createdAt: formatOffset(-1),
      adminNotes: "Checked in today at 11:45 AM. Welcome drinks served."
    },
    {
      id: "MP-5512",
      customerName: "Arif Hossain",
      customerEmail: "arif.hossain@techcorp.com",
      customerPhone: "+880 1611-998877",
      cottageId: "rodela",
      cottageName: "Rodela Cottage",
      checkIn: formatOffset(5),
      checkOut: formatOffset(7),
      adults: 2,
      children: 0,
      totalAmount: 11000,
      amountPaid: 0,
      paymentMethod: "bkash",
      paymentStatus: "unpaid",
      status: "pending",
      createdAt: formatOffset(-1),
      adminNotes: "Awaiting bkash deposit of 3,060 tk."
    }
  ];

  localStorage.setItem("meghpunji_bookings", JSON.stringify(dummy));
  return dummy;
};

export const saveBookingsToStorage = (bookings: Booking[]) => {
  localStorage.setItem("meghpunji_bookings", JSON.stringify(bookings));
};

// Simple generator for email logging
export const generateAutomatedEmail = (booking: Booking, templateType: 'confirmation' | 'check_in' | 'payment_received' | 'check_out'): EmailLog => {
  let subject = "";
  let body = "";

  const checkInFormatted = new Date(booking.checkIn).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const checkOutFormatted = new Date(booking.checkOut).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  switch (templateType) {
    case "confirmation":
      subject = `Reservation Confirmation - ${booking.cottageName} | Meghpunji Resort Sajek [${booking.id}]`;
      body = `Dear ${booking.customerName},

Thank you for choosing Meghpunji Resort, Sajek - the village in the cloud.

We are delighted to confirm your reservation. Below are your booking details:

  • Cottage: ${booking.cottageName}
  • Check-In: ${checkInFormatted} (from 11:30 AM)
  • Check-Out: ${checkOutFormatted} (until 09:30 AM)
  • Guests: ${booking.adults} Adults, ${booking.children} Children
  • Total Amount: ৳${booking.totalAmount.toLocaleString()}
  • Amount Paid: ৳${booking.amountPaid.toLocaleString()}
  • Status: ${booking.status.toUpperCase()}

Please remember that advance payment of at least 3,060 tk per cottage per night must be received within 24 hours via bKash personal no 01815-761065. If you have already paid, our reservation managers will update your verification status shortly.

We look forward to welcoming you above the clouds!

Warm regards,
Meghpunji Resort Reservation Team
Sajek, Rangamati, Bangladesh`;
      break;

    case "payment_received":
      subject = `Payment Verification Success - Meghpunji Resort Sajek [${booking.id}]`;
      body = `Dear ${booking.customerName},

We have successfully verified your payment for your upcoming stay at Meghpunji Resort.

  • Cottage: ${booking.cottageName}
  • Check-In Date: ${checkInFormatted}
  • Total Amount: ৳${booking.totalAmount.toLocaleString()}
  • Amount Verified & Received: ৳${booking.amountPaid.toLocaleString()}
  • Payment Method: ${booking.paymentMethod.toUpperCase()} (ID: ${booking.transactionId || "N/A"})
  • Remaining Balance: ৳${(booking.totalAmount - booking.amountPaid).toLocaleString()}

Your booking status has been marked as CONFIRMED.

Our resort gates remain locked for outsiders to ensure 100% privacy, security, and safety during your stay. Your check-in is scheduled at 11:30 AM.

See you soon above 1,800 feet!

Sincerely,
Meghpunji Resort Billing
Sajek, Rangamati`;
      break;

    case "check_in":
      subject = `Welcome Above the Clouds! Check-In Completed at Meghpunji [${booking.id}]`;
      body = `Dear ${booking.customerName},

Welcome to your mountain sanctuary! Your check-in process for ${booking.cottageName} has been successfully completed.

Your package details:
  • Morning tea is served on your private balcony at 07:00 AM daily.
  • Complimentary breakfast (Khichuri, Egg, and custom delicacies) is served from 08:00 AM - 09:30 AM in the restaurant.
  • Welcome drinks have been delivered to your cottage.
  • Access to the largest garden area and stargazing swings is unrestricted.

Emergency Hotlines during stay:
  • Front Desk: +880 1815-761065
  • Housekeeping: Extension 101

Please let us know if you need any assistance with hot water, blanket modifications, or local tours. Enjoy your stay in the clouds!

Warmest regards,
The Management Team
Meghpunji Resort Sajek`;
      break;

    case "check_out":
      subject = `Thank you for staying with us! - Meghpunji Resort Sajek`;
      body = `Dear ${booking.customerName},

Thank you for choosing Meghpunji Resort for your retreat in Sajek Valley. Your check-out process for ${booking.cottageName} is now complete.

We sincerely hope you enjoyed the sea of clouds, our eco mud architecture, the stargazing balcony, and the peaceful vibes above 1,800 feet.

If you have a moment, we would love to hear about your experience! You can drop a review on our official page.

We hope to welcome you back soon whenever your spirit seeks silence and cloudy horizons.

Safe travels back home!

Sincerely,
Meghpunji Resort Team
Sajek, Rangamati`;
      break;
  }

  return {
    id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
    bookingId: booking.id,
    recipientEmail: booking.customerEmail,
    subject: `[Meghpunji Resort] ${subject}`,
    body,
    sentAt: new Date().toISOString(),
    status: "sent",
    templateType
  };
};

// Get email logs
export const getStoredEmailLogs = (): EmailLog[] => {
  const logs = localStorage.getItem("meghpunji_email_logs");
  if (logs) {
    try {
      return JSON.parse(logs);
    } catch (e) {
      console.error("Failed to parse email logs", e);
    }
  }
  return [];
};

export const saveEmailLog = (log: EmailLog) => {
  const currentLogs = getStoredEmailLogs();
  currentLogs.unshift(log); // Add at the start
  localStorage.setItem("meghpunji_email_logs", JSON.stringify(currentLogs));
};

export const isSameCottageId = (id1: string, id2: string): boolean => {
  if (!id1 || !id2) return false;
  const norm1 = id1.toLowerCase().replace(/_eco|_villa/g, "");
  const norm2 = id2.toLowerCase().replace(/_eco|_villa/g, "");
  return norm1 === norm2 || norm1.startsWith(norm2) || norm2.startsWith(norm1);
};

export const isCottageAvailable = (
  cottageId: string,
  checkIn: string,
  checkOut: string,
  bookings: Booking[]
): boolean => {
  if (!checkIn || !checkOut || !cottageId) return true;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (start >= end) return true;

  return !bookings.some((booking) => {
    if (!isSameCottageId(booking.cottageId, cottageId)) return false;
    if (booking.status === "cancelled") return false;

    const bStart = new Date(booking.checkIn);
    const bEnd = new Date(booking.checkOut);

    return bStart < end && bEnd > start;
  });
};

