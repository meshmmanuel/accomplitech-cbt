import { attemptService } from "@/services/attempt.service";
import { institutionRepository } from "@/repositories/institution.repository";
import { AppError } from "@/lib/errors";

export class ResultsService {
  private async getDefaultInstitutionId() {
    const institution = await institutionRepository.findDefault();
    if (!institution) {
      throw new AppError("Institution not configured", 500);
    }
    return institution.id;
  }

  async listForDefaultInstitution() {
    const institutionId = await this.getDefaultInstitutionId();
    return attemptService.listSubmittedForInstitution(institutionId);
  }
}

export const resultsService = new ResultsService();
