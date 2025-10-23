import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { jwtMiddleware } from '../middlewares/jwtMiddleware';

export const createProductRoutes = (productController: ProductController): Router => {
    const router = Router();

    // GET ALL - público
    router.get('/', productController.getAll);

    // GET by ID - público
    router.get('/:id', productController.getById);

    // POST - protegido
    router.post('/', jwtMiddleware, productController.create);

    // PUT - protegido
    router.put('/:id', jwtMiddleware, productController.update);

    // PATCH - protegido
    router.patch('/:id', jwtMiddleware, productController.partialUpdate);

    // DELETE - protegido
    router.delete('/:id', jwtMiddleware, productController.remove);

    return router;
};