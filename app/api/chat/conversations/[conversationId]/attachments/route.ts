import { randomUUID } from "crypto"
import { NextResponse } from "next/server"

import { getViewerWithAdmin, verifyConversationAccess } from "@/app/api/chat/utils"

const BUCKET_ID = "chat-files"
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

export async function POST(
  request: Request,
  { params }: { params: { conversationId: string } },
) {
  const conversationId = Number(params.conversationId)
  if (Number.isNaN(conversationId)) {
    return NextResponse.json({ error: "Invalid conversation ID." }, { status: 400 })
  }

  const url = new URL(request.url)
  const requestedRole = url.searchParams.get("role")
  const { viewer, adminSupabase, error } = await getViewerWithAdmin(
    requestedRole === "lawyer" || requestedRole === "user" ? (requestedRole as "user" | "lawyer") : undefined,
  )
  if (error || !viewer || !adminSupabase) return error!

  const accessCheck = await verifyConversationAccess(adminSupabase, conversationId, viewer)
  if ("error" in accessCheck) return accessCheck.error

  const formData = await request.formData()
  const files = formData.getAll("files").filter((value): value is File => value instanceof File)

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided." }, { status: 400 })
  }

  const uploadResults: Array<{ name: string; path: string; type: string; size: number }> = []
  const storageClient = adminSupabase.storage.from(BUCKET_ID)

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `${file.name} exceeds the 20MB limit.` }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const extension = file.name.split(".").pop()
    const uniqueName = `${Date.now()}-${randomUUID()}.${extension ?? "bin"}`
    const storagePath = `conversation-${conversationId}/${uniqueName}`

    const { error: uploadError } = await storageClient.upload(storagePath, buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    })

    if (uploadError) {
      console.error("[chat-attachments] upload error:", uploadError)
      return NextResponse.json({ error: `Failed to upload ${file.name}.` }, { status: 500 })
    }

    uploadResults.push({
      name: file.name,
      path: storagePath,
      type: file.type || "application/octet-stream",
      size: file.size,
    })
  }

  return NextResponse.json({ files: uploadResults })
}

