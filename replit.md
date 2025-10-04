# Campus Lost & Found - University Lost and Found Management System

## Overview
A full-stack web application designed for universities to manage lost and found items with intelligent matching, admin verification, and notification system.

## Project Architecture

### Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (via Drizzle ORM)
- **Authentication**: JWT with HTTP-only cookies
- **Development**: Single server setup (Express serves both API and frontend)

### Project Structure
- `/client` - React frontend application
  - `/src/components` - Reusable UI components (built with Radix UI)
  - `/src/pages` - Application pages (login, signup, dashboard, etc.)
  - `/src/api` - API client functions
  - `/src/hooks` - Custom React hooks
- `/server` - Express backend
  - `index.ts` - Main server entry point
  - `routes.ts` - API route definitions
  - `/middleware` - Auth and admin middleware
  - `/utils` - Matching engine, notifier, university connector
- `/shared` - Shared TypeScript types and schemas
  - `schema.ts` - Drizzle ORM database schema
- `/attached_assets` - Static assets and uploaded images

### Database Schema
- `users` - User accounts with university verification
- `lost_items` - Lost item reports
- `found_items` - Found item reports
- `match_requests` - Automated matches between lost/found items
- `claims` - Claim requests for matched items
- `notifications` - In-app notification system

## Setup & Configuration

### Environment Setup (Replit)
1. **Database**: PostgreSQL database automatically provisioned
2. **Port**: Server runs on port 5000 (serves both API and frontend)
3. **Host**: Configured to work with Replit's proxy (0.0.0.0:5000)
4. **Vite HMR**: Configured for Replit environment with clientPort 443

### Installation
```bash
npm install
```

### Database Setup
```bash
npm run db:push
```

### Development
```bash
npm run dev
```
Starts the server at http://0.0.0.0:5000

### Build & Production
```bash
npm run build  # Builds both frontend and backend
npm start      # Runs production build
```

## Features

### Core Functionality
- Item Management: Report and browse lost/found items with images
- Intelligent Matching: 60+ point threshold scoring system
  - Category matching (40 points)
  - Location matching (20 points)
  - Date proximity (15 points)
  - Keyword similarity (20 points)
  - Image presence bonus (5 points)
- Admin Panel: Match verification and user management
- Authentication: University email domain verification
- Notifications: Real-time in-app notifications

### Admin Features
- Match request review and approval
- User verification for non-university domains
- Statistics dashboard with success metrics
- User management and role assignment

## Recent Changes (2025-10-04)
- Initial setup for Replit environment
- Configured Vite to allow all hosts for Replit proxy
- Set up PostgreSQL database and pushed schema
- Created .gitignore for Node.js project
- Configured development workflow on port 5000
- Verified application is running correctly

## Development Notes
- Server serves both API endpoints and frontend in development
- Vite dev server is integrated with Express
- All API routes are prefixed with `/api`
- File uploads stored locally in `uploads/` directory (configurable for cloud storage)
- Demo credentials available: admin@university.test / Admin@123
