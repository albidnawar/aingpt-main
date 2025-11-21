import { NextResponse } from "next/server"

import { createServerSupabaseClient } from "@/lib/supabase-server"
import { createAdminSupabaseClient } from "@/lib/supabase-admin"

const TOKEN_COST_PER_REQUEST = 5

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const rawCaseId = body?.caseId
    const rawLawyerId = body?.lawyerId

    if (!rawCaseId || !rawLawyerId) {
      return NextResponse.json({ error: "Case ID and lawyer ID are required." }, { status: 400 })
    }

    const caseId = Number(rawCaseId)
    const lawyerId = Number(rawLawyerId)

    if (Number.isNaN(caseId) || Number.isNaN(lawyerId)) {
      return NextResponse.json({ error: "Invalid identifiers provided." }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const adminSupabase = createAdminSupabaseClient()

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Please log in to continue." }, { status: 401 })
    }

    const { data: userRecord, error: userError } = await adminSupabase
      .from("users")
      .select("id, token_balance")
      .eq("auth_user_id", session.user.id)
      .maybeSingle()

    if (userError || !userRecord) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 })
    }

    const { data: caseRecord, error: caseError } = await adminSupabase
      .from("cases")
      .select("id, user_id")
      .eq("id", caseId)
      .maybeSingle()

    if (caseError) {
      console.error("[case-requests] failed to fetch case:", caseError)
      return NextResponse.json({ error: "Unable to verify case ownership." }, { status: 500 })
    }

    if (!caseRecord || caseRecord.user_id !== userRecord.id) {
      return NextResponse.json({ error: "You can only share your own cases." }, { status: 403 })
    }

    const currentTokens = userRecord.token_balance ?? 0
    if (currentTokens < TOKEN_COST_PER_REQUEST) {
      return NextResponse.json(
        { error: "You need at least 5 tokens to send this request." },
        { status: 400 },
      )
    }

    const { data: existingRequest } = await adminSupabase
      .from("case_requests")
      .select("id")
      .eq("case_id", caseId)
      .eq("lawyer_id", lawyerId)
      .maybeSingle()

    if (existingRequest) {
      return NextResponse.json({ error: "You have already sent this lawyer a request for this case." }, { status: 409 })
    }

    const { data: updatedUser, error: balanceError } = await adminSupabase
      .from("users")
      .update({ token_balance: currentTokens - TOKEN_COST_PER_REQUEST })
      .eq("id", userRecord.id)
      .select("token_balance")
      .single()

    if (balanceError) {
      console.error("[case-requests] token deduction error:", balanceError)
      return NextResponse.json({ error: "Failed to deduct tokens. Please try again." }, { status: 500 })
    }

    const { error: insertError } = await adminSupabase.from("case_requests").insert({
      case_id: caseId,
      user_id: userRecord.id,
      lawyer_id: lawyerId,
    })

    if (insertError) {
      console.error("[case-requests] insert error:", insertError)
      await adminSupabase.from("users").update({ token_balance: currentTokens }).eq("id", userRecord.id)
      return NextResponse.json({ error: "Failed to submit your request. Please try again." }, { status: 500 })
    }

    const { error: userTokenLogError } = await adminSupabase.from("user_tokens").insert({
      user_id: userRecord.id,
      transaction_type: "case_request",
      amount: -TOKEN_COST_PER_REQUEST,
    })

    if (userTokenLogError) {
      console.error("[case-requests] user token log error:", userTokenLogError)
    }

    return NextResponse.json(
      {
        message: "Case request sent successfully.",
        tokenBalance: updatedUser.token_balance ?? currentTokens - TOKEN_COST_PER_REQUEST,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[case-requests] unexpected error:", error)
    return NextResponse.json({ error: "Unexpected error while sending request." }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const rawRequestId = body?.requestId
    if (!rawRequestId) {
      return NextResponse.json({ error: "Request ID is required." }, { status: 400 })
    }

    const requestId = Number(rawRequestId)
    if (Number.isNaN(requestId)) {
      return NextResponse.json({ error: "Invalid request ID." }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const adminSupabase = createAdminSupabaseClient()

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const [{ data: userRecord }, { data: lawyerRecord }] = await Promise.all([
      adminSupabase.from("users").select("id").eq("auth_user_id", session.user.id).maybeSingle(),
      adminSupabase.from("lawyers").select("id").eq("auth_user_id", session.user.id).maybeSingle(),
    ])

    const { data: caseRequest, error: requestError } = await adminSupabase
      .from("case_requests")
      .select("id, user_id, lawyer_id")
      .eq("id", requestId)
      .maybeSingle()

    if (requestError || !caseRequest) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 })
    }

    const isUserOwner = userRecord && caseRequest.user_id === userRecord.id
    const isLawyerOwner = lawyerRecord && caseRequest.lawyer_id === lawyerRecord.id

    if (!isUserOwner && !isLawyerOwner) {
      return NextResponse.json({ error: "You are not allowed to modify this request." }, { status: 403 })
    }

    const { error: deleteError } = await adminSupabase.from("case_requests").delete().eq("id", requestId)

    if (deleteError) {
      console.error("[case-requests] delete error:", deleteError)
      return NextResponse.json({ error: "Failed to remove request." }, { status: 500 })
    }

    return NextResponse.json({ message: "Request removed." })
  } catch (error) {
    console.error("[case-requests] delete unexpected error:", error)
    return NextResponse.json({ error: "Unexpected error while removing request." }, { status: 500 })
  }
}

