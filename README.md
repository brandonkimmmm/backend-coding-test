# Ride App

This application creates an express server that allows users to create and get rides taken. All rides are stored in memory using sqlite3.

## Requirements

- Node version 10

## Setup

1. Clone this repo
2. Run `npm ci`
3. Run `npm start`
4. Hit the server to test health `curl localhost:8010/health` and expect a `200` response

## Testing

- Mocha Test: Run `npm test`
- Load Test: Run `npm test:load`

## Dev Mode

This application can be ran in dev mode using `nodemon` using the script `npm run dev`.

## API Documentation

This application generates a Swagger API UI. To access the documentation, go to `localhost:8010/api-docs` in your browser.

## Logging

Logs are created using the winston library. All log files are generated every day and stored in a `logs` directory. Each log file has a maximum size of 20 mb and kept for up to 14 days.

## Libraries Used
- bluebird v3.7.2
- express v4.16.4
- helmet v4.6.0
- joi v17.5.0
- lodash v4.17.21
- morgan v1.10.0
- nanoid v3.1.30
- sqlite3 v4.0.6
- swagger-ui-express v4.2.0
- winston v3.3.3
- winston-daily-rotate-file v4.5.5
- yamljs 0.3.0

Dev Dependencies
- artillery v1.6.1
- artillery-plugin-expect v1.5.0
- chai v4.3.4
- eslint v8.4.0
- faker v5.5.3
- forever v4.0.1
- mocha v6.1.4
- nodemon v2.0.15
- nyc v15.1.0
- pre-push v0.1.1
- supertest v4.0.2