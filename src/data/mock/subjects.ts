export const subjects = [
  {
    id: 1,
    code: "CS101",
    name: "Introduction to Computer Science",
    desc: "Fundamentals of computing, programming and data structures.",
    examCount: 3,
    color: "#EEF2FF",
    dot: "#1A2B5E",
  },
  {
    id: 2,
    code: "MTH301",
    name: "Advanced Mathematics",
    desc: "Calculus, linear algebra and numerical methods.",
    examCount: 2,
    color: "#FDF4FF",
    dot: "#7C3AED",
  },
  {
    id: 3,
    code: "ENG201",
    name: "Technical English Writing",
    desc: "Academic and professional writing skills.",
    examCount: 1,
    color: "#ECFDF5",
    dot: "#10B981",
  },
  {
    id: 4,
    code: "PHY101",
    name: "General Physics",
    desc: "Mechanics, waves and thermodynamics.",
    examCount: 2,
    color: "#FFF7ED",
    dot: "#F59E0B",
  },
] as const;

export type Subject = (typeof subjects)[number];
