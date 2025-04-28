"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Todo } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Check, Undo, Pencil, Trash2, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { toggleTodoComplete, deleteTodo } from "@/lib/actions/todo-actions"

interface TodoActionsProps {
  todo: Todo
}

export default function TodoActions({ todo }: TodoActionsProps) {
  const router = useRouter()
  const [isToggling, setIsToggling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggleComplete = async () => {
    setIsToggling(true)
    await toggleTodoComplete(todo.id)
    setIsToggling(false)
    router.refresh()
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    await deleteTodo(todo.id)
    setIsDeleting(false)
    router.refresh()
  }

  return (
    <div className="flex space-x-2">
      <Button variant="outline" size="sm" onClick={handleToggleComplete} disabled={isToggling}>
        {isToggling ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : todo.isCompleted ? (
          <Undo className="h-4 w-4" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </Button>

      <Button variant="outline" size="sm" asChild>
        <Link href={`/student/todos/edit/${todo.id}`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
