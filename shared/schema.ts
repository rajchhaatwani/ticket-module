import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const organizers = pgTable("organizers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  organizerId: integer("organizer_id").references(() => organizers.id).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  venue: text("venue").notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  type: text("type").notNull(),
  price: real("price").notNull(),
  totalQuantity: integer("total_quantity").notNull(),
  availableQuantity: integer("available_quantity").notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assignedTickets = pgTable("assigned_tickets", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id).notNull(),
  userEmail: text("user_email").notNull(),
  qrCode: text("qr_code").notNull().unique(),
  status: text("status", { enum: ["assigned", "used", "cancelled"] }).default("assigned").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type", { enum: ["fixed", "percentage"] }).notNull(),
  discountValue: real("discount_value").notNull(),
  usageLimit: integer("usage_limit").notNull(),
  usedCount: integer("used_count").default(0).notNull(),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
});

export const scanLogs = pgTable("scan_logs", {
  id: serial("id").primaryKey(),
  assignedTicketId: integer("assigned_ticket_id").references(() => assignedTickets.id).notNull(),
  scannedBy: text("scanned_by").notNull(),
  scannedAt: timestamp("scanned_at").defaultNow().notNull(),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Organizer schemas
export const insertOrganizerSchema = createInsertSchema(organizers).omit({
  id: true,
  createdAt: true,
});

// Event schemas
export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

// Ticket schemas
export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
});

// Assigned ticket schemas
export const insertAssignedTicketSchema = createInsertSchema(assignedTickets).omit({
  id: true,
  assignedAt: true,
});

// Coupon schemas
export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  usedCount: true,
});

// Scan log schemas
export const insertScanLogSchema = createInsertSchema(scanLogs).omit({
  id: true,
  scannedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertOrganizer = z.infer<typeof insertOrganizerSchema>;
export type Organizer = typeof organizers.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

export type InsertAssignedTicket = z.infer<typeof insertAssignedTicketSchema>;
export type AssignedTicket = typeof assignedTickets.$inferSelect;

export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof coupons.$inferSelect;

export type InsertScanLog = z.infer<typeof insertScanLogSchema>;
export type ScanLog = typeof scanLogs.$inferSelect;
