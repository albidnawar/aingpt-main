import { NextResponse } from "next/server"

import { createAdminSupabaseClient } from "@/lib/supabase-admin"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export type ViewerContext = {
  role: "user" | "lawyer"
  userId?: number
  lawyerId?: number
  authUserId: string
}

export async function getViewerWithAdmin(preferredRole?: "user" | "lawyer") {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) }
  }

  const [userRecordRes, lawyerRecordRes] = await Promise.all([
    adminSupabase.from("users").select("id, auth_user_id").eq("auth_user_id", session.user.id).maybeSingle(),
    adminSupabase.from("lawyers").select("id, auth_user_id").eq("auth_user_id", session.user.id).maybeSingle(),
  ])

  const buildViewer = () => {
    if (preferredRole === "lawyer" && lawyerRecordRes.data) {
      return { role: "lawyer" as const, lawyerId: lawyerRecordRes.data.id, authUserId: session.user.id }
    }
    if (preferredRole === "user" && userRecordRes.data) {
      return { role: "user" as const, userId: userRecordRes.data.id, authUserId: session.user.id }
    }
    if (userRecordRes.data) {
      return { role: "user" as const, userId: userRecordRes.data.id, authUserId: session.user.id }
    }
    if (lawyerRecordRes.data) {
      return { role: "lawyer" as const, lawyerId: lawyerRecordRes.data.id, authUserId: session.user.id }
    }
    return null
  }

  const viewer = buildViewer()

  if (!viewer) {
    return { error: NextResponse.json({ error: "Profile not found for current session." }, { status: 403 }) }
  }

  return { viewer, adminSupabase }
}

export async function verifyConversationAccess(
  adminSupabase: ReturnType<typeof createAdminSupabaseClient>,
  conversationId: number,
  viewer: ViewerContext,
) {
  const { data, error } = await adminSupabase
    .from("chat_conversations")
    .select("id, user_id, lawyer_id, case_id")
    .eq("id", conversationId)
    .maybeSingle()

  if (error) {
    console.error("[chat] conversation lookup error:", error)
    return { error: NextResponse.json({ error: "Failed to load conversation." }, { status: 500 }) }
  }

  if (!data) {
    return { error: NextResponse.json({ error: "Conversation not found." }, { status: 404 }) }
  }

  if (
    (viewer.role === "user" && data.user_id !== viewer.userId) ||
    (viewer.role === "lawyer" && data.lawyer_id !== viewer.lawyerId)
  ) {
    return { error: NextResponse.json({ error: "You are not a participant in this conversation." }, { status: 403 }) }
  }

  return { conversation: data }
}

