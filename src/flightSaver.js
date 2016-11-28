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
    const departure = true;
    saveFlights(data.data.results, departure);
  })
  .catch((error) => {
    console.log(error);
  });

  flights.flights('en', 'arrivals')
  .then((data) => {
    departure = false;
    saveFlights(data.data.results, departure);
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

function saveFlights(flights, departure) {
  // Don't save if the data hasn't changed.
  if (flightArraysEqual(flights, recentlySavedFlights)) {  return; }
  recentlySavedFlights = [];
  for (let i = 0; i < flights.length; i++) {
    // Calculate the delay
    flights[i].delay = getDelay(flights[i], departure);
    if (departure) {
     db.insertDepartureFlight(flights[i]);
   } else {
     db.insertArrivalFlight(flights[i]);
   }
    // Add it to our recently saved flight list, so we don't
    // insert it again later.
    recentlySavedFlights.push(flights[i]);
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

function getDelay(flight, departure) {
  const plannedTime = flight.plannedArrival;
  let realTime = "";
  if (departure) {
    realTime = flight.realArrival.replace('Departed ', '');
  } else {
    realTime = flight.realArrival.replace('Landed ', '');
  }

  const realDate = constructDate(flight.date, realTime);
  const plannedDate = constructDate(flight.date, plannedTime);

  // We need to check if a flight has delay that spans over midnight
  // if that happens we need to add a day to plannedDate.

  let timeDiff = realDate - plannedDate;
  let minutes = Math.floor((timeDiff / 1000) / 60);

  // If minutes is negative then that means the plane has departed
  // earlier than planned.  This is normal up to a certain extent,
  // because flights might leave a little early.
  // If minutes is a large negative number then that indicates that the flights
  // was planned just before midnight but left after midnight.
  // If we see that a flight is leaving/arriving more than 60 minutes before
  // planned time then we assume the flight is close to midnight,  and we
  // add a day to the confirmed landing/departed date.
  if(minutes < -60){
    realDate.setDate(realDate.getDate()+1);
    timeDiff = realDate - plannedDate;
    minutes = Math.floor((timeDiff / 1000) / 60);
    flight.onTime = false;
    return minutes;
  }
  else if (minutes > -60 && minutes <= 0) {
    flight.onTime = true;
  }
  else {
    flight.onTime = false;
  }

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

  returnDate = new Date(dateString);
  return returnDate;
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
