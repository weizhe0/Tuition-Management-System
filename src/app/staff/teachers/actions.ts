
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertRole } from "@/lib/role-guard";
import { prisma } from "@/lib/prisma";

const PAGE = "/staff/teachers";

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function readTeacherFields(formData: FormData) {
  const fullName = getText(formData, "fullName");
  const rawEmail = getText(formData, "email").toLowerCase();
  const rawPhone = getText(formData, "phone");

  const email = rawEmail || null;
  const phone = rawPhone || null;

  const validEmail =
    !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (
    fullName.length < 2 ||
    fullName.length > 100 ||
    (email !== null && email.length > 254) ||
    !validEmail ||
    (phone !== null && phone.length > 40)
  ) {
    return null;
  }

  return {
    fullName,
    email,
    phone,
  };
}

function refreshPages() {
  revalidatePath("/staff");
  revalidatePath("/staff/teachers");
  revalidatePath("/staff/classes");
  revalidatePath("/teacher");
  revalidatePath("/student");
}

export async function createTeacher(formData: FormData) {
  await assertRole("STAFF");

  const fields = readTeacherFields(formData);

  if (!fields) {
    redirect(`${PAGE}?status=invalid`);
  }

  if (fields.email) {
    const duplicate = await prisma.teacher.findFirst({
      where: {
        email: fields.email,
      },
      select: {
        id: true,
      },
    });

    if (duplicate) {
      redirect(`${PAGE}?status=duplicate_email`);
    }
  }

  await prisma.teacher.create({
    data: {
      fullName: fields.fullName,
      email: fields.email,
      phone: fields.phone,
      isActive: true,
    },
  });

  refreshPages();

  redirect(`${PAGE}?status=created`);
}

export async function updateTeacher(formData: FormData) {
  await assertRole("STAFF");

  const teacherId = getText(formData, "teacherId");
  const fields = readTeacherFields(formData);
  const isActive = formData.get("isActive") === "on";

  if (!teacherId || teacherId.length > 128 || !fields) {
    redirect(`${PAGE}?status=invalid`);
  }

  const teacher = await prisma.teacher.findUnique({
    where: {
      id: teacherId,
    },
    select: {
      id: true,
      _count: {
        select: {
          classes: true,
        },
      },
    },
  });

  if (!teacher) {
    redirect(`${PAGE}?status=not_found`);
  }

  if (!isActive && teacher._count.classes > 0) {
    redirect(`${PAGE}?status=has_classes`);
  }

  if (fields.email) {
    const duplicate = await prisma.teacher.findFirst({
      where: {
        email: fields.email,
        NOT: {
          id: teacherId,
        },
      },
      select: {
        id: true,
      },
    });

    if (duplicate) {
      redirect(`${PAGE}?status=duplicate_email`);
    }
  }

  await prisma.teacher.update({
    where: {
      id: teacherId,
    },
    data: {
      fullName: fields.fullName,
      email: fields.email,
      phone: fields.phone,
      isActive,
    },
  });

  refreshPages();

  redirect(`${PAGE}?status=updated`);
}

export async function reassignClass(formData: FormData) {
  await assertRole("STAFF");

  const tuitionClassId = getText(
    formData,
    "tuitionClassId"
  );

  const teacherId = getText(formData, "teacherId");

  if (
    !tuitionClassId ||
    !teacherId ||
    tuitionClassId.length > 128 ||
    teacherId.length > 128
  ) {
    redirect(`${PAGE}?status=invalid_assignment`);
  }

  const [tuitionClass, teacher] = await Promise.all([
    prisma.tuitionClass.findUnique({
      where: {
        id: tuitionClassId,
      },
      select: {
        id: true,
      },
    }),

    prisma.teacher.findFirst({
      where: {
        id: teacherId,
        isActive: true,
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!tuitionClass || !teacher) {
    redirect(`${PAGE}?status=assignment_unavailable`);
  }

  await prisma.tuitionClass.update({
    where: {
      id: tuitionClass.id,
    },
    data: {
      teacher: {
        connect: {
          id: teacher.id,
        },
      },
    },
  });

  refreshPages();

  redirect(`${PAGE}?status=reassigned`);
}
