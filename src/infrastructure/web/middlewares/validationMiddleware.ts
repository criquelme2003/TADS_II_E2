import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodTypeAny } from 'zod';

interface SchemaMap {
    body?: ZodTypeAny;
    params?: ZodTypeAny;
    query?: ZodTypeAny;
}

export const validateRequest = (schemas: SchemaMap) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }

            if (schemas.params) {
                req.params = schemas.params.parse(req.params) as any;
            }

            if (schemas.query) {
                req.query = schemas.query.parse(req.query) as any;
            }

            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                const issues = error.issues ?? [];
                return res.status(400).json({
                    success: false,
                    message: 'Invalid request data',
                    errors: issues.map(issue => ({
                        path: issue.path.join('.'),
                        message: issue.message
                    }))
                });
            }

            return res.status(400).json({
                success: false,
                message: 'Invalid request data'
            });
        }
    };
};
