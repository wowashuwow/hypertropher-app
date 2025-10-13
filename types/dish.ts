// types/dish.ts
import { Restaurant } from './restaurant'

export interface Dish {
  id: string
  userId: string
  restaurant: Restaurant
  dishName: string
  city: string
  price: number
  proteinSource: string
  taste?: string
  proteinContent?: string
  satisfaction?: string
  comment?: string
  imageUrl?: string
  hasInStore: boolean
  deliveryApps: string[] // Only populated if hasInStore is false or both available
  createdAt: string
}

// Legacy interface for backward compatibility during migration
export interface LegacyDish {
  id: string
  dish_name: string
  restaurant_name: string
  city: string
  price: string
  protein: "Overloaded" | "Pretty Good"
  taste: "Mouthgasm" | "Pretty Good"
  satisfaction?: "Would Eat Everyday" | "Pretty Good"
  comment?: string
  addedBy: string
  addedByProfilePicture?: string | null
  availability: "In-Store" | "Online"
  image_url: string
  protein_source: string
  delivery_apps?: string[]
  place_id?: string | null
  users: { name: string; profile_picture_url?: string | null }
}
