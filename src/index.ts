import express, { Request, Response, NextFunction, Application } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

const app: Application = express();
const PORT = process.env.PORT || 3000;
const BODY_LIMIT = process.env.REQUEST_BODY_LIMIT || '100kb';

app.disable('x-powered-by');
app.use(helmet());

const parsePositiveNumber = (value: string | undefined, fallback: number): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const rateLimitWindowMs = parsePositiveNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const rateLimitMax = parsePositiveNumber(process.env.RATE_LIMIT_MAX, 100);

const apiLimiter = rateLimit({
    windowMs: rateLimitWindowMs,
    max: rateLimitMax,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    }
});

// Middleware
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));

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
    const server = new ApolloServer({ schema });

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
        const errorStack = err instanceof Error ? err.stack : undefined;
        if (errorStack) {
            console.error(errorStack);
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    });

    if (process.env.NODE_ENV !== 'test') {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 API: http://localhost:${PORT}/api/products`);
            console.log(`💚 Health: http://localhost:${PORT}/health`);
            console.log(`🔷 GraphQL: http://localhost:${PORT}/graphql`);
        });
    }
}

startServer().catch(error => {
    console.error('Error starting server:', error);
});

export default app;
export { app, startServer };
