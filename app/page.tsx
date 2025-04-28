import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import LoginForm from "@/components/login-form"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    const role = session.user.role
    switch (role) {
      case "admin":
        redirect("/admin/dashboard")
      case "teacher":
        redirect("/teacher/dashboard")
      case "student":
        redirect("/student/dashboard")
      case "parent":
        redirect("/parent/dashboard")
      default:
        redirect("/")
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight text-primary">SIAGOSIS</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Academic Information System for Students, Teachers, and Parents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-muted-foreground">
              © {new Date().getFullYear()} SIAGOSIS. All rights reserved.
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
