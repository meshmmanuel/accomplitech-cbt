import { AppError } from "@/lib/errors";
import {
  examCodeToType,
  toExamDetail,
  type CreateExamInput,
  type UpdateExamInput,
} from "@/modules/exams";
import { examRepository } from "@/repositories/exam.repository";
import { subjectRepository } from "@/repositories/subject.repository";

export class ExamService {
  async getById(id: string) {
    return examRepository.findById(id);
  }

  async getDetail(id: string) {
    const exam = await examRepository.findById(id);
    if (!exam) return null;
    return toExamDetail(exam);
  }

  listBySubject(subjectId: string) {
    return examRepository.findBySubject(subjectId);
  }

  async create(subjectId: string, input: CreateExamInput) {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new AppError("Subject not found", 404);
    }

    const exam = await examRepository.create({
      subject: { connect: { id: subjectId } },
      name: input.name,
      type: examCodeToType(input.type),
      durationMinutes: input.durationMinutes,
      passMark: input.passMark,
      totalMarks: input.totalMarks ?? 100,
      instructions: input.instructions || null,
      status: input.status ?? "draft",
    });

    return toExamDetail({
      ...exam,
      _count: { questions: 0 },
    });
  }

  async update(id: string, input: UpdateExamInput) {
    const existing = await examRepository.findById(id);
    if (!existing) {
      throw new AppError("Exam not found", 404);
    }

    const exam = await examRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.type !== undefined ? { type: examCodeToType(input.type) } : {}),
      ...(input.durationMinutes !== undefined
        ? { durationMinutes: input.durationMinutes }
        : {}),
      ...(input.passMark !== undefined ? { passMark: input.passMark } : {}),
      ...(input.totalMarks !== undefined ? { totalMarks: input.totalMarks } : {}),
      ...(input.instructions !== undefined
        ? { instructions: input.instructions || null }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    });

    return toExamDetail({
      ...exam,
      _count: { questions: existing._count.questions },
    });
  }

  async delete(id: string) {
    const existing = await examRepository.findByIdWithRelations(id);
    if (!existing) {
      throw new AppError("Exam not found", 404);
    }

    if (existing._count.sessionExams > 0) {
      throw new AppError(
        "Cannot delete an exam linked to a session. Remove it from sessions first.",
        409,
      );
    }

    if (existing._count.attempts > 0) {
      throw new AppError(
        "Cannot delete an exam that has student attempts.",
        409,
      );
    }

    await examRepository.delete(id);
  }
}

export const examService = new ExamService();
