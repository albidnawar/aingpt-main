import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { createAdminSupabaseClient } from "@/lib/supabase-admin"

const TOKEN_COST_PER_CASE = 5

export async function POST(
  req: Request,
  { params }: { params: { caseId: string } },
) {
  try {
    const supabase = createServerSupabaseClient()
    const adminSupabase = createAdminSupabaseClient()

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
    }

    const caseIdParam = params.caseId
    const caseIdNum = parseInt(caseIdParam, 10)
    if (Number.isNaN(caseIdNum)) {
      return NextResponse.json({ error: "Invalid case ID." }, { status: 400 })
    }

    const { data: lawyerData, error: lawyerError } = await adminSupabase
      .from("lawyers")
      .select("id, token_balance")
      .eq("auth_user_id", session.user.id)
      .maybeSingle()

    if (lawyerError || !lawyerData) {
      return NextResponse.json({ error: "Lawyer profile not found." }, { status: 404 })
    }

    const currentTokens = lawyerData.token_balance ?? 0
    if (currentTokens < TOKEN_COST_PER_CASE) {
      return NextResponse.json(
        { error: "Insufficient tokens to accept this case." },
        { status: 400 },
      )
    }

    const { data: existingAcceptance, error: acceptanceLookupError } = await adminSupabase
      .from("case_acceptances")
      .select("id, status")
      .eq("case_id", caseIdNum)
      .eq("lawyer_id", lawyerData.id)
      .maybeSingle()

    if (acceptanceLookupError) {
      console.error("Error checking acceptance:", acceptanceLookupError)
      return NextResponse.json(
        { error: "Unable to verify existing acceptances." },
        { status: 500 },
      )
    }

    if (existingAcceptance) {
      return NextResponse.json(
        { error: "You have already accepted this case." },
        { status: 409 },
      )
    }

    const { data: caseRecord, error: caseError } = await adminSupabase
      .from("cases")
      .select("id, case_number, case_title, status")
      .eq("id", caseIdNum)
      .maybeSingle()

    if (caseError) {
      console.error("Error fetching case record:", caseError)
      return NextResponse.json({ error: "Failed to fetch case information." }, { status: 500 })
    }

    if (!caseRecord) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 })
    }

    const { data: updatedLawyer, error: tokenUpdateError } = await adminSupabase
      .from("lawyers")
      .update({ token_balance: currentTokens - TOKEN_COST_PER_CASE })
      .eq("id", lawyerData.id)
      .select("token_balance")
      .single()

    if (tokenUpdateError) {
      console.error("Error updating token balance:", tokenUpdateError)
      return NextResponse.json({ error: "Failed to deduct tokens." }, { status: 500 })
    }

    const { error: tokenLogError } = await adminSupabase.from("lawyer_tokens").insert({
      lawyer_id: lawyerData.id,
      transaction_type: "case_accept",
      amount: -TOKEN_COST_PER_CASE,
    })

    if (tokenLogError) {
      console.error("Error logging token transaction:", tokenLogError)
    }

    const { data: acceptanceData, error: acceptanceInsertError } = await adminSupabase
      .from("case_acceptances")
      .insert({
        case_id: caseIdNum,
        lawyer_id: lawyerData.id,
        status: "accepted",
      })
      .select("id, accepted_at, status")
      .single()

    if (acceptanceInsertError) {
      console.error("Error creating acceptance:", acceptanceInsertError)

      await adminSupabase
        .from("lawyers")
        .update({ token_balance: currentTokens })
        .eq("id", lawyerData.id)

      return NextResponse.json({ error: "Failed to accept case." }, { status: 500 })
    }

    const { error: caseStatusError } = await adminSupabase
      .from("cases")
      .update({ status: "accepted" })
      .eq("id", caseIdNum)

    if (caseStatusError) {
      console.error("Error updating case status:", caseStatusError)
    }

    return NextResponse.json({
      message: "Case accepted successfully.",
      tokenBalance: updatedLawyer.token_balance ?? currentTokens - TOKEN_COST_PER_CASE,
      acceptance: acceptanceData,
    })
  } catch (error) {
    console.error("Error accepting case:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}


