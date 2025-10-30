import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

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
  const provider = user.app_metadata.provider; // 'google', 'email', etc.

  // Get the name, city, inviteCode, and profilePictureUrl from the request body
  const { name, city, inviteCode, profilePictureUrl } = await request.json();

  if (!city || !inviteCode) {
    return NextResponse.json({ error: "City and invite code are required." }, { status: 400 });
  }

  // For Google OAuth, name comes from user metadata
  // For email signup, name is required from form
  let userName = name;
  if (!userName && provider === 'google') {
    // Extract name from Google user metadata
    userName = user.user_metadata?.full_name || user.user_metadata?.name || 'User';
  }

  if (!userName) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  // Create the user's record in our public 'users' table
  const { data, error } = await supabase
    .from("users")
    .insert({ 
      id: user.id,
      email: email,
      phone: null, // No phone for new email/Google users
      name: userName, 
      city,
      profile_picture_url: profilePictureUrl || user.user_metadata?.avatar_url || null,
      profile_picture_updated_at: profilePictureUrl || user.user_metadata?.avatar_url ? new Date().toISOString() : null
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating user profile:", error);
    return NextResponse.json({ error: "Failed to create profile." }, { status: 500 });
  }

  // Mark the invite code as used
  const { error: inviteCodeError } = await supabase
    .from("invite_codes")
    .update({ is_used: true, used_by_user_id: user.id })
    .eq("code", inviteCode);

  if (inviteCodeError) {
    console.error("Error updating invite code:", inviteCodeError);
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
