const express = require('express');

const router = express.Router();
const schedule = require('./schedule');
const db = require('./dbConnect');
const flightSaver = require('./flightSaver');

/* GET home page. Returns arrivals in English by default */
router.get('/', (req, res, next) => {
  schedule.flights('en', 'arrivals')
    .then((result) => {
      // check for empty array => no flights found
      let empty = false;
      if (result.data.results === []) {
        empty = true;
      }

      res.render('index', {
        title: 'Arrivals',
        schedule: result.data.results,
        type: 'arrivals',
        empty });
    })
    .catch((error) => {
      res.render('error', { title: 'Something went wrong!', error });
    });
});

// get type of flight, either 'arrivals' or 'departures'
// if param is 'statistics' we send the request forward
router.get('/f/:type', (req, res, next) => {
  const type = req.params.type;

  if (type === 'statistics') next();

  schedule.flights('en', type)
    .then((result) => {
      // check for empty array => no flights found
      let empty = false;
      if (result.data.results === []) {
        empty = true;
      }

      let title = '';

      if (type === 'arrivals') {
        title = 'Arrivals';
      } else {
        title = 'Departures';
      }

      res.render('index', {
        title,
        schedule: result.data.results,
        type,
        empty });
    })
    .catch((error) => {
      res.render('error', { title: 'Something went wrong!', error });
    });
});

/* GET flight schedule */
router.get('/statistics/', (req, res, next) => {
  // db.createTables();
  flightSaver.initFlightSaver();
  res.render('stats', { title: 'Flight Statistics' });
});

/* GET flight schedule */
router.get('/json/', (req, res, next) => {
  db.getAvgDelayAllAirlines()
  .then((data) => {
    res.json(data);
  });
});
module.exports = router;
