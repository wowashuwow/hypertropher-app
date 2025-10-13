export interface CountryDeliveryApps {
  [country: string]: string[]
}

/**
 * Delivery apps available by country
 * Based on the data from delivery_apps_by_country.md
 */
export const DELIVERY_APPS_BY_COUNTRY: CountryDeliveryApps = {
  "India": ["Swiggy", "Zomato"],
  "USA": ["Uber Eats", "DoorDash", "Grubhub", "Postmates"],
  "Canada": ["Uber Eats", "DoorDash", "Just Eat Takeaway.com"],
  "UK": ["Uber Eats", "Just Eat Takeaway.com", "Deliveroo", "Grubhub"],
  "Australia": ["Uber Eats", "Just Eat Takeaway.com", "Deliveroo"],
  "New Zealand": ["Just Eat Takeaway.com", "Deliveroo"],
  "Ireland": ["Just Eat Takeaway.com", "Deliveroo"],
  "France": ["Uber Eats", "Just Eat Takeaway.com", "Deliveroo"],
  "Germany": ["Uber Eats", "Just Eat Takeaway.com"],
  "Belgium": ["Just Eat Takeaway.com", "Deliveroo"],
  "Netherlands": ["Just Eat Takeaway.com", "Deliveroo"],
  "Austria": ["Just Eat Takeaway.com"],
  "Bulgaria": ["Just Eat Takeaway.com", "Foodpanda"],
  "Denmark": ["Just Eat Takeaway.com"],
  "Israel": ["Just Eat Takeaway.com"],
  "Italy": ["Just Eat Takeaway.com"],
  "Luxembourg": ["Just Eat Takeaway.com"],
  "Poland": ["Just Eat Takeaway.com"],
  "Slovakia": ["Just Eat Takeaway.com"],
  "Spain": ["Just Eat Takeaway.com"],
  "Switzerland": ["Just Eat Takeaway.com"],
  "Singapore": ["Grab", "Foodpanda", "Deliveroo"],
  "Malaysia": ["Grab", "Foodpanda"],
  "Thailand": ["Grab", "Foodpanda"],
  "Indonesia": ["Grab"],
  "Vietnam": ["Grab"],
  "Philippines": ["Grab", "Foodpanda"],
  "Cambodia": ["Grab"],
  "Myanmar": ["Grab"],
  "Taiwan": ["Foodpanda"],
  "Hong Kong": ["Foodpanda", "Deliveroo"],
  "Kazakhstan": ["Foodpanda"],
  "Romania": ["Foodpanda"],
  "Qatar": ["Foodpanda", "Careem", "Talabat"],
  "United Arab Emirates": ["Foodpanda", "Deliveroo", "Noon", "Careem", "Talabat"],
  "Pakistan": ["Foodpanda", "Careem"],
  "Brazil": ["Rappi", "iFood", "Uber Eats"],
  "Mexico": ["Rappi", "iFood", "Uber Eats"],
  "Chile": ["Rappi", "Foodpanda", "PedidosYa"],
  "Colombia": ["Rappi", "Foodpanda", "iFood", "PedidosYa"],
  "Peru": ["Rappi", "Foodpanda", "PedidosYa"],
  "Uruguay": ["Rappi", "Foodpanda", "PedidosYa"],
  "Argentina": ["Rappi", "Foodpanda", "PedidosYa"],
  "Ecuador": ["Rappi", "PedidosYa"],
  "Paraguay": ["PedidosYa"],
  "Bolivia": ["PedidosYa"],
  "Costa Rica": ["Rappi"],
  "South Korea": ["Uber Eats"],
  "Japan": ["Uber Eats"],
  "Saudi Arabia": ["Noon", "Careem"],
  "Egypt": ["Noon", "Careem", "Talabat"],
  "Kuwait": ["Talabat"],
  "Bahrain": ["Talabat"],
  "Oman": ["Careem", "Talabat"],
  "Jordan": ["Careem", "Talabat"],
  "Iraq": ["Talabat"]
}

/**
 * Extracts country from city string in various formats
 * Handles multiple Google Maps API formats:
 * - "City, Country" (e.g., "Doha, Qatar")
 * - "City - Country" (e.g., "Dubai - United Arab Emirates")
 * - "City Country" (e.g., "Riyadh Saudi Arabia")
 * @param city - City string from Google Maps API
 * @returns Country name or null if format is invalid
 */
export function extractCountryFromCity(city: string): string | null {
  if (!city || !city.trim()) {
    return null
  }

  // Try comma-separated format first: "City, Country"
  if (city.includes(',')) {
    const parts = city.split(',').map(p => p.trim())
    const lastPart = parts[parts.length - 1]
    
    // Check if it's a dash-separated format within the comma-split part
    // e.g., "Dubai - United Arab Emirates" from "Dubai - United Arab Emirates, Dubai - United Arab Emirates"
    if (lastPart.includes(' - ')) {
      const dashParts = lastPart.split(' - ').map(p => p.trim())
      const country = dashParts[dashParts.length - 1]
      if (country && country in DELIVERY_APPS_BY_COUNTRY) {
        return country
      }
    }
    
    // Check if last part is a valid country
    if (lastPart && lastPart in DELIVERY_APPS_BY_COUNTRY) {
      return lastPart
    }
  }
  
  // Try dash-separated format: "City - Country"
  if (city.includes(' - ')) {
    const parts = city.split(' - ').map(p => p.trim())
    const country = parts[parts.length - 1]
    if (country && country in DELIVERY_APPS_BY_COUNTRY) {
      return country
    }
  }
  
  // Try space-separated format by checking if any known country appears in the string
  // This handles formats like "Riyadh Saudi Arabia"
  const knownCountries = Object.keys(DELIVERY_APPS_BY_COUNTRY)
  for (const country of knownCountries) {
    // Check if the city string ends with or contains the country name
    if (city.endsWith(country) || city.includes(` ${country}`)) {
      return country
    }
  }
  
  return null
}

/**
 * Delivery app logo mapping
 * Maps app names to their SVG logo paths
 */
export const DELIVERY_APP_LOGOS: Record<string, string> = {
  "Swiggy": "/logos/swiggy.svg",
  "Zomato": "/logos/zomato.svg",
  "Uber Eats": "/logos/ubereats.svg",
  "DoorDash": "/logos/doordash.svg",
  "Grubhub": "/logos/grubhub.svg",
  "Postmates": "/logos/postmates.svg",
  "Just Eat Takeaway.com": "/logos/just-eat.svg",
  "Deliveroo": "/logos/deliveroo.svg",
  "Grab": "/logos/grab.svg",
  "Foodpanda": "/logos/foodpanda.svg",
  "iFood": "/logos/ifood.svg",
  "PedidosYa": "/logos/pedidosya.svg",
  "Rappi": "/logos/rappi.svg",
  "Noon": "/logos/noon.svg",
  "Careem": "/logos/careem.svg",
  "Talabat": "/logos/talabat.svg",
}

/**
 * Gets the logo path for a delivery app
 * @param appName - Name of the delivery app
 * @returns Path to the SVG logo or placeholder if not found
 */
export function getDeliveryAppLogo(appName: string): string {
  return DELIVERY_APP_LOGOS[appName] || "/logos/placeholder.svg"
}

/**
 * Gets available delivery apps for a given city
 * @param city - City string in "City, Country" format
 * @returns Object with available apps, country, and hasApps flag
 */
export function getDeliveryAppsForCity(city: string) {
  const country = extractCountryFromCity(city)
  const availableApps = country ? DELIVERY_APPS_BY_COUNTRY[country] || [] : []
  
  return {
    availableApps,
    country,
    hasApps: availableApps.length > 0
  }
}
