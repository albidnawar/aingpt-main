"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ArrowLeft, Download, Loader2, MessageCircle, Paperclip, Send } from "lucide-react"

type AttachmentMeta = {
  name: string
  path: string
  type?: string
  size?: number
}

type ChatConversation = {
  id: string
  caseId: string
  caseTitle: string
  caseNumber: string
  caseStatus?: string | null
  createdAt: string
  counterpart: {
    name: string
    avatarUrl?: string | null
    role: "user" | "lawyer"
    email?: string | null
    phone?: string | null
  }
  lastMessage: ChatMessage | null
}

type ChatMessage = {
  id: string
  content: string
  attachments: AttachmentMeta[]
  createdAt: string
  senderRole: "user" | "lawyer"
}

interface CaseChatViewProps {
  variant: "user" | "lawyer"
}

const formatTimestamp = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

export function CaseChatView({ variant }: CaseChatViewProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [viewerRole, setViewerRole] = useState<"user" | "lawyer">(variant)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true)
    setError(null)
    try {
      const response = await fetch(`/api/chat/conversations?role=${variant}`)
      const body = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to load conversations.")
      }
      setConversations(body?.conversations ?? [])
      if (body?.role === "user" || body?.role === "lawyer") {
        setViewerRole(body.role)
      }
      if (!selectedConversationId && body?.conversations?.length) {
        setSelectedConversationId(String(body.conversations[0].id))
      }
    } catch (err) {
      console.error("Failed to load conversations:", err)
      setError(err instanceof Error ? err.message : "Failed to load conversations.")
      setConversations([])
    } finally {
      setIsLoadingConversations(false)
    }
  }, [selectedConversationId, variant])

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setIsLoadingMessages(true)
      setError(null)
      try {
        const response = await fetch(`/api/chat/conversations/${conversationId}/messages?role=${viewerRole}`)
        const body = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(body?.error ?? "Failed to load messages.")
        }
        setMessages(body?.messages ?? [])
      } catch (err) {
        console.error("Failed to load messages:", err)
        setError(err instanceof Error ? err.message : "Failed to load messages.")
        setMessages([])
      } finally {
        setIsLoadingMessages(false)
      }
    },
    [viewerRole],
  )

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId)
    } else {
      setMessages([])
    }
  }, [selectedConversationId, loadMessages])

  useEffect(() => {
    if (!selectedConversationId) return

    const channel = supabase
      .channel(`chat-messages-${selectedConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${selectedConversationId}`,
        },
        (payload) => {
          const record = payload.new as any
          setMessages((prev) => [
            ...prev,
            {
              id: String(record.id),
              content: record.content ?? "",
              attachments: record.attachments ?? [],
              createdAt: record.created_at,
              senderRole: record.sender_role,
            },
          ])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, selectedConversationId])

  const selectedConversation = conversations.find((conversation) => String(conversation.id) === selectedConversationId) ?? null

  const handleSendMessage = useCallback(async () => {
    if (!selectedConversation || (!messageInput.trim() && pendingFiles.length === 0)) {
      return
    }

    setIsSending(true)
    setError(null)

    try {
      let attachmentsMeta: AttachmentMeta[] = []

      if (pendingFiles.length > 0) {
        const formData = new FormData()
        pendingFiles.forEach((file) => formData.append("files", file))

        const uploadResponse = await fetch(
          `/api/chat/conversations/${selectedConversation.id}/attachments?role=${viewerRole}`,
          {
            method: "POST",
            body: formData,
          },
        )
        const uploadBody = await uploadResponse.json().catch(() => null)
        if (!uploadResponse.ok) {
          throw new Error(uploadBody?.error ?? "Failed to upload attachments.")
        }
        attachmentsMeta = uploadBody?.files ?? []
        setPendingFiles([])
      }

      const response = await fetch(`/api/chat/conversations/${selectedConversation.id}/messages?role=${viewerRole}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageInput, attachments: attachmentsMeta }),
      })
      const body = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to send message.")
      }

      setMessageInput("")
      // message addition handled via realtime; optionally append body.message to avoid delay
      if (body?.message) {
        setMessages((prev) => [...prev, body.message])
      }
    } catch (err) {
      console.error("Failed to send message:", err)
      setError(err instanceof Error ? err.message : "Failed to send message.")
    } finally {
      setIsSending(false)
    }
  }, [messageInput, pendingFiles, selectedConversation, viewerRole])

  const handleDownloadAttachment = useCallback(
    async (attachment: AttachmentMeta) => {
      if (!selectedConversation) return
      try {
        const response = await fetch(
          `/api/chat/attachments?conversationId=${selectedConversation.id}&path=${encodeURIComponent(
            attachment.path,
          )}&name=${encodeURIComponent(attachment.name)}&role=${viewerRole}`,
        )
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error ?? "Failed to download file.")
        }
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = attachment.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (err) {
        console.error("Failed to download attachment:", err)
        setError(err instanceof Error ? err.message : "Failed to download file.")
      }
    },
    [selectedConversation, viewerRole],
  )

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return
    setPendingFiles(Array.from(files))
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
            {viewerRole === "user" ? "Accepted Cases - Chat" : "Client Communication"}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            {viewerRole === "user"
              ? "Chat with lawyers working on your cases"
              : "Chat with your clients about their cases"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadConversations} disabled={isLoadingConversations}>
          {isLoadingConversations ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Refreshing
            </>
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[600px]">
        <div className={`space-y-2 ${selectedConversation ? "hidden lg:block" : "block"} lg:col-span-1`}>
          <h2 className="font-semibold mb-2 text-sm sm:text-base">Conversations</h2>
          {isLoadingConversations ? (
            <Card>
              <CardContent className="p-6 flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading conversations...
              </CardContent>
            </Card>
          ) : conversations.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground text-sm">
                No conversations yet.
              </CardContent>
            </Card>
          ) : (
            conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedConversationId === String(conversation.id) ? "bg-accent/10 border-accent" : "hover:bg-muted",
                )}
                onClick={() => setSelectedConversationId(String(conversation.id))}
              >
                <CardContent className="p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={conversation.counterpart.avatarUrl ?? undefined} />
                      <AvatarFallback>
                        {conversation.counterpart.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{conversation.counterpart.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{conversation.caseTitle}</p>
                    </div>
                  </div>
                  {conversation.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.lastMessage.senderRole === viewerRole ? "You: " : ""}
                      {conversation.lastMessage.content || conversation.lastMessage.attachments.length
                        ? conversation.lastMessage.content ||
                          `${conversation.lastMessage.attachments.length} attachment${conversation.lastMessage.attachments.length > 1 ? "s" : ""}`
                        : "Attachment"}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="lg:col-span-3 flex flex-col bg-card rounded-lg border border-border">
          {selectedConversation ? (
            <>
              <div className="border-b border-border p-3 sm:p-4 flex items-center gap-3">
                <button
                  className="lg:hidden h-8 w-8 flex items-center justify-center rounded-md border border-border"
                  onClick={() => setSelectedConversationId(null)}
                  aria-label="Back to conversation list"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation.counterpart.avatarUrl ?? undefined} />
                  <AvatarFallback>
                    {selectedConversation.counterpart.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-base truncate">{selectedConversation.counterpart.name}</h2>
                    {selectedConversation.caseStatus && (
                      <Badge className="text-xs capitalize">{selectedConversation.caseStatus}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{selectedConversation.caseTitle}</p>
                  <p className="text-xs text-muted-foreground">Case #{selectedConversation.caseNumber}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center text-sm text-muted-foreground gap-2">
                    <MessageCircle className="h-10 w-10 mx-auto" />
                    <p>No messages yet.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn("flex", message.senderRole === viewerRole ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[90%] sm:max-w-md rounded-lg p-3 space-y-2",
                          message.senderRole === viewerRole
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-foreground",
                        )}
                      >
                        {message.content && <p className="text-sm whitespace-pre-line break-words">{message.content}</p>}
                        {message.attachments.length > 0 && (
                          <div className="space-y-2">
                            {message.attachments.map((attachment, index) => (
                              <button
                                key={`${attachment.path}-${index}`}
                                className="flex items-center gap-2 text-xs underline w-full text-left"
                                onClick={() => handleDownloadAttachment(attachment)}
                              >
                                <Download className="h-4 w-4 shrink-0" />
                                <span className="truncate break-all">{attachment.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        <p className="text-xs opacity-70">{formatTimestamp(message.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-border p-3 sm:p-4 space-y-2">
                {pendingFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {pendingFiles.map((file) => (
                      <span key={file.name} className="bg-muted px-2 py-1 rounded-md">
                        {file.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={isSending} className="shrink-0">
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelection}
                />
              </div>
            </>
          ) : (
            <Card className="flex items-center justify-center h-full">
              <CardContent className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">Select a conversation to start chatting</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

