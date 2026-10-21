export const createCustomerRepository = (prisma) => ({
  findManyAndCount: async ({ page = 1, pageSize = 20, search } = {}) => {
    const where = search
      ? {
          OR: ["code", "name", "email", "phone"].map((field) => ({
            [field]: { contains: search, mode: "insensitive" },
          })),
        }
      : {};

    const [total, data] = await prisma.$transaction([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return { total, data };
  },

  findById: async (id) => {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        leads: { take: 20, orderBy: { createdAt: "desc" } },
        quotations: { take: 20, orderBy: { createdAt: "desc" } },
        orders: { take: 20, orderBy: { createdAt: "desc" } },
      },
    });
  },

  create: async (data, tx) => {
    const client = tx || prisma;
    return client.customer.create({ data });
  },

  update: async (id, data, tx) => {
    const client = tx || prisma;
    return client.customer.update({ where: { id }, data });
  },

  count: async () => prisma.customer.count(),
});
