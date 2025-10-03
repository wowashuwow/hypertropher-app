import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

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

    // Add the user_id from the authenticated user
    const dishToInsert = {
      ...dishData,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("dishes")
      .insert(dishToInsert)
      .select();

    if (error) {
      console.error("Error inserting dish:", error);
      return NextResponse.json({ error: "Failed to create dish." }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

// GET handler for fetching dishes filtered by user's city
export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get the currently authenticated user to fetch their city
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

    // 1. Fetch dishes - filter by user's city if authenticated, otherwise fetch all
    const query = supabase
      .from("dishes")
      .select(`*`);
    
    if (userCity) {
      query.eq("city", userCity);
    }

    const { data: dishes, error: dishesError } = await query;

    if (dishesError) {
      console.error("Error fetching dishes:", dishesError);
      return NextResponse.json({ error: "Failed to fetch dishes." }, { status: 500 });
    }

    // 2. Enhance each dish with the author's name using a secure RPC call
    const enhancedDishes = await Promise.all(
      dishes.map(async (dish) => {
        const { data: authorName, error: nameError } = await supabase.rpc(
          "get_user_name_by_id",
          { user_id_input: dish.user_id }
        );

        if (nameError) {
          console.error(`Error fetching name for user ${dish.user_id}:`, nameError);
        }

        return {
          ...dish,
          users: { name: authorName || "A User" }, // Use a fallback name if fetch fails
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
      console.error("Error fetching dish:", fetchError);
      return NextResponse.json({ error: "Dish not found." }, { status: 404 });
    }

    if (existingDish.user_id !== user.id) {
      return NextResponse.json({ error: "You can only update your own dishes." }, { status: 403 });
    }

    // Update the dish
    const { data, error } = await supabase
      .from("dishes")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id) // Double-check ownership
      .select();

    if (error) {
      console.error("Error updating dish:", error);
      return NextResponse.json({ error: "Failed to update dish." }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server Error:", error);
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
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching dish:", fetchError);
      return NextResponse.json({ error: "Dish not found." }, { status: 404 });
    }

    if (existingDish.user_id !== user.id) {
      return NextResponse.json({ error: "You can only delete your own dishes." }, { status: 403 });
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
