import winston from 'winston';
import { isObject } from 'lodash';
import { SPLAT } from 'triple-beam';
import 'winston-daily-rotate-file';

const rotateTransport: winston.transport = new winston.transports.DailyRotateFile({
	filename: 'rideapp-%DATE%.log',
	dirname: 'logs',
	datePattern: 'YYYY-MM-DD-HH',
	zippedArchive: true,
	maxSize: '20m',
	maxFiles: '14d'
});

const formatObject = (data: string | object): string => isObject(data) ? JSON.stringify(data) : data;

const myFormat = winston.format((info: winston.LogEntry ): winston.LogEntry => {
	const splat = info[SPLAT as any] || [];
	const message = formatObject(info.message);
	const rest = splat.map(formatObject).join(' ');
	info.message = `${message} ${rest}`;
	return info;
});

const logger: winston.Logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		myFormat(),
		winston.format.timestamp(),
		winston.format.align(),
		winston.format.printf((info) => `${info.timestamp} ${info.level}: ${formatObject(info.message)}`)
	),
	transports: [
		new winston.transports.Console(),
		rotateTransport
	],
	silent: process.env.NODE_ENV === 'test'
});

export default logger;