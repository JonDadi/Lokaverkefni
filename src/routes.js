const express = require('express');

const router = express.Router();
const schedule = require('./schedule');


/* GET home page. Returns departures in English by default */
router.get('/', (req, res, next) => {
  schedule.flights("en")
    .then((result) => {
      console.log("result er: "+result);
      // check for empty array => no flights found
      let empty = false;
      if (result.data.results === []) {
        empty = true;
      }

      let lang = "english";

      res.render('index', {
        title: 'Flight schedule',
        schedule: result.data.results,
        language: lang,
        empty });
    })
    .catch((error) => {
      res.render('error', { title: 'Something went wrong!', error });
    });
});

/* GET flight schedule */
router.get('/statistics/', (req, res, next) => {

});

module.exports = router;
