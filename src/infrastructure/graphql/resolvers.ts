export const createResolvers = (useCases: any) => ({
    Query: {
        products: async () => {
            return await useCases.getAllProducts.execute();
        },
    },
    Mutation: {
        createProduct: async (_: any, { input }: { input: any }) => {
            return await useCases.createProduct.execute(input);
        },
    },
});