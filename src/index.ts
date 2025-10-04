import express, { Request, Response, NextFunction } from 'express';
import { createProductRoutes } from './infrastructure/web/routes/productRoutes';
import { ProductController } from './infrastructure/web/controllers/ProductController';
import { InMemoryProductRepository } from './infrastructure/database/InMemoryProductRepository';

// Use Cases
import { CreateProduct } from './application/use-cases/CreateProduct';
import { GetAllProducts } from './application/use-cases/GetAllProducts';
import { GetProductById } from './application/use-cases/GetProductById';
import { UpdateProduct } from './application/use-cases/UpdateProduct';
import { PartialUpdateProduct } from './application/use-cases/PartialUpdateProduct';
import { DeleteProduct } from './application/use-cases/DeleteProduct';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dependency Injection
const productRepository = new InMemoryProductRepository();

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

// =========================================
// PUNTO 3: GRAPHQL SETUP (Para implementar)
// =========================================
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API: http://localhost:${PORT}/api/products`);
    console.log(`💚 Health: http://localhost:${PORT}/health`);
    // console.log(`🔷 GraphQL: http://localhost:${PORT}/graphql`);
});

export default app;
