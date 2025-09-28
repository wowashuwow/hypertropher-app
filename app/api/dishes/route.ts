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

// GET handler for fetching all dishes
export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // 1. Fetch all dishes first
    const { data: dishes, error: dishesError } = await supabase
      .from("dishes")
      .select(`*`);

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
