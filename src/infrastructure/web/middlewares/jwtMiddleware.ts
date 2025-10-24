import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email?: string;
                role?: string;
            };
        }
    }
}

interface TokenPayload extends JwtPayload {
    id?: string;
    email?: string;
    role?: string;
}

export const jwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Token required. Format: Bearer <token>'
        });
    }

    const token = authHeader.substring(7).trim();
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        return res.status(500).json({
            success: false,
            message: 'Authentication service is not configured'
        });
    }

    try {
        const payload = jwt.verify(token, secret) as TokenPayload;
        const userId =
            (typeof payload.sub === 'string' && payload.sub) ||
            (typeof payload.id === 'string' && payload.id) ||
            (typeof payload.email === 'string' && payload.email);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Token payload missing required subject'
            });
        }

        req.user = {
            id: userId,
            email: typeof payload.email === 'string' ? payload.email : undefined,
            role: typeof payload.role === 'string' ? payload.role : undefined
        };

        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};
