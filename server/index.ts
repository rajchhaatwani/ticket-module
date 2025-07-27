import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Import MongoDB support (using dynamic imports)
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoose = (await import('mongoose')).default;
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketpro', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Import MongoDB routes using dynamic imports
const setupRoutes = async () => {
  const authRoutes = (await import('./routes/auth.js')).default;
  const eventRoutes = (await import('./routes/events.js')).default;
  const ticketRoutes = (await import('./routes/tickets.js')).default;
  const assignmentRoutes = (await import('./routes/assignments.js')).default;
  const couponRoutes = (await import('./routes/coupons.js')).default;
  const scanRoutes = (await import('./routes/scan.js')).default;

  // API Routes - Add these BEFORE the existing routes
  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/assignments', assignmentRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/scan', scanRoutes);
};

// Setup routes after imports
setupRoutes();

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
