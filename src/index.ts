import logger from './tools/logger';
import { initDb } from './tools/database';
import { initApp } from './api';

const port = 8010;

try {
	logger.info('index.js Initializing app');

	initDb();

	const app = initApp();

	app.listen(port, () => logger.info(`index.js App initialized and listening on port ${port}`));
} catch (err) {
	logger.error(
		'index.js Error during app initialization',
		err instanceof Error ? err.message : ''
	);

	process.exit(0);
}