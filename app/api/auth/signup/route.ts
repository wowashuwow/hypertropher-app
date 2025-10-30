import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { cookies } from "next/headers";
import { checkRateLimit, getResetTimeString } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const { email, password, inviteCode, provider } = await request.json();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Basic validation
  if (!email || !inviteCode) {
    return NextResponse.json(
      { error: "Email and invite code are required." },
      { status: 400 }
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Invalid email format." },
      { status: 400 }
    );
  }

  // Rate limiting check - 3 signup attempts per 15 minutes per email
  const rateLimitResult = checkRateLimit(email, 3, 15 * 60 * 1000);
  
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

    // 2. Determine signup method: password or magic link
    if (password && provider === 'email_password') {
      // Email + Password signup
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters." },
          { status: 400 }
        );
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
          data: {
            invite_code: inviteCode, // Store in user metadata temporarily
          }
        }
      });

      if (signUpError) {
        console.error("Supabase SignUp Error:", signUpError);
        return NextResponse.json(
          { error: signUpError.message || "Failed to sign up. Please try again." },
          { status: signUpError.status || 500 }
        );
      }

      return NextResponse.json({
        message: "Signup successful! Please check your email to verify your account.",
        userId: data.user?.id,
      });
    } else {
      // Magic link signup (passwordless)
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${request.nextUrl.origin}/auth/callback?next=/complete-profile`,
          data: {
            invite_code: inviteCode,
          }
        }
      });

      if (magicLinkError) {
        console.error("Supabase Magic Link Error:", magicLinkError);
        return NextResponse.json(
          { error: magicLinkError.message || "Failed to send magic link. Please try again." },
          { status: magicLinkError.status || 500 }
        );
      }

      return NextResponse.json({
        message: "Magic link sent! Please check your email.",
      });
    }
  } catch (error) {
    console.error("Sign-up Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
