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
    return NextResponse.json({ error: "You must be logged in to add availability channels." }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { dish_id, channel } = body

    // Verify the dish belongs to the user
    const { data: dish, error: dishError } = await supabase
      .from('dishes')
      .select('user_id')
      .eq('id', dish_id)
      .single()

    if (dishError || !dish) {
      return NextResponse.json({ error: "Dish not found." }, { status: 404 })
    }

    if (dish.user_id !== user.id) {
      return NextResponse.json({ error: "You can only modify your own dishes." }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('dish_availability_channels')
      .insert({ dish_id, channel })
      .select()
      .single()

    if (error) {
      console.error('Error creating availability channel:', error)
      throw new Error(`Failed to create availability channel: ${error.message}`)
    }

    return NextResponse.json({ availabilityChannel: data })
  } catch (error) {
    console.error('Availability channel creation error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const { searchParams } = new URL(request.url)
    const dishId = searchParams.get('dish_id')

    if (!dishId) {
      return NextResponse.json({ error: "Dish ID is required." }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('dish_availability_channels')
      .select('*')
      .eq('dish_id', dishId)

    if (error) {
      console.error('Error fetching availability channels:', error)
      return NextResponse.json({ error: "Failed to fetch availability channels." }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Availability channels fetch error:', error)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "You must be logged in to delete availability channels." }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('id')

    if (!channelId) {
      return NextResponse.json({ error: "Channel ID is required." }, { status: 400 })
    }

    // Verify the channel belongs to a dish owned by the user
    const { data: channel, error: channelError } = await supabase
      .from('dish_availability_channels')
      .select(`
        id,
        dishes!inner(user_id)
      `)
      .eq('id', channelId)
      .single()

    if (channelError || !channel) {
      return NextResponse.json({ error: "Availability channel not found." }, { status: 404 })
    }

    if (channel.dishes && Array.isArray(channel.dishes) && channel.dishes[0]?.user_id !== user.id) {
      return NextResponse.json({ error: "You can only delete your own dish availability channels." }, { status: 403 })
    }

    const { error } = await supabase
      .from('dish_availability_channels')
      .delete()
      .eq('id', channelId)

    if (error) {
      console.error('Error deleting availability channel:', error)
      return NextResponse.json({ error: "Failed to delete availability channel." }, { status: 500 })
    }

    return NextResponse.json({ message: "Availability channel deleted successfully." })
  } catch (error) {
    console.error('Availability channel deletion error:', error)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
