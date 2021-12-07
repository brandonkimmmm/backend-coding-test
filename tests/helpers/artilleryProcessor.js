'use strict';

const faker = require('faker');

const generateRandomRide = (userContext, events, done) => {
	const ride = {
		start_lat: faker.datatype.number({ min: -90, max: 90 }),
		start_long: faker.datatype.number({ min: -180, max: 180 }),
		end_lat: faker.datatype.number({ min: -90, max: 90 }),
		end_long: faker.datatype.number({ min: -180, max: 180 }),
		rider_name: faker.name.findName(),
		driver_name: faker.name.findName(),
		driver_vehicle: faker.vehicle.vehicle()
	};

	userContext.vars.mockRide = ride;
	return done();
};

module.exports = {
	generateRandomRide
};