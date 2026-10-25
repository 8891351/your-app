"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Send,
  User,
  Mail,
  Tag,
  MessageSquare,
  RefreshCw,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Database,
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import {
  saveUserSubmission,
  envFirebaseConfig,
  isValidConfig,
  type UserSubmission,
  type FirebaseConfig,
} from "@/lib/firebase"

const CATEGORIES = ["Feedback", "Inquiry", "Feature Request", "General Info"]

function getActiveConfig(): { config: FirebaseConfig; isConfigured: boolean } {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("firebase_custom_config")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (isValidConfig(parsed)) {
          return { config: parsed, isConfigured: true }
        }
      } catch {
        // ignore
      }
    }
  }
  return {
    config: envFirebaseConfig,
    isConfigured: isValidConfig(envFirebaseConfig),
  }
}

export default function EnterDataPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [category, setCategory] = useState(CATEGORIES[0])
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      toast.add({
        type: "warning",
        title: "Required Fields",
        description: "Please enter your name and email address.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { config, isConfigured } = getActiveConfig()

      if (isConfigured) {
        const docId = await saveUserSubmission(
          {
            name: name.trim(),
            email: email.trim(),
            category,
            message: message.trim(),
          },
          config
        )
        setLastSubmittedId(docId)
        toast.add({
          type: "success",
          title: "Saved to Firebase!",
          description: "Your record is now stored in Cloud Firestore.",
        })
      } else {
        // Fallback local storage demo mode
        const existingData: UserSubmission[] = JSON.parse(
          localStorage.getItem("local_user_submissions") || "[]"
        )
        const newEntry: UserSubmission = {
          id: `local-${Date.now()}`,
          name: name.trim(),
          email: email.trim(),
          category,
          message: message.trim(),
          createdAt: new Date().toISOString(),
        }
        localStorage.setItem(
          "local_user_submissions",
          JSON.stringify([newEntry, ...existingData])
        )
        setLastSubmittedId(newEntry.id || "demo")
        toast.add({
          type: "info",
          title: "Saved in Demo Mode",
          description: "Connect Firebase credentials to persist directly to Cloud Firestore.",
        })
      }

      // Clear input fields
      setName("")
      setEmail("")
      setMessage("")
    } catch (err: unknown) {
      console.error(err)
      toast.add({
        type: "error",
        title: "Submission Error",
        description: err instanceof Error ? err.message : "Failed to save record.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {/* Page Header */}
      <div className="mb-8 text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-1">
          <Sparkles className="size-3.5" />
          <span>Page 1 of 2: Data Entry</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Enter User Information</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Submit records below to be stored in the Firebase Firestore database.
        </p>
      </div>

      {/* Success Notification Alert */}
      {lastSubmittedId && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-emerald-600 dark:text-emerald-400">
                Information saved successfully!
              </p>
              <p className="text-xs text-muted-foreground">
                Record stored. You can view all entries on the display page.
              </p>
            </div>
          </div>
          <Link
            href="/data"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "shrink-0 gap-1.5 text-xs"
            )}
          >
            View All Data
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* Form Card */}
      <Card className="shadow-sm border-border/80">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="size-4 text-primary" />
            <span>New Information Record</span>
          </CardTitle>
          <CardDescription className="text-xs">
            All fields submitted will be pushed directly to Firestore
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 text-sm">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <User className="size-3.5" /> Full Name *
              </label>
              <Input
                placeholder="e.g. John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Mail className="size-3.5" /> Email Address *
              </label>
              <Input
                type="email"
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Category / Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Tag className="size-3.5" /> Category
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      category === cat
                        ? "bg-primary text-primary-foreground border-primary font-medium shadow-xs"
                        : "bg-muted/40 text-muted-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Message / Details */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <MessageSquare className="size-3.5" /> Message / Notes
              </label>
              <Textarea
                placeholder="Type any message, feedback, inquiry, or custom user details here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-border/40 pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setName("")
                setEmail("")
                setMessage("")
                setLastSubmittedId(null)
              }}
            >
              Reset Form
            </Button>
            <div className="flex items-center gap-2">
              <Link
                href="/data"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-1.5"
                )}
              >
                <Database className="size-3.5" />
                View Entries
              </Link>
              <Button type="submit" size="sm" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" />
                    Save Record
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
