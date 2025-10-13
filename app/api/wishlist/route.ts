import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// GET handler for fetching user's wishlist
export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You are not authorized." }, { status: 401 });
  }

  try {
    // First, get the user's current city
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("city")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return NextResponse.json({ error: "Failed to fetch user profile." }, { status: 500 });
    }

    const userCity = userProfile.city;

    // Fetch wishlist items for the current user, filtered by user's city
    const { data: wishlistItems, error: wishlistError } = await supabase
      .from("wishlist_items")
      .select(`
        dish_id,
        created_at,
        dishes!wishlist_items_dish_id_fkey (
          id,
          dish_name,
          image_url,
          price,
          protein_source,
          taste,
          protein_content,
          satisfaction,
          comment,
          created_at,
          restaurant_id,
          restaurants!dishes_restaurant_id_fkey (
            id,
            name,
            city,
            place_id,
            google_maps_address,
            manual_address,
            is_cloud_kitchen
          ),
          users!dishes_user_id_fkey (
            name
          )
        )
      `)
      .eq("user_id", user.id);

    if (wishlistError) {
      console.error("❌ Error fetching wishlist:", wishlistError);
      return NextResponse.json({ error: "Failed to fetch wishlist." }, { status: 500 });
    }

    // Filter by city in JavaScript since Supabase doesn't support nested relationship filtering
    const cityFilteredItems = userCity 
      ? wishlistItems?.filter((item: any) => item.dishes?.restaurants?.city === userCity)
      : wishlistItems;

    // Get availability channels and delivery apps for each dish
    const enhancedWishlistDishes = await Promise.all(
      (cityFilteredItems || []).map(async (item: any) => {
        const dish = item.dishes;
        
        // Get availability channels
        const { data: availabilityChannels } = await supabase
          .from('dish_availability_channels')
          .select('channel')
          .eq('dish_id', dish.id);

        const hasInStore = availabilityChannels?.some((ch: any) => ch.channel === 'In-Store') || false;
        const hasOnline = availabilityChannels?.some((ch: any) => ch.channel === 'Online') || false;

        // Get delivery apps for online availability
        let deliveryApps = [];
        if (hasOnline) {
          const { data: onlineChannel } = await supabase
            .from('dish_availability_channels')
            .select('id')
            .eq('dish_id', dish.id)
            .eq('channel', 'Online')
            .single();

          if (onlineChannel) {
            const { data: apps } = await supabase
              .from('dish_delivery_apps')
              .select('delivery_app')
              .eq('availability_channel_id', onlineChannel.id);
            
            deliveryApps = apps?.map((app: any) => app.delivery_app) || [];
          }
        }

        // Get restaurant data from JOIN
        const restaurantData = dish.restaurants || {
          name: 'Unknown Restaurant',
          city: 'Unknown City',
          source_type: 'manual',
          is_cloud_kitchen: false
        };

        return {
          id: dish.id,
          dish_name: dish.dish_name,
          restaurant_name: restaurantData.name,
          city: restaurantData.city,
          price: `₹${dish.price}`,
          protein: dish.protein_content as "💪 Overloaded" | "👍 Great",
          taste: dish.taste as "🤤 Amazing" | "👍 Great",
          satisfaction: dish.satisfaction as "🤩 Would Eat Everyday" | "👍 Great",
          comment: dish.comment,
          addedBy: dish.users?.name || "Unknown",
          availability: hasInStore && hasOnline ? "Both" : hasInStore ? "In-Store" : "Online",
          image_url: dish.image_url || "/delicious-high-protein-meal.jpg",
          protein_source: dish.protein_source,
          delivery_apps: deliveryApps,
          place_id: restaurantData.place_id || null,
          restaurant_address: restaurantData.google_maps_address || restaurantData.manual_address,
          users: dish.users,
          wishlisted_at: item.created_at,
          // New restaurant-centric fields
          restaurant: restaurantData,
          hasInStore,
          deliveryApps
        };
      })
    );

    return NextResponse.json(enhancedWishlistDishes);
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

// POST handler for adding a dish to wishlist
export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You are not authorized." }, { status: 401 });
  }

  try {
    const { dish_id } = await request.json();

    if (!dish_id) {
      return NextResponse.json({ error: "Dish ID is required." }, { status: 400 });
    }

    // Check if the dish exists
    const { data: dish, error: dishError } = await supabase
      .from("dishes")
      .select("id")
      .eq("id", dish_id)
      .single();

    if (dishError || !dish) {
      return NextResponse.json({ error: "Dish not found." }, { status: 404 });
    }

    // Add to wishlist (ignore if already exists)
    const { data, error } = await supabase
      .from("wishlist_items")
      .insert({ user_id: user.id, dish_id })
      .select()
      .single();

    if (error) {
      // If it's a duplicate key error, that's okay - item is already in wishlist
      if (error.code === "23505") {
        return NextResponse.json({ message: "Dish already in wishlist." }, { status: 200 });
      }
      console.error("Error adding to wishlist:", error);
      return NextResponse.json({ error: "Failed to add to wishlist." }, { status: 500 });
    }

    return NextResponse.json({ message: "Dish added to wishlist successfully." });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

// DELETE handler for removing a dish from wishlist
export async function DELETE(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You are not authorized." }, { status: 401 });
  }

  try {
    const { dish_id } = await request.json();

    if (!dish_id) {
      return NextResponse.json({ error: "Dish ID is required." }, { status: 400 });
    }

    // Remove from wishlist
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("dish_id", dish_id);

    if (error) {
      console.error("Error removing from wishlist:", error);
      return NextResponse.json({ error: "Failed to remove from wishlist." }, { status: 500 });
    }

    return NextResponse.json({ message: "Dish removed from wishlist successfully." });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
