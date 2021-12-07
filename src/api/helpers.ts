import P from 'bluebird';
import { db } from '../tools/database';
import { CreateRideSchema, GetRidesSchema, GetRideSchema } from '../tools/schemas';

export interface Ride {
	rideID: number;
	created: string;
	startLat: number;
	startLong: number;
	endLat: number;
	endLong: number;
	riderName: string;
	driverName: string;
	driverVehicle: string;
}

export const createRide = (
	start_lat: number,
	start_long: number,
	end_lat: number,
	end_long: number,
	rider_name: string,
	driver_name: string,
	driver_vehicle: string,
): Promise<Ride> => {
	return new P((resolve, reject) => {
		const validation = CreateRideSchema.validate({
			start_lat,
			start_long,
			end_lat,
			end_long,
			rider_name,
			driver_name,
			driver_vehicle
		});

		if (validation.error) {
			return reject(new Error(validation.error.message));
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

export const countRides = async (): Promise<number> => {
	const { count } = await db.getAsync('SELECT COUNT(RideID) AS count FROM Rides');
	return count;
};

export const getPaginatedRides = async (limit = 50, page = 1): Promise<Ride[]> => {
	await GetRidesSchema.validateAsync({ limit, page });
	const offset = limit * (page - 1);

	const rows = await db.allAsync('SELECT * FROM Rides ORDER BY rideID DESC LIMIT ? OFFSET ?', [limit, offset]);
	return rows;
};

export const getRide = async (id: number): Promise<Ride | undefined> => {
	await GetRideSchema.validateAsync({ id });

	const ride = await db.getAsync('SELECT * FROM Rides WHERE rideID=?', id);
	return ride;
};