import { NextResponse } from "next/server"

import { getViewerWithAdmin, verifyConversationAccess } from "@/app/api/chat/utils"

const BUCKET_ID = "chat-files"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const conversationId = Number(url.searchParams.get("conversationId"))
  const path = url.searchParams.get("path")
  const fileName = url.searchParams.get("name") ?? "attachment"

  if (Number.isNaN(conversationId) || !path) {
    return NextResponse.json({ error: "conversationId and path are required." }, { status: 400 })
  }

  const requestedRole = url.searchParams.get("role")
  const { viewer, adminSupabase, error } = await getViewerWithAdmin(
    requestedRole === "lawyer" || requestedRole === "user" ? (requestedRole as "user" | "lawyer") : undefined,
  )
  if (error || !viewer || !adminSupabase) return error!

  const accessCheck = await verifyConversationAccess(adminSupabase, conversationId, viewer)
  if ("error" in accessCheck) return accessCheck.error

  const storageClient = adminSupabase.storage.from(BUCKET_ID)
  const { data, error: downloadError } = await storageClient.download(path)

  if (downloadError || !data) {
    console.error("[chat-attachments] download error:", downloadError)
    return NextResponse.json({ error: "Failed to download attachment." }, { status: 500 })
  }

  const buffer = Buffer.from(await data.arrayBuffer())
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": data.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  })
}

