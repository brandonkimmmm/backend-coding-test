'use strict';

const Joi = require('joi');

const rideSchema = Joi.object({
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

const paginationSchema = Joi.object({
	limit: Joi.number().integer().min(1).max(50)
		.error(() => new Error('Limit must be an integer between 1 and 50')),
	page: Joi.number().integer().min(1)
		.error(() => new Error('Page must be an integer greater than 0')),
});

const rideIdSchema = Joi.object({
	id: Joi.number().integer().min(1).required()
		.error(() => new Error('ID must be an integer greater than 0'))
});

module.exports = {
	rideSchema,
	paginationSchema,
	rideIdSchema
};