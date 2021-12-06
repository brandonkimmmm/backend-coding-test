'use strict';

const express = require('express');
const router = express.Router();
const { postRides, getRides, getRidesId } = require('./controllers');
const Joi = require('joi');
const logger = require('../tools/logger');
const { pick } = require('lodash');

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

		const schema = Joi.object({
			start_lat: Joi.number().integer().min(-90).max(90).required()
				.error(() => new Error('Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively')),
			start_long: Joi.number().integer().min(-180).max(180).required()
				.error(() => new Error('Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively')),
			end_lat: Joi.number().integer().min(-90).max(90).required()
				.error(() => new Error('End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively')),
			end_long: Joi.number().integer().min(-180).max(180).required()
				.error(() => new Error('End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively')),
			rider_name: Joi.string().min(1).required()
				.error(() => new Error('Rider name must be a non empty string')),
			driver_name: Joi.string().min(1).required()
				.error(() => new Error('Driver name must be a non empty string')),
			driver_vehicle: Joi.string().min(1).required()
				.error(() => new Error('Driver vehicle must be a non empty string'))
		});

		try {
			await schema.validateAsync(req.body);
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

		const schema = Joi.object({
			limit: Joi.number().integer().min(1).max(50)
				.error(() => new Error('Limit must be an integer between 1 and 50')),
			page: Joi.number().integer().min(1)
				.error(() => new Error('Page must be an integer greater than 0')),
		});

		try {
			await schema.validateAsync(req.query);
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

		const schema = Joi.object({
			id: Joi.number().integer().min(1).required()
				.error(() => new Error('ID must be an integer greater than 0'))
		});

		try {
			await schema.validateAsync(req.params);
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