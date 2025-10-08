# UI/UX Design Documentation - Hypertropher

## Design System Overview

Hypertropher follows a modern, mobile-first design approach with a focus on accessibility, performance, and user experience. The design system is built on Shadcn UI components with Tailwind CSS for consistent styling.

## Design Principles

### 1. Mobile-First Approach
- **Primary Platform**: Mobile devices (phones and tablets)
- **Responsive Design**: Desktop layouts as enhanced mobile experiences
- **Touch-Friendly**: All interactive elements sized for touch input
- **Performance**: Optimized for mobile network conditions

### 2. Accessibility First
- **WCAG 2.1 AA Compliance**: Meeting accessibility standards
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Color Contrast**: High contrast ratios for readability
- **Focus Management**: Clear focus indicators

### 3. Performance & Usability
- **Fast Loading**: Optimized images and code splitting
- **Intuitive Navigation**: Clear information architecture
- **Error Prevention**: Form validation and user feedback
- **Progressive Enhancement**: Core functionality works without JavaScript

## Color Palette

### Primary Colors (Updated - v0 Design System)
```css
/* Primary Brand Colors - Energetic Red/Orange Theme */
--primary: #cc0000;                  /* Bold red for powerful, energetic look */
--primary-foreground: #ffffff;       /* White text on primary */

/* Secondary Colors */
--secondary: #ff4400;                /* Deep orange to complement red */
--secondary-foreground: #ffffff;     /* White text on secondary */

/* Accent Colors */
--accent: #ff8800;                   /* Warm amber accent */
--accent-foreground: #ffffff;        /* White text on accent */
```

### Semantic Colors
```css
/* Status Colors */
--destructive: 0 84.2% 60.2%;        /* Red for errors */
--destructive-foreground: 210 40% 98%; /* Light text on destructive */

/* Success Colors */
--success: 142.1 76.2% 36.3%;        /* Green for success */
--success-foreground: 355.7 100% 97.3%; /* Light text on success */

/* Warning Colors */
--warning: 38 92% 50%;                /* Orange for warnings */
--warning-foreground: 48 96% 89%;     /* Light text on warning */
```

### Neutral Colors
```css
/* Background Colors */
--background: 0 0% 100%;              /* White background */
--foreground: 222.2 84% 4.9%;         /* Dark text */

/* Card Colors */
--card: 0 0% 100%;                    /* White card background */
--card-foreground: 222.2 84% 4.9%;    /* Dark text on cards */

/* Border Colors */
--border: 214.3 31.8% 91.4%;          /* Light gray borders */
--input: 214.3 31.8% 91.4%;           /* Input border color */

/* Muted Colors */
--muted: 210 40% 96%;                 /* Muted background */
--muted-foreground: 215.4 16.3% 46.9%; /* Muted text */
```

## Typography

### Font Stack
```css
/* Primary Font - Rethink Sans */
font-family: 'Rethink Sans', ui-sans-serif, system-ui, sans-serif;

/* Monospace Font - Geist Mono */
font-family: 'Geist Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
```

### Type Scale
```css
/* Headings */
--text-4xl: 2.25rem;    /* 36px - Page titles */
--text-3xl: 1.875rem;   /* 30px - Section headers */
--text-2xl: 1.5rem;     /* 24px - Card titles */
--text-xl: 1.25rem;     /* 20px - Subsection headers */
--text-lg: 1.125rem;    /* 18px - Large body text */

/* Body Text */
--text-base: 1rem;      /* 16px - Default body text */
--text-sm: 0.875rem;    /* 14px - Small text, captions */
--text-xs: 0.75rem;     /* 12px - Very small text, labels */
```

### Font Weights
- **Regular**: 400 - Default body text
- **Medium**: 500 - Emphasized text, labels
- **Semibold**: 600 - Subheadings, buttons
- **Bold**: 700 - Main headings, important text
- **Extrabold**: 800 - App title, major headings

### Responsive Typography
```css
/* App Title - Responsive sizing */
.app-title {
  font-size: 1.875rem; /* 30px on mobile */
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: normal;
}

@media (min-width: 640px) {
  .app-title {
    font-size: 1.5rem; /* 24px on desktop */
  }
}
```

## Component Library

### Button Components
```typescript
// Primary Button - Main actions
<Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
  Add Dish
</Button>

// Secondary Button - Secondary actions
<Button variant="outline">
  Cancel
</Button>

// Ghost Button - Subtle actions
<Button variant="ghost">
  View Details
</Button>

// Size Variants
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

### Card Components
```typescript
// Basic Card Structure
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
</Card>

// Dish Card Specific
<Card className="overflow-hidden">
  <div className="aspect-square relative">
    <Image src={imageUrl} alt={dishName} fill className="object-cover" />
  </div>
  <CardContent className="p-4">
    {/* Dish details */}
  </CardContent>
</Card>
```

### Form Components
```typescript
// Input with Label
<div className="space-y-2">
  <Label htmlFor="dish-name">Dish Name</Label>
  <Input 
    id="dish-name" 
    placeholder="Enter dish name"
    value={dishName}
    onChange={(e) => setDishName(e.target.value)}
  />
</div>

// Select Dropdown
<Select value={selectedValue} onValueChange={setSelectedValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

## Layout System

### Grid System
```css
/* Responsive Grid for Dish Cards */
.dish-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .dish-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .dish-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .dish-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Spacing System
```css
/* Consistent spacing scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Container Sizes
```css
/* Page containers */
.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1280px; }
.container-2xl { max-width: 1536px; }
```

## User Experience Flows

### 1. Authentication Flow
```
Sign Up → Enter Invite Code → Enter Phone → Verify OTP → Complete Profile → Homepage
```

**Key UX Considerations:**
- Clear step indicators
- Immediate feedback on validation
- Error messages with actionable guidance
- Smooth transitions between steps

### 2. Dish Discovery Flow
```
Homepage → Filter by Protein → Sort by Price → View Dish Details → Add to Wishlist
```

**Key UX Considerations:**
- Fast filtering and sorting
- Clear visual hierarchy
- Quick access to dish details
- One-tap wishlist actions

### 3. Dish Contribution Flow
```
Add Dish → Select Source Type → Enter Details → Upload Photo → Add Ratings → Submit
```

**Key UX Considerations:**
- Progressive form completion
- Image upload with preview
- Rating system with emoji feedback
- Form validation and error handling
- Clear error messages for API failures (no mock data fallbacks)
- Proper empty states when no data is available

## Responsive Design Requirements

### Breakpoints
```css
/* Mobile First Approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Laptops */
2xl: 1536px /* Large screens */
```

### Mobile Design (320px - 768px)
- **Navigation**: Bottom navigation bar
- **Cards**: Single column layout
- **Forms**: Full-width inputs
- **Buttons**: Touch-friendly sizing (44px minimum)
- **Typography**: Readable font sizes

### Tablet Design (768px - 1024px)
- **Navigation**: Bottom navigation with additional options
- **Cards**: Two-column grid
- **Forms**: Optimized for touch input
- **Layout**: More spacious design

### Desktop Design (1024px+)
- **Navigation**: Top header with full navigation
- **Cards**: Multi-column grid (3-4 columns)
- **Forms**: Side-by-side layouts where appropriate
- **Layout**: Maximum content width with proper spacing

## Accessibility Standards

### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Focus Indicators**: Visible focus states for all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Semantic HTML and ARIA labels
- **Alternative Text**: Descriptive alt text for all images

### Implementation Guidelines
```typescript
// Accessible Button
<Button 
  aria-label="Add dish to wishlist"
  onClick={handleWishlistToggle}
>
  <Heart className="w-4 h-4" />
</Button>

// Accessible Form
<form aria-labelledby="add-dish-title">
  <h2 id="add-dish-title">Add New Dish</h2>
  <div className="space-y-2">
    <Label htmlFor="dish-name">Dish Name</Label>
    <Input 
      id="dish-name"
      aria-describedby="dish-name-help"
      required
    />
    <p id="dish-name-help" className="text-sm text-muted-foreground">
      Enter the name of the dish
    </p>
  </div>
</form>
```

## Component Specifications

### Dish Card Component
```typescript
interface DishCardProps {
  id: string
  dishName: string
  restaurantName: string
  city: string
  price: string
  protein: "💪 Overloaded" | "👍 Great"
  taste: "🤤 Amazing" | "👍 Great"
  satisfaction: "🤩 Would Eat Everyday" | "👍 Great"
  comment?: string
  addedBy: string
  availability: "In-Store" | "Online"
  imageUrl: string
  proteinSource: string
  isBookmarked: boolean
  onBookmarkToggle: (id: string) => void
}
```

**Visual Specifications:**
- **Image**: 1:1 aspect ratio, object-cover
- **Ratings**: Emoji-based rating system
- **Price**: Prominent display with currency
- **Actions**: Bookmark and navigation buttons
- **Comments**: Expandable accordion for long comments

### Navigation Components
```typescript
// Header Navigation (Desktop)
<Header isLoggedIn={user ? true : false} />

// Bottom Navigation (Mobile)
<BottomNavigation />

// Navigation Items
const navItems = [
  { href: "/", icon: Home, label: "Discover" },
  { href: "/add-dish", icon: PlusCircle, label: "Add Dish" },
  { href: "/my-wishlist", icon: Bookmark, label: "My Wishlist" },
  { href: "/my-dishes", icon: User, label: "My Dishes" }
]
```

## User Journey Maps

### New User Journey
1. **Discovery**: User receives invite code
2. **Onboarding**: Sign up with phone number
3. **Profile Setup**: Complete profile with name and city
4. **First Use**: Browse existing dishes
5. **Contribution**: Add first dish
6. **Engagement**: Use wishlist and discover more

### Returning User Journey
1. **Login**: Quick phone-based authentication
2. **Discovery**: Browse new dishes since last visit
3. **Filtering**: Use protein and price filters
4. **Interaction**: Bookmark interesting dishes
5. **Contribution**: Add new discoveries
6. **Sharing**: Share invite codes with friends

## Performance Guidelines

### Image Optimization
- **Format**: WebP with JPEG fallback
- **Sizing**: Responsive images with multiple sizes
- **Loading**: Lazy loading for off-screen images
- **Placeholders**: Blur placeholders during loading

### Code Splitting
- **Routes**: Automatic code splitting by route
- **Components**: Dynamic imports for heavy components
- **Libraries**: Lazy load non-critical libraries

### Caching Strategy
- **Static Assets**: Long-term caching
- **API Responses**: Appropriate cache headers
- **User Data**: Client-side caching with invalidation
- **Session Data**: Event-based in-memory caching in SessionProvider (no time expiration) to prevent redundant API calls
- **Cache Invalidation**: Intelligent cache clearing when user updates profile data

### Mobile Performance Optimization
- **3D Effects**: Progressive enhancement with mobile-specific optimizations
- **CSS Transforms**: Hardware-accelerated transforms for smooth animations
- **Responsive Design**: Automatic effect scaling based on device capabilities
- **Fallback Systems**: Graceful degradation for older devices
- **API Call Optimization**: Reduced redundant API calls through intelligent caching (80-90% reduction)
- **Page Load Performance**: Faster navigation through cached user data and session state
- **Event-Based Caching**: Cache persists until user data actually changes (no arbitrary time expiration)
- **Smart Cache Invalidation**: Cache clears only when user updates city, profile picture, or signs out

## Interactive Components

### Comment Section with 3D Effects
- **Profile Pictures**: Small circular images (24x24px) with gradient fallback
- **3D Tray Animation**: Slide-up overlay with depth and shadows
- **Mobile Optimization**: Simplified shadows for optimal performance
- **Desktop Enhancement**: Multi-layer shadows + backdrop blur for realistic depth
- **Personal Touch**: Profile pictures create "friend messaging" aesthetic

### Page Transition Animations
- **CSS-Only Approach**: Pure CSS animations that work harmoniously with Next.js App Router
- **Slide-In Effect**: Pages slide in from right (40px) with opacity fade-in
- **Animation Timing**: 400ms duration with ease-out timing for smooth, visible transitions
- **Hardware Acceleration**: Uses `transform: translateX()` and `opacity` for optimal performance
- **Accessibility Support**: Respects `prefers-reduced-motion` for users with motion sensitivity
- **Mobile-First**: Optimized for mobile performance with 60fps target

### Visual Hierarchy
- **Depth System**: Layered shadows create clear visual hierarchy
- **Glass Morphism**: Gradient backgrounds with transparency for modern look
- **Progressive Enhancement**: Desktop gets full effects, mobile gets optimized experience
- **Animation Timing**: 200ms transitions with ease-out for natural feel

## Design Tools Integration

### Figma Integration
- **Design System**: Component library in Figma
- **Prototypes**: Interactive prototypes for user testing
- **Handoff**: Developer handoff with specifications
- **Version Control**: Design versioning and collaboration

### Development Workflow
1. **Design**: Create designs in Figma
2. **Review**: Stakeholder review and approval
3. **Implementation**: Build components in code
4. **Testing**: Cross-browser and device testing
5. **Deployment**: Deploy with design validation

This UI/UX documentation serves as the single source of truth for design decisions, component specifications, and user experience guidelines throughout the Hypertropher development process.
