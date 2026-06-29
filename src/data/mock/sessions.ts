export const sessions = [
  {
    id: 1,
    name: "First Semester Exams 2025",
    date: "Jul 15, 2025",
    time: "9:00 AM",
    instructions:
      "Students must arrive 15 minutes early. No entry after 9:10 AM.\nMobile phones must be submitted at the door.\nPresent ID card and exam slip.",
    examIds: [1, 4],
    dur: 180,
    type: "both" as const,
    status: "upcoming" as const,
    enrolled: 32,
    examCode: "FS2025",
  },
  {
    id: 2,
    name: "Mid-Term Assessment",
    date: "Jul 10, 2025",
    time: "10:00 AM",
    instructions:
      "This is a closed-book exam. No reference materials allowed.",
    examIds: [1],
    dur: 90,
    type: "obj" as const,
    status: "active" as const,
    enrolled: 28,
    examCode: "MT2025",
  },
  {
    id: 3,
    name: "English Proficiency Test",
    date: "Jun 28, 2025",
    time: "2:00 PM",
    instructions:
      "Bring your own pen. Pencils are not accepted for essay answers.",
    examIds: [6],
    dur: 60,
    type: "theory" as const,
    status: "completed" as const,
    enrolled: 45,
    examCode: "ENG2025",
  },
] as const;

export type Session = (typeof sessions)[number];
