import faker from 'faker';

export interface SnakeCaseRide {
	start_lat: number;
	start_long: number;
	end_lat: number;
	end_long: number;
	rider_name: string;
	driver_name: string;
	driver_vehicle: string;
}

export interface CamelCaseRide {
	rideID?: number;
	created?: string;
	startLat: number;
	startLong: number;
	endLat: number;
	endLong: number;
	riderName: string;
	driverName: string;
	driverVehicle: string;
}

export const getSnakeCaseMockRide = (): SnakeCaseRide => {
	return {
		start_lat: faker.datatype.number({ min: -90, max: 90 }),
		start_long: faker.datatype.number({ min: -180, max: 180 }),
		end_lat: faker.datatype.number({ min: -90, max: 90 }),
		end_long: faker.datatype.number({ min: -180, max: 180 }),
		rider_name: faker.name.findName(),
		driver_name: faker.name.findName(),
		driver_vehicle: faker.vehicle.vehicle()
	};
};

export const getMockRide = (): CamelCaseRide => {
	return {
		startLat: faker.datatype.number({ min: -90, max: 90 }),
		startLong: faker.datatype.number({ min: -180, max: 180 }),
		endLat: faker.datatype.number({ min: -90, max: 90 }),
		endLong: faker.datatype.number({ min: -180, max: 180 }),
		riderName: faker.name.findName(),
		driverName: faker.name.findName(),
		driverVehicle: faker.vehicle.vehicle()
	};
};