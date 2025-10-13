import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "You must be logged in to add restaurants." }, { status: 401 })
  }

  try {
    const body = await request.json()
    console.log("🏪 Creating/finding restaurant with data:", body)
    const { type, googleMapsData, manualData, city } = body

    // Check for existing restaurant
    let existingRestaurant = null
    
    if (type === 'google_maps' && googleMapsData?.place_id) {
      const { data } = await supabase
        .from('restaurants')
        .select('*')
        .eq('place_id', googleMapsData.place_id)
        .single()
      
      existingRestaurant = data
    } else if (type === 'manual') {
      // Fuzzy search for similar manual entries
      const { data } = await supabase
        .from('restaurants')
        .select('*')
        .eq('source_type', 'manual')
        .eq('city', city)
        .ilike('name', `%${manualData.name}%`)
      
      existingRestaurant = data?.[0]
    }

    if (existingRestaurant) {
      console.log("✅ Found existing restaurant:", existingRestaurant)
      return NextResponse.json({ restaurant: existingRestaurant })
    }

    // Create new restaurant
    const restaurantData = {
      name: type === 'google_maps' ? googleMapsData.name : manualData.name,
      city,
      source_type: type,
      ...(type === 'google_maps' && googleMapsData && {
        place_id: googleMapsData.place_id,
        google_maps_address: googleMapsData.formatted_address,
        latitude: googleMapsData.geometry?.location?.lat,
        longitude: googleMapsData.geometry?.location?.lng,
      }),
      ...(type === 'manual' && manualData && {
        manual_address: manualData.address,
        is_cloud_kitchen: manualData.isCloudKitchen,
      }),
    }

    const { data: newRestaurant, error } = await supabase
      .from('restaurants')
      .insert(restaurantData)
      .select()
      .single()

    if (error) {
      console.error('❌ Restaurant creation error:', error)
      throw new Error(`Failed to create restaurant: ${error.message}`)
    }

    console.log("✅ Created new restaurant:", newRestaurant)
    return NextResponse.json({ restaurant: newRestaurant })
  } catch (error) {
    console.error('❌ Restaurant API error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching restaurants:', error)
      return NextResponse.json({ error: "Failed to fetch restaurants." }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Server Error:', error)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
