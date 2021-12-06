'use strict';

const { db } = require('../tools/database');
const Promise = require('bluebird');

const createRide = (
	startLat,
	startLong,
	endLat,
	endLong,
	riderName,
	driverName,
	driverVehicle,
	opts = {
		returning: true
	}
) => {
	return new Promise((resolve, reject) => {
		db.run(
			'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
			[
				startLat,
				startLong,
				endLat,
				endLong,
				riderName,
				driverName,
				driverVehicle
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
	const offset = limit * (page - 1);

	const rows = await db.allAsync('SELECT * FROM Rides ORDER BY rideID DESC LIMIT ? OFFSET ?', [limit, offset]);

	return rows;
};

const getRide = async (rideID) => {
	const ride = await db.getAsync('SELECT * FROM Rides WHERE rideID=?', rideID);

	return ride;
};

module.exports = {
	createRide,
	countRides,
	getPaginatedRides,
	getRide
};