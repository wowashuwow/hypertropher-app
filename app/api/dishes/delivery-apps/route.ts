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
    return NextResponse.json({ error: "You must be logged in to add delivery apps." }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { dish_id, availability_channel_id, delivery_app } = body

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

    // Verify the availability channel exists and belongs to the dish
    const { data: channel, error: channelError } = await supabase
      .from('dish_availability_channels')
      .select('id, dish_id, channel')
      .eq('id', availability_channel_id)
      .eq('dish_id', dish_id)
      .single()

    if (channelError || !channel) {
      return NextResponse.json({ error: "Availability channel not found." }, { status: 404 })
    }

    if (channel.channel !== 'Online') {
      return NextResponse.json({ error: "Delivery apps can only be added to Online availability channels." }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('dish_delivery_apps')
      .insert({ dish_id, availability_channel_id, delivery_app })
      .select()
      .single()

    if (error) {
      console.error('Error adding delivery app:', error)
      throw new Error(`Failed to add delivery app: ${error.message}`)
    }

    return NextResponse.json({ deliveryApp: data })
  } catch (error) {
    console.error('Delivery app creation error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "You must be logged in to delete delivery apps." }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const deliveryAppId = searchParams.get('id')

    if (!deliveryAppId) {
      return NextResponse.json({ error: "Delivery app ID is required." }, { status: 400 })
    }

    // Verify the delivery app belongs to a dish owned by the user
    const { data: deliveryApp, error: deliveryAppError } = await supabase
      .from('dish_delivery_apps')
      .select(`
        id,
        dishes!inner(user_id)
      `)
      .eq('id', deliveryAppId)
      .single()

    if (deliveryAppError || !deliveryApp) {
      return NextResponse.json({ error: "Delivery app not found." }, { status: 404 })
    }

    if (deliveryApp.dishes && Array.isArray(deliveryApp.dishes) && deliveryApp.dishes[0]?.user_id !== user.id) {
      return NextResponse.json({ error: "You can only delete your own dish delivery apps." }, { status: 403 })
    }

    const { error } = await supabase
      .from('dish_delivery_apps')
      .delete()
      .eq('id', deliveryAppId)

    if (error) {
      console.error('Error deleting delivery app:', error)
      return NextResponse.json({ error: "Failed to delete delivery app." }, { status: 500 })
    }

    return NextResponse.json({ message: "Delivery app deleted successfully." })
  } catch (error) {
    console.error('Delivery app deletion error:', error)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
