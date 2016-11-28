const flights = require('./schedule');

const db = require('./dbConnect');
const schedule = require('node-schedule');
// Array that stores the flights that come from the Api.
let currentFlights = [];
let timerOn = false;

// Keeping track of recently saved flights to avoid saving duplicates.
let recentlySavedFlights = [];

function initFlightSaver() {
  flights.flights('en', 'departures')
  .then((data) => {

    saveFlights(data.data.results);
  })
  .catch((error) => {
    console.log(error);
  });
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

function saveFlights(flights) {
  // Don't save if the data hasn't changed.
  console.log(flightArraysEqual(flights, recentlySavedFlights));
  if (flightArraysEqual(flights, recentlySavedFlights)) {  return; }
  recentlySavedFlights = [];
  for (let i = 0; i < flights.length; i++) {
    // Calculate the delay
    flights[i].delay = getDelay(flights[i]);
    db.insertDepartureFlight(flights[i]);
    // Add it to our recently saved flight list, so we don't
    // insert it again later.
    recentlySavedFlights.push(flights[i]);
    // console.log(flights[i].flightNumber);
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
    console.log(flights[i].realArrival.includes('Departed'));
    if(flights[i].realArrival.includes('Departed') &&
       !(recentlySavedFlights.indexOf(flights[i].flightNumber) > -1)){
        unsavedFlights.push(flights[i]);

    }
  }
  return unsavedFlights;
}
*/

function getDelay(flight) {
  const plannedTime = flight.plannedArrival;
  const realTime = flight.realArrival.replace('Departed ', '');
  const timeDiff = Math.abs(new Date('2011/10/09 ' + realTime)
    - new Date('2011/10/09 ' + plannedTime));
  const minutes = Math.floor((timeDiff / 1000) / 60);
  constructDate(flight.date, plannedTime);
  if (isNaN(minutes)) return 0;
  return minutes;
}

// Takes two strings in the form day.month (8. Nov)
// and hour:minutes (12:31).
// returns a legal Js Date object
function constructDate(flightDate, time){
  let returnDate;
  const currDate = new Date();
  const currentYear = currDate.getFullYear();
  const month = flightDate.substring(flightDate.length-3, flightDate.length);
  const day = flightDate.substring(0, 2);
  const dateString = currentYear+'/'+month+'/'+day+' '+time;
  //console.log(returnDate);
  //console.log(month);
  //console.log(day);
  //console.log("dStr",dateString);
  returnDate = new Date(dateString);
}


function flightArraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = arr1.length; i--;) {
    if (arr1[i].flightNumber !== arr2[i].flightNumber) {
      return false;
    }
  }
  return true;
}

function setTimer() {
  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [new schedule.Range(0, 6)];
  rule.hour = 23;
  rule.minute = 50;

  let j = schedule.scheduleJob(rule, function(){
    flights.flights()
    .then((data) => {
      saveFlights(data.data.results);
    })
    .catch((error) => {
      console.log(error);
    });
  });
}

module.exports = { initFlightSaver };
