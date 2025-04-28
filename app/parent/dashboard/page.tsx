import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, CalendarCheck, MessageSquare } from "lucide-react"

export default async function ParentDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "parent") {
    redirect("/")
  }

  // Get parent data
  const parent = await db.parent.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      user: true,
    },
  })

  if (!parent) {
    redirect("/")
  }

  // Get children
  const parentStudents = await db.parentStudent.findMany({
    where: {
      parentId: parent.id,
    },
    include: {
      student: {
        include: {
          user: true,
          class: true,
        },
      },
    },
  })

  const children = parentStudents.map((ps) => ps.student)
  const childrenIds = children.map((child) => child.id)

  // Get recent grades
  const recentGrades = await db.grade.findMany({
    where: {
      studentId: {
        in: childrenIds,
      },
    },
    include: {
      student: {
        include: {
          user: true,
        },
      },
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
      studentId: {
        in: childrenIds,
      },
    },
    include: {
      student: {
        include: {
          user: true,
        },
      },
      subject: true,
    },
    orderBy: {
      date: "desc",
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
          <h1 className="text-2xl md:text-3xl font-bold">Parent Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {parent.user.name}!</p>
        </div>
        <div className="mt-2 md:mt-0">
          <Badge variant="outline" className="text-sm">
            Children: {children.length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Children</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{children.length}</div>
            <p className="text-xs text-muted-foreground">Total children registered</p>
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadNotifications}</div>
            <p className="text-xs text-muted-foreground">Unread notifications</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Users className="mr-2 h-5 w-5" />
                My Children
              </CardTitle>
            </CardHeader>
            <CardContent>
              {children.length > 0 ? (
                <div className="space-y-4">
                  {children.map((child) => (
                    <div key={child.id} className="flex justify-between items-center border-b pb-4">
                      <div>
                        <p className="font-medium">{child.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          NIS: {child.nis} • Class: {child.class.name}
                        </p>
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/parent/children/${child.id}`}>View Details</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No children registered.</p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            {grade.subject.name} • {grade.type}
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
                  <Link href="/parent/grades">View All Grades</Link>
                </Button>
              </CardFooter>
            </Card>

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
                            {record.subject.name} • {format(new Date(record.date), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <Badge
                          variant={
                            record.status === "present"
                              ? "default"
                              : record.status === "late"
                                ? "warning"
                                : "destructive"
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
                  <Link href="/parent/attendance">View All Attendance</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Parent Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{parent.user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">NIK</p>
                  <p>{parent.nik}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p>{parent.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{parent.user.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p>{parent.user.phone || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <MessageSquare className="mr-2 h-5 w-5" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-2">Contact your children's teachers</p>
                <Button asChild>
                  <Link href="/parent/messages">View Messages</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
