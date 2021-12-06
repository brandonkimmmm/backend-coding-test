'use strict';

const port = 8010;
const logger = require('./tools/logger');
const { initDb } = require('./tools/database');
const initApp = require('./src/app');

(async () => {
	try {
		logger.info('index.js Initializing app');

		initDb();

		const app = initApp();

		app.listen(port, () => logger.info(`index.js App initialized and listening on port ${port}`));
	} catch (err) {
		logger.error(
			'index.js Error during app initialization',
			err.message
		);

		process.exit(0);
	}
})();
