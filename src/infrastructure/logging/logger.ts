import pino from 'pino';
import { config } from '../../config';

export const logger = pino({
    level: config.logging.level,
    base: {
        env: config.nodeEnv
    },
    redact: ['req.headers.authorization']
});
