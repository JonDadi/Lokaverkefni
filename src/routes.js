const express = require('express');

const router = express.Router();
const schedule = require('./schedule');


/* GET home page. */
router.get('/', (req, res, next) => {
  schedule.flights()
    .then((result) => {

    });

  res.render('index', { title: 'Nú er gaman!' });
});

/* GET flight schedule */
router.get('/flight/', (req, res, next) => {

});

module.exports = router;
