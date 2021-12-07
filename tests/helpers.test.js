'use strict';

const lodash = require('lodash');
const { expect } = require('chai');
const { initDb, db } = require('../tools/database');
const { createRide, getPaginatedRides, getRide, countRides } = require('../src/helpers');
const { getMockRide } = require('./mockdata');

const MOCK_RIDE = getMockRide();

describe('Helper tests', () => {
	before((done) => {
		db.serialize((err) => {
			if (err) {
				return done(err);
			}

			initDb();

			for (let i = 0; i < 50; i++) {
				const fakerRide = getMockRide();
				db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', Object.values(fakerRide));
			}

			done();
		});
	});

	after((done) => {
		db.serialize((err) => {
			if (err) {
				return done(err);
			}

			db.run('DROP TABLE Rides');

			done();
		});
	});

	describe('#createRide', () => {
		it('should not allow SQL injection', async () => {
			const ride = await createRide(
				MOCK_RIDE.startLat,
				MOCK_RIDE.startLong,
				MOCK_RIDE.endLat,
				MOCK_RIDE.endLong,
				MOCK_RIDE.riderName,
				MOCK_RIDE.driverName,
				'); DROP TABLE Rides; --'
			);

			expect(lodash.omit(ride, ['rideID', 'created'])).to.deep.equal({ ...MOCK_RIDE, driverVehicle: '); DROP TABLE Rides; --' });
		});

		it('should create a new ride and return data', async () => {
			const ride = await createRide(
				MOCK_RIDE.startLat,
				MOCK_RIDE.startLong,
				MOCK_RIDE.endLat,
				MOCK_RIDE.endLong,
				MOCK_RIDE.riderName,
				MOCK_RIDE.driverName,
				MOCK_RIDE.driverVehicle
			);

			expect(lodash.omit(ride, ['rideID', 'created'])).to.deep.equal(MOCK_RIDE);

			MOCK_RIDE.rideID = ride.rideID;
		});

		it('should create a new ride and only return rideID', async () => {
			const id = await createRide(
				MOCK_RIDE.startLat,
				MOCK_RIDE.startLong,
				MOCK_RIDE.endLat,
				MOCK_RIDE.endLong,
				MOCK_RIDE.riderName,
				MOCK_RIDE.driverName,
				MOCK_RIDE.driverVehicle,
				{
					returning: false
				}
			);

			expect(id).to.equal(MOCK_RIDE.rideID + 1);

			MOCK_RIDE.rideID = id;
		});

		it('should throw an error if invalid start long is given', async () => {
			let error;

			try {
				await createRide(
					MOCK_RIDE.startLat,
					false,
					MOCK_RIDE.endLat,
					MOCK_RIDE.endLong,
					MOCK_RIDE.riderName,
					MOCK_RIDE.driverName,
					MOCK_RIDE.driverVehicle,
					{
						returning: false
					}
				);
			} catch (err) {
				error = err;
			}

			expect(error.message).to.equal('Error: Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively');
		});

		it('should throw an error if invalid rider name is given', async () => {
			let error;

			try {
				await createRide(
					MOCK_RIDE.startLat,
					MOCK_RIDE.startLong,
					MOCK_RIDE.endLat,
					MOCK_RIDE.endLong,
					2390123,
					MOCK_RIDE.driverName,
					MOCK_RIDE.driverVehicle,
					{
						returning: false
					}
				);
			} catch (err) {
				error = err;
			}

			expect(error.message).to.equal('Error: Rider name must be a non empty string');
		});
	});

	describe('#getRide', () => {
		it('should get ride with ID 1', async () => {
			const ride = await getRide(MOCK_RIDE.rideID);
			expect(lodash.omit(ride, ['created'])).to.deep.equal(MOCK_RIDE);
		});

		it('should return undefined if ride with ID is not found', async () => {
			const ride = await getRide(100);
			expect(ride).to.be.undefined;
		});

		it('should throw an error if invalid ride ID is given', async () => {
			let error;

			try {
				await getRide(false);
			} catch (err) {
				error = err;
			}

			expect(error.message).to.equal('ID must be an integer greater than 0');
		});

		it('should not allow SQL injection', async () => {
			let error;

			try {
				await getRide('1 OR 1=1');
			} catch (err) {
				error = err;
			}

			expect(error.message).to.equal('ID must be an integer greater than 0');
		});
	});

	describe('#coutnRides', () => {
		it('should return number of rides in DB', async () => {
			const count = await countRides();
			expect(count).to.equal(MOCK_RIDE.rideID);
		});
	});

	describe('#getPaginatedRides', () => {
		it('should return all rides with default limit 50 and page 1', async () => {
			const rides = await getPaginatedRides();
			expect(rides).to.be.an('array');
			expect(rides.length).to.equal(50);
			expect(rides[0].rideID).to.equal(MOCK_RIDE.rideID);
		});

		it('should return 10 rides if limit is 10', async () => {
			const rides = await getPaginatedRides(10);
			expect(rides).to.be.an('array');
			expect(rides.length).to.equal(10);
			expect(rides[0].rideID).to.equal(MOCK_RIDE.rideID);
		});

		it('should return 2nd page of limit 1 rides if limit = 1 and page = 2', async () => {
			const rides = await getPaginatedRides(1, 2);
			expect(rides).to.be.an('array');
			expect(rides.length).to.equal(1);
			expect(rides[0].rideID).to.equal(MOCK_RIDE.rideID - 1);
		});

		it('should throw an error if invalid limit is given', async () => {
			let error;

			try {
				await getPaginatedRides(100);
			} catch (err) {
				error = err;
			}

			expect(error.message).to.equal('Limit must be an integer between 1 and 50');
		});

		it('should throw an error if invalid page is given', async () => {
			let error;

			try {
				await getPaginatedRides(50, -111);
			} catch (err) {
				error = err;
			}

			expect(error.message).to.equal('Page must be an integer greater than 0');
		});

		it('should not allow SQL injection', async () => {
			let error;

			try {
				await getPaginatedRides('1; DROP TABLE Rides');
			} catch (err) {
				error = err;
			}

			expect(error.message).to.equal('Limit must be an integer between 1 and 50');
		});
	});
});