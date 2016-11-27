const flights = require('./schedule');
const db = require('./dbConnect');
const schedule = require('node-schedule');
// Array that stores the flights that come from the Api.
let currentFlights = [];
let timerOn = false;

// Keeping track of recently saved flights to avoid saving duplicates.
let recentlySavedFlights = [];

function initFlightSaver(){

  flights.flights()
  .then( (data) => {
      saveFlights(data.data.results);
  })
  .catch( (error) => {
    console.log(error);
  });


    dummyFlight = {"date":"27. Nov","flightNumber":"WW760","airline":"WOW air",
                  "to":"Frankfurt",
                  "plannedArrival":"06:20",
                  "realArrival":"Departed 12:59",
                  "status":null}
    //setTimer();

  }

/*
function compareToCurrentArray(data){
   // Check if the flights provided by the api are equal to
   // our last data we recieved from the api.
   //if(!arraysEqual(data, currentFlights)){
     //saveFlights(getUnsavedDepartedFlights(data));
     saveFlights(data);
     //update our displayed flights to the apis flights.
    // currentFlights = data;
   //}
}
*/

function saveFlights(flights){
  // Don't save if the data hasn't changed.
  if(arraysEqual(flights, recentlySavedFlights)){ return; }
  for(let i = 0; i<flights.length; i++){

    // Calculate the delay
    flights[i].delay = getDelay(flights[i]);
    //Empty the recently saved flights.
    recentlySavedFlights = [];
    db.insertDepartureFlight(flights[i]);
    // Add it to our recently saved flight list, so we don't
    // insert it again later.
    recentlySavedFlights.push(flights[i].flightNumber);
    //console.log(flights[i].flightNumber);
  }
}

/*
function getUnsavedDepartedFlights(flights){
  let unsavedFlights = [];
  //The loop checks all the flights for a flight marked departed.
  for(let i = 0; i < flights.length; i++){
    console.log(recentlySavedFlights);
    //console.log(recentlySavedFlights.indexOf(flights[i].flightNumber));
    //Check if the flight is departed and is not in recently saved flights.
    console.log(!(recentlySavedFlights.indexOf(flights[i].flightNumber) > -1));
    console.log(flights[i].realArrival.includes("Departed"));
    if(flights[i].realArrival.includes("Departed") &&
       !(recentlySavedFlights.indexOf(flights[i].flightNumber) > -1)){
        unsavedFlights.push(flights[i]);

    }
  }
  return unsavedFlights;
}
*/

function getDelay(flight){
  const plannedTime = flight.plannedArrival;
  const realTime = flight.realArrival.replace("Departed ", "");

  const timeDiff = Math.abs(new Date('2011/10/09 '+realTime) - new Date('2011/10/09 '+plannedTime));

  return Math.floor((timeDiff/1000)/60);
}


function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }
    return true;
}

function setTimer(){
  var rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [new schedule.Range(0, 6)];
  rule.hour = 23;
  rule.minute = 50;

  var j = schedule.scheduleJob(rule, function(){
    flights.flights()
    .then( (data) => {
        saveFlights(data.data.results);
    })
    .catch( (error) => {
      console.log(error);
    });
  });
  }

module.exports = {initFlightSaver,};
