import { NextResponse } from "next/server"

import { getViewerWithAdmin } from "@/app/api/chat/utils"

const mapConversation = (record: any, viewerRole: "user" | "lawyer") => {
  const lastMessage =
    Array.isArray(record.chat_messages) && record.chat_messages.length > 0 ? record.chat_messages[0] : null
  const cases = record.cases ?? {}
  const lawyer = record.lawyer ?? {}
  const user = record.user ?? {}

  const counterpart =
    viewerRole === "user"
      ? {
          name: lawyer.full_name ?? lawyer.lawyer_id ?? "Lawyer",
          avatarUrl: lawyer.avatar_url ?? null,
          email: lawyer.email ?? null,
          phone: lawyer.phone ?? null,
          role: "lawyer",
        }
      : {
          name: user.full_name ?? user.username ?? "Client",
          avatarUrl: user.avatar_url ?? null,
          email: user.email ?? null,
          phone: user.phone ?? null,
          role: "user",
        }

  return {
    id: record.id,
    caseId: record.case_id,
    caseTitle: cases.case_title ?? "Untitled Case",
    caseNumber: cases.case_number ?? "N/A",
    caseStatus: cases.status ?? null,
    createdAt: record.created_at,
    counterpart,
    lastMessage: lastMessage
      ? {
          id: lastMessage.id,
          content: lastMessage.content ?? "",
          attachments: lastMessage.attachments ?? [],
          createdAt: lastMessage.created_at,
          senderRole: lastMessage.sender_role,
        }
      : null,
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const requestedRole = url.searchParams.get("role")

    const { viewer, adminSupabase, error } = await getViewerWithAdmin(
      requestedRole === "lawyer" || requestedRole === "user" ? (requestedRole as "user" | "lawyer") : undefined,
    )
    if (error || !viewer || !adminSupabase) return error!

    const filterColumn = viewer.role === "user" ? "user_id" : "lawyer_id"
    const filterValue = viewer.role === "user" ? viewer.userId : viewer.lawyerId

    const { data, error: conversationsError } = await adminSupabase
      .from("chat_conversations")
      .select(
        `
        id,
        case_id,
        created_at,
        cases (
          case_number,
          case_title,
          status
        ),
        user:user_id (
          id,
          full_name,
          username,
          avatar_url,
          email,
          phone,
          auth_user_id
        ),
        lawyer:lawyer_id (
          id,
          full_name,
          avatar_url,
          email,
          phone,
          lawyer_id,
          auth_user_id
        ),
        chat_messages!chat_messages_conversation_id_fkey (
          id,
          content,
          attachments,
          created_at,
          sender_role
        )
      `,
        { count: "exact" },
      )
      .eq(filterColumn, filterValue!)
      .order("created_at", { ascending: false })

    if (conversationsError) {
      console.error("[chat-conversations] fetch error:", conversationsError)
      return NextResponse.json({ error: "Failed to load conversations." }, { status: 500 })
    }

    const conversations = (data ?? []).map((record) => mapConversation(record, viewer.role))

    return NextResponse.json({
      role: viewer.role,
      conversations,
    })
  } catch (error) {
    console.error("[chat-conversations] unexpected error:", error)
    return NextResponse.json({ error: "Unexpected error while loading conversations." }, { status: 500 })
  }
}

