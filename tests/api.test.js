'use strict';

const request = require('supertest');
const lodash = require('lodash');
const { expect } = require('chai');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

const MOCK_RIDE = {
	startLat: -70,
	endLat: 89,
	startLong: -100,
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

			buildSchemas(db);

			done();
		});
	});

	describe('GET /health', () => {
		it('should return health', (done) => {
			request(app)
				.get('/health')
				.expect('Content-Type', /text/)
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
						message: 'Rider name must be a non empty string'
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
						message: 'Rider name must be a non empty string'
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
	});
});