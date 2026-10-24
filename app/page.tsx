"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export default function Page() {
  const [name, setName] = useState("")

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Hello, shadcn/ui</CardTitle>
          <CardDescription>
            This page uses Button, Card, Input and Dialog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Type your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <Button variant="outline" onClick={() => setName("")}>
            Clear
          </Button>
          <Dialog>
            <DialogTrigger render={<Button />}>Say hello</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hello, {name.trim() || "stranger"}!</DialogTitle>
                <DialogDescription>
                  Your Next.js, Tailwind CSS and shadcn/ui setup works.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button />}>Close</DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </main>
  )
}
