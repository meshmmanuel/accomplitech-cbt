import { institutionRepository } from "@/repositories/institution.repository";
import { subjectRepository } from "@/repositories/subject.repository";

export class SubjectService {
  async listForDefaultInstitution() {
    const institution = await institutionRepository.findDefault();
    if (!institution) return [];
    return subjectRepository.findAllByInstitution(institution.id);
  }

  async getById(id: string) {
    return subjectRepository.findById(id);
  }
}

export const subjectService = new SubjectService();
