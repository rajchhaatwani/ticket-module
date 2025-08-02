import { Event, Ticket, AssignedTicket, Coupon } from '../types';

export const mockEvents: Event[] = [
  {
    _id: '1',
    organizer_id: '1',
    name: 'Tech Conference 2024',
    description: 'Annual technology conference featuring latest innovations',
    start_time: '2024-03-15T10:00:00Z',
    end_time: '2024-03-15T18:00:00Z',
    venue: 'Convention Center, Main Hall',
    is_deleted: false,
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    _id: '2',
    organizer_id: '1',
    name: 'Music Festival Summer',
    description: 'Three-day music festival with top artists',
    start_time: '2024-06-20T16:00:00Z',
    end_time: '2024-06-22T23:00:00Z',
    venue: 'Central Park Amphitheater',
    is_deleted: false,
    created_at: '2024-02-01T10:00:00Z',
  },
  {
    _id: '3',
    organizer_id: '1',
    name: 'Business Workshop',
    description: 'Intensive workshop on modern business strategies',
    start_time: '2024-04-10T09:00:00Z',
    end_time: '2024-04-10T17:00:00Z',
    venue: 'Business Center, Room 201',
    is_deleted: false,
    created_at: '2024-01-20T12:00:00Z',
  },
];

export const mockTickets: Ticket[] = [
  {
    _id: '1',
    event_id: '1',
    type: 'General Admission',
    price: 99.99,
    total_quantity: 500,
    available_quantity: 342,
    is_deleted: false,
    created_at: '2024-01-16T08:00:00Z',
  },
  {
    _id: '2',
    event_id: '1',
    type: 'VIP',
    price: 299.99,
    total_quantity: 100,
    available_quantity: 67,
    is_deleted: false,
    created_at: '2024-01-16T08:30:00Z',
  },
  {
    _id: '3',
    event_id: '2',
    type: 'Early Bird',
    price: 149.99,
    total_quantity: 200,
    available_quantity: 89,
    is_deleted: false,
    created_at: '2024-02-02T10:00:00Z',
  },
  {
    _id: '4',
    event_id: '2',
    type: 'Regular',
    price: 199.99,
    total_quantity: 800,
    available_quantity: 234,
    is_deleted: false,
    created_at: '2024-02-02T10:30:00Z',
  },
];

export const mockAssignedTickets: AssignedTicket[] = [
  {
    _id: '1',
    ticket_id: '1',
    user_email: 'user1@example.com',
    qr_code: 'QR-TECH-CONF-2024-001',
    status: 'assigned',
    assigned_at: '2024-01-20T14:30:00Z',
  },
  {
    _id: '2',
    ticket_id: '2',
    user_email: 'user2@example.com',
    qr_code: 'QR-TECH-CONF-2024-002',
    status: 'used',
    assigned_at: '2024-01-21T09:15:00Z',
  },
];

export const mockCoupons: Coupon[] = [
  {
    _id: '1',
    event_id: '1',
    code: 'EARLY20',
    discount_type: 'percentage',
    discount_value: 20,
    usage_limit: 100,
    used_count: 43,
    valid_from: '2024-01-01T00:00:00Z',
    valid_until: '2024-02-28T23:59:59Z',
  },
  {
    _id: '2',
    event_id: '2',
    code: 'SUMMER50',
    discount_type: 'fixed',
    discount_value: 50,
    usage_limit: 50,
    used_count: 27,
    valid_from: '2024-04-01T00:00:00Z',
    valid_until: '2024-06-01T23:59:59Z',
  },
];