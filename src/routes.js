'use strict';

const express = require('express');
const router = express.Router();
const { postRides, getRides, getRidesId } = require('./controllers');
const logger = require('../tools/logger');
const { pick } = require('lodash');
const { rideSchema, paginationSchema, rideIdSchema } = require('../tools/schemas');

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
			await rideSchema.validateAsync(req.body);
			next();
		} catch (err) {
			logger.error(
				req.nanoid,
				'src/routes/postRides validation error:',
				err.message
			);

			return res.send({
				error_code: 'VALIDATION_ERROR',
				message: err.message
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
			await paginationSchema.validateAsync(req.query);
			next();
		} catch (err) {
			logger.error(
				req.nanoid,
				'src/routes/getRides validation error:',
				err.message
			);

			return res.send({
				error_code: 'VALIDATION_ERROR',
				message: err.message
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
			await rideIdSchema.validateAsync(req.params);
			next();
		} catch (err) {
			logger.error(
				req.nanoid,
				'src/routes/getRidesID validation error:',
				err.message
			);

			return res.send({
				error_code: 'VALIDATION_ERROR',
				message: err.message
			});
		}
	},
	getRidesId
);

module.exports = router;