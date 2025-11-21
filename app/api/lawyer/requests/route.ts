import { NextResponse } from "next/server"

import { createServerSupabaseClient } from "@/lib/supabase-server"
import { createAdminSupabaseClient } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const adminSupabase = createAdminSupabaseClient()

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { data: lawyerRecord, error: lawyerError } = await adminSupabase
      .from("lawyers")
      .select("id")
      .eq("auth_user_id", session.user.id)
      .maybeSingle()

    if (lawyerError || !lawyerRecord) {
      return NextResponse.json({ error: "Lawyer profile not found." }, { status: 404 })
    }

    const { data, error } = await adminSupabase
      .from("case_requests")
      .select(
        `
        id,
        requested_at,
        case_id,
        cases:case_id (
          id,
          case_number,
          case_type,
          thana_name,
          case_name_dhara,
          dhara_number,
          case_title,
          register_date,
          short_description,
          bp_form_no,
          case_persons,
          case_documents (
            id,
            document_path
          )
        ),
        users:user_id (
          id,
          full_name,
          username,
          email,
          phone
        )
      `,
      )
      .eq("lawyer_id", lawyerRecord.id)
      .order("requested_at", { ascending: false })

    if (error) {
      console.error("[lawyer-requests] fetch error:", error)
      return NextResponse.json({ error: "Failed to load pending requests." }, { status: 500 })
    }

    const requests =
      data
        ?.map((record) => {
          const caseInfo = (record as any).cases
          const clientInfo = (record as any).users
          if (!caseInfo) return null
          const documents =
            caseInfo.case_documents?.map((doc: any, index: number) => ({
              id: doc.id ? String(doc.id) : `${caseInfo.id}-doc-${index + 1}`,
              name: doc.document_path ? doc.document_path.split("/").pop() ?? "document" : "document",
              path: doc.document_path ?? undefined,
            })) ?? []

          return {
            id: String(record.id),
            caseId: String(caseInfo.id),
            caseNumber: caseInfo.case_number ?? "N/A",
            caseType: caseInfo.case_type ?? "N/A",
            thanaName: caseInfo.thana_name ?? "N/A",
            caseName: caseInfo.case_name_dhara ?? "",
            dharaNumber: caseInfo.dhara_number ?? "",
            caseTitle: caseInfo.case_title ?? "Untitled Case",
            registerDate: caseInfo.register_date ?? null,
            description: caseInfo.short_description ?? "",
            bpFormNo: caseInfo.bp_form_no ?? "",
            casePersons: caseInfo.case_persons ?? "",
            documents,
            requestedDate: record.requested_at ?? null,
            clientName: clientInfo?.full_name ?? clientInfo?.username ?? "Client",
            clientPhone: clientInfo?.phone ?? "Not provided",
            clientEmail: clientInfo?.email ?? "Not provided",
          }
        })
        .filter(Boolean) ?? []

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("[lawyer-requests] unexpected error:", error)
    return NextResponse.json({ error: "Unexpected error while loading requests." }, { status: 500 })
  }
}

