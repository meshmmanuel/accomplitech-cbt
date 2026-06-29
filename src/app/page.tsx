"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, ChevronRight, Monitor, Shield } from "lucide-react";

export default function LandingPage() {
  const [hovered, setHovered] = useState<string | null>(null);

  const portals = [
    {
      key: "student",
      href: "/student/login",
      icon: BookOpen,
      title: "Student Portal",
      desc: "Take your scheduled exams and view your performance.",
      color: "bg-gold text-navy-dark",
      accent: "text-gold",
    },
    {
      key: "admin",
      href: "/admin/login",
      icon: Shield,
      title: "Admin Portal",
      desc: "Manage sessions, questions, students and monitor exams.",
      color: "bg-blue-400 text-navy-dark",
      accent: "text-blue-400",
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-navy-dark via-navy to-blue-900 p-6">
      {[400, 300, 600].map((size, i) => (
        <div
          key={size}
          className={`pointer-events-none absolute rounded-full border border-white/5 ${
            i === 2
              ? "bottom-0 left-0 -translate-x-1/3 translate-y-1/2"
              : "top-1/2 right-0 -translate-y-1/2 translate-x-1/3"
          }`}
          style={{ width: size, height: size }}
        />
      ))}

      <div className="z-10 mb-13 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[20px] bg-gold shadow-[0_12px_40px_rgba(240,165,0,0.35)]">
          <Monitor size={40} className="text-navy-dark" />
        </div>
        <h1 className="m-0 text-4xl font-black tracking-tight text-exam-white">
          ExamLink <span className="text-gold">CBT</span>
        </h1>
        <p className="mt-2.5 text-[15px] text-[#7B90C4]">
          Computer-Based Testing Platform
        </p>
      </div>

      <div className="z-10 flex flex-wrap justify-center gap-5">
        {portals.map((portal) => {
          const Icon = portal.icon;
          const isHovered = hovered === portal.key;
          return (
            <Link
              key={portal.key}
              href={portal.href}
              onMouseEnter={() => setHovered(portal.key)}
              onMouseLeave={() => setHovered(null)}
              className={`w-66 rounded-[20px] border p-8 text-left transition-all ${
                isHovered
                  ? "-translate-y-1 border-white/20 bg-white/10"
                  : "border-white/10 bg-white/6"
              }`}
            >
              <div
                className={`mb-5 flex h-[54px] w-[54px] items-center justify-center rounded-[14px] ${portal.color}`}
              >
                <Icon size={28} />
              </div>
              <div className="mb-2.5 text-[19px] font-bold text-exam-white">
                {portal.title}
              </div>
              <div className="mb-5 text-[13px] leading-relaxed text-[#8899BB]">
                {portal.desc}
              </div>
              <div
                className={`flex items-center gap-1 text-[13px] font-semibold ${portal.accent}`}
              >
                Enter portal <ChevronRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="absolute bottom-5 z-10 flex items-center gap-4 text-xs text-[#3D5490]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-exam-green" />
          Network Online
        </span>
        <span>·</span>
        <span>Server: 192.168.1.1</span>
        <span>·</span>
        <span>v2.4.1</span>
      </div>
    </div>
  );
}
