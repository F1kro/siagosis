import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, CalendarCheck } from "lucide-react"

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "teacher") {
    redirect("/")
  }

  // Get teacher data
  const teacher = await db.teacher.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      user: true,
      subject: true,
    },
  })

  if (!teacher) {
    redirect("/")
  }

  // Get classes taught by this teacher
  const classSubjects = await db.classSubject.findMany({
    where: {
      subjectId: teacher.subjectId,
    },
    include: {
      class: true,
    },
  })

  const classIds = classSubjects.map((cs) => cs.classId)

  // Get total students in these classes
  const totalStudents = await db.student.count({
    where: {
      classId: {
        in: classIds,
      },
    },
  })

  // Get recent attendance records
  const recentAttendance = await db.attendance.findMany({
    where: {
      teacherId: teacher.id,
    },
    include: {
      student: {
        include: {
          user: true,
          class: true,
        },
      },
      subject: true,
    },
    orderBy: {
      date: "desc",
    },
    take: 5,
  })

  // Get recent grades
  const recentGrades = await db.grade.findMany({
    where: {
      teacherId: teacher.id,
    },
    include: {
      student: {
        include: {
          user: true,
          class: true,
        },
      },
      subject: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })

  // Get unread messages
  const unreadMessages = await db.message.count({
    where: {
      receiverId: session.user.id,
      isRead: false,
    },
  })

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {teacher.user.name}!</p>
        </div>
        <div className="mt-2 md:mt-0">
          <Badge variant="outline" className="text-sm">
            Subject: {teacher.subject.name}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classSubjects.length}</div>
            <p className="text-xs text-muted-foreground">Total classes you teach</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Total students in your classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadMessages}</div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <CalendarCheck className="mr-2 h-5 w-5" />
                Recent Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentAttendance.length > 0 ? (
                <div className="space-y-4">
                  {recentAttendance.map((record) => (
                    <div key={record.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{record.student.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {record.student.class.name} • {format(new Date(record.date), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <Badge
                        variant={
                          record.status === "present" ? "default" : record.status === "late" ? "warning" : "destructive"
                        }
                      >
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No recent attendance records.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" variant="outline">
                <Link href="/teacher/attendance">View All Attendance</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <GraduationCap className="mr-2 h-5 w-5" />
                Recent Grades
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentGrades.length > 0 ? (
                <div className="space-y-4">
                  {recentGrades.map((grade) => (
                    <div key={grade.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{grade.student.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {grade.student.class.name} • {grade.type}
                        </p>
                      </div>
                      <Badge variant={grade.value >= 70 ? "default" : "destructive"}>{grade.value}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No recent grades.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" variant="outline">
                <Link href="/teacher/grades">View All Grades</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Teacher Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{teacher.user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">NIP</p>
                  <p>{teacher.nip}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subject</p>
                  <p>
                    {teacher.subject.name} ({teacher.subject.code})
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Teaching Hours</p>
                  <p>{teacher.teachingHours || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{teacher.user.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p>{teacher.user.phone || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Users className="mr-2 h-5 w-5" />
                Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {classSubjects.length > 0 ? (
                <div className="space-y-2">
                  {classSubjects.map((cs) => (
                    <div key={cs.id} className="flex justify-between items-center border-b pb-2">
                      <p>{cs.class.name}</p>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/teacher/classes/${cs.classId}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No classes assigned.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" variant="outline">
                <Link href="/teacher/classes">View All Classes</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
