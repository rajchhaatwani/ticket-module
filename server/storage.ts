import { 
  users, type User, type InsertUser,
  organizers, type Organizer, type InsertOrganizer,
  events, type Event, type InsertEvent,
  tickets, type Ticket, type InsertTicket,
  assignedTickets, type AssignedTicket, type InsertAssignedTicket,
  coupons, type Coupon, type InsertCoupon,
  scanLogs, type ScanLog, type InsertScanLog
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Organizer operations
  getOrganizer(id: number): Promise<Organizer | undefined>;
  getOrganizerByEmail(email: string): Promise<Organizer | undefined>;
  createOrganizer(organizer: InsertOrganizer): Promise<Organizer>;
  authenticateOrganizer(email: string, password: string): Promise<Organizer | null>;

  // Event operations
  getEvents(organizerId: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;

  // Ticket operations
  getTickets(eventId: number): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, ticket: Partial<InsertTicket>): Promise<Ticket | undefined>;
  deleteTicket(id: number): Promise<boolean>;

  // Assigned ticket operations
  getAssignedTickets(ticketId?: number): Promise<AssignedTicket[]>;
  getAssignedTicket(id: number): Promise<AssignedTicket | undefined>;
  getAssignedTicketByQR(qrCode: string): Promise<AssignedTicket | undefined>;
  createAssignedTicket(assignedTicket: InsertAssignedTicket): Promise<AssignedTicket>;
  updateAssignedTicketStatus(id: number, status: "assigned" | "used" | "cancelled"): Promise<AssignedTicket | undefined>;

  // Coupon operations
  getCoupons(eventId: number): Promise<Coupon[]>;
  getCoupon(id: number): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: number, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined>;
  useCoupon(id: number): Promise<Coupon | undefined>;

  // Scan log operations
  getScanLogs(assignedTicketId?: number): Promise<ScanLog[]>;
  createScanLog(scanLog: InsertScanLog): Promise<ScanLog>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private organizers: Map<number, Organizer>;
  private events: Map<number, Event>;
  private tickets: Map<number, Ticket>;
  private assignedTickets: Map<number, AssignedTicket>;
  private coupons: Map<number, Coupon>;
  private scanLogs: Map<number, ScanLog>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.organizers = new Map();
    this.events = new Map();
    this.tickets = new Map();
    this.assignedTickets = new Map();
    this.coupons = new Map();
    this.scanLogs = new Map();
    this.currentId = 1;

    // Add demo organizer
    this.createOrganizer({
      name: "John Organizer",
      email: "demo@ticketpro.com",
      password: "password123"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Organizer operations
  async getOrganizer(id: number): Promise<Organizer | undefined> {
    return this.organizers.get(id);
  }

  async getOrganizerByEmail(email: string): Promise<Organizer | undefined> {
    return Array.from(this.organizers.values()).find(
      (organizer) => organizer.email === email,
    );
  }

  async createOrganizer(insertOrganizer: InsertOrganizer): Promise<Organizer> {
    const id = this.currentId++;
    const organizer: Organizer = { 
      ...insertOrganizer, 
      id,
      createdAt: new Date()
    };
    this.organizers.set(id, organizer);
    return organizer;
  }

  async authenticateOrganizer(email: string, password: string): Promise<Organizer | null> {
    const organizer = await this.getOrganizerByEmail(email);
    if (organizer && organizer.password === password) {
      return organizer;
    }
    return null;
  }

  // Event operations
  async getEvents(organizerId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.organizerId === organizerId && !event.isDeleted
    );
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const event = this.events.get(id);
    return event && !event.isDeleted ? event : undefined;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentId++;
    const event: Event = { 
      ...insertEvent, 
      id,
      isDeleted: false,
      createdAt: new Date()
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, updateEvent: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (event && !event.isDeleted) {
      const updatedEvent = { ...event, ...updateEvent };
      this.events.set(id, updatedEvent);
      return updatedEvent;
    }
    return undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const event = this.events.get(id);
    if (event) {
      this.events.set(id, { ...event, isDeleted: true });
      return true;
    }
    return false;
  }

  // Ticket operations
  async getTickets(eventId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.eventId === eventId && !ticket.isDeleted
    );
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    return ticket && !ticket.isDeleted ? ticket : undefined;
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = this.currentId++;
    const ticket: Ticket = { 
      ...insertTicket, 
      id,
      isDeleted: false,
      createdAt: new Date()
    };
    this.tickets.set(id, ticket);
    return ticket;
  }

  async updateTicket(id: number, updateTicket: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (ticket && !ticket.isDeleted) {
      const updatedTicket = { ...ticket, ...updateTicket };
      this.tickets.set(id, updatedTicket);
      return updatedTicket;
    }
    return undefined;
  }

  async deleteTicket(id: number): Promise<boolean> {
    const ticket = this.tickets.get(id);
    if (ticket) {
      this.tickets.set(id, { ...ticket, isDeleted: true });
      return true;
    }
    return false;
  }

  // Assigned ticket operations
  async getAssignedTickets(ticketId?: number): Promise<AssignedTicket[]> {
    const tickets = Array.from(this.assignedTickets.values());
    return ticketId ? 
      tickets.filter((ticket) => ticket.ticketId === ticketId) : 
      tickets;
  }

  async getAssignedTicket(id: number): Promise<AssignedTicket | undefined> {
    return this.assignedTickets.get(id);
  }

  async getAssignedTicketByQR(qrCode: string): Promise<AssignedTicket | undefined> {
    return Array.from(this.assignedTickets.values()).find(
      (ticket) => ticket.qrCode === qrCode
    );
  }

  async createAssignedTicket(insertAssignedTicket: InsertAssignedTicket): Promise<AssignedTicket> {
    const id = this.currentId++;
    const assignedTicket: AssignedTicket = { 
      ...insertAssignedTicket, 
      id,
      status: "assigned",
      assignedAt: new Date()
    };
    this.assignedTickets.set(id, assignedTicket);
    return assignedTicket;
  }

  async updateAssignedTicketStatus(id: number, status: "assigned" | "used" | "cancelled"): Promise<AssignedTicket | undefined> {
    const ticket = this.assignedTickets.get(id);
    if (ticket) {
      const updatedTicket = { ...ticket, status };
      this.assignedTickets.set(id, updatedTicket);
      return updatedTicket;
    }
    return undefined;
  }

  // Coupon operations
  async getCoupons(eventId: number): Promise<Coupon[]> {
    return Array.from(this.coupons.values()).filter(
      (coupon) => coupon.eventId === eventId
    );
  }

  async getCoupon(id: number): Promise<Coupon | undefined> {
    return this.coupons.get(id);
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    return Array.from(this.coupons.values()).find(
      (coupon) => coupon.code === code
    );
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const id = this.currentId++;
    const coupon: Coupon = { 
      ...insertCoupon, 
      id,
      usedCount: 0
    };
    this.coupons.set(id, coupon);
    return coupon;
  }

  async updateCoupon(id: number, updateCoupon: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const coupon = this.coupons.get(id);
    if (coupon) {
      const updatedCoupon = { ...coupon, ...updateCoupon };
      this.coupons.set(id, updatedCoupon);
      return updatedCoupon;
    }
    return undefined;
  }

  async useCoupon(id: number): Promise<Coupon | undefined> {
    const coupon = this.coupons.get(id);
    if (coupon && coupon.usedCount < coupon.usageLimit) {
      const updatedCoupon = { ...coupon, usedCount: coupon.usedCount + 1 };
      this.coupons.set(id, updatedCoupon);
      return updatedCoupon;
    }
    return undefined;
  }

  // Scan log operations
  async getScanLogs(assignedTicketId?: number): Promise<ScanLog[]> {
    const logs = Array.from(this.scanLogs.values());
    return assignedTicketId ? 
      logs.filter((log) => log.assignedTicketId === assignedTicketId) : 
      logs;
  }

  async createScanLog(insertScanLog: InsertScanLog): Promise<ScanLog> {
    const id = this.currentId++;
    const scanLog: ScanLog = { 
      ...insertScanLog, 
      id,
      scannedAt: new Date()
    };
    this.scanLogs.set(id, scanLog);
    return scanLog;
  }
}

export const storage = new MemStorage();
