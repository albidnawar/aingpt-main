"use client"

import { useState } from "react"
import { LawyerDashboardLayout } from "@/components/lawyer-dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  Send,
  Phone,
  Mail,
  FileText,
  Calendar,
  DollarSign,
  Paperclip,
  Info,
  X,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ClientCase {
  id: string
  clientName: string
  caseTitle: string
  caseNumber: string
  clientPhoto?: string
  status: "accepted" | "in_progress" | "completed" | "on_hold"
  messages: Message[]
  phone: string
  email: string
  consultationFee: string
  caseType: string
  lastMessageTime: string
}

interface Message {
  id: string
  sender: "client" | "lawyer"
  content: string
  timestamp: string
  attachments?: string[]
}

const mockClientCases: ClientCase[] = [
  {
    id: "1",
    clientName: "Ahmed Rahman",
    caseTitle: "Property Dispute - Land ownership dispute",
    caseNumber: "2024-001",
    status: "in_progress",
    phone: "+880 1712-345678",
    email: "ahmed.rahman@email.com",
    consultationFee: "৳2,000",
    caseType: "Civil",
    lastMessageTime: "2 hours ago",
    messages: [
      {
        id: "1",
        sender: "lawyer",
        content: "Hello Mr. Rahman, I have reviewed your case documents. I believe we have a strong case regarding the property boundary dispute.",
        timestamp: "2024-02-01 10:30 AM",
      },
      {
        id: "2",
        sender: "client",
        content: "Thank you! Can you help with the property boundary issue? The neighbor is claiming 500 square feet of our land.",
        timestamp: "2024-02-01 11:00 AM",
      },
      {
        id: "3",
        sender: "lawyer",
        content: "Yes, absolutely. Based on the survey report you provided, the boundary is clearly defined. I recommend we proceed with filing the appropriate documents. Would you like to schedule a meeting to discuss the strategy?",
        timestamp: "2024-02-01 11:15 AM",
      },
      {
        id: "4",
        sender: "client",
        content: "That sounds good. When would be convenient for you?",
        timestamp: "2024-02-01 02:30 PM",
      },
    ],
  },
  {
    id: "2",
    clientName: "Mohammad Hassan",
    caseTitle: "Assault Case - Public assault incident",
    caseNumber: "2024-002",
    status: "accepted",
    phone: "+880 1945-678901",
    email: "m.hassan@email.com",
    consultationFee: "৳3,500",
    caseType: "Criminal",
    lastMessageTime: "1 day ago",
    messages: [
      {
        id: "1",
        sender: "lawyer",
        content: "Hello Mr. Hassan, I've reviewed your FIR and medical reports. We should proceed with gathering witness statements. Please prepare a list of witnesses who can testify.",
        timestamp: "2024-02-05 09:00 AM",
      },
      {
        id: "2",
        sender: "client",
        content: "Thank you. I'll prepare the list and send it to you.",
        timestamp: "2024-02-05 10:00 AM",
      },
    ],
  },
  {
    id: "3",
    clientName: "Fatima Begum",
    caseTitle: "Divorce Case - Mutual divorce proceedings",
    caseNumber: "2024-015",
    status: "completed",
    phone: "+880 1755-123456",
    email: "fatima.begum@email.com",
    consultationFee: "৳5,000",
    caseType: "Family",
    lastMessageTime: "3 days ago",
    messages: [
      {
        id: "1",
        sender: "lawyer",
        content: "The divorce proceedings have been completed successfully. All documents have been filed and approved by the court. You should receive the final decree within 7-10 business days.",
        timestamp: "2024-02-15 11:00 AM",
      },
      {
        id: "2",
        sender: "client",
        content: "Thank you so much for your help throughout this process.",
        timestamp: "2024-02-15 11:30 AM",
      },
    ],
  },
]

export default function LawyerAcceptedCasesChatPage() {
  const [cases] = useState<ClientCase[]>(mockClientCases)
  const [selectedCase, setSelectedCase] = useState<ClientCase | null>(cases[0] || null)
  const [messageInput, setMessageInput] = useState("")
  const [showCaseDetails, setShowCaseDetails] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedCase) {
      const newMessage: Message = {
        id: String(selectedCase.messages.length + 1),
        sender: "lawyer",
        content: messageInput,
        timestamp: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
      }
      selectedCase.messages.push(newMessage)
      setMessageInput("")
    }
  }

  const filteredCases = filterStatus === "all"
    ? cases
    : cases.filter((c) => c.status === filterStatus)

  const getStatusColor = (status: ClientCase["status"]) => {
    switch (status) {
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "on_hold":
        return "bg-gray-100 text-gray-800"
      default:
        return ""
    }
  }

  const getStatusLabel = (status: ClientCase["status"]) => {
    switch (status) {
      case "accepted":
        return "Accepted"
      case "in_progress":
        return "In Progress"
      case "completed":
        return "Completed"
      case "on_hold":
        return "On Hold"
      default:
        return status
    }
  }

  return (
    <LawyerDashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
              Client Communication
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Chat with your clients about their cases
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-32 text-xs sm:text-sm">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cases</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[600px]">
          {/* Cases List - Mobile: Hidden when chat is open, Desktop: Always visible */}
          <div className={`lg:col-span-1 space-y-2 ${selectedCase ? 'hidden lg:block' : 'block'}`}>
            <h2 className="font-semibold mb-4 text-sm sm:text-base">Client Cases</h2>
            {filteredCases.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground">No cases found</p>
                </CardContent>
              </Card>
            ) : (
              filteredCases.map((caseItem) => (
                <Card
                  key={caseItem.id}
                  className={`cursor-pointer transition-colors ${
                    selectedCase?.id === caseItem.id
                      ? "bg-accent/10 border-accent"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedCase(caseItem)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-xs sm:text-sm truncate mb-1">
                          {caseItem.clientName}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                          {caseItem.caseTitle}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`${getStatusColor(caseItem.status)} text-xs shrink-0`}>
                            {getStatusLabel(caseItem.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">#{caseItem.caseNumber}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {caseItem.lastMessageTime}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Chat Area */}
          {selectedCase ? (
            <div className="lg:col-span-3 flex flex-col bg-card rounded-lg border border-border h-full">
              {/* Header */}
              <div className="border-b border-border p-3 sm:p-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="lg:hidden mr-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                    <AvatarImage src={selectedCase.clientPhoto || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {selectedCase.clientName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-semibold text-sm sm:text-base truncate">
                        {selectedCase.clientName}
                      </h2>
                      <Badge className={`${getStatusColor(selectedCase.status)} text-xs shrink-0`}>
                        {getStatusLabel(selectedCase.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{selectedCase.caseTitle}</p>
                    <p className="text-xs text-muted-foreground">Case #{selectedCase.caseNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                    title="View Case Details"
                    onClick={() => setShowCaseDetails(!showCaseDetails)}
                  >
                    <Info className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Details</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                    title="Call Client"
                  >
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Call</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 hidden sm:flex"
                    title="Email Client"
                  >
                    <Mail className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Email</span>
                  </Button>
                </div>
              </div>

              {/* Case Details Panel */}
              {showCaseDetails && (
                <div className="border-b border-border p-3 sm:p-4 bg-muted/30">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Case Type</p>
                      <p className="font-medium">{selectedCase.caseType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Consultation Fee</p>
                      <p className="font-medium text-accent">{selectedCase.consultationFee}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Phone</p>
                      <p className="font-medium truncate">{selectedCase.phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Email</p>
                      <p className="font-medium truncate">{selectedCase.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0">
                {selectedCase.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No messages yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Start the conversation with your client
                      </p>
                    </div>
                  </div>
                ) : (
                  selectedCase.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "lawyer" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-xs rounded-lg p-2 sm:p-3 ${
                          message.sender === "lawyer"
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-xs sm:text-sm break-words">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {message.attachments.map((att, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1 text-xs bg-black/10 dark:bg-white/10 rounded px-2 py-1"
                              >
                                <FileText className="h-3 w-3" />
                                <span className="truncate max-w-[100px]">{att}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="border-t border-border p-3 sm:p-4">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 sm:h-10 shrink-0"
                    title="Attach File"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type your message to client..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="text-sm sm:text-base"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-accent hover:bg-accent/90 shrink-0"
                    disabled={!messageInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => {
                      setMessageInput(
                        "I've reviewed your case documents. Let's schedule a meeting to discuss the next steps. What time works best for you?"
                      )
                    }}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Schedule Meeting
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => {
                      setMessageInput(
                        "Please find the case update document attached. Please review and let me know if you have any questions."
                      )
                    }}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Case Update
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => {
                      setMessageInput(
                        "The consultation fee invoice has been sent to your email. Please proceed with the payment at your earliest convenience."
                      )
                    }}
                  >
                    <DollarSign className="h-3 w-3 mr-1" />
                    Payment Reminder
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Card className="lg:col-span-3 flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center py-12 px-4">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-sm sm:text-base">
                  Select a client case to start chatting
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </LawyerDashboardLayout>
  )
}
