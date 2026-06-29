/** Stable IDs for seed data — referenced by tests and dev login hints */
export const SEED_IDS = {
  institution: "inst_examlink_demo",
  admin: "user_admin_demo",
  subjects: {
    cs101: "subj_cs101",
    mth301: "subj_mth301",
    eng201: "subj_eng201",
    phy101: "subj_phy101",
  },
  exams: {
    cs101MidTerm: "exam_cs101_midterm",
    cs101Final: "exam_cs101_final",
    cs101Resit: "exam_cs101_resit",
    mth301Calculus: "exam_mth301_calculus",
    mth301Final: "exam_mth301_final",
    eng201Proficiency: "exam_eng201_proficiency",
    phy101Practical: "exam_phy101_practical",
  },
  sessions: {
    firstSemester: "sess_first_sem_2025",
    midTerm: "sess_mid_term",
    englishProficiency: "sess_english_proficiency",
  },
} as const;

export const SEED_CREDENTIALS = {
  adminEmail: "admin@examlink.local",
  adminPassword: "admin123",
  /** Active session exam code for student login testing */
  demoExamCode: "MT2025",
} as const;
