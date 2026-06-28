export interface Cottage {
  id: string;
  name: string;
  type: string;
  rating: number;
  weekdayPrice: number;
  weekendPrice: number;
  maxGuests: number;
  image: string;
  gallery: string[];
  description: string;
  features: string[];
  rules: string[];
  packages: {
    name: string;
    description: string;
    features: string[];
  }[];
  reviews: {
    author: string;
    rating: number;
    text: string;
    avatar: string;
    date: string;
  }[];
}

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  cottageId: string;
  cottageName: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults: number;
  children: number;
  totalAmount: number;
  amountPaid: number;
  paymentMethod: 'bkash' | 'card' | 'cash';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  transactionId?: string;
  adminNotes?: string;
  createdAt: string;
  userId?: string;
}

export interface EmailLog {
  id: string;
  bookingId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  sentAt: string;
  status: 'sent' | 'queued' | 'failed';
  templateType: 'confirmation' | 'check_in' | 'payment_received' | 'check_out';
}
