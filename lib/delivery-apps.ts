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
  "Qatar": ["Foodpanda"],
  "United Arab Emirates": ["Foodpanda", "Deliveroo"],
  "Pakistan": ["Foodpanda"],
  "Brazil": ["iFood", "Uber Eats"],
  "Mexico": ["iFood", "Uber Eats"],
  "Chile": ["Foodpanda", "PedidosYa"],
  "Colombia": ["Foodpanda", "iFood", "PedidosYa"],
  "Peru": ["Foodpanda", "PedidosYa"],
  "Uruguay": ["Foodpanda", "PedidosYa"],
  "Argentina": ["Foodpanda", "PedidosYa"],
  "Ecuador": ["PedidosYa"],
  "Paraguay": ["PedidosYa"],
  "Bolivia": ["PedidosYa"],
  "South Korea": ["Uber Eats"],
  "Japan": ["Uber Eats"]
}

/**
 * Extracts country from city string in "City, Country" format
 * @param city - City string like "Mumbai, India" or "New York, United States"
 * @returns Country name or null if format is invalid
 */
export function extractCountryFromCity(city: string): string | null {
  const parts = city.split(', ')
  
  if (parts.length < 2) {
    return null // No comma found
  }
  
  // Get the last part (country)
  const country = parts[parts.length - 1].trim()
  
  // Check if country is empty
  if (!country) {
    return null
  }
  
  // Check if country exists in our mapping
  return country in DELIVERY_APPS_BY_COUNTRY ? country : null
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
