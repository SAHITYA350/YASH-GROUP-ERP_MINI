export const createProductService = (productRepo) => ({
  list: async () => {
    return productRepo.findAllActive();
  },

  getById: async (id) => {
    return productRepo.findById(id);
  },
});
