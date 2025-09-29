import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const { phone } = await request.json();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Basic validation
  if (!phone) {
    return NextResponse.json(
      { error: "Phone number is required." },
      { status: 400 }
    );
  }

  try {
    // Send OTP via Supabase Auth (no invite code required for login)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone,
    });

    if (otpError) {
      console.error("Supabase OTP Error:", otpError);
      return NextResponse.json(
        { error: otpError.message || "Failed to send OTP. Please try again." },
        { status: otpError.status || 500 }
      );
    }

    return NextResponse.json({
      message: "OTP sent successfully. Please check your phone.",
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
