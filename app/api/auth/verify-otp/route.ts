import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const { email, token } = await request.json();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Basic validation
  if (!email || !token) {
    return NextResponse.json(
      { error: "Email and OTP code are required." },
      { status: 400 }
    );
  }

  try {
    // Verify the OTP
    const { error, data } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      console.error("Supabase OTP Verification Error:", error);
      return NextResponse.json(
        { error: error.message || "Invalid or expired OTP code. Please try again." },
        { status: error.status || 400 }
      );
    }

    // Check if user has completed profile
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found after verification." },
        { status: 500 }
      );
    }

    const { data: profile } = await supabase
      .from('users')
      .select('id, city')
      .eq('id', user.id)
      .single();

    // Return success with profile status
    return NextResponse.json({
      message: "OTP verified successfully!",
      hasProfile: !!profile && !!profile.city,
      userId: user.id,
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

