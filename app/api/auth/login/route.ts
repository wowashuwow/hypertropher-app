import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { checkRateLimit, getResetTimeString } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const { email, password, useMagicLink } = await request.json();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Basic validation
  if (!email) {
    return NextResponse.json(
      { error: "Email is required." },
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

  // Rate limiting check - 5 login attempts per 15 minutes per email
  const rateLimitResult = checkRateLimit(email, 5, 15 * 60 * 1000);
  
  if (!rateLimitResult.allowed) {
    const resetTime = getResetTimeString(rateLimitResult.resetTime);
    return NextResponse.json(
      { 
        error: `Too many login attempts. Please try again in ${resetTime}.` 
      },
      { status: 429 }
    );
  }

  try {
    if (useMagicLink) {
      // Magic link login (passwordless)
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
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
    } else {
      // Email + Password login
      if (!password) {
        return NextResponse.json(
          { error: "Password is required for email login." },
          { status: 400 }
        );
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Supabase SignIn Error:", signInError);
        return NextResponse.json(
          { error: signInError.message || "Invalid email or password." },
          { status: signInError.status || 401 }
        );
      }

      return NextResponse.json({
        message: "Login successful!",
      });
    }
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
