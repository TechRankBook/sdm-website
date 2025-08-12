---
description: Repository Information Overview
alwaysApply: true
---

# SDM Website Information

## Summary
A modern web application for a transportation service (SDM) built with React, TypeScript, and Vite. The application provides features for booking rides, user authentication, payment processing via Razorpay, and ride tracking.

## Structure
- **src/**: Main application source code containing React components, pages, and utilities
- **public/**: Static assets including images and favicon
- **supabase/**: Backend functions and database migrations for Supabase integration
- **.zencoder/**: Configuration for Zencoder

## Language & Runtime
**Language**: TypeScript/JavaScript
**Version**: TypeScript 5.5.3
**Build System**: Vite 5.4.1
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- React 18.3.1
- React Router 6.26.2
- Supabase 2.53.0
- TanStack Query 5.56.2
- shadcn/ui (Radix UI components)
- Tailwind CSS 3.4.11
- Zod 3.23.8
- Zustand 5.0.7

**Development Dependencies**:
- Vite 5.4.1
- ESLint 9.9.0
- TypeScript 5.5.3
- SWC (via @vitejs/plugin-react-swc)
- Lovable Tagger 1.1.7

## Build & Installation
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Backend Services
**Supabase Functions**:
- **create-razorpay-order**: Creates payment orders via Razorpay API
- **verify-razorpay-payment**: Verifies payment status from Razorpay
- **booking-notifications**: Handles notifications for bookings

**Database**:
- Supabase PostgreSQL database with tables for users, bookings, and payments

## Main Files & Resources
**Entry Points**:
- src/main.tsx: Application entry point
- src/App.tsx: Main component with routing configuration

**Key Components**:
- src/pages/: Page components (Index, Booking, Profile, etc.)
- src/components/: Reusable UI components
- src/contexts/AuthContext.tsx: Authentication context provider
- src/integrations/supabase/: Supabase client configuration

## Deployment
**Hosting**: Vercel (configured via vercel.json)
**Environment**: Node.js
**URL**: Configured via Lovable platform (https://lovable.dev/projects/12b0fe8b-10c1-442f-ad21-db25d3dfef8b)