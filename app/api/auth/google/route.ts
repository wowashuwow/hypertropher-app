import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const { inviteCode } = await request.json();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Validate invite code first (before OAuth)
  if (!inviteCode) {
    return NextResponse.json(
      { error: "Invite code is required." },
      { status: 400 }
    );
  }

  try {
    // Check if the invite code is valid and not used
    const serviceSupabase = createServiceClient();
    const { data: codeData, error: codeError } = await serviceSupabase
      .from("invite_codes")
      .select("*")
      .eq("code", inviteCode)
      .single();

    if (codeError || !codeData) {
      return NextResponse.json(
        { error: "Invalid invite code." },
        { status: 404 }
      );
    }

    if (codeData.is_used) {
      return NextResponse.json(
        { error: "This invite code has already been used." },
        { status: 400 }
      );
    }

    // Initiate Google OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${request.nextUrl.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });

    if (error) {
      console.error("Google OAuth Error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to initiate Google sign-in." },
        { status: error.status || 500 }
      );
    }

    // Return OAuth URL for client-side redirect
    return NextResponse.json({
      url: data.url,
      inviteCode, // Send back for client-side storage
    });
  } catch (error) {
    console.error("Google OAuth Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

