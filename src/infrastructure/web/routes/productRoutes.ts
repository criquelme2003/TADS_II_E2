import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { jwtMiddleware } from '../middlewares/jwtMiddleware';
import { validateRequest } from '../middlewares/validationMiddleware';
import {
    createProductSchema,
    updateProductSchema,
    partialProductSchema,
    idParamSchema
} from '../validation/productSchemas';

export const createProductRoutes = (productController: ProductController): Router => {
    const router = Router();

    // GET ALL - público
    router.get('/', productController.getAll);

    // GET by ID - público
    router.get('/:id', validateRequest({ params: idParamSchema }), productController.getById);

    // POST - protegido
    router.post(
        '/',
        jwtMiddleware,
        validateRequest({ body: createProductSchema }),
        productController.create
    );

    // PUT - protegido
    router.put(
        '/:id',
        jwtMiddleware,
        validateRequest({ params: idParamSchema, body: updateProductSchema }),
        productController.update
    );

    // PATCH - protegido
    router.patch(
        '/:id',
        jwtMiddleware,
        validateRequest({ params: idParamSchema, body: partialProductSchema }),
        productController.partialUpdate
    );

    // DELETE - protegido
    router.delete(
        '/:id',
        jwtMiddleware,
        validateRequest({ params: idParamSchema }),
        productController.remove
    );

    return router;
};
