'use strict';

const path = require('path');
const logger = require('../tools/logger');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(path.resolve(__dirname,'swagger.yaml'));
const express = require('express');
const { nanoid } = require('nanoid');
const morgan = require('morgan');
const ridesRouter = require('./routes');

const initApp = () => {
	const app = express();

	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());

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

	app.get('/health', (req, res) => res.send('Healthy'));

	app.use('/rides', ridesRouter);

	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

	app.use((req, res) => {
		return res.status(400).send({
			error_code: 'REQUEST_ERROR',
			message: `Path ${req.path} does not exist`
		});
	});

	return app;
};

module.exports = initApp;