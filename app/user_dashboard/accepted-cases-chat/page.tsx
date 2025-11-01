"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Phone, Mail } from "lucide-react"

interface AcceptedCase {
  id: string
  lawyerName: string
  caseTitle: string
  caseNumber: string
  lawyerPhoto?: string
  status: "active" | "completed" | "pending_confirmation"
  messages: Message[]
  phone: string
  email: string
}

interface Message {
  id: string
  sender: "user" | "lawyer"
  content: string
  timestamp: string
}

const mockAcceptedCases: AcceptedCase[] = [
  {
    id: "1",
    lawyerName: "Sarah Ahmed",
    caseTitle: "Property Dispute",
    caseNumber: "2024-001",
    lawyerPhoto: "/professional-woman-lawyer.png",
    status: "active",
    phone: "+880 1712-345678",
    email: "sarah.ahmed@lawyers.com",
    messages: [
      {
        id: "1",
        sender: "lawyer",
        content: "Hello! I have reviewed your case. I believe I can help you effectively.",
        timestamp: "2024-02-01 10:30 AM",
      },
      {
        id: "2",
        sender: "user",
        content: "Thank you! Can you help with the property boundary issue?",
        timestamp: "2024-02-01 11:00 AM",
      },
      {
        id: "3",
        sender: "lawyer",
        content: "Yes, absolutely. I have handled similar cases. My consultation fee is ৳2000 for the initial meeting.",
        timestamp: "2024-02-01 11:15 AM",
      },
    ],
  },
  {
    id: "2",
    lawyerName: "Mohammad Rahman",
    caseTitle: "Assault Case",
    caseNumber: "2024-002",
    lawyerPhoto: "/professional-lawyer.png",
    status: "pending_confirmation",
    phone: "+880 1945-678901",
    email: "rahman@lawyers.com",
    messages: [
      {
        id: "1",
        sender: "lawyer",
        content: "Hi! I'm interested in your case. Let me know if you'd like to proceed.",
        timestamp: "2024-02-03 03:00 PM",
      },
    ],
  },
]

export default function AcceptedCasesChatPage() {
  const [cases] = useState<AcceptedCase[]>(mockAcceptedCases)
  const [selectedCase, setSelectedCase] = useState<AcceptedCase | null>(cases[0] || null)
  const [messageInput, setMessageInput] = useState("")

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedCase) {
      const newMessage: Message = {
        id: String(selectedCase.messages.length + 1),
        sender: "user",
        content: messageInput,
        timestamp: new Date().toLocaleString(),
      }
      selectedCase.messages.push(newMessage)
      setMessageInput("")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="h-8 w-8 text-accent" />
            Accepted Cases - Chat
          </h1>
          <p className="text-muted-foreground">Communicate with lawyers who have accepted your cases</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
          {/* Cases List */}
          <div className="lg:col-span-1 space-y-2">
            <h2 className="font-semibold mb-4">My Accepted Cases</h2>
            {cases.map((caseItem) => (
              <Card
                key={caseItem.id}
                className={`cursor-pointer transition-colors ${
                  selectedCase?.id === caseItem.id ? "bg-accent/10 border-accent" : "hover:bg-muted"
                }`}
                onClick={() => setSelectedCase(caseItem)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-sm truncate">{caseItem.caseTitle}</h3>
                    <Badge className="text-xs" variant={caseItem.status === "active" ? "default" : "secondary"}>
                      {caseItem.status === "active" ? "Active" : "Pending"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{caseItem.lawyerName}</p>
                  <p className="text-xs text-muted-foreground">Case #{caseItem.caseNumber}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chat Area */}
          {selectedCase ? (
            <div className="lg:col-span-2 flex flex-col bg-card rounded-lg border border-border">
              {/* Header */}
              <div className="border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedCase.lawyerPhoto || "/placeholder.svg"} />
                    <AvatarFallback>
                      {selectedCase.lawyerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">{selectedCase.lawyerName}</h2>
                    <p className="text-xs text-muted-foreground">{selectedCase.caseTitle}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedCase.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg p-3 ${
                        message.sender === "user" ? "bg-accent text-accent-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} className="bg-accent hover:bg-accent/90">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Card className="lg:col-span-2 flex items-center justify-center">
              <CardContent className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a case to start chatting</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
