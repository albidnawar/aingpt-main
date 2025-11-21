import { NextResponse } from "next/server"

import { createAdminSupabaseClient } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient()

    const [{ data: lawyers, error: lawyersError }, { data: ratingStats, error: ratingStatsError }] = await Promise.all([
      supabase
        .from("lawyers")
        .select(
          "id, lawyer_id, full_name, email, phone, practice_areas, chamber_address, law_practicing_place, years_experience, consultation_fee, token_balance, avatar_url, created_at",
        )
        .order("created_at", { ascending: false }),
      supabase.from("lawyer_rating_stats").select("lawyer_id, average_rating, review_count"),
    ])

    if (lawyersError) {
      console.error("[lawyers-list] failed to fetch lawyers", lawyersError)
      return NextResponse.json({ error: "Unable to fetch lawyers right now." }, { status: 500 })
    }

    if (ratingStatsError) {
      console.error("[lawyers-list] failed to fetch rating stats", ratingStatsError)
    }

    const ratingMap = new Map<number, { average_rating: number | null; review_count: number | null }>()
    ratingStats?.forEach((stat) => {
      ratingMap.set(stat.lawyer_id, {
        average_rating: stat.average_rating,
        review_count: stat.review_count,
      })
    })

    const payload =
      lawyers?.map((lawyer) => ({
        ...lawyer,
        average_rating: ratingMap.get(lawyer.id)?.average_rating ?? null,
        review_count: ratingMap.get(lawyer.id)?.review_count ?? null,
      })) ?? []

    return NextResponse.json({ lawyers: payload })
  } catch (error) {
    console.error("[lawyers-list] unexpected error", error)
    return NextResponse.json({ error: "Unexpected error while loading lawyers." }, { status: 500 })
  }
}

