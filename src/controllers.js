'use strict';

const logger = require('../tools/logger');
const { createRide, countRides, getPaginatedRides, getRide } = require('./helpers');

const postRides = async (req, res) => {
	const {
		start_lat,
		start_long,
		end_lat,
		end_long,
		rider_name,
		driver_name,
		driver_vehicle
	} = req.body;

	try {
		logger.verbose(
			req.nanoid,
			'src/controllers/postRides creating ride',
			'startLat:',
			start_lat,
			'startLong:',
			start_long,
			'endLat:',
			end_lat,
			'endLong:',
			end_long,
			'riderName:',
			rider_name,
			'driverName:',
			driver_name,
			'driverVehicle:',
			driver_vehicle
		);

		const ride = await createRide(
			start_lat,
			start_long,
			end_lat,
			end_long,
			rider_name,
			driver_name,
			driver_vehicle
		);

		logger.verbose(
			req.nanoid,
			'src/controllers/postRides ride created with ID:',
			ride.rideID
		);

		return res.status(201).send(ride);
	} catch (err) {
		logger.error(
			req.nanoid,
			'src/controllers/postRides err during ride creation',
			err.message
		);

		return res.status(500).send({
			error_code: 'SERVER_ERROR',
			message: 'Unknown error'
		});
	}
};

const getRides = async (req, res) => {
	const { limit, page } = req.query;

	try {
		logger.verbose(
			req.nanoid,
			'src/controllers/getRides getting rides',
			'limit:',
			limit,
			'page:',
			page
		);

		const count = await countRides();

		if (count === 0) {
			logger.error(
				req.nanoid,
				'src/controllers/getRides no rides found in database'
			);

			return res.status(404).send({
				error_code: 'RIDES_NOT_FOUND_ERROR',
				message: 'Could not find any rides'
			});
		}

		const rows = await getPaginatedRides(limit, page);

		logger.verbose(
			req.nanoid,
			'src/controllers/getRides rides retrieved',
			'total count:',
			count
		);

		return res.send({ count, rows });
	} catch (err) {
		logger.error(
			req.nanoid,
			'src/controllers/getRides err during ride query',
			err.message
		);

		return res.status(500).send({
			error_code: 'SERVER_ERROR',
			message: 'Unknown error'
		});
	}
};

const getRidesId = async (req, res) => {
	const { id } = req.params;

	try {
		logger.verbose(
			req.nanoid,
			'src/controllers/getRidesId getting ride with id',
			id
		);

		const ride = await getRide(id);

		if (!ride) {
			logger.error(
				req.nanoid,
				'src/controllers/getRidesId ride not found with ID',
				id
			);

			return res.status(404).send({
				error_code: 'RIDES_NOT_FOUND_ERROR',
				message: 'Could not find any rides'
			});
		}

		logger.verbose(
			req.nanoid,
			'src/controllers/getRidesId ride found with ID',
			id
		);

		return res.send(ride);
	} catch (err) {
		logger.error(
			req.nanoid,
			'src/controllers/getRidesId error during ride DB query',
			err.message
		);

		return res.status(500).send({
			error_code: 'SERVER_ERROR',
			message: 'Unknown error'
		});
	}
};

module.exports = {
	postRides,
	getRides,
	getRidesId
};