
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertRole } from "@/lib/role-guard";
import { prisma } from "@/lib/prisma";

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// STAFF ONLY: Create a class and assign a teacher.
export async function createClass(formData: FormData) {
  await assertRole("STAFF");

  const name = getText(formData, "name");
  const subject = getText(formData, "subject");
  const teacherId = getText(formData, "teacherId");

  if (
    name.length < 2 ||
    name.length > 100 ||
    subject.length < 2 ||
    subject.length > 100 ||
    !teacherId ||
    teacherId.length > 128
  ) {
    redirect("/staff/classes?status=invalid_class");
  }

  const teacher = await prisma.teacher.findFirst({
    where: {
      id: teacherId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!teacher) {
    redirect("/staff/classes?status=teacher_unavailable");
  }

  await prisma.tuitionClass.create({
    data: {
      name,
      subject,
      teacherId: teacher.id,
    },
  });

  revalidatePath("/staff/classes");
  revalidatePath("/teacher");

  redirect("/staff/classes?status=class_created");
}

// STAFF ONLY: Enroll a student in an existing class.
export async function enrollStudent(formData: FormData) {
  await assertRole("STAFF");

  const tuitionClassId = getText(formData, "tuitionClassId");
  const studentId = getText(formData, "studentId");

  if (
    !tuitionClassId ||
    !studentId ||
    tuitionClassId.length > 128 ||
    studentId.length > 128
  ) {
    redirect("/staff/classes?status=invalid_enrollment");
  }

  const [tuitionClass, student] = await Promise.all([
    prisma.tuitionClass.findUnique({
      where: { id: tuitionClassId },
      select: { id: true },
    }),
    prisma.student.findFirst({
      where: {
        id: studentId,
        isActive: true,
      },
      select: { id: true },
    }),
  ]);

  if (!tuitionClass) {
    redirect("/staff/classes?status=class_unavailable");
  }

  if (!student) {
    redirect("/staff/classes?status=student_unavailable");
  }

  // Prevent duplicate enrollment.
  await prisma.enrollment.upsert({
    where: {
      studentId_tuitionClassId: {
        studentId: student.id,
        tuitionClassId: tuitionClass.id,
      },
    },
    update: {},
    create: {
      studentId: student.id,
      tuitionClassId: tuitionClass.id,
    },
  });

  revalidatePath("/staff/classes");
  revalidatePath("/teacher");
  revalidatePath("/student");

  redirect("/staff/classes?status=student_enrolled");
}
