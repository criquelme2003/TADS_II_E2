import { Request, Response, NextFunction } from 'express';

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
        return next();
    }

    return res.status(401).json({
        success: false,
        message: 'Invalid token'
    });
};