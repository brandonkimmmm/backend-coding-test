'use strict';

const request = require('supertest');
const lodash = require('lodash');
const { expect } = require('chai');
const { initDb, db } = require('../tools/database');
const initApp = require('../src/app');
let app;

const MOCK_RIDE = {
	startLat: -70,
	startLong: -100,
	endLat: 89,
	endLong: -1,
	riderName: 'brandon',
	driverName: 'john',
	driverVehicle: '400z'
};

describe('API tests', () => {
	before((done) => {
		db.serialize((err) => {
			if (err) {
				return done(err);
			}

			initDb();
			app = initApp();

			for (let i = 0; i < 50; i++) {
				db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', Object.values(MOCK_RIDE));
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

	describe('GET /api-docs', () => {
		it('should return renderd swagger ui', (done) => {
			request(app)
				.get('/api-docs')
				.expect('Content-Type', /html/)
				.expect(301, done);
		});
	});

	describe('GET /health', () => {
		it('should return health', (done) => {
			request(app)
				.get('/health')
				.expect('Content-Type', /html/)
				.expect(200, done);
		});
	});

	describe('POST /rides', () => {
		it('should return newly created ride', (done) => {
			request(app)
				.post('/rides')
				.send({
					start_lat: MOCK_RIDE.startLat,
					end_lat: MOCK_RIDE.endLat,
					start_long: MOCK_RIDE.startLong,
					end_long: MOCK_RIDE.endLong,
					rider_name: MOCK_RIDE.riderName,
					driver_name: MOCK_RIDE.driverName,
					driver_vehicle: MOCK_RIDE.driverVehicle
				})
				.expect('Content-Type', /json/)
				.expect(200)
				.expect((res) => {
					expect(res.body).to.be.an('array');
					expect(res.body[0]).to.be.an('object');

					const formattedResponse = lodash.mapKeys(
						lodash.omit(res.body[0], ['rideID', 'created']),
						(value, key) => lodash.camelCase(key)
					);

					expect(formattedResponse).to.deep.equal(MOCK_RIDE);
				})
				.end(done);
		});

		it('should return error response if invalid start latitude given', (done) => {
			request(app)
				.post('/rides')
				.send({
					start_lat: 100000,
					end_lat: MOCK_RIDE.endLat,
					start_long: MOCK_RIDE.startLong,
					end_long: MOCK_RIDE.endLong,
					rider_name: MOCK_RIDE.riderName,
					driver_name: MOCK_RIDE.driverName,
					driver_vehicle: MOCK_RIDE.driverVehicle
				})
				.expect('Content-Type', /json/)
				.expect(200)
				.expect((res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.deep.equal({
						error_code: 'VALIDATION_ERROR',
						message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
					});
				})
				.end(done);
		});

		it('should return error response if invalid end longitude given', (done) => {
			request(app)
				.post('/rides')
				.send({
					start_lat: MOCK_RIDE.startLat,
					end_lat: MOCK_RIDE.endLat,
					start_long: MOCK_RIDE.startLong,
					end_long: -9999999,
					rider_name: MOCK_RIDE.riderName,
					driver_name: MOCK_RIDE.driverName,
					driver_vehicle: MOCK_RIDE.driverVehicle
				})
				.expect('Content-Type', /json/)
				.expect(200)
				.expect((res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.deep.equal({
						error_code: 'VALIDATION_ERROR',
						message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
					});
				})
				.end(done);
		});

		it('should return error response if invalid rider name given', (done) => {
			request(app)
				.post('/rides')
				.send({
					start_lat: MOCK_RIDE.startLat,
					end_lat: MOCK_RIDE.endLat,
					start_long: MOCK_RIDE.startLong,
					end_long: MOCK_RIDE.endLong,
					rider_name: 99999,
					driver_name: MOCK_RIDE.driverName,
					driver_vehicle: MOCK_RIDE.driverVehicle
				})
				.expect('Content-Type', /json/)
				.expect(200)
				.expect((res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.deep.equal({
						error_code: 'VALIDATION_ERROR',
						message: 'Rider name must be a non empty string'
					});
				})
				.end(done);
		});

		it('should return error response if invalid driver name given', (done) => {
			request(app)
				.post('/rides')
				.send({
					start_lat: MOCK_RIDE.startLat,
					end_lat: MOCK_RIDE.endLat,
					start_long: MOCK_RIDE.startLong,
					end_long: MOCK_RIDE.endLong,
					rider_name: MOCK_RIDE.riderName,
					driver_name: '',
					driver_vehicle: MOCK_RIDE.driverVehicle
				})
				.expect('Content-Type', /json/)
				.expect(200)
				.expect((res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.deep.equal({
						error_code: 'VALIDATION_ERROR',
						message: 'Driver name must be a non empty string'
					});
				})
				.end(done);
		});

		it('should return error response if invalid driver vehicle given', (done) => {
			request(app)
				.post('/rides')
				.send({
					start_lat: MOCK_RIDE.startLat,
					end_lat: MOCK_RIDE.endLat,
					start_long: MOCK_RIDE.startLong,
					end_long: MOCK_RIDE.endLong,
					rider_name: MOCK_RIDE.riderName,
					driver_name: MOCK_RIDE.driverName,
					driver_vehicle: false
				})
				.expect('Content-Type', /json/)
				.expect(200)
				.expect((res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.deep.equal({
						error_code: 'VALIDATION_ERROR',
						message: 'Driver vehicle must be a non empty string'
					});
				})
				.end(done);
		});
	});

	describe('GET /rides/:id', () => {
		it('should return ride with ID 1', (done) => {
			request(app)
				.get('/rides/1')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect((res) => {
					expect(res.body).to.be.an('array');
					expect(res.body[0]).to.be.an('object');

					const formattedResponse = lodash.mapKeys(
						lodash.omit(res.body[0], ['rideID', 'created']),
						(value, key) => lodash.camelCase(key)
					);

					expect(formattedResponse).to.deep.equal(MOCK_RIDE);
				})
				.end(done);
		});

		it('should return error response if ride with ID is not found', (done) => {
			request(app)
				.get('/rides/999999')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect((res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.deep.equal({
						error_code: 'RIDES_NOT_FOUND_ERROR',
						message: 'Could not find any rides'
					});
				})
				.end(done);
		});

		it('should return error response if ride below 1 is given', (done) => {
			request(app)
				.get('/rides/-23')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect((res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.deep.equal({
						error_code: 'VALIDATION_ERROR',
						message: 'ID must be an integer greater than 0'
					});
				})
				.end(done);
		});
	});

	describe('GET /rides', () => {
		it('should return all rides', (done) => {
			request(app)
				.get('/rides')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect((res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('count');
					expect(res.body).to.have.property('rows');
					expect(res.body.count).to.equal(51);
					expect(res.body.rows).to.be.an('array');
					expect(res.body.rows.length).to.equal(50);
					expect(res.body.rows[0]).to.be.an('object');

					const formattedResponse = lodash.mapKeys(
						lodash.omit(res.body.rows[0], ['rideID', 'created']),
						(value, key) => lodash.camelCase(key)
					);

					expect(formattedResponse).to.deep.equal(MOCK_RIDE);
				})
				.end(done);
		});

		it('should only return 20 rows when limit 20 is given', (done) => {
			request(app)
				.get('/rides')
				.query({ limit: 20 })
				.expect('Content-Type', /json/)
				.expect(200)
				.expect((res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('count');
					expect(res.body).to.have.property('rows');
					expect(res.body.count).to.equal(51);
					expect(res.body.rows).to.be.an('array');
					expect(res.body.rows.length).to.equal(20);
					expect(res.body.rows[0]).to.be.an('object');

					const formattedResponse = lodash.mapKeys(
						lodash.omit(res.body.rows[0], ['rideID', 'created']),
						(value, key) => lodash.camelCase(key)
					);

					expect(formattedResponse).to.deep.equal(MOCK_RIDE);
				})
				.end(done);
		});

		it('should only return third page when page 3 is given', (done) => {
			request(app)
				.get('/rides')
				.query({ limit: 1, page: 3 })
				.expect('Content-Type', /json/)
				.expect(200)
				.expect((res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('count');
					expect(res.body).to.have.property('rows');
					expect(res.body.count).to.equal(51);
					expect(res.body.rows).to.be.an('array');
					expect(res.body.rows.length).to.equal(1);
					expect(res.body.rows[0]).to.be.an('object');
					expect(res.body.rows[0].rideID).to.equal(49);
				})
				.end(done);
		});

		it('should return error if no rides are found in DB', (done) => {
			db.runAsync('DELETE FROM Rides')
				.then(() => {
					request(app)
						.get('/rides')
						.expect('Content-Type', /json/)
						.expect(200)
						.expect((res) => {
							expect(res.body).to.be.an('object');
							expect(res.body).to.deep.equal({
								error_code: 'RIDES_NOT_FOUND_ERROR',
								message: 'Could not find any rides'
							});
						})
						.end(done);
				})
				.catch(done);
		});

		it('should return error if limit above 50 is given', (done) => {
			request(app)
				.get('/rides')
				.query({ limit: 100 })
				.expect('Content-Type', /json/)
				.expect(200)
				.expect((res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.deep.equal({
						error_code: 'VALIDATION_ERROR',
						message: 'Limit must be an integer between 1 and 50'
					});
				})
				.end(done);
		});

		it('should return error if page below 1 is given', (done) => {
			request(app)
				.get('/rides')
				.query({ page: -23 })
				.expect('Content-Type', /json/)
				.expect(200)
				.expect((res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.deep.equal({
						error_code: 'VALIDATION_ERROR',
						message: 'Page must be an integer greater than 0'
					});
				})
				.end(done);
		});
	});
});