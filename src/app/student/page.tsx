
import RoleDashboard from "@/components/role-dashboard";

export default function StudentPage() {
  return (
    <RoleDashboard
      role="student"
      title="Student Dashboard / 学生中心"
      description="View your classes, learning activities and tuition information."
      modules={[
        {
          title: "My Profile / 个人资料",
          description: "View your registered student information.",
        },
        {
          title: "My Timetable / 我的课表",
          description: "Check your weekly tuition schedule.",
        },
        {
          title: "Attendance / 出席记录",
          description: "Review your own attendance history.",
        },
        {
          title: "Homework / 我的功课",
          description: "View assignments and submit homework.",
        },
        {
          title: "Tuition Fees / 学费账单",
          description: "View invoices, payment history and balances.",
        },
        {
          title: "Announcements / 最新公告",
          description: "Read announcements from your centre and teachers.",
        },
      ]}
    />
  );
}
