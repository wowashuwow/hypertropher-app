# Project Structure - Hypertropher

## Overview
Hypertropher is a Next.js 14 application built with the App Router, using Supabase as the backend service. The project follows a modern, scalable architecture with clear separation of concerns.

## Root Directory Structure
```
hypertropher-app/
├── app/                          # Next.js App Router pages and API routes
│   ├── account/                  # User account management
│   ├── add-dish/                 # Dish contribution form
│   │   └── loading.tsx           # Loading state for add dish page
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/            # User login
│   │   │   └── signup/           # User registration
│   │   ├── dishes/               # Dish CRUD operations
│   │   ├── invite-codes/         # Invite code management
│   │   ├── upload-profile-picture/ # Profile picture upload endpoint
│   │   ├── users/                # User management
│   │   └── wishlist/             # Wishlist management
│   ├── complete-profile/         # User onboarding
│   ├── edit-dish/                # Dish editing functionality
│   │   └── [id]/                 # Dynamic route for dish editing
│   │       ├── loading.tsx       # Loading state for edit dish page
│   │       └── page.tsx          # Edit dish form
│   ├── my-dishes/                # User's contributed dishes
│   ├── my-wishlist/              # User's saved dishes
│   ├── signup/                   # Authentication pages
│   ├── fonts/                    # Custom fonts
│   │   ├── GeistMonoVF.woff      # Geist Mono font
│   │   └── GeistVF.woff          # Geist font
│   ├── favicon.ico               # App favicon
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   ├── loading.tsx               # Global loading states
│   └── page.tsx                  # Homepage
├── components/                   # Reusable UI components
│   ├── ui/                       # Shadcn UI components
│   │   ├── badge.tsx             # Status and category badges
│   │   ├── button.tsx            # Button variants and states
│   │   ├── card.tsx              # Card container components
│   │   ├── command.tsx           # Command palette component
│   │   ├── dialog.tsx            # Modal dialog components
│   │   ├── input.tsx             # Form input components
│   │   ├── label.tsx             # Form labels
│   │   ├── multi-select.tsx      # Multi-selection dropdown
│   │   ├── popover.tsx           # Popover components
│   │   ├── profile-picture-upload.tsx # Profile picture upload component
│   │   ├── restaurant-search-input.tsx # Google Maps restaurant search component
│   │   ├── city-search-input.tsx # Google Maps city search component
│   │   └── select.tsx            # Dropdown selection components
│   ├── bottom-navigation.tsx     # Mobile navigation
│   ├── dish-card.tsx             # Dish display component
│   ├── header.tsx                # App header
│   └── main-layout.tsx           # Layout wrapper
├── lib/                          # Utility libraries and configurations
│   ├── auth/                     # Authentication utilities
│   │   ├── route-protection.tsx  # Route protection component
│   │   └── session-provider.tsx  # Session context provider
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-delivery-apps.ts  # Delivery app filtering hook
│   │   ├── use-geolocation.ts    # Location permission and user location
│   │   └── use-google-places.ts  # Google Places API service integration
│   ├── supabase/                 # Supabase client configurations
│   │   ├── client.ts             # Browser-side Supabase client
│   │   ├── server.ts             # Server-side Supabase client
│   │   └── service.ts            # Service role client for admin operations
│   ├── clipboard.ts              # Clipboard API utility with fallback support
│   ├── delivery-apps.ts          # Delivery apps by country mapping and utilities
│   ├── rate-limit.ts             # OTP rate limiting utility
│   └── utils.ts                  # Shared utilities
├── public/                       # Static assets
│   ├── logos/                    # Delivery app logos
│   │   ├── doordash.svg          # DoorDash logo
│   │   ├── swiggy.svg            # Swiggy logo
│   │   ├── ubereats.svg          # Uber Eats logo
│   │   └── zomato.svg            # Zomato logo
│   ├── delicious-high-protein-meal.jpg
│   ├── fish-curry-with-rice-indian-cuisine.jpg
│   ├── grilled-chicken-vegetable-bowl.png
│   ├── paneer-tikka-salad-with-fresh-greens.jpg
│   ├── placeholder-logo.png      # Placeholder logo
│   ├── placeholder-logo.svg      # Placeholder logo SVG
│   ├── placeholder-user.jpg      # Placeholder user image
│   ├── placeholder.jpg           # General placeholder
│   ├── placeholder.svg           # General placeholder SVG
│   └── vegetable-egg-white-omelette.png
├── styles/                       # Additional stylesheets
│   └── globals.css               # Additional global styles
├── Docs/                         # Project documentation
│   ├── Bug_tracking.md           # Error tracking and resolution
│   ├── Implementation.md         # Development roadmap and tasks
│   ├── project_structure.md      # This file - project organization
│   └── UI_UX_doc.md              # Design system and UX guidelines
├── .cursor/                      # Cursor IDE rules
├── components.json               # Shadcn UI configuration
├── DATABASE_SCHEMA.md            # Database design documentation
├── delivery_apps_by_country.md   # Delivery apps available by country
├── next-env.d.ts                 # Next.js TypeScript definitions
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies and scripts
├── package-lock.json             # Dependency lock file
├── postcss.config.mjs            # PostCSS configuration
├── PRD.md                        # Product Requirements Document
├── README.md                     # Project readme
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── tsconfig.tsbuildinfo          # TypeScript build cache
└── types/                        # TypeScript type definitions
    └── google-maps.d.ts          # Google Maps API type definitions
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
- **`/edit-dish/[id]`**: Dynamic route for editing existing dishes
- **`/my-dishes`**: User's contributed dishes
- **`/my-wishlist`**: User's bookmarked dishes
- **`/signup`**: Authentication and user registration

#### API Routes (`/app/api`)
- **`/auth/login`**: User authentication and login
- **`/auth/signup`**: User registration with invite code validation
- **`/dishes`**: CRUD operations for dishes (GET, POST, PUT, DELETE)
- **`/invite-codes`**: Invite code management and retrieval
- **`/users`**: User profile management (GET, POST, PUT)
- **`/wishlist`**: Wishlist management (GET, POST, DELETE)

### `/components` - UI Components
Reusable React components following atomic design principles:

#### Core Components
- **`main-layout.tsx`**: Wrapper component with header and navigation
- **`header.tsx`**: App header with navigation and user controls
- **`bottom-navigation.tsx`**: Mobile-first bottom navigation
- **`dish-card.tsx`**: Dish display component with ratings and actions

#### UI Components (`/components/ui`)
Shadcn UI components for consistent design:
- **`badge.tsx`**: Status and category badges
- **`button.tsx`**: Button variants and states
- **`card.tsx`**: Card container components
- **`command.tsx`**: Command palette component
- **`dialog.tsx`**: Modal dialog components
- **`input.tsx`**: Form input components
- **`label.tsx`**: Form labels
- **`multi-select.tsx`**: Multi-selection dropdown component
- **`popover.tsx`**: Popover components
- **`select.tsx`**: Dropdown selection components

### `/lib` - Utilities and Configuration
Shared libraries and configurations:

#### Authentication (`/lib/auth`)
- **`route-protection.tsx`**: Component for protecting authenticated routes
- **`session-provider.tsx`**: React context provider for user session management

#### Custom Hooks (`/lib/hooks`)
- **`use-geolocation.ts`**: Location permission handling and user location management
- **`use-google-places.ts`**: Google Places API integration and restaurant search services

#### Supabase (`/lib/supabase`)
- **`client.ts`**: Browser-side Supabase client configuration
- **`server.ts`**: Server-side Supabase client configuration
- **`service.ts`**: Service role client for admin operations (bypasses RLS)

#### Utilities
- **`clipboard.ts`**: Clipboard API utility with modern API support and fallback for older browsers
- **`rate-limit.ts`**: OTP rate limiting utility with in-memory storage and configurable limits
- **`utils.ts`**: Shared utility functions (cn, etc.)

### `/public` - Static Assets
Static files served directly:

#### Images
- **Dish Images**: High-quality food photography for dish displays
- **Placeholder Images**: Default images for missing content
- **User Images**: Placeholder user avatars

#### Logos (`/public/logos`)
- **Delivery App Logos**: SVG logos for Swiggy, Zomato, DoorDash, Uber Eats
- **App Logos**: Application branding assets

#### Icons
- **Favicon**: App icon for browser tabs
- **App Icons**: Various sizes for different platforms

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
- **Build Configuration**: `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`
- **TypeScript**: `tsconfig.json`, `next-env.d.ts`, `tsconfig.tsbuildinfo`
- **UI Components**: `components.json` (Shadcn UI configuration)
- **Documentation**: `README.md`, `PRD.md`, `DATABASE_SCHEMA.md`

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

# Supabase Secret API Key (for admin operations)
SUPABASE_SECRET_API_KEY=sb_secret_[secret_api_key_from_dashboard]

# Google Maps API
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
- **Session State**: Context API for user session management
- **Authentication State**: Supabase Auth with session provider

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
- **Invite Codes**: Single-use validation system with RLS policies
- **Session Management**: Secure authentication with Supabase Auth
- **Route Protection**: Client-side and server-side route protection

This structure supports scalable development, clear separation of concerns, and maintainable code organization following Next.js and React best practices.
