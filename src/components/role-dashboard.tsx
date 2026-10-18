
import Link from "next/link";

type Role = "staff" | "teacher" | "student";

type DashboardModule = {
  title: string;
  description: string;
};

type RoleDashboardProps = {
  role: Role;
  title: string;
  description: string;
  modules: DashboardModule[];
};

const navigation: { role: Role; label: string; href: string }[] = [
  { role: "staff", label: "Staff", href: "/staff" },
  { role: "teacher", label: "Teacher", href: "/teacher" },
  { role: "student", label: "Student", href: "/student" },
];

export default function RoleDashboard({
  role,
  title,
  description,
  modules,
}: RoleDashboardProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">
            Tuition Management System
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            补习中心管理系统
          </p>

          <nav className="mt-6 flex flex-wrap gap-3" aria-label="Dashboard navigation">
            {navigation.map((item) => (
              <Link
                key={item.role}
                href={item.href}
                aria-current={role === item.role ? "page" : undefined}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  role === item.role
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <section className="mt-8">
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="mt-2 text-slate-600">{description}</p>

          <p className="mt-3 text-sm text-amber-700">
            Demo preview only — login and permissions are not yet implemented.
          </p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <article
              key={module.title}
              className="rounded-xl bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold">
                {module.title}
              </h3>

              <p className="mt-3 text-sm text-slate-600">
                {module.description}
              </p>

              <p className="mt-5 text-xs font-medium text-blue-600">
                Coming soon
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
