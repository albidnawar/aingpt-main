import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { createAdminSupabaseClient } from "@/lib/supabase-admin"

export async function GET(
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

    const { searchParams } = new URL(req.url)
    const fileName = searchParams.get("fileName")
    const filePathQuery = searchParams.get("filePath")

    if (!fileName && !filePathQuery) {
      return NextResponse.json({ error: "File identifier is required." }, { status: 400 })
    }

    const [userResult, lawyerResult] = await Promise.all([
      adminSupabase
        .from("users")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .maybeSingle(),
      adminSupabase
        .from("lawyers")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .maybeSingle(),
    ])

    const userId = userResult.data?.id ?? null
    const lawyerId = lawyerResult.data?.id ?? null

    if (!userId && !lawyerId) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 })
    }

    const { data: caseData, error: caseError } = await adminSupabase
      .from("cases")
      .select("id, user_id")
      .eq("id", caseIdNum)
      .maybeSingle()

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 })
    }

    let hasAccess = false

    if (userId && caseData.user_id === userId) {
      hasAccess = true
    }

    if (!hasAccess && lawyerId) {
      const { data: acceptanceData, error: acceptanceError } = await adminSupabase
        .from("case_acceptances")
        .select("id")
        .eq("case_id", caseIdNum)
        .eq("lawyer_id", lawyerId)
        .maybeSingle()

      if (acceptanceError) {
        console.error("Error verifying acceptance for download:", acceptanceError)
        return NextResponse.json({ error: "Unable to verify access." }, { status: 500 })
      }

      if (acceptanceData) {
        hasAccess = true
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized access to this case." }, { status: 403 })
    }

    const { data: documentsData, error: documentError } = await adminSupabase
      .from("case_documents")
      .select("document_path")
      .eq("case_id", caseIdNum)

    if (documentError || !documentsData || documentsData.length === 0) {
      return NextResponse.json({ error: "No files found for this case." }, { status: 404 })
    }

    const documentData = documentsData.find((doc) => {
      if (filePathQuery) {
        return doc.document_path === filePathQuery
      }

      const pathParts = doc.document_path.split("/")
      const pathFileName = pathParts[pathParts.length - 1]
      const cleanPathFileName = pathFileName.replace(/^\d+-/, "")

      return (
        doc.document_path === fileName ||
        pathFileName === fileName ||
        cleanPathFileName === fileName
      )
    })

    if (!documentData) {
      return NextResponse.json({ error: "File not found for this case." }, { status: 404 })
    }

    const filePath = documentData.document_path
    const bucketName = "case-documents"

    const { data: fileBlob, error: downloadError } = await adminSupabase.storage
      .from(bucketName)
      .download(filePath)

    if (downloadError || !fileBlob) {
      return NextResponse.json(
        {
          error: "File not available in storage.",
          message: downloadError?.message || "File download failed",
        },
        { status: 404 },
      )
    }

    const pathParts = filePath.split("/")
    const originalFileName = pathParts[pathParts.length - 1].replace(/^\d+-/, "")

    const arrayBuffer = await fileBlob.arrayBuffer()
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${originalFileName}"`,
      },
    })
  } catch (error) {
    console.error("Error downloading file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

