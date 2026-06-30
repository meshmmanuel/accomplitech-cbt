# AccompliTech CBT

Computer-Based Testing platform for colleges and training institutions. A single Next.js application powers both the admin back office and the student exam experience, designed to run in the browser today and inside an Electron shell for lab deployments.

## What it does

### Student portal

- Log in with an admission number and session exam code
- View scheduled exams in a session hub
- Read exam instructions, then start timed attempts
- Answer objective (multiple choice) and theory questions in a focused exam workspace
- Submit individual exams or an entire session; the server controls timers and final submission

### Admin portal

- **Dashboard** — overview of sessions, subjects, and live activity
- **Subjects & exams** — organize courses, create exams (objective, theory, or both), and manage question banks
- **Question import** — bring in questions from CSV, Word (`.docx`), or AI-assisted extraction via Google Gemini
- **Sessions** — schedule exam windows, assign exams, and control when students can sit papers
- **Monitor** — live lab-floor view of connected workstations: online/offline presence, student activity, progress, and time remaining
- **Results & reports** — review outcomes after sessions close
- **Settings** — institution profile and configuration

### How it works

- The **server is the source of truth** for exam timers, submission, and grading
- **Workstation presence** is tracked via client heartbeat so invigilators can see which machines are online and what each student is doing
- Business logic lives in `src/services/`, data access in `src/repositories/`, and thin HTTP handlers in `src/app/api/`

## Tech stack

| Layer | Tools |
|-------|-------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router), [React 19](https://react.dev), TypeScript |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com), [Lucide React](https://lucide.dev) icons, Inter font |
| **Database** | [Prisma 7](https://www.prisma.io) with SQLite (`better-sqlite3`) for V1; schema is PostgreSQL-migration-ready |
| **Auth** | JWT via [jose](https://github.com/panva/jose), password hashing with [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Validation** | [Zod](https://zod.dev) |
| **Question import** | [Mammoth](https://github.com/mwilliamson/mammoth.js) (Word parsing), [@google/generative-ai](https://ai.google.dev) (Gemini extraction) |
| **Desktop (planned)** | Electron shell in `electron/` for LAN lab deployments |

## Project structure

```
src/
├── app/           # Pages and API routes (Next.js App Router)
├── components/    # UI components (admin, student, shared)
├── services/      # Business logic
├── repositories/  # Prisma data access
├── modules/       # Domain types, schemas, and constants
├── lib/           # DB singleton, auth, utilities
└── hooks/         # Client-side React hooks

prisma/
├── schema.prisma  # Data model
├── migrations/    # SQL migrations
└── seed.ts        # Demo institution, users, subjects, exams, sessions
```

## Getting started

### Prerequisites

- Node.js 20+
- npm

### Install and run

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The landing page links to the **Student** and **Admin** portals.

### Seed credentials

After seeding, you can sign in to the admin portal with:

| Field | Value |
|-------|-------|
| Email | `admin@examlink.local` |
| Password | `admin123` |

Student login uses an admission number and the active session exam code from the seed data (see `prisma/seed-ids.ts`).

### Environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLite path (default: `file:./dev.db`) |
| `GEMINI_API_KEY` | Required for AI-assisted Word question import |
| `GEMINI_MODEL` | Optional Gemini model override |

### Useful scripts

```bash
npm run dev          # Start development server
npm run build        # Production build (runs prisma generate)
npm run db:migrate   # Apply migrations
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database and re-seed
npm run lint         # ESLint
```

## License

Private — Accomplitech.
