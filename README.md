# Campus Lost & Found - University Lost and Found Management System

A full-stack web application designed for universities to manage lost and found items with intelligent matching, admin verification, and notification system.

## 🚀 Features

### Core Functionality
- **Item Management**: Report and browse lost/found items with detailed descriptions and images
- **Intelligent Matching**: Automatic matching algorithm with 60+ point threshold based on:
  - Category matching (40 points)
  - Location matching (20 points)
  - Date proximity (15 points)
  - Keyword similarity (20 points)
  - Image presence bonus (5 points)
- **Admin Panel**: Comprehensive dashboard for match verification and user management
- **Authentication**: JWT-based auth with university email domain verification
- **Notifications**: Real-time in-app notifications for matches and updates
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

### Admin Features
- Match request review and approval
- User verification for non-university domains
- Statistics dashboard with success metrics
- User management and role assignment

### Technical Features
- **Backend**: Node.js + Express with SQLite database
- **Frontend**: React + Vite with TypeScript
- **Authentication**: JWT with HTTP-only cookies
- **File Uploads**: Local storage with image validation (easily configurable for cloud storage)
- **Matching Engine**: Intelligent scoring algorithm with detailed breakdown
- **Notifications**: Database-stored notifications with optional email integration

## 📋 Prerequisites

- Node.js 18+ LTS
- npm or yarn package manager

## 🛠️ Setup & Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd campus-lost-found

# Install dependencies
npm install
