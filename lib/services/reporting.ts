import { createServiceClient } from "@/lib/supabase/service"

/**
 * Check if threshold is met and remove delivery app from restaurant if needed
 * @param restaurantId The restaurant ID
 * @param deliveryApp The delivery app to check
 * @returns true if app was removed, false otherwise
 */
export async function checkAndRemoveReportedApps(
  restaurantId: string,
  deliveryApp: string
): Promise<boolean> {
  const supabase = createServiceClient()

  // Count unique users who reported this restaurant+app combination
  const { data: reports, error: countError } = await supabase
    .from("restaurant_delivery_app_reports")
    .select("reported_by_user_id")
    .eq("restaurant_id", restaurantId)
    .eq("delivery_app", deliveryApp)

  if (countError) {
    console.error("Error counting reports:", countError)
    return false
  }

  const uniqueReporters = new Set(reports?.map(r => r.reported_by_user_id) || [])
  
  // Threshold: 2+ unique users
  if (uniqueReporters.size >= 2) {
    // Remove delivery app from all dishes at this restaurant
    await removeDeliveryAppFromRestaurant(restaurantId, deliveryApp)
    
    // Check if cloud kitchen needs Online channel cleanup
    await handleCloudKitchenChannelCleanup(restaurantId)
    
    return true
  }

  return false
}

/**
 * Remove delivery app from all dishes at a restaurant
 * @param restaurantId The restaurant ID
 * @param deliveryApp The delivery app to remove
 */
async function removeDeliveryAppFromRestaurant(
  restaurantId: string,
  deliveryApp: string
): Promise<void> {
  const supabase = createServiceClient()

  // Get all dishes at this restaurant
  const { data: dishes, error: dishesError } = await supabase
    .from("dishes")
    .select("id")
    .eq("restaurant_id", restaurantId)

  if (dishesError || !dishes) {
    console.error("Error fetching dishes for restaurant:", dishesError)
    return
  }

  // For each dish, find Online availability channel and remove delivery app
  for (const dish of dishes) {
    // Get Online availability channel for this dish
    const { data: onlineChannel, error: channelError } = await supabase
      .from("dish_availability_channels")
      .select("id")
      .eq("dish_id", dish.id)
      .eq("channel", "Online")
      .single()

    if (channelError || !onlineChannel) {
      // No Online channel for this dish, skip
      continue
    }

    // Remove delivery app entry
    const { error: deleteError } = await supabase
      .from("dish_delivery_apps")
      .delete()
      .eq("availability_channel_id", onlineChannel.id)
      .eq("delivery_app", deliveryApp)

    if (deleteError) {
      console.error(`Error removing delivery app ${deliveryApp} from dish ${dish.id}:`, deleteError)
    }
  }

  console.log(`Removed ${deliveryApp} from all dishes at restaurant ${restaurantId}`)
}

/**
 * Handle cloud kitchen edge case: Remove Online channel if all apps are removed
 * @param restaurantId The restaurant ID
 */
async function handleCloudKitchenChannelCleanup(
  restaurantId: string
): Promise<void> {
  const supabase = createServiceClient()

  // Get restaurant info
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("is_cloud_kitchen")
    .eq("id", restaurantId)
    .single()

  if (restaurantError || !restaurant) {
    console.error("Error fetching restaurant:", restaurantError)
    return
  }

  // Only proceed if it's a cloud kitchen
  if (!restaurant.is_cloud_kitchen) {
    return
  }

  // Get all dishes at this restaurant
  const { data: dishes, error: dishesError } = await supabase
    .from("dishes")
    .select("id")
    .eq("restaurant_id", restaurantId)

  if (dishesError || !dishes) {
    console.error("Error fetching dishes:", dishesError)
    return
  }

  // Check each dish: if Online channel exists but no delivery apps remain, delete channel
  for (const dish of dishes) {
    // Get Online availability channel
    const { data: onlineChannel, error: channelError } = await supabase
      .from("dish_availability_channels")
      .select("id")
      .eq("dish_id", dish.id)
      .eq("channel", "Online")
      .single()

    if (channelError || !onlineChannel) {
      continue
    }

    // Count remaining delivery apps for this channel
    const { data: remainingApps, error: appsError } = await supabase
      .from("dish_delivery_apps")
      .select("id")
      .eq("availability_channel_id", onlineChannel.id)

    // If no apps remain, delete the Online channel
    if (!appsError && (!remainingApps || remainingApps.length === 0)) {
      const { error: deleteError } = await supabase
        .from("dish_availability_channels")
        .delete()
        .eq("id", onlineChannel.id)

      if (deleteError) {
        console.error(`Error deleting Online channel for dish ${dish.id}:`, deleteError)
      } else {
        console.log(`Removed Online availability channel from cloud kitchen dish ${dish.id} (no apps remaining)`)
      }
    }
  }
}

