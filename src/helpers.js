'use strict';

const { db } = require('../tools/database');
const Promise = require('bluebird');
const { rideSchema, paginationSchema, rideIdSchema } = require('../tools/schemas');

const createRide = (
	start_lat,
	start_long,
	end_lat,
	end_long,
	rider_name,
	driver_name,
	driver_vehicle,
	opts = {
		returning: true
	}
) => {
	return new Promise((resolve, reject) => {
		const validation = rideSchema.validate({
			start_lat,
			start_long,
			end_lat,
			end_long,
			rider_name,
			driver_name,
			driver_vehicle
		});

		if (validation.error) {
			return reject(new Error(validation.error));
		}

		db.run(
			'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
			[
				start_lat,
				start_long,
				end_lat,
				end_long,
				rider_name,
				driver_name,
				driver_vehicle
			],
			function (err) {
				if (err) {
					return reject(err);
				}

				if (!opts.returning) {
					return resolve(this.lastID);
				}

				db.get('SELECT * FROM Rides WHERE rideID = ?', this.lastID, (err, data) => {
					if (err) {
						return reject(err);
					}
					return resolve(data);
				});
			}
		);
	});
};

const countRides = async () => {
	const { count } = await db.getAsync('SELECT COUNT(RideID) AS count FROM Rides');

	return count;
};

const getPaginatedRides = async (limit = 50, page = 1) => {
	await paginationSchema.validateAsync({ limit, page });

	const offset = limit * (page - 1);

	const rows = await db.allAsync('SELECT * FROM Rides ORDER BY rideID DESC LIMIT ? OFFSET ?', [limit, offset]);

	return rows;
};

const getRide = async (id) => {
	await rideIdSchema.validateAsync({ id });

	const ride = await db.getAsync('SELECT * FROM Rides WHERE rideID=?', id);

	return ride;
};

module.exports = {
	createRide,
	countRides,
	getPaginatedRides,
	getRide
};