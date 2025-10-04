/**
 * Deep link configuration for delivery apps
 * Provides both mobile app deep links and web fallback URLs
 */

export interface DeepLinkConfig {
  deepLink: string
  webUrl: string
}

/**
 * Deep link mappings for all supported delivery apps
 * Mobile app deep links that open the respective apps directly
 */
export const DELIVERY_APP_DEEP_LINKS: Record<string, string> = {
  'Swiggy': 'swiggy://',
  'Zomato': 'zomato://',
  'Uber Eats': 'ubereats://',
  'DoorDash': 'doordash://',
  'Grubhub': 'grubhub://',
  'Postmates': 'postmates://',
  'Just Eat Takeaway.com': 'justeat://',
  'Deliveroo': 'deliveroo://',
  'Grab': 'grab://',
  'Foodpanda': 'foodpanda://',
  'iFood': 'ifood://',
  'PedidosYa': 'pedidosya://'
}

/**
 * Web fallback URLs for delivery apps
 * Used when mobile apps are not installed
 */
export const DELIVERY_APP_WEB_URLS: Record<string, string> = {
  'Swiggy': 'https://www.swiggy.com',
  'Zomato': 'https://www.zomato.com',
  'Uber Eats': 'https://www.ubereats.com',
  'DoorDash': 'https://www.doordash.com',
  'Grubhub': 'https://www.grubhub.com',
  'Postmates': 'https://postmates.com',
  'Just Eat Takeaway.com': 'https://www.just-eat.co.uk',
  'Deliveroo': 'https://deliveroo.co.uk',
  'Grab': 'https://www.grab.com',
  'Foodpanda': 'https://www.foodpanda.com',
  'iFood': 'https://www.ifood.com.br',
  'PedidosYa': 'https://www.pedidosya.com'
}

/**
 * Gets the deep link URL for a delivery app
 * @param appName - Name of the delivery app
 * @returns Deep link URL or fallback web URL if deep link not available
 */
export function getDeepLinkUrl(appName: string): string {
  return DELIVERY_APP_DEEP_LINKS[appName] || DELIVERY_APP_WEB_URLS[appName] || `https://${appName.toLowerCase().replace(' ', '')}.com`
}

/**
 * Gets the web fallback URL for a delivery app
 * @param appName - Name of the delivery app
 * @returns Web URL for the delivery app
 */
export function getWebFallbackUrl(appName: string): string {
  return DELIVERY_APP_WEB_URLS[appName] || `https://${appName.toLowerCase().replace(' ', '')}.com`
}

/**
 * Gets both deep link and web URL for a delivery app
 * @param appName - Name of the delivery app
 * @returns Object containing both deep link and web URL
 */
export function getDeliveryAppUrls(appName: string): DeepLinkConfig {
  return {
    deepLink: DELIVERY_APP_DEEP_LINKS[appName] || '',
    webUrl: DELIVERY_APP_WEB_URLS[appName] || `https://${appName.toLowerCase().replace(' ', '')}.com`
  }
}
