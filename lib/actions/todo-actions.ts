"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { redirect } from "next/navigation"

const todoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["low", "medium", "high"]),
})

export async function createTodo(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "student") {
    throw new Error("Unauthorized")
  }

  const student = await db.student.findFirst({
    where: {
      userId: session.user.id,
    },
  })

  if (!student) {
    throw new Error("Student not found")
  }

  const validatedFields = todoSchema.parse({
    title: formData.get("title"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
  })

  await db.todo.create({
    data: {
      studentId: student.id,
      title: validatedFields.title,
      description: validatedFields.description || "",
      dueDate: new Date(validatedFields.dueDate),
      priority: validatedFields.priority,
      isCompleted: false,
    },
  })

  revalidatePath("/student/todos")
  redirect("/student/todos")
}

export async function updateTodo(id: string, formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "student") {
    throw new Error("Unauthorized")
  }

  const student = await db.student.findFirst({
    where: {
      userId: session.user.id,
    },
  })

  if (!student) {
    throw new Error("Student not found")
  }

  const todo = await db.todo.findUnique({
    where: {
      id,
      studentId: student.id,
    },
  })

  if (!todo) {
    throw new Error("Todo not found or not owned by this student")
  }

  const validatedFields = todoSchema.parse({
    title: formData.get("title"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
  })

  const isCompleted = formData.get("isCompleted") === "on"

  await db.todo.update({
    where: {
      id,
    },
    data: {
      title: validatedFields.title,
      description: validatedFields.description || "",
      dueDate: new Date(validatedFields.dueDate),
      priority: validatedFields.priority,
      isCompleted,
    },
  })

  revalidatePath("/student/todos")
  redirect("/student/todos")
}

export async function toggleTodoComplete(id: string) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "student") {
    throw new Error("Unauthorized")
  }

  const student = await db.student.findFirst({
    where: {
      userId: session.user.id,
    },
  })

  if (!student) {
    throw new Error("Student not found")
  }

  const todo = await db.todo.findUnique({
    where: {
      id,
      studentId: student.id,
    },
  })

  if (!todo) {
    throw new Error("Todo not found or not owned by this student")
  }

  await db.todo.update({
    where: {
      id,
    },
    data: {
      isCompleted: !todo.isCompleted,
    },
  })

  revalidatePath("/student/todos")
}

export async function deleteTodo(id: string) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "student") {
    throw new Error("Unauthorized")
  }

  const student = await db.student.findFirst({
    where: {
      userId: session.user.id,
    },
  })

  if (!student) {
    throw new Error("Student not found")
  }

  const todo = await db.todo.findUnique({
    where: {
      id,
      studentId: student.id,
    },
  })

  if (!todo) {
    throw new Error("Todo not found or not owned by this student")
  }

  await db.todo.delete({
    where: {
      id,
    },
  })

  revalidatePath("/student/todos")
}
