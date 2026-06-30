# ExamLink CBT — Backlog

Last updated: Monitor reframed as client presence; pivot toward client/student side.

## Current phase

**Phase 3 ~85% done** — Subjects, exams, questions, sessions CRUD are live.  
**Next focus:** client/student side (Phase 4 + Electron presence), not more admin mock wiring.

---

## Monitor — intended design (not yet built)

Monitor is a **lab floor view**, not a database attempt list.

**Primary:** Which **clients/workstations** are online vs offline (heartbeat).  
**Secondary:** If a client has a **logged-in student**, show user + activity (exam, progress, time left).

```
Workstation (client)  →  online | offline | disconnected
       ↓ (optional)
Student on that client →  admission #, session/exam, progress
```

| Monitor column | Source |
|----------------|--------|
| Seat / machine | Client registration (Electron or browser tab) |
| IP | Server or client report |
| Online / offline | Heartbeat + last-seen timeout (~30s) |
| User | Student login tied to `clientId` |
| Activity | Screen state: idle, instructions, in exam, submitted |
| Progress / time left | Attempt APIs (Phase 4) when in exam |

**Do not** implement Monitor as “query `ExamAttempt` only” — that misses idle online machines and true offline state.

### Monitor — backlog

- [ ] `ExamClient` (or similar) model: id, seat label, ip, lastSeenAt, institutionId
- [ ] Client register + heartbeat API (`POST /api/clients/heartbeat`)
- [ ] Link heartbeat payload to optional student session / attempt id
- [ ] `monitorService` + `GET /api/monitor/live` (clients first, user overlay second)
- [ ] Wire Monitor page: poll API, empty/loading/error states
- [ ] Overview + sidebar badge: “X clients online, Y in exam” from same service
- [ ] **Deferred:** Pause all, add time, broadcast, reset disconnected (invigilator controls)
- [ ] **Deferred:** Seat roster pre-registration (V1 can use auto-assigned client id)

---

## Question bank (deferred)

- [ ] Rich-text editor (TipTap or similar) for manual create/edit
- [ ] Expandable question detail view in admin
- [ ] Student-facing preview from admin question bank
- [ ] Wire CSV import button on exam page (`QuestionImportModal` exists)
- [ ] Bulk delete / bulk reorder
- [ ] Search and filter by topic, type, difficulty

## Phase 3 — Admin (remaining, after client data exists)

- [ ] Wire overview dashboard (real stats + sessions + subjects; active counts from monitor/attempts)
- [ ] Monitor page — **client presence** (see above)
- [ ] Results page — submitted attempts + theory grading UI
- [ ] Reports page — real analytics

## Phase 4 — Student exam runtime (priority)

Browser-first; Electron wraps the same student UI later.

- [ ] Attempt APIs (start, save answer, submit)
- [ ] `/exam/[attemptId]` page (replace `/exam/demo`)
- [ ] Server-side timer and auto-submit
- [ ] Objective grading on submit
- [ ] Render question blocks on student exam UI (theory stems + images/tables)
- [ ] Link session instructions → real exam start
- [ ] Client heartbeat from student app (idle / logged in / in exam / submitted)

## Phase 1b — Electron lab client

- [ ] Electron main: start Next.js, expose LAN IP
- [ ] Student app in Electron shell (kiosk-friendly)
- [ ] Persistent `clientId` + heartbeat from main/renderer
- [ ] Admin server reachable on LAN for lab machines

## V1+ / Polish

- [ ] Session auto open/close by schedule
- [ ] Duplicate exam / copy question bank
- [ ] Audit log UI
- [ ] Student roster management (deferred for V1)
- [ ] Invigilator actions: pause session, add time, broadcast message

## Credentials (dev)

- Admin: `admin@examlink.local` / `admin123`
- Seed exam code: `MT2025` (`npm run db:seed`)
