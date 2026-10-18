
import RoleDashboard from "@/components/role-dashboard";

export default function TeacherPage() {
  return (
    <RoleDashboard
      role="teacher"
      title="Teacher Dashboard / 教师中心"
      description="Manage your classes, attendance, homework and announcements."
      modules={[
        {
          title: "My Classes / 我的班级",
          description: "View assigned classes and student lists.",
        },
        {
          title: "My Timetable / 我的课表",
          description: "View upcoming lessons and schedules.",
        },
        {
          title: "Attendance / 学生点名",
          description: "Record student attendance for your classes.",
        },
        {
          title: "Homework / 功课管理",
          description: "Assign homework and review submissions.",
        },
        {
          title: "Announcements / 公告",
          description: "Publish messages to your classes.",
        },
        {
          title: "Teaching Reports / 教学报告",
          description: "Review attendance and learning progress.",
        },
      ]}
    />
  );
}
