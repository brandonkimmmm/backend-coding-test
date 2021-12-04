'use strict';

const express = require('express');
const app = express();
const port = 8010;
const logger = require('./utils/logger');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const buildSchemas = require('./src/schemas');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./src/swagger.yaml');

db.serialize(() => {
    buildSchemas(db);

    const app = require('./src/app')(db);

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.listen(port, () => logger.info(`App started and listening on port ${port}`));
});