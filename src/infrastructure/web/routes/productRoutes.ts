import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { jwtMiddleware } from '../middlewares/jwtMiddleware';
import { validateRequest } from '../middlewares/validationMiddleware';
import { requireRoles } from '../middlewares/authorizationMiddleware';
import { config } from '../../../config';
import {
    createProductSchema,
    updateProductSchema,
    partialProductSchema,
    idParamSchema
} from '../validation/productSchemas';

export const createProductRoutes = (productController: ProductController): Router => {
    const router = Router();
    const productWriteRole = config.security.productWriteRole;

    // GET ALL - público
    router.get('/', productController.getAll);

    // GET by ID - público
    router.get('/:id', validateRequest({ params: idParamSchema }), productController.getById);

    // POST - protegido
    router.post(
        '/',
        jwtMiddleware,
        requireRoles(productWriteRole),
        validateRequest({ body: createProductSchema }),
        productController.create
    );

    // PUT - protegido
    router.put(
        '/:id',
        jwtMiddleware,
        requireRoles(productWriteRole),
        validateRequest({ params: idParamSchema, body: updateProductSchema }),
        productController.update
    );

    // PATCH - protegido
    router.patch(
        '/:id',
        jwtMiddleware,
        requireRoles(productWriteRole),
        validateRequest({ params: idParamSchema, body: partialProductSchema }),
        productController.partialUpdate
    );

    // DELETE - protegido
    router.delete(
        '/:id',
        jwtMiddleware,
        requireRoles(productWriteRole),
        validateRequest({ params: idParamSchema }),
        productController.remove
    );

    return router;
};
