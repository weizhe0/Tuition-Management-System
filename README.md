# Tuition Management System V2

A full-stack tuition center management system built with Next.js, TypeScript, Prisma ORM, PostgreSQL, and Better Auth.

The application provides role-based dashboards for staff, teachers, and students to manage tuition center operations. This project was developed as a hands-on learning project to practise full-stack development, database design, authentication, and role-based authorization.

## Screenshots

### Staff Management Dashboard

Staff can manage students, teachers, tuition classes, and student enrollments.

![Staff Management Dashboard](docs/screenshots/staff-dashboard.png)

### Teacher Dashboard

Teachers can view their assigned classes, enrolled students, and teacher profile information.

![Teacher Dashboard](docs/screenshots/teacher-dashboard.png)

### Student Dashboard

Students can view their personal information, monthly fee plan, and enrolled classes.

![Student Dashboard](docs/screenshots/student-dashboard.png)

## Features

### Authentication and Authorization

- Email and password authentication with Better Auth.
- Role-based access for Staff, Teachers, and Students.
- Protected dashboards and server-side role checks.
- Login and logout functionality.

### Student Management

- View registered students.
- Create and edit student records.
- Manage student status and monthly fee plans.

### Teacher Management

- Create and edit teacher profiles.
- Manage teacher active status.
- Assign and reassign teachers to tuition classes.

### Class Management

- Create tuition classes.
- Assign teachers to classes.
- Enroll students into classes.
- View class and enrollment information.

### Role-Based Dashboards

- **Staff:** Overview of students, teachers, classes, and enrollments.
- **Teacher:** View assigned classes and enrolled students.
- **Student:** View personal information, monthly fee plan, and enrolled classes.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js App Router | Full-stack web application |
| TypeScript | Type-safe application code |
| Tailwind CSS | User interface styling |
| Better Auth | Authentication |
| Prisma ORM | Database access and data modeling |
| PostgreSQL | Relational database |
| Git and GitHub | Version control and source code management |

## Project Structure

```text
tuition-management-system/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── scripts/
│   └── create-demo-logins.ts
├── src/
│   ├── app/
│   │   ├── api/auth/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── staff/
│   │   ├── teacher/
│   │   └── student/
│   ├── components/
│   └── lib/
│       ├── auth.ts
│       ├── auth-client.ts
│       ├── prisma.ts
│       └── role-guard.ts
├── docs/
│   └── screenshots/
├── prisma7.config.ts
├── package.json
├── package-lock.json
└── README.md
```

## Getting Started

Follow this guide to set up the project on a new computer.

### Prerequisites

Install the following software before running the application:

- [Node.js](https://nodejs.org/) — version 20.9.0 or later, compatible with Next.js 16.
- npm — included with Node.js.
- [PostgreSQL](https://www.postgresql.org/) — relational database.
- [Git](https://git-scm.com/) — version control.

Verify that Node.js, npm, and Git are installed:

```powershell
node -v
npm -v
git --version
```

### 1. Clone the Repository

```powershell
git clone https://github.com/weizhe0/Tuition-Management-System.git
cd Tuition-Management-System
```

If the repository is private, you must have permission to access it.

### 2. Install Dependencies

```powershell
npm install
```

This command installs the project dependencies defined in `package.json` and `package-lock.json`.

**Why is `npm install` necessary?**

GitHub stores the source code and dependency definitions, but the `node_modules` directory is normally excluded from version control. npm downloads the required packages when you run `npm install`.

If you encounter the error `'next' is not recognized as an internal or external command`, install the dependencies before running the development server.

### 3. Configure Environment Variables

Create a `.env` file in the project root, alongside `package.json`.

Configure the PostgreSQL connection and authentication settings required by the project.

Example:

```dotenv
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"
SHADOW_DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/SHADOW_DATABASE_NAME?schema=public"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-own-long-random-secret"
```

Replace the example values with your own local configuration.

Important notes:

- Make sure the environment variable names match those expected by `prisma7.config.ts` and `src/lib/auth.ts`.
- Configure PostgreSQL and create the required databases before running database migrations.
- Use your own strong, randomly generated authentication secret.
- Never commit your real `.env` file, database passwords, or authentication secrets to GitHub.
- The `.env` file is normally excluded from Git through `.gitignore`.

### 4. Set Up the PostgreSQL Database

Install and start PostgreSQL, then create or configure a local development database.

Make sure the database names, username, password, host, and port match the connection strings in your `.env` file.

A fresh database does not automatically contain the data from another computer. GitHub stores your code, not your local PostgreSQL database contents.

### 5. Apply Database Migrations

After configuring the database, run:

```powershell
npx prisma migrate dev
```

This applies the project's existing development migrations to the configured database.

Then generate Prisma Client:

```powershell
npx prisma generate
```

Prisma Client provides the generated database access code used by the application. In this project, the generated output is local and may be excluded from Git, so it should be generated after installing dependencies on a new computer.

**Important:** Confirm that your database connection points to the intended development database before running migrations. Do not use a production database for local development migrations.

### 6. Set Up Demo Accounts

The repository includes a demo-account creation script:

```text
scripts/create-demo-logins.ts
```

Demo accounts are separate from the database schema and are not automatically created just by cloning the repository.

After configuring your local environment and database, check the project's `package.json` scripts and the demo-account script to confirm the intended command before running it.

Use fictional demo data only. Do not put real passwords or generated demo credentials in this README or commit them to GitHub.

### 7. Start the Development Server

```powershell
npm run dev
```

Open the application in your browser:

[http://localhost:3000](http://localhost:3000)

The development server must remain running while you use the local application.

## Common Troubleshooting

### Error: `'next' is not recognized`

Install the project dependencies:

```powershell
npm install
```

Then try again:

```powershell
npm run dev
```

### Error: Prisma Client or generated module not found

Regenerate Prisma Client:

```powershell
npx prisma generate
```

### Error: Cannot connect to PostgreSQL

Check that:

- PostgreSQL is installed and running.
- The target database exists.
- Your `.env` connection strings are correct.
- The database username and password are valid.

### Error: Missing environment variables

Confirm that `.env` exists in the project root and contains the variables required by the application and Prisma configuration.

Restart the development server after changing environment variables.

### Demo login accounts are missing

A fresh database may not contain any demo accounts. Follow the demo-account setup instructions in the project before attempting to log in.

## Development Notes

- This project currently uses fictional demo data for development and demonstration.
- The application has separate Staff, Teacher, and Student dashboards.
- Server-side role checks are used to protect role-specific pages and actions.
- A fresh installation requires its own environment variables and PostgreSQL database.
- Database records are not included automatically when cloning the repository.

Before production deployment, review security, account lifecycle management, database backups, automated testing, and production environment configuration.

## Future Improvements

- Attendance management.
- Payment and outstanding fee tracking.
- Class timetable and scheduling.
- Staff-managed teacher and student accounts.
- Automated testing with Vitest and Playwright.
- Production deployment and database backup procedures.
- Improved monitoring and error handling.

## Author

Developed as a hands-on project to practise full-stack development, relational database design, authentication, role-based authorization, and Git version control.