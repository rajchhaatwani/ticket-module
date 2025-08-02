import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Import and register MongoDB API routes
  try {
    const authRoutes = (await import('./routes/auth.js')).default;
    const eventRoutes = (await import('./routes/events.js')).default;
    const ticketRoutes = (await import('./routes/tickets.js')).default;
    const assignmentRoutes = (await import('./routes/assignments.js')).default;
    const couponRoutes = (await import('./routes/coupons.js')).default;
    const scanRoutes = (await import('./routes/scan.js')).default;

    // Register API routes - these will take priority over Vite routes
    app.use('/api/auth', authRoutes);
    app.use('/api/events', eventRoutes);
    app.use('/api/tickets', ticketRoutes);
    app.use('/api/assignments', assignmentRoutes);
    app.use('/api/coupons', couponRoutes);
    app.use('/api/scan', scanRoutes);
    
    console.log('✅ MongoDB API routes registered successfully');
  } catch (error) {
    console.error('❌ Error registering MongoDB API routes:', error);
  }

  const httpServer = createServer(app);
  return httpServer;
}
