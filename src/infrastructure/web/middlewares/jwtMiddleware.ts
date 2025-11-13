import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../../../config';
import { logger } from '../../logging/logger';

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

const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, config.security.jwtSecret, {
        algorithms: ['HS256']
    }) as TokenPayload;
};

export const jwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn({ route: req.originalUrl }, 'Missing bearer token');
        return res.status(401).json({
            success: false,
            message: 'Token required. Format: Bearer <token>'
        });
    }

    const token = authHeader.substring(7).trim();

    try {
        const payload = verifyToken(token);
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
        logger.warn(
            { route: req.originalUrl, error: error instanceof Error ? error.message : error },
            'Rejected request due to invalid token'
        );
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

export const decodeAuthHeader = (authHeader?: string) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return undefined;
    }

    const token = authHeader.substring(7).trim();
    try {
        const payload = verifyToken(token);
        const userId =
            (typeof payload.sub === 'string' && payload.sub) ||
            (typeof payload.id === 'string' && payload.id) ||
            (typeof payload.email === 'string' && payload.email);

        if (!userId) {
            return undefined;
        }

        return {
            id: userId,
            email: typeof payload.email === 'string' ? payload.email : undefined,
            role: typeof payload.role === 'string' ? payload.role : undefined
        };
    } catch (error) {
        logger.warn(
            { error: error instanceof Error ? error.message : error },
            'Discarded invalid bearer token outside middleware'
        );
        return undefined;
    }
};
