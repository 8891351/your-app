"use client"

import { useState, useEffect, useSyncExternalStore } from "react"
import Link from "next/link"
import {
  Database,
  PlusCircle,
  Search,
  Trash2,
  RefreshCw,
  Mail,
  User,
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import {
  subscribeSubmissions,
  deleteUserSubmission,
  envFirebaseConfig,
  isValidConfig,
  type UserSubmission,
  type FirebaseConfig,
} from "@/lib/firebase"

const CATEGORIES = ["All", "Feedback", "Inquiry", "Feature Request", "General Info"]

function formatTimestamp(ts?: string | { seconds: number; nanoseconds: number } | null): string {
  if (!ts) return "Just now"
  if (typeof ts === "string") {
    try {
      return new Date(ts).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return ts
    }
  }
  if (typeof ts === "object" && "seconds" in ts) {
    return new Date(ts.seconds * 1000).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  return "Just now"
}

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

function getInitialSubmissions(): UserSubmission[] {
  if (typeof window === "undefined") return []
  const saved = localStorage.getItem("local_user_submissions")
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return []
    }
  }
  return [
    {
      id: "demo-1",
      name: "Alex Morgan",
      email: "alex@example.com",
      category: "Feedback",
      message: "The Firebase integration is working smoothly! Add your credentials to persist to Firestore.",
      createdAt: new Date().toISOString(),
    },
  ]
}

const emptySubscribe = () => () => {}

export default function DisplayDataPage() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  const [submissions, setSubmissions] = useState<UserSubmission[]>(getInitialSubmissions)
  const [isLoading, setIsLoading] = useState(() => getActiveConfig().isConfigured)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const { config, isConfigured } = getActiveConfig()

  useEffect(() => {
    if (!mounted || !isConfigured) return

    const unsubscribe = subscribeSubmissions((items) => {
      setSubmissions(items)
      setIsLoading(false)
    }, config)

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [mounted, isConfigured, config])

  const handleDelete = async (id?: string) => {
    if (!id) return
    try {
      if (isConfigured) {
        await deleteUserSubmission(id, config)
        toast.add({
          type: "success",
          title: "Deleted",
          description: "Record removed from Cloud Firestore.",
        })
      } else {
        const updated = submissions.filter((item) => item.id !== id)
        setSubmissions(updated)
        localStorage.setItem("local_user_submissions", JSON.stringify(updated))
        toast.add({
          type: "info",
          title: "Deleted",
          description: "Record removed from local storage.",
        })
      }
    } catch (err: unknown) {
      console.error(err)
      toast.add({
        type: "error",
        title: "Delete Failed",
        description: err instanceof Error ? err.message : "Unable to delete entry.",
      })
    }
  }

  // Filter submissions by search query & category
  const filteredSubmissions = submissions.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q)

    return matchesCategory && matchesSearch
  })

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
            <Database className="size-3.5" />
            <span>Page 2 of 2: Stored Data Display</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Display Entered Data</h1>
            <Badge variant="outline" className="text-xs font-mono">
              {submissions.length} {submissions.length === 1 ? "record" : "records"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isConfigured
              ? `Real-time synchronization with Firestore (${config.projectId})`
              : "Showing demo records from local storage"}
          </p>
        </div>

        <Link
          href="/"
          className={cn(buttonVariants({ variant: "default" }), "gap-2 shrink-0")}
        >
          <PlusCircle className="size-4" />
          Enter New Data
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="mb-6 shadow-2xs border-border/70">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
            <span className="text-xs font-medium text-muted-foreground mr-1">Filter:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary font-medium"
                    : "bg-muted/40 text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <RefreshCw className="size-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading Firestore documents...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-2xl p-8 bg-muted/10">
            <div className="size-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
              <Database className="size-6" />
            </div>
            <p className="text-base font-semibold">No records found</p>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              {searchQuery || selectedCategory !== "All"
                ? "No entries match your current search or category filter."
                : "No data has been entered into the database yet."}
            </p>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5"
              )}
            >
              <PlusCircle className="size-3.5" />
              Go to Enter Data Page
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSubmissions.map((item) => (
              <Card
                key={item.id}
                className="group border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-primary shrink-0" />
                        <CardTitle className="text-base truncate font-semibold">
                          {item.name}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 truncate">
                        <Mail className="size-3 shrink-0" />
                        <span>{item.email}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0 font-normal">
                      {item.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pb-3 flex-1">
                  {item.message ? (
                    <div className="bg-muted/40 p-3 rounded-lg text-xs leading-relaxed whitespace-pre-wrap text-foreground/90 border border-border/30">
                      {item.message}
                    </div>
                  ) : (
                    <p className="text-xs italic text-muted-foreground/60">No notes provided</p>
                  )}
                </CardContent>

                <div className="px-6 py-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-mono">
                    {formatTimestamp(item.createdAt)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="size-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
