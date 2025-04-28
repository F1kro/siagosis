import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarCheck, CheckCircle, Clock, XCircle } from "lucide-react"
import { format } from "date-fns"

export default async function AttendancePage() {
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
      class: true,
    },
  })

  if (!student) {
    redirect("/")
  }

  // Get attendance records
  const attendance = await db.attendance.findMany({
    where: {
      studentId: student.id,
    },
    include: {
      subject: true,
      teacher: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  })

  // Calculate attendance statistics
  const totalDays = attendance.length
  const presentDays = attendance.filter((a) => a.status === "present").length
  const lateDays = attendance.filter((a) => a.status === "late").length
  const absentDays = attendance.filter((a) => a.status === "absent").length

  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  // Group attendance by month
  const attendanceByMonth: Record<string, typeof attendance> = {}

  attendance.forEach((record) => {
    const monthYear = format(new Date(record.date), "MMMM yyyy")
    if (!attendanceByMonth[monthYear]) {
      attendanceByMonth[monthYear] = []
    }
    attendanceByMonth[monthYear].push(record)
  })

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Attendance</h1>
          <p className="text-muted-foreground">Track your attendance records</p>
        </div>
        <div className="mt-2 md:mt-0">
          <Badge variant="outline" className="text-sm">
            Class: {student.class.name}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Overall attendance rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentDays}</div>
            <p className="text-xs text-muted-foreground">Days present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lateDays}</div>
            <p className="text-xs text-muted-foreground">Days late</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentDays}</div>
            <p className="text-xs text-muted-foreground">Days absent</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <CalendarCheck className="mr-2 h-5 w-5" />
            Attendance Records
          </CardTitle>
          <CardDescription>Your attendance history by month</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(attendanceByMonth).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(attendanceByMonth).map(([month, records]) => (
                <div key={month}>
                  <h3 className="font-medium text-lg mb-2">{month}</h3>
                  <div className="rounded-md border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left p-3">Date</th>
                            <th className="text-left p-3">Subject</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Teacher</th>
                          </tr>
                        </thead>
                        <tbody>
                          {records.map((record) => (
                            <tr key={record.id} className="border-t">
                              <td className="p-3">{format(new Date(record.date), "EEEE, MMMM d, yyyy")}</td>
                              <td className="p-3">{record.subject.name}</td>
                              <td className="p-3">
                                <Badge
                                  className="flex items-center w-24 justify-center"
                                  variant={
                                    record.status === "present"
                                      ? "default"
                                      : record.status === "late"
                                        ? "warning"
                                        : "destructive"
                                  }
                                >
                                  {record.status === "present" ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : record.status === "late" ? (
                                    <Clock className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  {record.status}
                                </Badge>
                              </td>
                              <td className="p-3">{record.teacher.user.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No attendance records available.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
