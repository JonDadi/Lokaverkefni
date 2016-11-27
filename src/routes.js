const express = require('express');

const router = express.Router();
const schedule = require('./schedule');
const db = require('./dbConnect');
const flightSaver = require('./flightSaver');

/* GET home page. Returns arrivals in English by default */
router.get('/', (req, res, next) => {
  schedule.flights("en", "arrivals")
    .then((result) => {
      // check for empty array => no flights found
      let empty = false;
      if (result.data.results === []) {
        empty = true;
      }

      res.render('index', {
        title: 'Arrivals',
        schedule: result.data.results,
        type: "arrivals",
        empty });
    })
    .catch((error) => {
      res.render('error', { title: 'Something went wrong!', error });
    });
});

// get type of flight, either "arrivals" or "departures"
router.get('/:type', (req, res, next) => {
  let type = req.params.type;

  schedule.flights("en", type)
    .then((result) => {
      // check for empty array => no flights found
      let empty = false;
      if (result.data.results === []) {
        empty = true;
      }

      let title = "";

      if (type === 'arrivals') {
        title = "Arrivals";
      } else {
        title = "Departures";
      }

      res.render('index', {
        title: title,
        schedule: result.data.results,
        type: type,
        empty });
    })
    .catch((error) => {
      res.render('error', { title: 'Something went wrong!', error });
    });
});

/* GET flight schedule */
router.get('/statistics/', (req, res, next) => {

  db.createTables();

  //Flight data should be
  const flightData = ["test", "test", "test", "test", "test", "test", "test"];

  //data = db.getAllArrivals()

  flightSaver.initFlightSaver();


  res.render('stats', {title: 'Flight Statistics'});

});


module.exports = router;
