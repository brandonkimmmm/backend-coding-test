'use strict';

const port = 8010;
const logger = require('./tools/logger');
const { init } = require('./tools/database');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./src/swagger.yaml');
const express = require('express');
const { nanoid } = require('nanoid');
const server = require('./src/app');
const morgan = require('morgan');

(async () => {
	try {
		logger.info('index.js Initializing app');

		await init();

		const app = express();

		app.use(morgan('tiny', {
			stream: {
				write: (message) => logger.info(message)
			}
		}));

		app.use((req, res, next) => {
			req.nanoid = nanoid();
			logger.info(
				req.nanoid,
				'middleware/hostname',
				req.hostname,
				req.headers['x-real-ip'],
				req.headers['x-real-origin'],
				req.method,
				req.path
			);
			next();
		});

		server(app);

		app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

		app.use((req, res) => {
			return res.status(400).send({
				error_code: 'REQUEST_ERROR',
				message: `Path ${req.path} does not exist`
			});
		});

		app.listen(port, () => logger.info(`index.js App initialized and listening on port ${port}`));
	} catch (err) {
		logger.error(
			'index.js Error during app initialization',
			err.message
		);

		process.exit(0);
	}
})();
