import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "You must be logged in to submit feedback." }, { status: 401 })
  }

  try {
    const { message, type } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Feedback message is required." },
        { status: 400 }
      )
    }

    // Store feedback in Supabase
    // Note: Create feedback table in Supabase if it doesn't exist:
    // CREATE TABLE feedback (
    //   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    //   user_id UUID REFERENCES users(id),
    //   message TEXT NOT NULL,
    //   type TEXT DEFAULT 'general',
    //   created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    // );
    const { error } = await supabase
      .from("feedback")
      .insert({
        user_id: user.id,
        message: message.trim(),
        type: type || "general", // general, bug, feature, other
      })

    if (error) {
      // If table doesn't exist, log the feedback for now
      // You can create the table later and feedback will start being stored
      console.error("Error storing feedback (table may not exist yet):", error)
      console.log("Feedback from user:", user.id, "-", message.trim())
      
      // Still return success - feedback is logged in server logs
      return NextResponse.json({
        message: "Thank you for your feedback! We'll review it soon.",
      })
    }

    return NextResponse.json({
      message: "Thank you for your feedback! We'll review it soon.",
    })
  } catch (error) {
    console.error("Feedback submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit feedback. Please try again." },
      { status: 500 }
    )
  }
}

