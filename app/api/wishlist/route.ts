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
        dishes!inner (
          id,
          dish_name,
          restaurant_name,
          city,
          availability,
          image_url,
          price,
          protein_source,
          taste,
          protein_content,
          satisfaction,
          comment,
          delivery_apps,
          place_id,
          created_at,
          users!dishes_user_id_fkey (
            name
          )
        )
      `)
      .eq("user_id", user.id)
      .eq("dishes.city", userCity);

    if (wishlistError) {
      console.error("Error fetching wishlist:", wishlistError);
      return NextResponse.json({ error: "Failed to fetch wishlist." }, { status: 500 });
    }

    // Transform the data to match the expected format
    const wishlistDishes = wishlistItems.map((item: any) => ({
      id: item.dishes.id,
      dish_name: item.dishes.dish_name,
      restaurant_name: item.dishes.restaurant_name,
      city: item.dishes.city,
      price: `₹${item.dishes.price}`,
      protein: item.dishes.protein_content as "💪 Overloaded" | "👍 Great",
      taste: item.dishes.taste as "🤤 Amazing" | "👍 Great",
      satisfaction: item.dishes.satisfaction as "🤩 Would Eat Everyday" | "👍 Great",
      comment: item.dishes.comment,
      addedBy: item.dishes.users?.name || "Unknown",
      availability: item.dishes.availability as "In-Store" | "Online",
      image_url: item.dishes.image_url || "/delicious-high-protein-meal.jpg",
      protein_source: item.dishes.protein_source,
      delivery_apps: item.dishes.delivery_apps || [],
      place_id: item.dishes.place_id,
      users: item.dishes.users,
      wishlisted_at: item.created_at
    }));

    return NextResponse.json(wishlistDishes);
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
