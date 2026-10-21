export const createUserRepository = (prisma) => ({
  findAll: async ({ search } = {}) => {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { department: { contains: search, mode: "insensitive" } },
            { designation: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        designation: true,
        employeeCode: true,
        role: true,
        isActive: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });
  },

  findById: async (id) => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        designation: true,
        employeeCode: true,
        role: true,
        isActive: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  updateAccessibility: async (id, data, tx) => {
    const client = tx || prisma;
    return client.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        designation: true,
        employeeCode: true,
        role: true,
        isActive: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  findRolePermissions: async () => {
    return prisma.rolePermission.findMany();
  },

  upsertRolePermission: async (role, permissions) => {
    return prisma.rolePermission.upsert({
      where: { role },
      update: { permissions },
      create: { role, permissions },
    });
  },
});
