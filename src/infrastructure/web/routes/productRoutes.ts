import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { jwtMiddleware } from '../middlewares/jwtMiddleware';

export const createProductRoutes = (productController: ProductController): Router => {
    const router = Router();

    // GET ALL - Obtener todos los productos
    router.get('/', productController.getAll);

    // GET by ID - Obtener producto por ID
    router.get('/:id', productController.getById);

    // POST - Crear nuevo producto
    // PUNTO 2: Agregar middleware JWT aquí -> router.post('/', jwtMiddleware, productController.create);
    router.post('/', jwtMiddleware, productController.create);

    // PUT - Actualizar producto completo
    router.put('/:id', productController.update);

    // PATCH - Actualizar producto parcialmente
    router.patch('/:id', productController.partialUpdate);

    // DELETE - Eliminar producto
    router.delete('/:id', productController.remove);

    return router;
};
