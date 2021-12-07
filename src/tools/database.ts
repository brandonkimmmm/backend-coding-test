import logger from './logger';
import sqlite3 from 'sqlite3';
import { promisifyAll } from 'bluebird';

export interface PromisifiedDB extends sqlite3.Database {
	[x: string]: any;
}

export const db: PromisifiedDB = promisifyAll(new sqlite3.Database(':memory:'));

export const initDb = () => {
	logger.info(
		'tools/db/init',
		'Creating Rides DB table'
	);

	db.run(`
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
