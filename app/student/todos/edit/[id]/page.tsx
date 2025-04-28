import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import TodoForm from "@/components/todo-form"

interface EditTodoPageProps {
  params: {
    id: string
  }
}

export default async function EditTodoPage({ params }: EditTodoPageProps) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "student") {
    redirect("/")
  }

  // Get student data
  const student = await db.student.findFirst({
    where: {
      userId: session.user.id,
    },
  })

  if (!student) {
    redirect("/")
  }

  // Get todo
  const todo = await db.todo.findUnique({
    where: {
      id: params.id,
      studentId: student.id,
    },
  })

  if (!todo) {
    redirect("/student/todos")
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/student/todos">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Task</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>Update your task information</CardDescription>
        </CardHeader>
        <CardContent>
          <TodoForm todo={todo} />
        </CardContent>
      </Card>
    </div>
  )
}
