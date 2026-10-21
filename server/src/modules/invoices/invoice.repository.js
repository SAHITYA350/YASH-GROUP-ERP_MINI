export const createInvoiceRepository = (prisma) => ({
  findManyAndCount: async ({ page = 1, pageSize = 20, search } = {}) => {
    const where = search
      ? {
          OR: [
            { invoiceNo: { contains: search, mode: "insensitive" } },
            { customer: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {};

    const [total, data] = await prisma.$transaction([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { name: true } },
          salesOrder: { select: { orderNumber: true } },
          items: true,
        },
      }),
    ]);

    return { total, data };
  },

  findById: async (id) => {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        salesOrder: {
          select: { id: true, orderNumber: true, customerPONumber: true },
        },
        items: true,
        payments: { orderBy: { receivedAt: "desc" } },
      },
    });
  },

  createPayment: async (data, tx) => {
    const client = tx || prisma;
    return client.payment.create({ data });
  },

  update: async (id, data, tx) => {
    const client = tx || prisma;
    return client.invoice.update({ where: { id }, data });
  },
});
