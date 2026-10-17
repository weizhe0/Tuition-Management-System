"use client";

import { useState } from "react";

type Student = {
  id: number;
  name: string;
  subject: string;
  monthlyFee: number;
  paymentStatus: "paid" | "unpaid";
};

const students: Student[] = [
  {
    id: 1,
    name: "Ali Tan",
    subject: "Mathematics",
    monthlyFee: 180,
    paymentStatus: "paid",
  },
  {
    id: 2,
    name: "Mei Ling",
    subject: "English",
    monthlyFee: 150,
    paymentStatus: "unpaid",
  },
  {
    id: 3,
    name: "Jason Lee",
    subject: "Physics",
    monthlyFee: 200,
    paymentStatus: "paid",
  },
  {
  id: 4,
  name: "Sarah Lim",
  subject: "Chemistry",
  monthlyFee: 250,
  paymentStatus: "unpaid",
  },
];

const totalMonthlyFees = students.reduce(
  (total, student) => total + student.monthlyFee,
  0
);

const paidStudents = students.filter(
  (student) => student.paymentStatus === "paid"
);

const unpaidStudents = students.filter(
  (student) => student.paymentStatus === "unpaid"
);

const totalPaidFees = paidStudents.reduce(
  (total, student) => total + student.monthlyFee,0
);

const totalUnPaidFees = unpaidStudents.reduce(
  (total, student) => total + student.monthlyFee,0
);



export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredStudents = students.filter((student) =>
    student.name
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase())
  );

  {filteredStudents.length === 0 && (
  <p>No students found</p>
)}


  return (

    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">
          Tuition Management System
        </h1>


        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          <label
            htmlFor="student-search"
            className="block text-sm font-medium"
          >
            Search Student / 搜索学生
          </label>

          <input
            id="student-search"
            type="text"
            placeholder="Enter student name..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 p-3"
          />

          <p className="mt-3 text-sm text-slate-500">
            You are searching for: {searchQuery}
          </p>
        </div>

        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">
            Total Students / 学生总数
          </h2>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {students.length}
          </p>
        </div>

        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">
            Total Monthly Fees / 月费总额
          </h2>

          <p className="mt-2 text-3xl font-bold text-green-600">
            RM {totalMonthlyFees}
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">
            Paid Students / 已付款学生
          </h2>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {paidStudents.length}
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">
            Unpaid Students / 未付款学生
          </h2>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {unpaidStudents.length}
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">
            Fees Marked Paid / 标记已付学费
          </h2>

          <p className="mt-2 text-3xl font-bold text-green-600">
            RM {totalPaidFees}
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">
            Fees Marked Unpaid / 标记未付学费
          </h2>

          <p className="mt-2 text-3xl font-bold text-red-600">
            RM {totalUnPaidFees}
          </p>
        </div>

        <section className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">
            Student List / 学生名单
          </h2>

          {filteredStudents.length === 0 && (
            <p
              role="status"
              className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800"
            >
              No students found / 找不到学生。
              Please try another name.
            </p>
          )}

          <ul className="mt-4 space-y-3">
            {filteredStudents.map((student) => (
              <li
                key={student.id}
                className="flex justify-between rounded-lg bg-slate-100 p-4"
              >
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-slate-600">
                    {student.subject}
                  </p>


                  <p
                    className={
                      student.paymentStatus === "paid"
                        ? "mt-2 text-sm font-medium text-green-600"
                        : "mt-2 text-sm font-medium text-red-600"
                    }
                  >
                    {student.paymentStatus === "paid"
                      ? "Paid / 已付款"
                      : "Unpaid / 未付款"}
                  </p>

                </div>

                <p className="font-semibold">
                  RM {student.monthlyFee}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}