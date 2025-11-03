import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

function generateInviteCode(): string {
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HYPER${randomPart}`;
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // First, get the currently authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You are not authorized." }, { status: 401 });
  }

  // Get user metadata from Supabase Auth
  const email = user.email;

  // Get the name, city, inviteCode, and profilePictureUrl from the request body
  const { name, city, inviteCode, profilePictureUrl } = await request.json();

  if (!city || !inviteCode) {
    return NextResponse.json({ error: "City and invite code are required." }, { status: 400 });
  }

  // Name is required from form
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  // Create the user's record in our public 'users' table
  const { data, error } = await supabase
    .from("users")
    .insert({ 
      id: user.id,
      email: email,
      phone: null, // No phone for email users
      name: name, 
      city,
      profile_picture_url: profilePictureUrl || null,
      profile_picture_updated_at: profilePictureUrl ? new Date().toISOString() : null
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating user profile:", error);
    return NextResponse.json({ error: "Failed to create profile." }, { status: 500 });
  }

  // Mark the invite code as used
  // Use service client to bypass RLS (user didn't generate the code, but is using it)
  const serviceSupabase = createServiceClient();
  const { error: inviteCodeError } = await serviceSupabase
    .from("invite_codes")
    .update({ is_used: true, used_by_user_id: user.id })
    .eq("code", inviteCode);

  if (inviteCodeError) {
    console.error("Error updating invite code:", inviteCodeError);
    // Note: We don't fail the signup if this fails, but it should succeed now
  }

  // Generate 5 new invite codes for the new user
  const newCodes = [];
  for (let i = 0; i < 5; i++) {
    newCodes.push({
      code: generateInviteCode(),
      generated_by_user_id: user.id,
      is_used: false
    });
  }

  const { error: codesError } = await supabase
    .from("invite_codes")
    .insert(newCodes);

  if (codesError) {
    console.error("Error generating invite codes:", codesError);
  }

  return NextResponse.json(data);
}

// GET handler for fetching current user profile
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
    const { data, error} = await supabase
      .from("users")
      .select("id, name, email, city, created_at, profile_picture_url, profile_picture_updated_at")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return NextResponse.json({ error: "Failed to fetch profile." }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

// PUT handler for updating user profile
export async function PUT(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You are not authorized." }, { status: 401 });
  }

  try {
    const { name, city } = await request.json();

    if (!name && !city) {
      return NextResponse.json({ error: "At least one field (name or city) is required." }, { status: 400 });
    }

    // Build update object with only provided fields
    const updateData: { name?: string; city?: string } = {};
    if (name) updateData.name = name;
    if (city) updateData.city = city;

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
