export const createProductRepository = (prisma) => ({
  findAllActive: async () => {
    return prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        sku: true,
        name: true,
        variant: true,
        listPrice: true,
        gstPercent: true,
        unitOfMeasure: true,
      },
      orderBy: { name: "asc" },
    });
  },

  findById: async (id) => {
    return prisma.product.findUnique({
      where: { id },
    });
  },
});
