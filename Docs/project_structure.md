# Project Structure - Hypertropher

## Overview
Hypertropher is a Next.js 14 application built with the App Router, using Supabase as the backend service. The project follows a modern, scalable architecture with clear separation of concerns.

## Root Directory Structure
```
hypertropher-app/
├── app/                          # Next.js App Router pages and API routes
│   ├── account/                  # User account management
│   ├── add-dish/                 # Dish contribution form
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── dishes/               # Dish CRUD operations
│   │   └── users/                # User management
│   ├── complete-profile/         # User onboarding
│   ├── my-dishes/                # User's contributed dishes
│   ├── my-wishlist/              # User's saved dishes
│   ├── signup/                   # Authentication pages
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Homepage
├── components/                   # Reusable UI components
│   ├── ui/                       # Shadcn UI components
│   ├── bottom-navigation.tsx     # Mobile navigation
│   ├── dish-card.tsx             # Dish display component
│   ├── header.tsx                # App header
│   └── main-layout.tsx           # Layout wrapper
├── lib/                          # Utility libraries and configurations
│   ├── supabase/                 # Supabase client configurations
│   └── utils.ts                  # Shared utilities
├── public/                       # Static assets
├── styles/                       # Additional stylesheets
├── Docs/                         # Project documentation
├── .cursor/                      # Cursor IDE rules
├── DATABASE_SCHEMA.md            # Database design documentation
├── PRD.md                        # Product Requirements Document
└── package.json                  # Dependencies and scripts
```

## Detailed Structure

### `/app` - Next.js App Router
The main application directory using Next.js 14 App Router conventions:

- **`layout.tsx`**: Root layout with global providers and metadata
- **`page.tsx`**: Homepage with dish discovery and filtering
- **`loading.tsx`**: Global loading states
- **`globals.css`**: Global CSS with Tailwind imports

#### Page Routes
- **`/account`**: User profile and settings management
- **`/add-dish`**: Form for contributing new dishes
- **`/complete-profile`**: User onboarding after signup
- **`/my-dishes`**: User's contributed dishes
- **`/my-wishlist`**: User's bookmarked dishes
- **`/signup`**: Authentication and user registration

#### API Routes (`/app/api`)
- **`/auth/signup`**: User registration with invite code validation
- **`/dishes`**: CRUD operations for dishes (POST, GET)
- **`/users`**: User profile management (POST for profile completion)

### `/components` - UI Components
Reusable React components following atomic design principles:

#### Core Components
- **`main-layout.tsx`**: Wrapper component with header and navigation
- **`header.tsx`**: App header with navigation and user controls
- **`bottom-navigation.tsx`**: Mobile-first bottom navigation
- **`dish-card.tsx`**: Dish display component with ratings and actions

#### UI Components (`/components/ui`)
Shadcn UI components for consistent design:
- **`button.tsx`**: Button variants and states
- **`card.tsx`**: Card container components
- **`input.tsx`**: Form input components
- **`select.tsx`**: Dropdown selection components
- **`badge.tsx`**: Status and category badges
- **`label.tsx`**: Form labels

### `/lib` - Utilities and Configuration
Shared libraries and configurations:

- **`supabase/client.ts`**: Browser-side Supabase client
- **`supabase/server.ts`**: Server-side Supabase client
- **`utils.ts`**: Shared utility functions (cn, etc.)

### `/public` - Static Assets
Static files served directly:

- **Images**: Placeholder images for dishes and UI
- **Icons**: App icons and favicons
- **Assets**: Any other static resources

### `/Docs` - Documentation
Project documentation and specifications:

- **`Implementation.md`**: Development roadmap and task tracking
- **`project_structure.md`**: This file - project organization
- **`UI_UX_doc.md`**: Design system and user experience guidelines
- **`Bug_tracking.md`**: Error tracking and resolution documentation

## File Naming Conventions

### Pages and Components
- **Pages**: `page.tsx` (App Router convention)
- **Layouts**: `layout.tsx`
- **Components**: `kebab-case.tsx` (e.g., `dish-card.tsx`)
- **API Routes**: `route.ts`

### Configuration Files
- **Environment**: `.env.local` (gitignored)
- **Package Management**: `package.json`, `package-lock.json`
- **Build Configuration**: `next.config.mjs`, `tailwind.config.ts`
- **TypeScript**: `tsconfig.json`

## Module Organization Patterns

### Component Structure
```typescript
// Component file structure
interface ComponentProps {
  // Props definition
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return (
    // JSX
  )
}
```

### API Route Structure
```typescript
// API route structure
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // GET handler
}

export async function POST(request: NextRequest) {
  // POST handler
}
```

### Page Structure
```typescript
// Page component structure
"use client" // If client-side

import { useState } from "react"
// Other imports

export default function PageName() {
  // Page logic
  return (
    <MainLayout>
      {/* Page content */}
    </MainLayout>
  )
}
```

## Environment Configuration

### Required Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API (for future use)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Development vs Production
- **Development**: Uses `.env.local` for local development
- **Production**: Environment variables configured in Vercel dashboard

## Build and Deployment Structure

### Build Process
1. **Next.js Build**: `npm run build` compiles the application
2. **Static Generation**: Pages are pre-rendered where possible
3. **API Routes**: Serverless functions for backend logic

### Deployment (Vercel)
- **Automatic Deployments**: Connected to GitHub repository
- **Environment Variables**: Configured in Vercel dashboard
- **Domain**: Custom domain configuration
- **Analytics**: Built-in Vercel analytics

## Development Guidelines

### Code Organization
- **Single Responsibility**: Each component has one clear purpose
- **Composition**: Build complex UIs from simple components
- **Props Interface**: Always define TypeScript interfaces for props
- **Error Boundaries**: Implement error handling for robust UX

### Import Organization
```typescript
// Import order
import React from "react"
import { useState } from "react"

// Third-party libraries
import { Button } from "@/components/ui/button"

// Local components
import { MainLayout } from "@/components/main-layout"

// Utilities
import { cn } from "@/lib/utils"
```

### State Management
- **Local State**: `useState` for component-level state
- **Server State**: Supabase queries for data fetching
- **Form State**: Controlled components with React state
- **Global State**: Context API for user session (future)

## Asset Organization

### Images
- **Dish Photos**: Stored in Supabase Storage
- **UI Assets**: Static images in `/public`
- **Icons**: Lucide React icons for consistency
- **Placeholders**: Default images for missing content

### Styles
- **Global Styles**: `app/globals.css` with Tailwind imports
- **Component Styles**: Tailwind classes in components
- **Custom CSS**: Additional styles in `/styles` if needed
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## Security Considerations

### API Security
- **Authentication**: Supabase Auth for user management
- **Authorization**: Server-side session validation
- **Input Validation**: Request body validation in API routes
- **CORS**: Configured for production domains

### Data Protection
- **Environment Variables**: Sensitive data in environment variables
- **Database Security**: Row Level Security (RLS) in Supabase
- **File Uploads**: Secure image upload to Supabase Storage
- **Invite Codes**: Single-use validation system

This structure supports scalable development, clear separation of concerns, and maintainable code organization following Next.js and React best practices.
