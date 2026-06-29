import { questionRepository } from "@/repositories/question.repository";

export class QuestionService {
  listByExam(examId: string) {
    return questionRepository.findByExam(examId);
  }
}

export const questionService = new QuestionService();
