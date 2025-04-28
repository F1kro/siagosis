import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { CalendarCheck, GraduationCap, MessageSquare, CheckCircle } from "lucide-react"

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "student") {
    redirect("/")
  }

  // Get student data
  const student = await db.student.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      user: true,
      class: true,
    },
  })

  if (!student) {
    redirect("/")
  }

  // Get upcoming todos
  const upcomingTodos = await db.todo.findMany({
    where: {
      studentId: student.id,
      isCompleted: false,
    },
    orderBy: {
      dueDate: "asc",
    },
    take: 5,
  })

  // Get recent grades
  const recentGrades = await db.grade.findMany({
    where: {
      studentId: student.id,
    },
    include: {
      subject: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })

  // Get recent attendance
  const recentAttendance = await db.attendance.findMany({
    where: {
      studentId: student.id,
    },
    orderBy: {
      date: "desc",
    },
    take: 5,
  })

  // Get recent news
  const recentNews = await db.news.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
  })

  // Get unread notifications
  const unreadNotifications = await db.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
    },
  })

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {student.user.name}!</p>
        </div>
        <div className="mt-2 md:mt-0">
          <Badge variant="outline" className="text-sm">
            Class: {student.class.name}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTodos.length > 0 ? (
                <div className="space-y-4">
                  {upcomingTodos.map((todo) => (
                    <div key={todo.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{todo.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {format(new Date(todo.dueDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <Badge
                        className={
                          todo.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : todo.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                        }
                      >
                        {todo.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No upcoming tasks.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" variant="outline">
                <Link href="/student/todos">View All Tasks</Link>
              </Button>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Recent Grades
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentGrades.length > 0 ? (
                  <div className="space-y-2">
                    {recentGrades.map((grade) => (
                      <div key={grade.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{grade.subject.name}</p>
                          <p className="text-xs text-muted-foreground">{grade.type}</p>
                        </div>
                        <Badge variant={grade.value >= 70 ? "default" : "destructive"}>{grade.value}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No grades available.</p>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild size="sm" variant="outline">
                  <Link href="/student/grades">View All Grades</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <CalendarCheck className="h-5 w-5 mr-2" />
                  Recent Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentAttendance.length > 0 ? (
                  <div className="space-y-2">
                    {recentAttendance.map((attendance) => (
                      <div key={attendance.id} className="flex justify-between items-center border-b pb-2">
                        <p className="font-medium">{format(new Date(attendance.date), "MMM dd, yyyy")}</p>
                        <Badge
                          variant={
                            attendance.status === "present"
                              ? "default"
                              : attendance.status === "late"
                                ? "warning"
                                : "destructive"
                          }
                        >
                          {attendance.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No attendance records available.</p>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild size="sm" variant="outline">
                  <Link href="/student/attendance">View All Attendance</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{student.user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">NIS</p>
                  <p>{student.nis}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Class</p>
                  <p>{student.class.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gender</p>
                  <p className="capitalize">{student.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Religion</p>
                  <p>{student.religion || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p>{student.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Recent News
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentNews.length > 0 ? (
                <div className="space-y-4">
                  {recentNews.map((news) => (
                    <div key={news.id} className="border-b pb-3">
                      <h3 className="font-medium">{news.title}</h3>
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(new Date(news.createdAt), "MMM dd, yyyy")}
                      </p>
                      <p className="text-sm line-clamp-2">{news.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No news available.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" variant="outline">
                <Link href="/student/news">View All News</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
