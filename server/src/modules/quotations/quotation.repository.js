export const createQuotationRepository = (prisma) => ({
  findManyAndCount: async ({ page = 1, pageSize = 20, search } = {}) => {
    const where = search
      ? {
          OR: [
            {
              quotationNo: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              customer: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          ],
        }
      : {};

    const [total, data] = await prisma.$transaction([
      prisma.quotation.count({ where }),
      prisma.quotation.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: "desc" },
        include: {
          customer: { select: { name: true } },
          items: {
            include: { product: { select: { id: true, sku: true, name: true, variant: true } } },
          },
          salesOrder: { select: { id: true, orderNumber: true } },
        },
      }),
    ]);

    return { total, data };
  },

  findById: async (id) => {
    return prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        lead: { select: { id: true, code: true, customerName: true } },
        salesRepresentative: { select: { id: true, name: true } },
        items: {
          include: {
            product: {
              select: { id: true, sku: true, name: true, variant: true, listPrice: true, gstPercent: true, unitOfMeasure: true },
            },
          },
        },
        salesOrder: { select: { id: true, orderNumber: true, status: true } },
      },
    });
  },

  create: async (data, tx) => {
    const client = tx || prisma;
    return client.quotation.create({
      data,
      include: { items: true },
    });
  },

  update: async (id, data, tx) => {
    const client = tx || prisma;
    return client.quotation.update({ where: { id }, data });
  },

  updateLeadStage: async (leadId, stage, tx) => {
    const client = tx || prisma;
    return client.lead.update({
      where: { id: leadId },
      data: { stage },
    });
  },
});
