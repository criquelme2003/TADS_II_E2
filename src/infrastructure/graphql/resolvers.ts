import { GraphQLError } from 'graphql';
import { config } from '../../config';
import {
    assertRoles,
    AuthorizationError,
    AuthenticatedUser
} from '../web/middlewares/authorizationMiddleware';

type GraphQLContext = {
    user?: AuthenticatedUser;
};

const productWriteRole = config.security.productWriteRole;

export const createResolvers = (useCases: any) => ({
    Query: {
        products: async () => {
            return await useCases.getAllProducts.execute();
        }
    },
    Mutation: {
        createProduct: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
            try {
                assertRoles(context?.user, [productWriteRole]);
            } catch (error) {
                if (error instanceof AuthorizationError) {
                    throw new GraphQLError(error.message, {
                        extensions: {
                            code: error.statusCode === 401 ? 'UNAUTHENTICATED' : 'FORBIDDEN'
                        }
                    });
                }

                throw error;
            }

            return await useCases.createProduct.execute(input, context?.user?.id);
        }
    }
});
