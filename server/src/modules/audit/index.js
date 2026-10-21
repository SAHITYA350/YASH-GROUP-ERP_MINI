import { createAuditRepository } from "./audit.repository.js";
import { createAuditService } from "./audit.service.js";

export function initAuditModule(prisma) {
  const repository = createAuditRepository(prisma);
  const service = createAuditService(repository);

  return { repository, service };
}

export { createAuditRepository, createAuditService };
