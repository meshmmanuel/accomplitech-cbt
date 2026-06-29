import { db } from "@/lib/db";

export class InstitutionRepository {
  findDefault() {
    return db.institution.findFirst({
      orderBy: { createdAt: "asc" },
    });
  }

  findById(id: string) {
    return db.institution.findUnique({ where: { id } });
  }
}

export const institutionRepository = new InstitutionRepository();
