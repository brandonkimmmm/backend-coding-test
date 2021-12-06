'use strict';

const logger = require('./logger');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
const { promisifyAll } = require('bluebird');
promisifyAll(db);

const init = async () => {
	logger.info(
		'tools/db/init',
		'Creating Rides DB table'
	);

	await db.run(`
		CREATE TABLE Rides
		(
		rideID INTEGER PRIMARY KEY AUTOINCREMENT,
		startLat DECIMAL NOT NULL,
		startLong DECIMAL NOT NULL,
		endLat DECIMAL NOT NULL,
		endLong DECIMAL NOT NULL,
		riderName TEXT NOT NULL,
		driverName TEXT NOT NULL,
		driverVehicle TEXT NOT NULL,
		created DATETIME default CURRENT_TIMESTAMP
		)
	`);

	logger.info(
		'tools/db/init',
		'Rides DB table created'
	);
};

module.exports = {
	init,
	db
};
