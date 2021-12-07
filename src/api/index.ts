import path from 'path';
import express from 'express';
import  morgan from 'morgan';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { nanoid } from 'nanoid';

import logger from '../tools/logger';
import ridesRouter from './routes';

const swaggerDocument = YAML.load(path.resolve(__dirname, '../../swagger.yaml'));

export const initApp = (): express.Application => {
	const app = express();

	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());
	app.use(helmet());

	app.use(
		morgan(
			'tiny',
			{ stream: { write: (message) => logger.info(message) } }
		)
	);

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

	app.use('/rides', ridesRouter);
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

	app.get('/health', (req, res) => res.send('Healthy'));

	app.use((req, res) => {
		return res.status(400).send({
			error_code: 'REQUEST_ERROR',
			message: `Path ${req.path} does not exist`
		});
	});

	return app;
};