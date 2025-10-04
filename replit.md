# Campus Lost & Found Application

## Overview
A full-stack web application for universities to help students report and find lost items. Features intelligent matching algorithm, admin verification panel, and real-time notifications.

## Tech Stack
- **Backend**: Node.js + Express with in-memory storage (MemStorage)
- **Frontend**: React + Vite with TypeScript
- **Authentication**: JWT with HTTP-only cookies
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: Wouter (React)
- **State Management**: TanStack Query (React Query v5)

## Current State
- Application running successfully on port 5000
- All critical build errors fixed (TypeScript types, ESM imports, AuthProvider setup)
- MVP features fully implemented and ready for testing
- In-memory storage with seed data populated

## Features

### Core Functionality
- **Item Management**: Report lost/found items with descriptions and image uploads
- **Intelligent Matching**: Automatic scoring algorithm with 60+ point threshold:
  - Category matching (40 points)
  - Location matching (20 points)
  - Date proximity (15 points)
  - Keyword similarity (20 points)
  - Image presence bonus (5 points)
- **Admin Panel**: Dashboard for match verification and user management
- **Authentication**: JWT-based auth with university email domain verification
- **Notifications**: In-app notifications for matches and updates
- **Responsive Design**: Mobile-friendly Tailwind CSS interface

### Admin Features
- Match request review and approval
- User verification for non-university domains
- Statistics dashboard with success metrics
- User management and role assignment

## Database Schema

### Users Table
- id (UUID primary key)
- name, email, university_id, password_hash
- role (student/admin), verified (boolean)
- created_at timestamp

### Lost/Found Items Tables
- id (UUID primary key)
- user_id (foreign key)
- title, category, description, location
- image_path (optional)
- date_lost/date_found
- status (pending/matched/returned/closed)
- created_at timestamp

### Match Requests Table
- id, lost_id, found_id
- score (integer)
- status (pending/approved/rejected)
- created_at timestamp

### Notifications Table
- id, user_id
- title, body, link
- read (boolean)
- created_at timestamp

## Seed Data

### Test Users
- **Admin**: admin@university.test / Admin@123
- **Students** (all password: Student@123):
  - ali@university.test (U2025-001)
  - sara@university.test (U2025-002)
  - bilal@university.test (U2025-003)

### Seeded Items
- 3 Lost items: iPhone 13 Pro, Black Backpack, Calculus Textbook
- 3 Found items: Phone with blue case, Nike Backpack, Math Textbook
- 1 Pending match request (score: 85)

## File Structure

### Important Files
- `server/routes.ts` - API routes and authentication
- `server/storage.ts` - In-memory storage with seed data
- `server/middleware/auth.ts` - JWT authentication middleware
- `server/utils/matchingEngine.ts` - Intelligent matching algorithm
- `shared/schema.ts` - Database schema and Zod validation
- `client/src/App.tsx` - React router with AuthProvider
- `client/src/pages/` - All application pages
- `client/src/hooks/use-auth.tsx` - Authentication context hook

### Key Directories
- `server/uploads/` - Local file upload storage (5MB limit)
- `client/src/components/` - Reusable UI components
- `client/src/lib/` - Query client and utilities

## Configuration

### Environment Variables
- `SESSION_SECRET` - JWT secret (already configured)
- University domain: `university.test` (mock implementation)

### File Uploads
- Max size: 5MB
- Allowed types: jpeg, jpg, png, gif
- Storage: Local filesystem at `/server/uploads`

## Development Workflow

### Running the Application
- Workflow: "Start application" (npm run dev)
- Frontend + Backend served on same port (5000)
- Hot reload enabled via Vite HMR

### Recent Changes (Oct 4, 2025)
1. Fixed duplicate MatchingEngine export
2. Installed missing TypeScript types (@types/bcrypt, @types/multer, @types/jsonwebtoken)
3. Fixed ESM imports in routes.ts (replaced require with import)
4. Added AuthProvider wrapper in App.tsx
5. Simplified multer callback types to fix TypeScript errors

## Testing Checklist
- [ ] Authentication flow (signup, login, JWT validation)
- [ ] Lost/found item creation with image upload
- [ ] Intelligent matching engine (60+ score threshold)
- [ ] Admin panel: match approval, user verification
- [ ] Dashboard, browsing, filtering
- [ ] Notifications system
- [ ] Complete end-to-end user workflow

## User Preferences
- N/A (first session)

## Next Steps
1. Test authentication flow end-to-end
2. Test item creation and matching engine
3. Test admin panel workflows
4. Test complete user journey from signup to item return
