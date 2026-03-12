import { createApp } from './app.js';
import { logger } from './lib/logger.js';

const PORT = Number(process.env.PORT) || 3000;

try {
    const app = createApp();

    app.listen(PORT, '0.0.0.0', () => {
        logger.info('Server started', {
            port: PORT,
            nodeEnv: process.env.NODE_ENV || 'development',
        });
    });
} catch (error) {
    logger.error('Server failed to start', { error });
    process.exit(1);
}
