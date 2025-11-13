import { z } from 'zod';

const DEV_FALLBACK_SECRET = 'dev-secret-placeholder-32chars-min-123456';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).optional().default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).optional().default(3000),
    REQUEST_BODY_LIMIT: z
        .string()
        .trim()
        .optional()
        .default('100kb'),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().optional().default(15 * 60 * 1000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().optional().default(100),
    JWT_SECRET: z
        .string()
        .min(32, { message: 'JWT_SECRET must be at least 32 characters long' })
        .refine(
            value => !/(^| )(secret|changeme|password)/i.test(value),
            'JWT_SECRET must not use weak placeholders'
        ),
    APP_ALLOWED_ORIGINS: z.string().optional(),
    LOG_LEVEL: z
        .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
        .optional(),
    PRODUCT_WRITE_ROLE: z.string().trim().optional().default('product_admin')
});

const envSource = { ...process.env };

if (!envSource.JWT_SECRET && envSource.NODE_ENV !== 'production') {
    envSource.JWT_SECRET = DEV_FALLBACK_SECRET;
    console.warn('[config] Using fallback JWT secret for non-production environment');
}

const parsedEnv = envSchema.parse(envSource);

const allowedOrigins = parsedEnv.APP_ALLOWED_ORIGINS
    ? parsedEnv.APP_ALLOWED_ORIGINS.split(',')
          .map(origin => origin.trim())
          .filter(origin => origin.length > 0)
    : [];

if (parsedEnv.NODE_ENV === 'production' && allowedOrigins.length === 0) {
    throw new Error('APP_ALLOWED_ORIGINS must be defined in production environments');
}

const allowAnyOrigin = allowedOrigins.length === 0;

export const config = {
    nodeEnv: parsedEnv.NODE_ENV,
    port: parsedEnv.PORT,
    bodyLimit: parsedEnv.REQUEST_BODY_LIMIT,
    rateLimit: {
        windowMs: parsedEnv.RATE_LIMIT_WINDOW_MS,
        max: parsedEnv.RATE_LIMIT_MAX
    },
    security: {
        jwtSecret: parsedEnv.JWT_SECRET,
        allowedOrigins,
        allowAnyOrigin,
        productWriteRole: parsedEnv.PRODUCT_WRITE_ROLE
    },
    graphql: {
        enableIntrospection: parsedEnv.NODE_ENV !== 'production'
    },
    logging: {
        level: parsedEnv.LOG_LEVEL || (parsedEnv.NODE_ENV === 'production' ? 'info' : 'debug')
    }
} as const;

export type AppConfig = typeof config;
