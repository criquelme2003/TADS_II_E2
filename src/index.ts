import express, { Request, Response, NextFunction, Application } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors, { CorsOptions } from 'cors';
import { ApolloServerPluginLandingPageDisabled } from 'apollo-server-core';
import { createProductRoutes } from './infrastructure/web/routes/productRoutes';
import { ProductController } from './infrastructure/web/controllers/ProductController';
import { PrismaProductRepository } from './infrastructure/database/PrismaProductRepository';
import { InMemoryProductRepository } from './infrastructure/database/InMemoryProductRepository';
import 'dotenv/config';

// Use Cases
import { CreateProduct } from './application/use-cases/CreateProduct';
import { GetAllProducts } from './application/use-cases/GetAllProducts';
import { GetProductById } from './application/use-cases/GetProductById';
import { UpdateProduct } from './application/use-cases/UpdateProduct';
import { PartialUpdateProduct } from './application/use-cases/PartialUpdateProduct';
import { DeleteProduct } from './application/use-cases/DeleteProduct';

// GraphQL imports
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from './infrastructure/graphql/schema';
import { createResolvers } from './infrastructure/graphql/resolvers';
import { config } from './config';
import { logger } from './infrastructure/logging/logger';
import { decodeAuthHeader } from './infrastructure/web/middlewares/jwtMiddleware';

const app: Application = express();
const PORT = config.port;

 app.disable('x-powered-by');
app.use(helmet());

const corsOptions: CorsOptions = config.security.allowAnyOrigin
    ? {
          origin: true,
          credentials: true
      }
    : {
          origin: (
              origin: string | undefined,
              callback: (err: Error | null, allow?: boolean) => void
          ) => {
              if (!origin) {
                  return callback(null, true);
              }

              if (config.security.allowedOrigins.includes(origin)) {
                  return callback(null, true);
              }

              logger.warn({ origin }, 'Blocked disallowed origin');
              return callback(new Error('Origin not allowed by CORS'), false);
          },
          credentials: true,
          optionsSuccessStatus: 204
      };

app.use(cors(corsOptions));

const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    }
});

// Middleware
app.use(express.json({ limit: config.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: config.bodyLimit }));

app.use('/api', apiLimiter);
app.use('/graphql', apiLimiter);

// Dependency Injection
const productRepository =
    process.env.NODE_ENV === 'test'
        ? new InMemoryProductRepository()
        : new PrismaProductRepository();

const useCases = {
    createProduct: new CreateProduct(productRepository),
    getAllProducts: new GetAllProducts(productRepository),
    getProductById: new GetProductById(productRepository),
    updateProduct: new UpdateProduct(productRepository),
    partialUpdateProduct: new PartialUpdateProduct(productRepository),
    deleteProduct: new DeleteProduct(productRepository)
};

const productController = new ProductController(useCases);
const productRoutes = createProductRoutes(productController);

// Routes
app.use('/api/products', productRoutes);

// Health endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// =========================================
// GRAPHQL SETUP
// =========================================
const schema = makeExecutableSchema({
    typeDefs,
    resolvers: createResolvers(useCases)
});

async function startServer() {
    const server = new ApolloServer({
        schema,
        introspection: config.graphql.enableIntrospection,
        plugins: config.graphql.enableIntrospection
            ? []
            : [ApolloServerPluginLandingPageDisabled()],
        context: ({ req }) => ({
            user: decodeAuthHeader(req.headers.authorization)
        })
    });

    await server.start();
    server.applyMiddleware({ app: app as any, path: '/graphql' });

    app.use((req: Request, res: Response) => {
        res.status(404).json({
            success: false,
            message: 'Route not found'
        });
    });

    // Error handler
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        logger.error(
            {
                route: req.originalUrl,
                method: req.method,
                message: err.message,
                stack: err.stack
            },
            'Unhandled error caught by global handler'
        );
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    });

    if (config.nodeEnv !== 'test') {
        app.listen(PORT, () => {
            logger.info({ port: PORT }, 'Server running');
            logger.info({ url: `/api/products` }, 'REST entry point ready');
            logger.info({ url: `/graphql` }, 'GraphQL endpoint ready');
        });
    }
}

startServer().catch(error => {
    console.error('Error starting server:', error);
});

export default app;
export { app, startServer };
