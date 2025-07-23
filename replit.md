# Digital Library Management System

## Overview

This is a full-stack digital library management system built with React, Express, and PostgreSQL. The application allows users to browse, borrow, and purchase books while providing administrative capabilities for library management. It features a modern, responsive UI built with shadcn/ui components and implements Replit's authentication system for user management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom library-themed color palette
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage

### Database Layer
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon serverless driver with WebSocket support
- **Tables**: Users, books, borrowed books, purchases, and sessions

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Authorization**: Role-based access control (user/admin roles)
- **Session Handling**: HTTP-only cookies with 7-day expiration

### Book Management
- **Catalog**: Searchable and filterable book collection
- **Inventory**: Track total and available copies per book
- **Categories**: Genre-based book organization
- **Rich Metadata**: ISBN, descriptions, cover images, and pricing

### User Operations
- **Borrowing System**: 14-day loan periods with renewal capability
- **Purchase System**: Digital book sales with transaction tracking
- **User Dashboard**: Personal library view with borrowed books and purchases
- **Due Date Management**: Overdue book tracking and notifications

### Admin Panel
- **Book Management**: CRUD operations for library inventory
- **Analytics Dashboard**: Real-time statistics and reporting
- **User Management**: Monitor user activity and library usage
- **Revenue Tracking**: Purchase analytics and financial reporting

## Data Flow

### Authentication Flow
1. User initiates login via Replit Auth
2. OpenID Connect handles authentication
3. User profile stored in PostgreSQL
4. Session created with secure cookie
5. Role-based route protection enforced

### Book Operations Flow
1. Frontend queries book catalog via React Query
2. Express API routes handle business logic
3. Drizzle ORM executes type-safe database operations
4. Real-time inventory updates across all clients
5. Transaction logging for audit trails

### Admin Operations Flow
1. Role verification middleware protects admin routes
2. Administrative actions logged and validated
3. Bulk operations supported for efficiency
4. Real-time dashboard updates via query invalidation

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless platform
- **Authentication**: Replit's OpenID Connect service
- **File Storage**: Public assets served via Vite static handling

### Key Libraries
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Data Fetching**: TanStack React Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with CSS variables for theming
- **Database**: Drizzle ORM with Neon serverless driver

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: TypeScript strict mode with path mapping
- **Development Server**: Hot module replacement with error overlay
- **Package Management**: npm with lockfile for reproducible builds

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Reload**: Both frontend and backend support live reloading
- **Database**: Neon development database with connection pooling
- **Environment Variables**: Secure credential management

### Production Deployment
- **Build Process**: Vite builds optimized React bundle
- **Server Bundle**: esbuild packages Express server for production
- **Static Assets**: Built frontend served by Express in production
- **Database Migrations**: Drizzle Kit manages schema changes
- **Environment Configuration**: Production-specific settings and secrets

### Scalability Considerations
- **Database**: Neon serverless automatically scales with demand
- **Session Storage**: PostgreSQL sessions support horizontal scaling
- **Static Assets**: Can be moved to CDN for improved performance
- **API Design**: RESTful structure supports load balancing