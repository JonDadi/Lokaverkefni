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
router.get('/f/:type', (req, res, next) => {
  const type = req.params.type;

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

router.get('/about', (req, res, next) => {
  res.render('about', { title: 'About this page' });
});

// hardcoded 7 days
router.get('/json/avgDepDelay', (req, res, next) => {
  db.getAvgDepartureDelayPastXDays(7)
  .then((data) => {
    res.json(data);
  });
});

// hardcoded 7 days
router.get('/json/avgArrDelay', (req, res, next) => {
  db.getAvgArrivalDelayPastXDays(7)
  .then((data) => {
    res.json(data);
  });
});

// Use input from user to get data X days back
router.get('/json/getArrDelayXDaysBack/:days', (req, res, next) => {
  db.getAvgArrivalDelayPastXDays(parseInt(req.params.days, 10))
  .then((data) => {
    res.json(data);
  });
});

router.get('/json/getDepartureDelayXDaysBack/:days', (req, res, next) => {
  db.getAvgDepartureDelayPastXDays(parseInt(req.params.days, 10))
  .then((data) => {
    res.json(data);
  });
});

router.get('/json/getDepDelayXDaysBackAirline/:airline/:days',
(req, res, next) => {
  db.getAvgDepartureDelayPastXDaysForAirline(parseInt(req.params.days, 10),
  req.params.airline)
  .then((data) => {
    res.json(data);
  });
});

router.get('/json/getDepDelayXDaysBackTwoAirlines/:airline1/:airline2/:days',
(req, res, next) => {
  db.getAvgDepartureDelayPastXDaysForTwoAirlines(parseInt(req.params.days, 10),
  req.params.airline1, req.params.airline2)
  .then((data) => {
    res.json(data);
  });
});

router.get('/json/getArrDelayXDaysBackAirline/:airline/:days',
(req, res, next) => {
  db.getAvgArrivalDelayPastXDaysForAirline(parseInt(req.params.days, 10),
  req.params.airline)
  .then((data) => {
    res.json(data);
  });
});

router.get('/json/getArrDelayXDaysBackTwoAirlines/:airline1/:airline2/:days',
(req, res, next) => {
  db.getAvgArrivalDelayPastXDaysForTwoAirlines(parseInt(req.params.days, 10),
  req.params.airline1, req.params.airline2)
  .then((data) => {
    res.json(data);
  });
});


router.get('/json/getTotalFlightsAndTimelyDepartures/', (req, res, next) => {
  db.getTotalFlightsAndTimelyDepartures()
  .then((data) => {
    res.json(data);
  });
});

router.get('/json/getTotalFlightsAndTimelyArrivals/', (req, res, next) => {
  db.getTotalFlightsAndTimelyArrivals()
  .then((data) => {
    res.json(data);
  });
});

// Get the airlines available
router.get('/json/getArrAirlines/:days', (req, res, next) => {
  db.getAllArrivalsAirlineNamesPastXDays(parseInt(req.params.days, 10))
  .then((data) => {
    res.json(data);
  });
});

router.get('/json/getDepAirlines/:days', (req, res, next) => {
  db.getAllDeparturesAirlineNamesPastXDays(parseInt(req.params.days, 10))
  .then((data) => {
    res.json(data);
  });
});

module.exports = router;
