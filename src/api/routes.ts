import express from 'express';
import { pick } from 'lodash';
import { postRides, getRides, getRidesId } from './controllers';
import { CreateRideSchema, GetRideSchema, GetRidesSchema } from '../tools/schemas';
import logger from '../tools/logger';

const router = express.Router();

router.post(
	'/',
	async (req, res, next) => {
		req.body = pick(req.body, [
			'start_lat',
			'start_long',
			'end_lat',
			'end_long',
			'rider_name',
			'driver_name',
			'driver_vehicle'
		]);

		logger.info(
			req.nanoid,
			'src/routes/postRides body',
			req.body
		);

		try {
			await CreateRideSchema.validateAsync(req.body);
			next();
		} catch (err) {
			logger.error(
				req.nanoid,
				'src/routes/postRides validation error:',
				err instanceof Error ? err.message : ''
			);

			return res.status(400).send({
				error_code: 'VALIDATION_ERROR',
				message: err instanceof Error ? err.message : 'Invalid request data'
			});
		}
	},
	postRides
);

router.get(
	'/',
	async (req, res, next) => {
		req.query = pick(req.query, [
			'limit',
			'page'
		]);

		logger.info(
			req.nanoid,
			'src/routes/getRides query params',
			req.query
		);

		try {
			await GetRidesSchema.validateAsync(req.query);
			next();
		} catch (err) {
			logger.error(
				req.nanoid,
				'src/routes/getRides validation error:',
				err instanceof Error ? err.message : ''
			);

			return res.status(400).send({
				error_code: 'VALIDATION_ERROR',
				message: err instanceof Error ? err.message : 'Invalid request data'
			});
		}
	},
	getRides
);

router.get(
	'/:id',
	async (req, res, next) => {
		req.params = pick(req.params, ['id']);

		logger.info(
			req.nanoid,
			'src/routes/getRidesId path params',
			req.params
		);

		try {
			await GetRideSchema.validateAsync(req.params);
			next();
		} catch (err) {
			logger.error(
				req.nanoid,
				'src/routes/getRidesID validation error:',
				err instanceof Error ? err.message : ''
			);

			return res.status(400).send({
				error_code: 'VALIDATION_ERROR',
				message: err instanceof Error ? err.message : 'Invalid request data'
			});
		}
	},
	getRidesId
);

export default router;