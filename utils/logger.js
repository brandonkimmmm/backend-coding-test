'use strict';

const winston = require('winston');
require('winston-daily-rotate-file');

const rotateTransport = new winston.transports.DailyRotateFile({
	filename: 'rideapp-%DATE%.log',
	dirname: 'logs',
	datePattern: 'YYYY-MM-DD-HH',
	zippedArchive: true,
	maxSize: '20m',
	maxFiles: '14d'
});

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.json()
	),
	transports: [
		new winston.transports.Console(),
		rotateTransport
	]
});

module.exports = logger;