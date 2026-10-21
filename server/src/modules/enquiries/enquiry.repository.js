export const createEnquiryRepository = (prisma) => ({
  findManyAndCount: async ({ page = 1, pageSize = 20, status, source, ownerId, search } = {}) => {
    const where = {
      ...(status && { stage: status }),
      ...(source && { source }),
      ...(ownerId && { assignedToId: ownerId }),
      ...(search && {
        OR: ["code", "customerName", "contactName", "email", "phone"].map(
          (field) => ({
            [field]: { contains: search, mode: "insensitive" },
          }),
        ),
      }),
    };

    const [total, data] = await prisma.$transaction([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: "desc" },
        include: {
          assignedTo: { select: { id: true, name: true } },
          customer: { select: { id: true, code: true, name: true } },
          product: { select: { id: true, sku: true, name: true, variant: true, listPrice: true } },
          items: true,
        },
      }),
    ]);

    return { total, data };
  },

  findById: async (id) => {
    return prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true } },
        customer: true,
        product: { select: { id: true, sku: true, name: true, variant: true, listPrice: true, gstPercent: true, unitOfMeasure: true } },
        items: {
          include: {
            product: {
              select: { id: true, sku: true, name: true, variant: true, listPrice: true },
            },
          },
        },
        quotations: {
          orderBy: { createdAt: "desc" },
          include: { items: { include: { product: { select: { id: true, sku: true, name: true, variant: true } } } } },
        },
        communications: {
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true } } },
        },
      },
    });
  },

  create: async (data, tx) => {
    const client = tx || prisma;
    return client.lead.create({
      data,
      include: {
        assignedTo: { select: { id: true, name: true } },
        customer: { select: { id: true, code: true, name: true } },
        items: true,
      },
    });
  },

  update: async (id, data, tx) => {
    const client = tx || prisma;
    return client.lead.update({ where: { id }, data });
  },

  createCommunication: async (data, tx) => {
    const client = tx || prisma;
    return client.communication.create({ data });
  },

  findSalesStaff: async () => {
    return prisma.user.findMany({
      where: { role: { in: ["SALES_CONSULTANT", "SALES_MANAGER"] }, isActive: true },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            assignedLeads: { where: { stage: { notIn: ["CONVERTED", "LOST"] } } },
          },
        },
      },
    });
  },

  findCustomerByContact: async ({ email, phone }) => {
    return prisma.customer.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          phone ? { phone } : undefined,
        ].filter(Boolean),
      },
    });
  },

  createCustomer: async (data, tx) => {
    const client = tx || prisma;
    return client.customer.create({ data });
  },

  findActiveProductsByIds: async (ids) => {
    return prisma.product.findMany({
      where: { id: { in: ids }, isActive: true },
      select: { id: true, sku: true, name: true, variant: true },
    });
  },

  countCustomers: async () => prisma.customer.count(),
});
