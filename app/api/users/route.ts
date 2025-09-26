import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

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

  const phone = user.phone;

  // Get the name, city, and inviteCode from the request body
  const { name, city, inviteCode } = await request.json();

  if (!name || !city || !inviteCode) {
    return NextResponse.json({ error: "Name, city, and invite code are required." }, { status: 400 });
  }

  // Create the user's record in our public 'users' table
  const { data, error } = await supabase
    .from("users")
    .insert({ id: user.id, phone: `+${user.phone}`, name, city })
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

  return NextResponse.json(data);
}
