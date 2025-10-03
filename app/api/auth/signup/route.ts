import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { cookies } from "next/headers";
import { checkRateLimit, getResetTimeString } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const { phone, inviteCode } = await request.json();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Basic validation
  if (!phone || !inviteCode) {
    return NextResponse.json(
      { error: "Phone number and invite code are required." },
      { status: 400 }
    );
  }

  // Rate limiting check - 3 signup attempts per 15 minutes per phone number
  const rateLimitResult = checkRateLimit(phone, 3, 15 * 60 * 1000);
  
  if (!rateLimitResult.allowed) {
    const resetTime = getResetTimeString(rateLimitResult.resetTime);
    return NextResponse.json(
      { 
        error: `Too many signup attempts. Please try again in ${resetTime}.` 
      },
      { status: 429 }
    );
  }

  try {
    // 1. Check if the invite code is valid and not used
    // Use service role to bypass RLS since user is not authenticated yet
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

    // 2. Send OTP via Supabase Auth
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
    console.error("Sign-up Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
