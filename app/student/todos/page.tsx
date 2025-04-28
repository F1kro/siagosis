import { cn } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, CheckCircle, Clock } from "lucide-react"
import TodoActions from "@/components/todo-actions"

export default async function TodosPage() {
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

  // Get todos
  const todos = await db.todo.findMany({
    where: {
      studentId: student.id,
    },
    orderBy: [
      {
        isCompleted: "asc",
      },
      {
        dueDate: "asc",
      },
    ],
  })

  // Separate todos by completion status
  const pendingTodos = todos.filter((todo) => !todo.isCompleted)
  const completedTodos = todos.filter((todo) => todo.isCompleted)

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">My To-Do List</h1>
        <Button asChild className="mt-2 md:mt-0">
          <Link href="/student/todos/create">
            <Plus className="mr-2 h-4 w-4" /> Add New Task
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Clock className="mr-2 h-5 w-5" />
              Pending Tasks
            </CardTitle>
            <CardDescription>Tasks that need to be completed</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingTodos.length > 0 ? (
              <div className="space-y-4">
                {pendingTodos.map((todo) => {
                  const isOverdue = new Date(todo.dueDate) < new Date()
                  const isToday = new Date(todo.dueDate).toDateString() === new Date().toDateString()

                  return (
                    <div
                      key={todo.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="mb-2 md:mb-0">
                        <div className="flex items-center">
                          <h3 className="font-medium">{todo.title}</h3>
                          {isOverdue && (
                            <Badge variant="destructive" className="ml-2">
                              Overdue
                            </Badge>
                          )}
                          {isToday && !isOverdue && (
                            <Badge variant="outline" className="ml-2">
                              Today
                            </Badge>
                          )}
                        </div>
                        {todo.description && <p className="text-sm text-muted-foreground mt-1">{todo.description}</p>}
                        <div className="flex items-center mt-2">
                          <p className="text-xs text-muted-foreground">
                            Due: {format(new Date(todo.dueDate), "MMM dd, yyyy")}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn(
                              "ml-2",
                              todo.priority === "high"
                                ? "bg-red-100 text-red-800 hover:bg-red-100"
                                : todo.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                  : "bg-blue-100 text-blue-800 hover:bg-blue-100",
                            )}
                          >
                            {todo.priority}
                          </Badge>
                        </div>
                      </div>
                      <TodoActions todo={todo} />
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pending tasks.</p>
                <Button asChild variant="outline" className="mt-2">
                  <Link href="/student/todos/create">Create a new task</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CheckCircle className="mr-2 h-5 w-5" />
              Completed Tasks
            </CardTitle>
            <CardDescription>Tasks you have already completed</CardDescription>
          </CardHeader>
          <CardContent>
            {completedTodos.length > 0 ? (
              <div className="space-y-4">
                {completedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-muted/50"
                  >
                    <div className="mb-2 md:mb-0">
                      <h3 className="font-medium line-through text-muted-foreground">{todo.title}</h3>
                      {todo.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-through">{todo.description}</p>
                      )}
                      <div className="flex items-center mt-2">
                        <p className="text-xs text-muted-foreground">
                          Due: {format(new Date(todo.dueDate), "MMM dd, yyyy")}
                        </p>
                        <Badge variant="outline" className="ml-2 opacity-50">
                          {todo.priority}
                        </Badge>
                      </div>
                    </div>
                    <TodoActions todo={todo} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No completed tasks yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
