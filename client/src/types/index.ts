export interface Organizer {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Event {
  _id: string;
  organizer: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  venue: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Ticket {
  _id: string;
  event: string;
  type: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignedTicket {
  _id: string;
  ticket: string;
  userEmail: string;
  qrCode: string;
  status: 'assigned' | 'used' | 'cancelled';
  assignedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Coupon {
  _id: string;
  event: string;
  code: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScanLog {
  _id: string;
  assignedTicket: string;
  scannedBy: string;
  scannedAt?: string;
  location?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: Organizer | null;
  token: string | null;
  isAuthenticated: boolean;
}