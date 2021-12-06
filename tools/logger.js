'use strict';

const winston = require('winston');
const { SPLAT } = require('triple-beam');
require('winston-daily-rotate-file');
const { isObject } = require('lodash');

const rotateTransport = new winston.transports.DailyRotateFile({
	filename: 'rideapp-%DATE%.log',
	dirname: 'logs',
	datePattern: 'YYYY-MM-DD-HH',
	zippedArchive: true,
	maxSize: '20m',
	maxFiles: '14d'
});

const formatObject = (data) => isObject(data) ? JSON.stringify(data) : data;

const myFormat = winston.format((info) => {
	const splat = info[SPLAT] || [];
	const message = formatObject(info.message);
	const rest = splat.map(formatObject).join(' ');
	info.message = `${message} ${rest}`;
	return info;
});

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		myFormat(),
		winston.format.timestamp(),
		winston.format.align(),
		winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
	),
	transports: [
		new winston.transports.Console(),
		rotateTransport
	],
	silent: process.env.NODE_ENV === 'test'
});

module.exports = logger;