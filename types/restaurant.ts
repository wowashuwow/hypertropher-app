// types/restaurant.ts
export interface Restaurant {
  id: string
  name: string
  city: string
  sourceType: 'google_maps' | 'manual'
  
  // Google Maps data
  placeId?: string
  googleMapsAddress?: string
  latitude?: number
  longitude?: number
  
  // Manual entry data
  manualAddress?: string
  isCloudKitchen: boolean
  
  verified: boolean
  createdAt: string
  updatedAt: string
}

export interface RestaurantInput {
  type: 'google_maps' | 'manual'
  googleMapsData?: RestaurantResult
  manualData?: {
    name: string
    address?: string
    isCloudKitchen: boolean
  }
}

export interface RestaurantResult {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  rating?: number
  user_ratings_total?: number
}

export interface DishAvailabilityChannel {
  id: string
  dishId: string
  channel: 'In-Store' | 'Online'
  deliveryApps?: string[]
}
