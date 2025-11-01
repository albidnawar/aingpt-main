"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Scale, MessageCircle, FileText, Users, BookOpen, Mic, ArrowRight } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [message, setMessage] = useState("")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const router = useRouter()

  const handleSendMessage = () => {
    if (message.trim()) {
      setShowAuthModal(true)
    }
  }

  const handleLogin = () => {
    router.push("/dashboard")
  }

  const toggleVoiceInput = () => {
    setIsListening(!isListening)
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 animate-fade-in">
            <Scale className="h-8 w-8 text-accent" />
            <span className="text-2xl font-bold text-foreground">AinGPT</span>
          </div>
          <Button
            onClick={() => setShowAuthModal(true)}
            className="bg-primary hover:bg-primary/90 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Login / Signup
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="container mx-auto text-center max-w-3xl">
          <div className="animate-fade-in-up mb-8">
            <h1 className="text-6xl font-bold text-foreground mb-4 text-balance">Legal Help, Simplified</h1>
            <p className="text-lg text-muted-foreground">AI-powered legal guidance at your fingertips</p>
          </div>

          {/* Guest Chat Interface */}
          <Card
            className="max-w-2xl mx-auto mb-16 animate-fade-in-up border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300"
            style={{ animationDelay: "0.2s" }}
          >
            <CardContent className="pt-6 space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="Ask your legal question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[80px] pr-12 resize-none"
                />
                <Button
                  size="sm"
                  variant={isListening ? "default" : "outline"}
                  className="absolute bottom-2 right-2 transition-all duration-200"
                  onClick={toggleVoiceInput}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleSendMessage} className="w-full group" size="lg">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Features Grid - Minimal */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {[
              { icon: MessageCircle, label: "AI Chat" },
              { icon: FileText, label: "Document Analysis" },
              { icon: Users, label: "Lawyer Network" },
              { icon: BookOpen, label: "Legal Resources" },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-lg border border-border/50 hover:border-accent/50 transition-all duration-300 cursor-pointer animate-fade-in-up hover:bg-card/50"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <feature.icon className="h-8 w-8 text-accent mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-foreground">{feature.label}</p>
              </div>
            ))}
          </div>

          {/* Pricing - Minimal Cards */}
          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { name: "Free", price: "0", features: ["Basic chat", "1 document", "Limited responses"] },
              { name: "Bronze", price: "500", features: ["Advanced chat", "10 documents", "Summaries"], popular: true },
              { name: "Gold", price: "1000", features: ["Unlimited analysis", "Citations", "Export features"] },
            ].map((plan, index) => (
              <Card
                key={index}
                className={`animate-fade-in-up transition-all duration-300 hover:shadow-lg ${
                  plan.popular ? "border-accent/50 bg-card/80" : "border-border/50"
                }`}
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{plan.name}</h3>
                  <div className="text-2xl font-bold mb-4">
                    ৳{plan.price}
                    <span className="text-xs font-normal text-muted-foreground">/mo</span>
                  </div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {plan.features.map((feature, i) => (
                      <li key={i}>• {feature}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLogin={handleLogin} />

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
