import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardStat } from "@/components/dashboard-stats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, GraduationCap, School, FileText } from "lucide-react"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    redirect("/")
  }

  // Get counts for dashboard stats
  const studentsCount = await db.student.count()
  const teachersCount = await db.teacher.count()
  const parentsCount = await db.parent.count()
  const classesCount = await db.classRoom.count()

  // Get recent users
  const recentUsers = await db.user.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      createdAt: true,
    },
  })

  // Get recent news
  const recentNews = await db.news.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  })

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardStat
          title="Total Students"
          value={studentsCount}
          icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
          className="bg-blue-50"
        />
        <DashboardStat
          title="Total Teachers"
          value={teachersCount}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          className="bg-green-50"
        />
        <DashboardStat
          title="Total Parents"
          value={parentsCount}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          className="bg-yellow-50"
        />
        <DashboardStat
          title="Total Classes"
          value={classesCount}
          icon={<School className="h-4 w-4 text-muted-foreground" />}
          className="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Name</th>
                    <th className="text-left py-3 px-2">Username</th>
                    <th className="text-left py-3 px-2">Role</th>
                    <th className="text-left py-3 px-2">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-2 px-2">{user.name}</td>
                      <td className="py-2 px-2">{user.username}</td>
                      <td className="py-2 px-2 capitalize">{user.role}</td>
                      <td className="py-2 px-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Button asChild size="sm">
                <Link href="/admin/users">View All Users</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Recent News
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Title</th>
                    <th className="text-left py-3 px-2">Created By</th>
                    <th className="text-left py-3 px-2">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {recentNews.map((news) => (
                    <tr key={news.id} className="border-b">
                      <td className="py-2 px-2">{news.title}</td>
                      <td className="py-2 px-2">{news.user.name}</td>
                      <td className="py-2 px-2">{new Date(news.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Button asChild size="sm">
                <Link href="/admin/news">View All News</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
