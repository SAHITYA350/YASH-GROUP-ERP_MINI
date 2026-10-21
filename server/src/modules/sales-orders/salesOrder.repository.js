export const createSalesOrderRepository = (prisma) => ({
  findManyAndCount: async ({ page = 1, pageSize = 20, search } = {}) => {
    const where = search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: "insensitive" } },
            { customer: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {};

    const [total, data] = await prisma.$transaction([
      prisma.salesOrder.count({ where }),
      prisma.salesOrder.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { name: true } },
          invoices: { select: { id: true, invoiceNo: true, status: true, total: true } },
        },
      }),
    ]);

    return { total, data };
  },

  findById: async (id) => {
    return prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        quotation: {
          select: {
            id: true,
            quotationNo: true,
            status: true,
            paymentTerms: true,
            deliveryTerms: true,
          },
        },
        items: {
          include: {
            product: { select: { id: true, sku: true, name: true, variant: true, unitOfMeasure: true } },
          },
        },
        invoices: {
          select: { id: true, invoiceNo: true, status: true, total: true, issueDate: true },
        },
      },
    });
  },

  create: async (data, tx) => {
    const client = tx || prisma;
    return client.salesOrder.create({ data });
  },

  createInvoice: async (data, tx) => {
    const client = tx || prisma;
    return client.invoice.create({
      data,
      include: {
        items: true,
        customer: { select: { name: true } },
      },
    });
  },
});
