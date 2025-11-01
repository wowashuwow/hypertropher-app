import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// Helper to extract file path from Supabase storage URL for dish images
function extractDishImagePathFromUrl(url: string): string | null {
  if (!url) return null;
  
  // Supabase URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{filepath}
  const match = url.match(/\/storage\/v1\/object\/public\/dish-photos\/(.+)$/);
  if (match && match[1]) {
    return match[1]; // Returns: "user-id/filename.jpg" or "old-filename.jpg" (legacy)
  }
  
  return null;
}

// Delete dish image from storage
async function deleteDishImage(imageUrl: string, supabase: SupabaseClient): Promise<void> {
  if (!imageUrl) return;
  
  const filePath = extractDishImagePathFromUrl(imageUrl);
  
  if (!filePath) {
    console.warn('Could not extract file path from URL:', imageUrl);
    return;
  }
  
  const { data, error } = await supabase.storage
    .from('dish-photos')
    .remove([filePath]);
  
  if (error) {
    console.error('Failed to delete dish image:', error);
    // Don't throw - dish deletion should still succeed
  }
}

// POST handler for creating a new dish
export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "You must be logged in to add a dish." }, { status: 401 });
  }

  try {
    const dishData = await request.json();
    console.log("🍽️ Creating dish with data:", dishData);

    // Only include non-redundant fields for dishes table
    const dishToInsert = {
      restaurant_id: dishData.restaurant_id,
      dish_name: dishData.dish_name,
      price: dishData.price,
      protein_source: dishData.protein_source,
      taste: dishData.taste,
      protein_content: dishData.protein_content,
      satisfaction: dishData.satisfaction,
      comment: dishData.comment,
      image_url: dishData.image_url,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("dishes")
      .insert(dishToInsert)
      .select()
      .single();

    if (error) {
      console.error("❌ Error inserting dish:", error);
      return NextResponse.json({ error: "Failed to create dish." }, { status: 500 });
    }

    console.log("✅ Dish created successfully:", data);
    return NextResponse.json({ dishId: data.id });
  } catch (error) {
    console.error("❌ Server Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

// GET handler for fetching dishes filtered by user's city
export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get the currently authenticated user to fetch their city
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // NEW: Get optional city parameter for non-authenticated users
  const { searchParams } = new URL(request.url);
  const cityParam = searchParams.get('city');

  try {
    // First, get the user's current city (if authenticated)
    let userCity = null;
    if (user) {
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("city")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        // Continue without city filtering if user profile fetch fails
      } else {
        userCity = userProfile.city;
      }
    }

    // Determine which city to filter by
    let filterCity = null;
    if (user && userCity) {
      // Authenticated users: use their selected city (existing behavior)
      filterCity = userCity;
    } else if (cityParam) {
      // Non-authenticated users: use provided city parameter (new behavior)
      filterCity = cityParam;
    }
    // If neither, fetch all dishes (existing behavior for non-authenticated)

    // 1. Fetch dishes with restaurant data - apply city filter if we have one
    let query = supabase
      .from("dishes")
      .select(`
        *,
        restaurants!dishes_restaurant_id_fkey (
          id,
          name,
          city,
          source_type,
          place_id,
          google_maps_address,
          latitude,
          longitude,
          manual_address,
          is_cloud_kitchen,
          verified
        )
      `);
    
    // Apply city filter if we have one
    if (filterCity) {
      query = query.eq("restaurants.city", filterCity);
    }

    const { data: dishes, error: dishesError } = await query;

    if (dishesError) {
      console.error("Error fetching dishes:", dishesError);
      return NextResponse.json({ error: "Failed to fetch dishes." }, { status: 500 });
    }

    // 2. Enhance each dish with availability channels and delivery apps
    const enhancedDishes = await Promise.all(
      dishes.map(async (dish) => {
        // Get user profile
        const { data: userProfile, error: profileError } = await supabase.rpc(
          "get_user_profile_by_id",
          { user_id_input: dish.user_id }
        );

        if (profileError) {
          console.error(`Error fetching profile for user ${dish.user_id}:`, profileError);
        }

        // Get availability channels
        const { data: availabilityChannels } = await supabase
          .from('dish_availability_channels')
          .select('channel')
          .eq('dish_id', dish.id);

        const hasInStore = availabilityChannels?.some(ch => ch.channel === 'In-Store') || false;
        const hasOnline = availabilityChannels?.some(ch => ch.channel === 'Online') || false;

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
            
            deliveryApps = apps?.map(app => app.delivery_app) || [];
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
          ...dish,
          // Legacy fields for backward compatibility
          restaurant_name: restaurantData.name,
          city: restaurantData.city,
          availability: hasInStore && hasOnline ? 'Both' : hasInStore ? 'In-Store' : 'Online',
          delivery_apps: deliveryApps,
          place_id: restaurantData.place_id || null,
          restaurant_address: restaurantData.google_maps_address || restaurantData.manual_address,
          latitude: restaurantData.latitude,
          longitude: restaurantData.longitude,
          
          // New fields
          restaurant: restaurantData,
          hasInStore,
          deliveryApps,
          
          users: { 
            name: userProfile?.name || "A User",
            profile_picture_url: userProfile?.profile_picture_url || null
          },
        };
      })
    );

    return NextResponse.json(enhancedDishes);
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

// PUT handler for updating a dish
export async function PUT(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "You must be logged in to update a dish." }, { status: 401 });
  }

  try {
    const { id, ...updateData } = await request.json();
    console.log("🍽️ Updating dish:", id, "with data:", updateData);

    if (!id) {
      return NextResponse.json({ error: "Dish ID is required." }, { status: 400 });
    }

    // First, verify the dish exists and belongs to the user
    const { data: existingDish, error: fetchError } = await supabase
      .from("dishes")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("❌ Error fetching dish:", fetchError);
      return NextResponse.json({ error: "Dish not found." }, { status: 404 });
    }

    if (existingDish.user_id !== user.id) {
      return NextResponse.json({ error: "You can only update your own dishes." }, { status: 403 });
    }

    // Validate and filter fields to prevent updating removed columns
    const validFields = [
      'restaurant_id', 'dish_name', 'price', 'protein_source',
      'protein_content', 'taste', 'satisfaction', 'comment', 'image_url'
    ];

    const cleanedUpdateData = Object.keys(updateData)
      .filter(key => validFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {} as any);

    console.log("🧹 Cleaned update data:", cleanedUpdateData);

    // Update the dish
    const { data, error } = await supabase
      .from("dishes")
      .update(cleanedUpdateData)
      .eq("id", id)
      .eq("user_id", user.id) // Double-check ownership
      .select()
      .single();

    if (error) {
      console.error("❌ Error updating dish:", error);
      return NextResponse.json({ error: "Failed to update dish." }, { status: 500 });
    }

    console.log("✅ Dish updated successfully:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Server Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

// DELETE handler for deleting a dish
export async function DELETE(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "You must be logged in to delete a dish." }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Dish ID is required." }, { status: 400 });
    }

    // First, verify the dish exists and belongs to the user
    const { data: existingDish, error: fetchError } = await supabase
      .from("dishes")
      .select("user_id, image_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching dish:", fetchError);
      return NextResponse.json({ error: "Dish not found." }, { status: 404 });
    }

    if (existingDish.user_id !== user.id) {
      return NextResponse.json({ error: "You can only delete your own dishes." }, { status: 403 });
    }

    // Delete image from storage if it exists (non-blocking)
    if (existingDish.image_url) {
      try {
        await deleteDishImage(existingDish.image_url, supabase);
      } catch (error) {
        console.error('Error deleting dish image (non-blocking):', error);
        // Continue with dish deletion even if image deletion fails
      }
    }

    // Delete the dish
    const { error } = await supabase
      .from("dishes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // Double-check ownership

    if (error) {
      console.error("Error deleting dish:", error);
      return NextResponse.json({ error: "Failed to delete dish." }, { status: 500 });
    }

    return NextResponse.json({ message: "Dish deleted successfully." });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
