import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email?: string;
            };
        }
    }
}

export const jwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Token required. Format: Bearer <token>'
        });
    }

    const token = authHeader.substring(7);

    if (token === process.env.JWT_SECRET) {
        req.user = {
            id: 'admin',
            email: 'admin@example.com'
        };
        return next();
    }

    return res.status(401).json({
        success: false,
        message: 'Invalid token'
    });
};