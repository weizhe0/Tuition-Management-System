
import RoleDashboard from "@/components/role-dashboard";

export default function StaffPage() {
  return (
    <RoleDashboard
      role="staff"
      title="Staff Dashboard / 员工管理中心"
      description="Manage students, teachers, classes, and tuition payments."
      modules={[
        {
          title: "Student Management / 学生管理",
          description: "Register, edit and search student records.",
        },
        {
          title: "Teacher Management / 教师管理",
          description: "Manage teacher profiles and assignments.",
        },
        {
          title: "Class Scheduling / 班级课表",
          description: "Create classes and manage weekly schedules.",
        },
        {
          title: "Billing & Payments / 学费管理",
          description: "Manage invoices, payments and outstanding fees.",
        },
        {
          title: "Attendance / 出席记录",
          description: "Review and correct attendance records.",
        },
        {
          title: "Reports / 报表",
          description: "View student and financial summaries.",
        },
      ]}
    />
  );
}
