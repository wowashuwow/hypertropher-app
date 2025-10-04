import { useMemo } from 'react'
import { getDeliveryAppsForCity } from '@/lib/delivery-apps'

/**
 * Hook to get available delivery apps for a given city
 * @param city - City string in "City, Country" format (e.g., "Mumbai, India")
 * @returns Object with available apps, country, and hasApps flag
 */
export function useDeliveryAppsForCity(city: string) {
  return useMemo(() => {
    if (!city || typeof city !== 'string') {
      return {
        availableApps: [],
        country: null,
        hasApps: false
      }
    }
    
    return getDeliveryAppsForCity(city)
  }, [city])
}
