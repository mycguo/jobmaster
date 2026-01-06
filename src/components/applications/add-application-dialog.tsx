/**
 * Add application dialog (placeholder for now)
 */

"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AddApplicationDialog() {
  return (
    <Button asChild>
      <Link href="/applications/new">➕ Add Application</Link>
    </Button>
  )
}

