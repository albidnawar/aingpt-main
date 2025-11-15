"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mic, Send, User, Bot, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatInterfaceProps {
  className?: string
  showUpgradePrompt?: boolean
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function ChatInterface({ className, showUpgradePrompt = false, onFileUpload }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI legal assistant. How can I help you with your legal questions today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Thank you for your question about "${message}". Based on general legal principles, I can provide some guidance. However, please remember that this is AI-generated information and should not be considered as professional legal advice. For specific legal matters, I recommend consulting with a qualified attorney who can review your particular circumstances.

Would you like me to help you find lawyers in your area who specialize in this type of legal issue?`,
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const toggleVoiceInput = () => {
    setIsListening(!isListening)
    // Voice-to-text functionality would be implemented here
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-4", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <Avatar className="w-10 h-10 bg-primary/10 flex-shrink-0">
                <AvatarFallback>
                  <Bot className="h-5 w-5 text-primary" />
                </AvatarFallback>
              </Avatar>
            )}
            <div className={cn("max-w-[75%]", msg.role === "user" ? "order-first" : "")}>
              <Card
                className={cn(
                  "p-4 shadow-sm rounded-2xl overflow-hidden border",
                  msg.role === "user" ? "bg-primary text-primary-foreground ml-auto border-primary/20" : "bg-card border-border",
                )}
              >
                <CardContent className="p-0">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </CardContent>
              </Card>
              <p className="text-xs text-muted-foreground mt-2 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            {msg.role === "user" && (
              <Avatar className="w-10 h-10 bg-secondary flex-shrink-0">
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4">
            <Avatar className="w-10 h-10 bg-primary/10 flex-shrink-0">
              <AvatarFallback>
                <Bot className="h-5 w-5 text-primary" />
              </AvatarFallback>
            </Avatar>
            <Card className="p-4 shadow-sm rounded-2xl overflow-hidden border">
              <CardContent className="p-0">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showUpgradePrompt && messages.length > 4 && (
        <div className="px-6 pb-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-medium text-sm">Continue chatting</h4>
                  <p className="text-xs text-muted-foreground mt-1">Upgrade for unlimited conversations</p>
                </div>
                <Button size="sm" className="flex-shrink-0">
                  Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="p-4 sm:p-6 border-t border-border bg-card/50">
        <div className="space-y-3">
          <div className="relative flex items-center gap-2">
            {/* Mobile: File Upload Button */}
            {onFileUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.doc"
                  className="hidden"
                  onChange={onFileUpload}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="lg:hidden h-8 w-8 p-0 flex-shrink-0"
                  disabled={isLoading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </>
            )}
            <div className="relative flex-1 flex items-center">
              <Textarea
                placeholder="Ask your legal question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[44px] max-h-[44px] pr-24 resize-none text-sm overflow-hidden py-2.5 leading-normal"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                disabled={isLoading}
              />
              <div className="absolute top-1/2 -translate-y-1/2 right-2 flex gap-2">
                <Button
                  size="sm"
                  variant={isListening ? "default" : "outline"}
                  onClick={toggleVoiceInput}
                  disabled={isLoading}
                  className="h-8 w-8 p-0"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  className="h-8 w-8 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            AI-generated responses are for informational purposes only, not legal advice
          </p>
        </div>
      </div>
    </div>
  )
}
