import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { checkAndRemoveReportedApps } from "@/lib/services/reporting"

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "You must be logged in to report." }, { status: 401 })
  }

  try {
    const { restaurantId, deliveryApps } = await request.json()

    if (!restaurantId || !Array.isArray(deliveryApps) || deliveryApps.length === 0) {
      return NextResponse.json(
        { error: "Restaurant ID and delivery apps array are required." },
        { status: 400 }
      )
    }

    // Use service client to insert reports (bypass RLS)
    const serviceSupabase = createServiceClient()

    // Insert reports for each app
    const reportPromises = deliveryApps.map(async (app: string) => {
      const { error } = await serviceSupabase
        .from("restaurant_delivery_app_reports")
        .insert({
          restaurant_id: restaurantId,
          delivery_app: app,
          reported_by_user_id: user.id,
        })
        .select()

      // Handle unique constraint violation (user already reported this app)
      if (error && error.code !== "23505") {
        // 23505 is unique violation - ignore (user already reported)
        console.error(`Error reporting ${app}:`, error)
        return { app, success: false, error: error.message }
      }

      return { app, success: true }
    })

    const results = await Promise.all(reportPromises)
    const successfulReports = results.filter(r => r.success)

    // Check and remove apps that meet threshold (2+ reports)
    const removalPromises = deliveryApps.map(async (app: string) => {
      const wasRemoved = await checkAndRemoveReportedApps(restaurantId, app)
      return { app, wasRemoved }
    })

    const removalResults = await Promise.all(removalPromises)
    const removedApps = removalResults.filter(r => r.wasRemoved).map(r => r.app)

    return NextResponse.json({
      message: "Reports submitted successfully.",
      reportedApps: successfulReports.map(r => r.app),
      removedApps: removedApps.length > 0 ? removedApps : undefined,
    })
  } catch (error) {
    console.error("Report submission error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    )
  }
}

