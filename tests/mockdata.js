'use strict';

const faker = require('faker');
const lodash = require('lodash');

const getMockRide = (opts = { snake_case: false }) => {
	const ride = {
		startLat: faker.datatype.number({ min: -90, max: 90 }),
		startLong: faker.datatype.number({ min: -180, max: 180 }),
		endLat: faker.datatype.number({ min: -90, max: 90 }),
		endLong: faker.datatype.number({ min: -180, max: 180 }),
		riderName: faker.name.findName(),
		driverName: faker.name.findName(),
		driverVehicle: faker.vehicle.vehicle()
	};

	if (opts.snake_case) {
		return lodash.mapKeys(ride, (value, key) => lodash.snakeCase(key));
	}

	return ride;
};

const generateRandomRide = (userContext, events, done) => {
	const ride = getMockRide({ snake_case: true });

	userContext.vars.mockRide = ride;
	return done();
};

module.exports = {
	getMockRide,
	generateRandomRide
};