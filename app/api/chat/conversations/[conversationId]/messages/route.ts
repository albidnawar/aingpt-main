import { NextResponse } from "next/server"

import { getViewerWithAdmin, verifyConversationAccess } from "@/app/api/chat/utils"

const serializeMessages = (rows: any[]) =>
  rows.map((row) => ({
    id: row.id,
    content: row.content ?? "",
    attachments: row.attachments ?? [],
    createdAt: row.created_at,
    senderRole: row.sender_role,
  }))

export async function GET(
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

  const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200)
  const before = url.searchParams.get("before")

  let query = adminSupabase
    .from("chat_messages")
    .select("id, content, attachments, created_at, sender_role")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (before) {
    query = query.lt("created_at", before)
  }

  const { data, error: messageError } = await query

  if (messageError) {
    console.error("[chat-messages] fetch error:", messageError)
    return NextResponse.json({ error: "Failed to load messages." }, { status: 500 })
  }

  const messages = serializeMessages((data ?? []).reverse())
  return NextResponse.json({ messages })
}

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

  const body = await request.json().catch(() => null)
  const { content = "", attachments = [] } = body ?? {}

  if (!content.trim() && (!Array.isArray(attachments) || attachments.length === 0)) {
    return NextResponse.json({ error: "Message must include text or attachments." }, { status: 400 })
  }

  const { data, error: insertError } = await adminSupabase
    .from("chat_messages")
    .insert({
      conversation_id: conversationId,
      sender_role: viewer.role,
      sender_auth_user_id: viewer.authUserId,
      content: content.trim(),
      attachments,
    })
    .select("id, content, attachments, created_at, sender_role")
    .single()

  if (insertError) {
    console.error("[chat-messages] insert error:", insertError)
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 })
  }

  return NextResponse.json({ message: serializeMessages([data])[0] })
}

