'use strict';

const express = require('express');
const router = express.Router();
const { postRides, getRides, getRidesId } = require('./controllers');

router.post('/', postRides);
router.get('/', getRides);
router.get('/:id', getRidesId);

module.exports = router;