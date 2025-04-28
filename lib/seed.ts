import { db } from "@/lib/db"
import { hash } from "bcryptjs"

export async function seedDatabase() {
  try {
    // Check if database is already seeded
    const adminCount = await db.user.count({
      where: {
        role: "admin",
      },
    })

    if (adminCount > 0) {
      console.log("Database already seeded")
      return
    }

    console.log("Seeding database...")

    // Create admin user
    const adminUser = await db.user.create({
      data: {
        name: "Admin",
        username: "admin",
        email: "admin@example.com",
        password: await hash("password", 10),
        role: "admin",
      },
    })

    // Create classes
    const classes = [
      { name: "Class 10A", level: "10", section: "A" },
      { name: "Class 10B", level: "10", section: "B" },
      { name: "Class 11A", level: "11", section: "A" },
      { name: "Class 11B", level: "11", section: "B" },
      { name: "Class 12A", level: "12", section: "A" },
      { name: "Class 12B", level: "12", section: "B" },
    ]

    const createdClasses = await Promise.all(
      classes.map(async (classData) => {
        return db.classRoom.create({
          data: classData,
        })
      }),
    )

    // Create subjects
    const subjects = [
      { name: "Mathematics", code: "MATH" },
      { name: "Physics", code: "PHYS" },
      { name: "Chemistry", code: "CHEM" },
      { name: "Biology", code: "BIO" },
      { name: "English", code: "ENG" },
      { name: "History", code: "HIST" },
      { name: "Geography", code: "GEO" },
      { name: "Computer Science", code: "CS" },
    ]

    const createdSubjects = await Promise.all(
      subjects.map(async (subjectData) => {
        return db.subject.create({
          data: subjectData,
        })
      }),
    )

    // Assign subjects to classes
    for (const classRoom of createdClasses) {
      for (const subject of createdSubjects) {
        await db.classSubject.create({
          data: {
            classId: classRoom.id,
            subjectId: subject.id,
          },
        })
      }
    }

    // Create teachers
    const teachers = [
      {
        name: "Teacher 1",
        username: "teacher1",
        email: "teacher1@example.com",
        password: await hash("password", 10),
        role: "teacher",
        phone: "1234567890",
        nip: "T001",
        nik: "N001",
        subjectId: createdSubjects[0].id, // Mathematics
        teachingHours: 20,
      },
      {
        name: "Teacher 2",
        username: "teacher2",
        email: "teacher2@example.com",
        password: await hash("password", 10),
        role: "teacher",
        phone: "2345678901",
        nip: "T002",
        nik: "N002",
        subjectId: createdSubjects[1].id, // Physics
        teachingHours: 18,
      },
    ]

    for (const teacherData of teachers) {
      const { name, username, email, password, role, phone, nip, nik, subjectId, teachingHours } = teacherData

      const user = await db.user.create({
        data: {
          name,
          username,
          email,
          password,
          role,
          phone,
        },
      })

      await db.teacher.create({
        data: {
          userId: user.id,
          nip,
          nik,
          subjectId,
          teachingHours,
        },
      })
    }

    // Create students
    const students = [
      {
        name: "Student 1",
        username: "student1",
        email: "student1@example.com",
        password: await hash("password", 10),
        role: "student",
        phone: "3456789012",
        nis: "S001",
        birthDate: new Date("2005-01-15"),
        gender: "male",
        religion: "Islam",
        address: "Jl. Student 1",
        classId: createdClasses[0].id, // Class 10A
      },
      {
        name: "Student 2",
        username: "student2",
        email: "student2@example.com",
        password: await hash("password", 10),
        role: "student",
        phone: "4567890123",
        nis: "S002",
        birthDate: new Date("2005-02-20"),
        gender: "female",
        religion: "Islam",
        address: "Jl. Student 2",
        classId: createdClasses[0].id, // Class 10A
      },
    ]

    const createdStudents = []

    for (const studentData of students) {
      const { name, username, email, password, role, phone, nis, birthDate, gender, religion, address, classId } =
        studentData

      const user = await db.user.create({
        data: {
          name,
          username,
          email,
          password,
          role,
          phone,
        },
      })

      const student = await db.student.create({
        data: {
          userId: user.id,
          nis,
          birthDate,
          gender,
          religion,
          address,
          classId,
        },
      })

      createdStudents.push(student)
    }

    // Create parents
    const parents = [
      {
        name: "Parent 1",
        username: "parent1",
        email: "parent1@example.com",
        password: await hash("password", 10),
        role: "parent",
        phone: "5678901234",
        nik: "P001",
        address: "Jl. Parent 1",
        studentIds: [createdStudents[0].id],
      },
      {
        name: "Parent 2",
        username: "parent2",
        email: "parent2@example.com",
        password: await hash("password", 10),
        role: "parent",
        phone: "6789012345",
        nik: "P002",
        address: "Jl. Parent 2",
        studentIds: [createdStudents[1].id],
      },
    ]

    for (const parentData of parents) {
      const { name, username, email, password, role, phone, nik, address, studentIds } = parentData

      const user = await db.user.create({
        data: {
          name,
          username,
          email,
          password,
          role,
          phone,
        },
      })

      const parent = await db.parent.create({
        data: {
          userId: user.id,
          nik,
          address,
        },
      })

      // Connect students to parent
      for (const studentId of studentIds) {
        await db.parentStudent.create({
          data: {
            parentId: parent.id,
            studentId,
          },
        })
      }
    }

    // Create news
    const news = [
      {
        title: "School Holiday Announcement",
        content: "School will be closed from December 20, 2023 to January 5, 2024 for the winter holidays.",
        userId: adminUser.id,
      },
      {
        title: "Annual Sports Day",
        content: "The annual sports day will be held on November 15, 2023. All students are required to participate.",
        userId: adminUser.id,
      },
      {
        title: "Parent-Teacher Meeting",
        content:
          "The parent-teacher meeting for this semester will be held on October 25, 2023. All parents are requested to attend.",
        userId: adminUser.id,
      },
    ]

    await Promise.all(
      news.map(async (newsData) => {
        return db.news.create({
          data: newsData,
        })
      }),
    )

    console.log("Database seeded successfully")
  } catch (error) {
    console.error("Error seeding database:", error)
    throw error
  }
}
