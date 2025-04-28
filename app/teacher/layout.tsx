import type React from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import TeacherNavbar from "@/components/teacher-navbar"

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "teacher") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherNavbar />
      <main>{children}</main>
    </div>
  )
}
