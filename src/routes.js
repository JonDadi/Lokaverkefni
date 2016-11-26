const express = require('express');

const router = express.Router();
const schedule = require('./schedule');
const db = require('./dbConnect');

/* GET home page. */
router.get('/', (req, res, next) => {
  schedule.flights()
    .then((result) => {

    });

  res.render('index', { title: 'Nú er gaman!' });
});

/* GET flight schedule */
router.get('/flight/', (req, res, next) => {

  //db.createTables();

  //Flight data should be
  const flightData = ["test", "test", "test", "test", "test", "test", "test"];

  data = db.getAllArrivals(callBackPrint)

  //database.insertArrivalFlight(flightData);

  res.render('index', {title: 'insertion successfull'});

});

function callBackPrint(data){
  console.log(data);
}

module.exports = router;
