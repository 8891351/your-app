"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Flame,
  Settings,
  Sun,
  Moon,
  ExternalLink,
  PlusCircle,
  Database,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast"
import {
  envFirebaseConfig,
  isValidConfig,
  type FirebaseConfig,
} from "@/lib/firebase"

function getSavedConfig(): FirebaseConfig | null {
  if (typeof window === "undefined") return null
  const saved = localStorage.getItem("firebase_custom_config")
  if (!saved) return null
  try {
    const parsed = JSON.parse(saved) as FirebaseConfig
    if (isValidConfig(parsed)) return parsed
  } catch {
    // ignore
  }
  return null
}

const emptySubscribe = () => () => {}

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  const [isConfigured, setIsConfigured] = useState(() => {
    const saved = getSavedConfig()
    return saved ? true : isValidConfig(envFirebaseConfig)
  })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [customApiKey, setCustomApiKey] = useState(() => getSavedConfig()?.apiKey || "")
  const [customProjectId, setCustomProjectId] = useState(() => getSavedConfig()?.projectId || "")
  const [customAuthDomain, setCustomAuthDomain] = useState(() => getSavedConfig()?.authDomain || "")

  const handleSaveCustomConfig = () => {
    if (!customApiKey.trim() || !customProjectId.trim()) {
      toast.add({
        type: "warning",
        title: "Incomplete Config",
        description: "API Key and Project ID are required.",
      })
      return
    }

    const newConfig: FirebaseConfig = {
      apiKey: customApiKey.trim(),
      projectId: customProjectId.trim(),
      authDomain: customAuthDomain.trim() || `${customProjectId.trim()}.firebaseapp.com`,
    }

    localStorage.setItem("firebase_custom_config", JSON.stringify(newConfig))
    setIsConfigured(true)
    setIsSettingsOpen(false)

    toast.add({
      type: "success",
      title: "Firebase Configured!",
      description: `Now connected to project: ${customProjectId.trim()}`,
    })

    window.location.reload()
  }

  const handleResetToEnv = () => {
    localStorage.removeItem("firebase_custom_config")
    setIsConfigured(isValidConfig(envFirebaseConfig))
    setCustomApiKey("")
    setCustomProjectId("")
    setCustomAuthDomain("")
    setIsSettingsOpen(false)
    toast.add({
      type: "info",
      title: "Reset Configuration",
      description: "Restored environment settings from .env.local.",
    })
    window.location.reload()
  }

  return (
    <>
      <header className="border-b border-border/60 bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                <Flame className="size-4 fill-amber-500/20" />
              </div>
              <span className="font-semibold text-sm tracking-tight hidden sm:inline">
                Firebase Hub
              </span>
            </Link>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/40">
              <Link
                href="/"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  pathname === "/"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PlusCircle className="size-3.5" />
                <span>Enter Data</span>
              </Link>
              <Link
                href="/data"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  pathname === "/data"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Database className="size-3.5" />
                <span>View Data</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={isConfigured ? "default" : "secondary"}
              className="text-[10px] hidden md:inline-flex cursor-pointer"
              onClick={() => setIsSettingsOpen(true)}
            >
              {isConfigured ? (
                <span className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Firestore Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-500">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  Demo Mode
                </span>
              )}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="gap-1.5 text-xs h-8"
            >
              <Settings className="size-3.5" />
              <span className="hidden sm:inline">Firebase Config</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="size-8 p-0"
              title="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                <Sun className="size-4 text-amber-400" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Firebase Setup & Config Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Flame className="size-4" />
              </div>
              <DialogTitle>Firebase Firestore Setup</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Configure your Firebase Web App credentials to persist data to Cloud Firestore.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="rounded-lg bg-muted/50 p-3 border border-border/60 space-y-1.5">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <ExternalLink className="size-3" /> Quick 3-Step Setup Guide
              </p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>
                  Open{" "}
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    console.firebase.google.com
                  </a>{" "}
                  and create or choose a project.
                </li>
                <li>
                  Go to <strong>Build &gt; Firestore Database</strong> &rarr; Click{" "}
                  <strong>Create database</strong> (choose <em>Test mode</em> for instant access).
                </li>
                <li>
                  Go to <strong>Project Settings</strong> &rarr; <strong>General</strong> &rarr; Add Web App
                  and copy your credentials below or into <code className="text-foreground">.env.local</code>.
                </li>
              </ol>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">Firebase API Key *</label>
                <Input
                  placeholder="AIzaSy..."
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">Project ID *</label>
                <Input
                  placeholder="my-nextjs-app-12345"
                  value={customProjectId}
                  onChange={(e) => setCustomProjectId(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">Auth Domain (optional)</label>
                <Input
                  placeholder="my-nextjs-app-12345.firebaseapp.com"
                  value={customAuthDomain}
                  onChange={(e) => setCustomAuthDomain(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={handleResetToEnv} className="text-xs">
              Reset to .env.local
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveCustomConfig} className="text-xs">
                Save &amp; Connect
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
