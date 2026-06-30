import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  ExamType,
  QuestionType,
  SessionStatus,
  UserRole,
} from "@prisma/client";
import { createPrismaClient } from "../src/lib/db";
import { canonicalToDbFields, textBlock } from "../src/modules/questions";
import { SEED_CREDENTIALS, SEED_IDS } from "./seed-ids";

const prisma = createPrismaClient();

const ANSWER_LETTERS = ["A", "B", "C", "D"] as const;

function mapExamType(type: "obj" | "theory" | "both"): ExamType {
  if (type === "obj") return ExamType.OBJECTIVE;
  if (type === "theory") return ExamType.THEORY;
  return ExamType.BOTH;
}

function mapSessionStatus(
  status: "upcoming" | "active" | "completed",
): SessionStatus {
  if (status === "upcoming") return SessionStatus.UPCOMING;
  if (status === "active") return SessionStatus.OPEN;
  return SessionStatus.CLOSED;
}

async function main() {
  console.log("Seeding AccompliTech CBT database...");

  await prisma.examAnswer.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.examSessionExam.deleteMany();
  await prisma.examSession.deleteMany();
  await prisma.question.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  const institution = await prisma.institution.create({
    data: {
      id: SEED_IDS.institution,
      name: "Demo Institution",
    },
  });

  const passwordHash = await bcrypt.hash(SEED_CREDENTIALS.adminPassword, 10);

  await prisma.user.create({
    data: {
      id: SEED_IDS.admin,
      institutionId: institution.id,
      email: SEED_CREDENTIALS.adminEmail,
      passwordHash,
      name: "Demo Admin",
      role: UserRole.SUPER_ADMIN,
    },
  });

  const subjects = [
    {
      id: SEED_IDS.subjects.cs101,
      code: "CS101",
      name: "Introduction to Computer Science",
      description:
        "Fundamentals of computing, programming and data structures.",
    },
    {
      id: SEED_IDS.subjects.mth301,
      code: "MTH301",
      name: "Advanced Mathematics",
      description: "Calculus, linear algebra and numerical methods.",
    },
    {
      id: SEED_IDS.subjects.eng201,
      code: "ENG201",
      name: "Technical English Writing",
      description: "Academic and professional writing skills.",
    },
    {
      id: SEED_IDS.subjects.phy101,
      code: "PHY101",
      name: "General Physics",
      description: "Mechanics, waves and thermodynamics.",
    },
  ];

  for (const subject of subjects) {
    await prisma.subject.create({
      data: {
        id: subject.id,
        institutionId: institution.id,
        code: subject.code,
        name: subject.name,
        description: subject.description,
      },
    });
  }

  const exams = [
    {
      id: SEED_IDS.exams.cs101MidTerm,
      subjectId: SEED_IDS.subjects.cs101,
      name: "Mid-Term Assessment",
      type: "both" as const,
      durationMinutes: 90,
      passMark: 50,
      totalMarks: 46,
      instructions:
        "1. Read all questions carefully.\n2. Write legibly in your answer booklet for theory.\n3. No programmable calculators.\n4. Mobile phones must be off.",
      status: "active",
    },
    {
      id: SEED_IDS.exams.cs101Final,
      subjectId: SEED_IDS.subjects.cs101,
      name: "End of Semester Exam",
      type: "obj" as const,
      durationMinutes: 60,
      passMark: 45,
      totalMarks: 100,
      instructions:
        "1. All 40 questions are compulsory.\n2. Shade your answer sheet with pencil.\n3. Each question carries 2.5 marks.",
      status: "draft",
    },
    {
      id: SEED_IDS.exams.cs101Resit,
      subjectId: SEED_IDS.subjects.cs101,
      name: "Resit Exam",
      type: "theory" as const,
      durationMinutes: 120,
      passMark: 40,
      totalMarks: 75,
      instructions:
        "1. Answer any 3 of the 5 questions.\n2. All questions carry equal marks.\n3. Show all workings.",
      status: "draft",
    },
    {
      id: SEED_IDS.exams.mth301Calculus,
      subjectId: SEED_IDS.subjects.mth301,
      name: "Calculus Assessment",
      type: "obj" as const,
      durationMinutes: 45,
      passMark: 50,
      totalMarks: 40,
      instructions:
        "1. Use the OMR answer sheet provided.\n2. Calculators are NOT allowed.",
      status: "active",
    },
    {
      id: SEED_IDS.exams.mth301Final,
      subjectId: SEED_IDS.subjects.mth301,
      name: "Final Examination",
      type: "both" as const,
      durationMinutes: 180,
      passMark: 50,
      totalMarks: 150,
      instructions:
        "1. Show all working for full marks.\n2. Scientific calculators allowed.\n3. Write matric number on every page.",
      status: "draft",
    },
    {
      id: SEED_IDS.exams.eng201Proficiency,
      subjectId: SEED_IDS.subjects.eng201,
      name: "Proficiency Test",
      type: "theory" as const,
      durationMinutes: 60,
      passMark: 60,
      totalMarks: 60,
      instructions:
        "1. Answer in clear, coherent paragraphs.\n2. Grammar and spelling will be assessed.\n3. Minimum 150 words per essay.",
      status: "active",
    },
    {
      id: SEED_IDS.exams.phy101Practical,
      subjectId: SEED_IDS.subjects.phy101,
      name: "Practical Theory Paper",
      type: "both" as const,
      durationMinutes: 90,
      passMark: 50,
      totalMarks: 120,
      instructions:
        "1. Show all workings with SI units.\n2. Formulae sheet provided on page 2.",
      status: "draft",
    },
  ];

  for (const exam of exams) {
    await prisma.exam.create({
      data: {
        id: exam.id,
        subjectId: exam.subjectId,
        name: exam.name,
        type: mapExamType(exam.type),
        durationMinutes: exam.durationMinutes,
        passMark: exam.passMark,
        totalMarks: exam.totalMarks,
        instructions: exam.instructions,
        status: exam.status,
      },
    });
  }

  const midTermQuestions = [
    {
      type: "obj" as const,
      text: "Which data structure uses LIFO order?",
      options: ["Queue", "Stack", "Heap", "Graph"],
      correctIndex: 1,
      marks: 2,
    },
    {
      type: "obj" as const,
      text: "What does RAM stand for?",
      options: [
        "Random Access Memory",
        "Rapid Array Module",
        "Read-only Access Memory",
        "Runtime Array Memory",
      ],
      correctIndex: 0,
      marks: 2,
    },
    {
      type: "obj" as const,
      text: "Binary 1101 in decimal equals:",
      options: ["11", "12", "13", "14"],
      correctIndex: 2,
      marks: 2,
    },
    {
      type: "obj" as const,
      text: "Which OSI layer handles routing?",
      options: ["Data Link", "Network", "Transport", "Application"],
      correctIndex: 1,
      marks: 2,
    },
    {
      type: "obj" as const,
      text: "Average time complexity of Quicksort:",
      options: ["O(n)", "O(n log n)", "O(n squared)", "O(log n)"],
      correctIndex: 1,
      marks: 2,
    },
    {
      type: "obj" as const,
      text: "HTTP stands for:",
      options: [
        "HyperText Transfer Protocol",
        "High Transfer Text Protocol",
        "HyperText Transport Port",
        "None",
      ],
      correctIndex: 0,
      marks: 2,
    },
    {
      type: "obj" as const,
      text: "Which is NOT a relational database?",
      options: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"],
      correctIndex: 2,
      marks: 2,
    },
    {
      type: "obj" as const,
      text: "Which language runs natively in the browser?",
      options: ["Python", "Java", "JavaScript", "C++"],
      correctIndex: 2,
      marks: 2,
    },
    {
      type: "theory" as const,
      text: "Explain the four main principles of Object-Oriented Programming (Encapsulation, Inheritance, Polymorphism, Abstraction) with practical examples.",
      marks: 15,
    },
    {
      type: "theory" as const,
      text: "Describe the OSI model layers and explain the function of each. How does data encapsulation work as data moves down the layers?",
      marks: 15,
    },
  ];

  for (const [index, question] of midTermQuestions.entries()) {
    const canonical =
      question.type === "obj"
        ? {
            questionType: "multiple_choice" as const,
            marks: question.marks,
            blocks: [textBlock(question.text)],
            options: question.options.map((value, optionIndex) => ({
              id: ANSWER_LETTERS[optionIndex],
              blocks: [textBlock(value)],
            })),
            answer: {
              kind: "single" as const,
              value: ANSWER_LETTERS[question.correctIndex],
            },
          }
        : {
            questionType: "essay" as const,
            marks: question.marks,
            blocks: [textBlock(question.text)],
            answer: { kind: "essay" as const, value: null },
          };

    const { examId, ...fields } = canonicalToDbFields(
      canonical,
      SEED_IDS.exams.cs101MidTerm,
      index,
    );

    await prisma.question.create({
      data: {
        examId,
        ...fields,
      },
    });
  }

  const sessions = [
    {
      id: SEED_IDS.sessions.firstSemester,
      name: "First Semester Exams 2025",
      date: new Date("2025-07-15T09:00:00"),
      startTime: "9:00 AM",
      durationMinutes: 180,
      instructions:
        "Students must arrive 15 minutes early. No entry after 9:10 AM.\nMobile phones must be submitted at the door.\nPresent ID card and exam slip.",
      examCode: "FS2025",
      status: "upcoming" as const,
      examIds: [SEED_IDS.exams.cs101MidTerm, SEED_IDS.exams.mth301Calculus],
    },
    {
      id: SEED_IDS.sessions.midTerm,
      name: "Mid-Term Assessment",
      date: new Date("2025-07-10T10:00:00"),
      startTime: "10:00 AM",
      durationMinutes: 90,
      instructions:
        "This is a closed-book exam. No reference materials allowed.",
      examCode: SEED_CREDENTIALS.demoExamCode,
      status: "active" as const,
      examIds: [SEED_IDS.exams.cs101MidTerm],
    },
    {
      id: SEED_IDS.sessions.englishProficiency,
      name: "English Proficiency Test",
      date: new Date("2025-06-28T14:00:00"),
      startTime: "2:00 PM",
      durationMinutes: 60,
      instructions:
        "Bring your own pen. Pencils are not accepted for essay answers.",
      examCode: "ENG2025",
      status: "completed" as const,
      examIds: [SEED_IDS.exams.eng201Proficiency],
    },
  ];

  for (const session of sessions) {
    await prisma.examSession.create({
      data: {
        id: session.id,
        institutionId: institution.id,
        name: session.name,
        date: session.date,
        startTime: session.startTime,
        durationMinutes: session.durationMinutes,
        instructions: session.instructions,
        examCode: session.examCode,
        status: mapSessionStatus(session.status),
        sessionExams: {
          create: session.examIds.map((examId) => ({ examId })),
        },
      },
    });
  }

  console.log("Seed complete.");
  console.log(`  Admin: ${SEED_CREDENTIALS.adminEmail} / ${SEED_CREDENTIALS.adminPassword}`);
  console.log(`  Student exam code: ${SEED_CREDENTIALS.demoExamCode} (session: Mid-Term Assessment)`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
