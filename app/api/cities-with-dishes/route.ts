import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // Get cities with dish counts using inner join
    const { data, error } = await supabase
      .from('restaurants')
      .select(`
        city,
        dishes!inner(id)
      `)
      .order('city')

    if (error) {
      console.error('Error fetching cities with dishes:', error)
      return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 })
    }

    // Group by city and count dishes
    const cityCounts = data.reduce((acc, item) => {
      acc[item.city] = (acc[item.city] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Transform to array and sort by dish count (descending)
    const citiesWithCounts = Object.entries(cityCounts)
      .map(([city, dishCount]) => ({ city, dishCount }))
      .sort((a, b) => b.dishCount - a.dishCount)

    return NextResponse.json(citiesWithCounts)
  } catch (error) {
    console.error('Server Error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
