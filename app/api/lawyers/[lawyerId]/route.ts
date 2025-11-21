import { NextResponse } from "next/server"

import { createAdminSupabaseClient } from "@/lib/supabase-admin"

interface RouteContext {
  params: {
    lawyerId: string
  }
}

export async function GET(_: Request, { params }: RouteContext) {
  const { lawyerId } = params

  if (!lawyerId) {
    return NextResponse.json({ error: "Lawyer identifier is required" }, { status: 400 })
  }

  try {
    const supabase = createAdminSupabaseClient()

    let { data: lawyer, error: lawyerError } = await supabase
      .from("lawyers")
      .select("*")
      .eq("lawyer_id", lawyerId)
      .maybeSingle()

    if ((!lawyer || lawyerError) && !Number.isNaN(Number(lawyerId))) {
      const numericId = Number(lawyerId)
      const fallbackResult = await supabase.from("lawyers").select("*").eq("id", numericId).maybeSingle()
      lawyer = fallbackResult.data
      lawyerError = fallbackResult.error
    }

    if (lawyerError) {
      console.error("[lawyers-profile] failed to fetch lawyer", lawyerError)
      return NextResponse.json({ error: "Unable to fetch lawyer profile" }, { status: 500 })
    }

    if (!lawyer) {
      return NextResponse.json({ error: "Lawyer not found" }, { status: 404 })
    }

    const lawyerPk = lawyer.id as number

    const [{ data: education = [], error: educationError }, { data: cases = [], error: casesError }, { data: ratingStats, error: ratingError }, { data: reviews = [], error: reviewsError }] =
      await Promise.all([
        supabase
          .from("lawyer_education_details")
          .select("id, degree, institution, graduation_year")
          .eq("lawyer_id", lawyerPk)
          .order("graduation_year", { ascending: false }),
        supabase
          .from("lawyer_cases")
          .select(
            "id, case_type, police_station, district, case_number, law_name_and_section, filing_date, yearly_number, crime_title",
          )
          .eq("lawyer_id", lawyerPk)
          .order("filing_date", { ascending: false, nullsFirst: false }),
        supabase.from("lawyer_rating_stats").select("average_rating, review_count").eq("lawyer_id", lawyerPk).maybeSingle(),
        supabase
          .from("lawyer_reviews")
          .select("id, rating, comment, created_at, user_id")
          .eq("lawyer_id", lawyerPk)
          .order("created_at", { ascending: false })
          .limit(5),
      ])

    if (educationError) {
      console.error("[lawyers-profile] education fetch error", educationError)
    }
    if (casesError) {
      console.error("[lawyers-profile] cases fetch error", casesError)
    }
    if (ratingError) {
      console.error("[lawyers-profile] rating fetch error", ratingError)
    }
    if (reviewsError) {
      console.error("[lawyers-profile] reviews fetch error", reviewsError)
    }

    const currentCases = cases?.filter((caseItem) => caseItem.case_type === "current") ?? []
    const significantCases = cases?.filter((caseItem) => caseItem.case_type === "significant") ?? []

    const shapedReviews =
      reviews?.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        reviewer_name: "AinGPT user",
      })) ?? []

    return NextResponse.json({
      lawyer,
      education,
      currentCases,
      significantCases,
      ratingStats: ratingStats ?? null,
      reviews: shapedReviews,
    })
  } catch (error) {
    console.error("[lawyers-profile] unexpected error", error)
    return NextResponse.json({ error: "Unexpected error while loading lawyer profile" }, { status: 500 })
  }
}

