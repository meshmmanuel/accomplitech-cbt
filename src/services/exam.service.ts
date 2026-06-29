import { examRepository } from "@/repositories/exam.repository";

export class ExamService {
  getById(id: string) {
    return examRepository.findById(id);
  }

  listBySubject(subjectId: string) {
    return examRepository.findBySubject(subjectId);
  }
}

export const examService = new ExamService();
