"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Users, GraduationCap, School, BookOpen, FileText, LogOut, Settings, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"

export default function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const routes = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Students",
      href: "/admin/students",
      icon: <GraduationCap className="h-5 w-5" />,
    },
    {
      label: "Teachers",
      href: "/admin/teachers",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Parents",
      href: "/admin/parents",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Classes",
      href: "/admin/classes",
      icon: <School className="h-5 w-5" />,
    },
    {
      label: "Subjects",
      href: "/admin/subjects",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      label: "News",
      href: "/admin/news",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <div className="hidden lg:flex flex-col w-64 bg-white border-r shadow-sm">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-primary">SIAGOSIS</h1>
        <p className="text-xs text-muted-foreground">Admin Panel</p>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                pathname === route.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              {route.icon}
              {route.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {session?.user?.name?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{session?.user?.name || "Admin"}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
