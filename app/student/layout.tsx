import type React from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import StudentNavbar from "@/components/student-navbar"

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "student") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />
      <main>{children}</main>
    </div>
  )
}
