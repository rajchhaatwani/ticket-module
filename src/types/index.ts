export interface Organizer {
  _id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Event {
  _id: string;
  organizer_id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  venue: string;
  is_deleted: boolean;
  created_at: string;
}

export interface Ticket {
  _id: string;
  event_id: string;
  type: string;
  price: number;
  total_quantity: number;
  available_quantity: number;
  is_deleted: boolean;
  created_at: string;
}

export interface AssignedTicket {
  _id: string;
  ticket_id: string;
  user_email: string;
  qr_code: string;
  status: 'assigned' | 'used' | 'cancelled';
  assigned_at: string;
}

export interface Coupon {
  _id: string;
  event_id: string;
  code: string;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  usage_limit: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
}

export interface ScanLog {
  _id: string;
  assigned_ticket_id: string;
  scanned_by: string;
  scanned_at: string;
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