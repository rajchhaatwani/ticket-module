# TicketPro - Event Management System

## Overview

TicketPro is a full-stack event management application that allows organizers to create and manage events, sell tickets, track assignments, manage coupons, and scan QR codes for ticket validation. The system consists of a React frontend with TypeScript, an Express.js backend, and PostgreSQL database with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Context API for authentication, React Query for server state
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcryptjs for password hashing
- **Session Management**: PostgreSQL session store using connect-pg-simple

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: @neondatabase/serverless for serverless PostgreSQL connections

## Key Components

### Authentication System
- JWT-based authentication for organizers
- Protected routes using context-based auth state
- Password hashing with bcryptjs
- Session persistence in localStorage

### Database Schema
The application uses the following main entities:
- **Users**: Basic user accounts with username/password
- **Organizers**: Event organizers with name, email, and password
- **Events**: Event details including time, venue, and description
- **Tickets**: Ticket types with pricing and quantity management
- **AssignedTickets**: Individual ticket assignments with QR codes
- **Coupons**: Discount codes with usage limits and validation
- **ScanLogs**: Audit trail for ticket scanning activities

### API Structure
- RESTful API design with `/api` prefix
- Protected routes using middleware
- CRUD operations for all entities
- Proper error handling and status codes

### Frontend Components
- **Dashboard**: Overview with statistics and charts
- **Event Management**: Create, edit, and delete events
- **Ticket Management**: Configure ticket types and pricing
- **Assignment Tracking**: Monitor ticket sales and assignments
- **Coupon System**: Create and manage discount codes
- **QR Scanner**: Mobile-friendly ticket validation

## Data Flow

1. **Authentication Flow**: Organizers log in → JWT token stored → Token validates API requests
2. **Event Creation**: Organizer creates event → Tickets defined → Assignments tracked
3. **Ticket Sales**: Customers receive assigned tickets with QR codes
4. **Validation Flow**: QR scanner validates tickets → Updates status → Logs scan activity

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations
- **bcryptjs**: Password hashing and validation
- **jsonwebtoken**: JWT token generation and verification
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI components
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **drizzle-kit**: Database schema management and migrations
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds
- **vite**: Development server and build tool

## Deployment Strategy

### Build Process
- Frontend builds to `dist/public` using Vite
- Backend compiles to `dist/index.js` using esbuild
- TypeScript compilation with strict type checking

### Environment Configuration
- Development: Uses tsx for hot reloading
- Production: Compiled JavaScript with optimized bundles
- Database: Requires `DATABASE_URL` environment variable

### Scripts
- `npm run dev`: Start development server with hot reloading
- `npm run build`: Build both frontend and backend for production
- `npm start`: Run production server
- `npm run db:push`: Push database schema changes

### Deployment Considerations
- Supports both traditional and serverless deployment
- Environment variables required for database connection
- Static file serving handled by Express in production
- Neon PostgreSQL compatible for cloud deployment

The application follows a monorepo structure with shared TypeScript types and schema definitions, enabling type safety across the full stack while maintaining clear separation between frontend and backend concerns.