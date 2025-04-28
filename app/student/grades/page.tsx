import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { GraduationCap } from "lucide-react"

export default async function GradesPage() {
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

  // Get all subjects for the student's class
  const classSubjects = await db.classSubject.findMany({
    where: {
      classId: student.classId,
    },
    include: {
      subject: true,
    },
  })

  // Get grades for each subject
  const subjectsWithGrades = await Promise.all(
    classSubjects.map(async (classSubject) => {
      const grades = await db.grade.findMany({
        where: {
          studentId: student.id,
          subjectId: classSubject.subjectId,
        },
        include: {
          teacher: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      // Calculate average grade
      const averageGrade = grades.length > 0 ? grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length : 0

      return {
        subject: classSubject.subject,
        grades,
        averageGrade,
      }
    }),
  )

  // Calculate overall average
  const overallAverage =
    subjectsWithGrades.length > 0
      ? subjectsWithGrades.reduce((sum, subject) => sum + subject.averageGrade, 0) / subjectsWithGrades.length
      : 0

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Grades</h1>
          <p className="text-muted-foreground">View your academic performance</p>
        </div>
        <div className="mt-2 md:mt-0 flex items-center">
          <Badge variant="outline" className="text-sm mr-2">
            Class: {student.class.name}
          </Badge>
          <Badge variant={overallAverage >= 70 ? "default" : "destructive"} className="text-sm">
            Overall Average: {overallAverage.toFixed(1)}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <GraduationCap className="mr-2 h-5 w-5" />
            Academic Performance
          </CardTitle>
          <CardDescription>View your grades by subject</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={subjectsWithGrades[0]?.subject.id || "overview"}>
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {subjectsWithGrades.map((item) => (
                <TabsTrigger key={item.subject.id} value={item.subject.id}>
                  {item.subject.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectsWithGrades.map((item) => (
                  <Card key={item.subject.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{item.subject.name}</CardTitle>
                      <CardDescription>{item.subject.code}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Average:</span>
                        <Badge variant={item.averageGrade >= 70 ? "default" : "destructive"}>
                          {item.averageGrade.toFixed(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-muted-foreground">Grades:</span>
                        <span>{item.grades.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {subjectsWithGrades.map((item) => (
              <TabsContent key={item.subject.id} value={item.subject.id}>
                <div className="rounded-md border">
                  <div className="p-4 bg-muted/50">
                    <div className="flex flex-col md:flex-row justify-between md:items-center">
                      <div>
                        <h3 className="font-medium">
                          {item.subject.name} ({item.subject.code})
                        </h3>
                        <p className="text-sm text-muted-foreground">Average Grade: {item.averageGrade.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>

                  {item.grades.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Type</th>
                            <th className="text-left p-3">Value</th>
                            <th className="text-left p-3">Teacher</th>
                            <th className="text-left p-3">Date</th>
                            <th className="text-left p-3">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.grades.map((grade) => (
                            <tr key={grade.id} className="border-b">
                              <td className="p-3">{grade.type}</td>
                              <td className="p-3">
                                <Badge variant={grade.value >= 70 ? "default" : "destructive"}>{grade.value}</Badge>
                              </td>
                              <td className="p-3">{grade.teacher.user.name}</td>
                              <td className="p-3">{new Date(grade.createdAt).toLocaleDateString()}</td>
                              <td className="p-3">{grade.description || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">No grades available for this subject.</div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
