import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { createAdminSupabaseClient } from "@/lib/supabase-admin"

const VALID_STATUSES = ["accepted", "in_progress", "hold", "completed"] as const
type CaseStatus = (typeof VALID_STATUSES)[number]

export async function PATCH(
  req: Request,
  { params }: { params: { caseId: string } },
) {
  try {
    const supabase = createServerSupabaseClient()
    const adminSupabase = createAdminSupabaseClient()

    const body = await req.json().catch(() => null)
    const newStatus = body?.status as CaseStatus | undefined

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: "Invalid status value. Use accepted, in_progress, hold, or completed." },
        { status: 400 },
      )
    }

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
      .select("id")
      .eq("auth_user_id", session.user.id)
      .maybeSingle()

    if (lawyerError || !lawyerData) {
      return NextResponse.json({ error: "Lawyer profile not found." }, { status: 404 })
    }

    const { data: acceptanceData, error: acceptanceError } = await adminSupabase
      .from("case_acceptances")
      .select("id")
      .eq("case_id", caseIdNum)
      .eq("lawyer_id", lawyerData.id)
      .maybeSingle()

    if (acceptanceError) {
      console.error("Error verifying acceptance:", acceptanceError)
      return NextResponse.json({ error: "Unable to verify case ownership." }, { status: 500 })
    }

    if (!acceptanceData) {
      return NextResponse.json(
        { error: "You have not accepted this case, so you cannot update its status." },
        { status: 403 },
      )
    }

    const { error: updateError } = await adminSupabase
      .from("cases")
      .update({ status: newStatus })
      .eq("id", caseIdNum)

    if (updateError) {
      console.error("Error updating case status:", updateError)
      return NextResponse.json({ error: "Failed to update case status." }, { status: 500 })
    }

    const { error: acceptanceStatusError } = await adminSupabase
      .from("case_acceptances")
      .update({ status: newStatus })
      .eq("case_id", caseIdNum)
      .eq("lawyer_id", lawyerData.id)

    if (acceptanceStatusError) {
      console.error("Error syncing acceptance status:", acceptanceStatusError)
    }

    return NextResponse.json({ message: "Case status updated successfully." })
  } catch (error) {
    console.error("Error updating case status:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}


