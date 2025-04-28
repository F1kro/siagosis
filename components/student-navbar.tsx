"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CheckSquare,
  GraduationCap,
  CalendarCheck,
  BookOpen,
  MessageSquare,
  Bell,
  Menu,
  LogOut,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function StudentNavbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    {
      label: "Dashboard",
      href: "/student/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "To-Do List",
      href: "/student/todos",
      icon: <CheckSquare className="h-5 w-5" />,
    },
    {
      label: "Grades",
      href: "/student/grades",
      icon: <GraduationCap className="h-5 w-5" />,
    },
    {
      label: "Attendance",
      href: "/student/attendance",
      icon: <CalendarCheck className="h-5 w-5" />,
    },
    {
      label: "Subjects",
      href: "/student/subjects",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      label: "News",
      href: "/student/news",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      label: "Notifications",
      href: "/student/notifications",
      icon: <Bell className="h-5 w-5" />,
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/student/dashboard" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">SIAGOSIS</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center transition-colors hover:text-foreground/80",
                  pathname === route.href ? "text-foreground" : "text-foreground/60",
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link href="/student/dashboard" className="flex items-center" onClick={() => setIsOpen(false)}>
              <span className="font-bold text-xl">SIAGOSIS</span>
            </Link>
            <div className="my-4">
              <div className="flex items-center gap-2 mb-4 mt-6">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {session?.user?.username?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{session?.user?.username}</p>
                  <p className="text-xs text-muted-foreground">Student</p>
                </div>
              </div>
            </div>
            <nav className="grid gap-2 py-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1 text-base rounded-md hover:bg-accent",
                    pathname === route.href ? "font-medium text-foreground bg-accent" : "text-muted-foreground",
                  )}
                >
                  {route.icon}
                  {route.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full justify-start" onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/student/dashboard" className="mr-6 flex items-center space-x-2 md:hidden">
              <span className="font-bold">SIAGOSIS</span>
            </Link>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {session?.user?.username?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/student/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
