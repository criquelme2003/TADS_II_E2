import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';

export const createProductRoutes = (productController: ProductController): Router => {
    const router = Router();

    // =========================================
    // PUNTO 2: JWT MIDDLEWARE (Para implementar)
    // =========================================

    // GET ALL - Obtener todos los productos
    router.get('/', productController.getAll);

    // GET by ID - Obtener producto por ID
    router.get('/:id', productController.getById);

    // POST - Crear nuevo producto
    // PUNTO 2: Agregar middleware JWT aquí -> router.post('/', jwtMiddleware, productController.create);
    router.post('/', productController.create);

    // PUT - Actualizar producto completo
    router.put('/:id', productController.update);

    // PATCH - Actualizar producto parcialmente
    router.patch('/:id', productController.partialUpdate);

    // DELETE - Eliminar producto
    router.delete('/:id', productController.remove);

    return router;
};
