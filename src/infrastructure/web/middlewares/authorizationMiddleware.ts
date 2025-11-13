import { Request, Response, NextFunction } from 'express';
import { logger } from '../../logging/logger';

export type AuthenticatedUser = Request['user'];

export class AuthorizationError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const assertRoles = (user: AuthenticatedUser, allowedRoles: string[]) => {
    if (!user) {
        throw new AuthorizationError('Authentication required', 401);
    }

    if (!user.role || !allowedRoles.includes(user.role)) {
        throw new AuthorizationError('You do not have permission to perform this action', 403);
    }
};

export const requireRoles =
    (...allowedRoles: string[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            assertRoles(req.user, allowedRoles);
            return next();
        } catch (error) {
            const status =
                error instanceof AuthorizationError && error.statusCode ? error.statusCode : 403;

            logger.warn(
                { route: req.originalUrl, userId: req.user?.id, role: req.user?.role },
                'Blocked request due to failed authorization'
            );

            return res.status(status).json({
                success: false,
                message: error instanceof Error ? error.message : 'Authorization failed'
            });
        }
    };
