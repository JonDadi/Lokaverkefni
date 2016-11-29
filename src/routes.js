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
   db.createTables();
  flightSaver.initFlightSaver();
  res.render('stats', { title: 'Flight Statistics' });
});

router.get('/json/avgDepDelay', (req, res, next) => {
  db.getAvgDepartureDelayAllAirlines()
  .then((data) => {
    res.json(data);
  });
});

router.get('/json/avgArrDelay', (req, res, next) => {
  db.getAvgArrivalDelayAllAirlines()
  .then((data) => {
    res.json(data);
  });
});

router.get('/json/getArrDelayXDaysBack/:days', (req, res, next) => {
  db.getAvgArrivalDelayPastXDays(parseInt(req.params.days))
  .then((data) => {
    res.json(data);
  });
});

router.get('/json/getDepartureDelayXDaysBack/:days', (req, res, next) => {
  db.getAvgDepartureDelayPastXDays(parseInt(req.params.days))
  .then((data) => {
    res.json(data);
  });
});

router.get('/json/getDepDelayXDaysBackAirline/:airline/:days', (req, res, next) => {
  db.getAvgArrivalDelayPastXDaysForAirline(parseInt(req.params.days), req.params.airline)
  .then((data) => {
    res.json(data);
  });
});
router.get('/json/getArrDelayXDaysBackAirline/:airline/:days', (req, res, next) => {
  db.getAvgArrivalDelayPastXDaysForAirline(parseInt(req.params.days), req.params.airline)
  .then((data) => {
    res.json(data);
  });
});


//Get the airlines available
router.get('/json/getArrAirlines/:days', (req, res, next) => {
  db.getAllArrivalsAirlineNamesPastXDays(parseInt(req.params.days))
  .then((data) => {
    res.json(data);
  });
});
router.get('/json/getDepAirlines/:days', (req, res, next) => {
  db.getAllDeparturesAirlineNamesPastXDays(parseInt(req.params.days))
  .then((data) => {
    res.json(data);
  });
});


module.exports = router;
