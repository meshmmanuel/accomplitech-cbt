"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ExamSuccessPage() {
  const pct = 63;

  return (
    <div className="min-h-screen bg-surface p-10">
      <div className="mx-auto max-w-[560px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-exam-green bg-emerald-50">
            <CheckCircle size={40} className="text-exam-green" />
          </div>
          <h2 className="m-0 mb-1.5 text-[26px] font-black text-exam-text">
            Exam Submitted
          </h2>
          <p className="text-sm text-exam-muted">CS101 · Mid-Term Assessment</p>
        </div>

        <div className="mb-4 rounded-2xl border border-exam-border bg-exam-white p-6.5">
          <div className="mb-5 grid grid-cols-3 gap-3">
            {[
              {
                label: "Objective Score",
                value: "14/16",
                sub: `${pct}%`,
                color: "text-exam-green",
              },
              {
                label: "Theory (Paper)",
                value: "30 marks",
                sub: "To be graded",
                color: "text-exam-amber",
              },
              {
                label: "Time Used",
                value: "38:42",
                sub: "of 90:00",
                color: "text-navy",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-[10px] bg-surface p-3.5 text-center"
              >
                <div className="mb-1 text-[11px] text-exam-muted">
                  {stat.label}
                </div>
                <div className={`text-xl font-extrabold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-[11px] text-exam-muted">{stat.sub}</div>
              </div>
            ))}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-exam-border">
            <div
              className="h-full rounded-full bg-exam-green"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <Link href="/student/login">
          <Button variant="navy" className="w-full justify-center">
            Back to Exam Portal
          </Button>
        </Link>
      </div>
    </div>
  );
}
