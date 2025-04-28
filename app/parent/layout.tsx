import type React from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import ParentNavbar from "@/components/parent-navbar"

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "parent") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ParentNavbar />
      <main>{children}</main>
    </div>
  )
}
