const flights = require('./schedule');

const db = require('./dbConnect');
const schedule = require('node-schedule');
// Array that stores the flights that come from the Api.
let currentDepartedApiFlights = [];
let currentArrivedFlights = [];
let timerOn = false;
let numFlights = 50;
// Keeping track of recently saved flights to avoid saving duplicates.
let recentlySavedDepartingFlights = [];
let recentlySavedArrivingFlights = [];
let hasRecentFlights = false;

function initFlightSaver() {

  if(!hasRecentFlights) getLastInsertedFlights(50);
  else {
    console.log("We already have recent flights! No need to fetch from DB");
  }
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

// We want to keep the recentFlights array at 50 flights
// to improve perfomance.
function trimRecentFlightsArray(){
  const departureLength = recentlySavedDepartingFlights.length;
  const arrivalLength = recentlySavedArrivingFlights.length;

  if(departureLength > 50){
    recentlySavedDepartingFlights = recentlySavedDepartingFlights
                                    .slice((departureLength-50), 51);
  }
  if(arrivalLength > 50){
    recentlySavedArrivingFlights = recentlySavedArrivingFlights
                                  .slice((arrivalLength-50), 51);
  }
}

function getLastInsertedFlights(numFlights){
  db.getRecentlySavedArriving(numFlights)
  .then( (arrivingFlights) => {
    recentlySavedArrivingFlights = arrivingFlights;
    db.getRecentlySavedDeparting(numFlights)
    .then( (departingFlights) =>{
      recentlySavedDepartingFlights = departingFlights;
      hasRecentFlights = true;
      setTimer();
      formatDates();
    })
    .catch( (error) => {
      // This statement will give us an error if the database is empty.
      // set recent departed flights to [].
      //recentlySavedDepartingFlights = []
    });
  })
  .catch( (error) => {
    // This statement will give us an error if the database is empty.
    // set recent departed flights to [].
    //recentlySavedArrivingFlights = []
  });
}

function formatDates(){
  for(let i = 0; i<recentlySavedArrivingFlights.length; i++){
    const date = recentlySavedArrivingFlights[i].flightdate;
    recentlySavedArrivingFlights[i].flightdate = trimSqlDate(date);
    const fnumber = recentlySavedArrivingFlights[i].flightnumber;
    recentlySavedArrivingFlights[i].flightNumber = fnumber;
  }
  for(let i = 0; i<recentlySavedDepartingFlights.length; i++){
    const date = recentlySavedDepartingFlights[i].flightdate;
    recentlySavedDepartingFlights[i].flightdate = trimSqlDate(date);
    const fnumber = recentlySavedDepartingFlights[i].flightnumber;
    recentlySavedDepartingFlights[i].flightNumber = fnumber;
  }
}

function saveFlights(flights, departure) {

  for (let i = 0; i < flights.length; i++) {
    // Calculate the delay
    flights[i].delay = getDelay(flights[i], departure);
    // Change the date to something postgresql can understand
    flights[i].date = getFormatedDate(flights[i]);
    if (departure) {
     db.insertDepartureFlight(flights[i]);
     recentlySavedDepartingFlights.push(flights[i]);
   } else {
     db.insertArrivalFlight(flights[i]);
     recentlySavedArrivingFlights.push(flights[i]);
    }
  }

  // We have inserted into either recentDeparture or recentArrivals
  // so it is now bigger than 50 flights.  We then trim it to keep it
  // at 50 flights.
  trimRecentFlightsArray();
}

function getDelay(flight, departure) {
  if (flight.realArrival.includes("Departed") ||
      flight.realArrival.includes("Landed")) {
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
      } else {
        return;
      }
}

function getFormatedDate(flight){
  const flightDate = flight.date;
  const currDate = new Date();
  const currentYear = currDate.getFullYear();
  const month = flightDate.substring(flightDate.length-3, flightDate.length);
  const day = flightDate.substring(0, 2);
  const formatedDate = day+'-'+month+'-'+currentYear;
  return formatedDate;
}

function constructSqlDate(flightDate){
  let fdate = constructDate(flightDate, "00:00");
  const currDate = new Date();
  const currentYear = currDate.getFullYear();
  fdate = currentYear+"-"+(fdate.getMonth()+1)+"-"+fdate.getDate();
  return fdate;
}
function trimSqlDate(flightDate){
  flightDate = ""+flightDate;
  let month = flightDate.substring(4, 7);
  month = getMonthFromString(month);
  const day = flightDate.substring(8, 10);
  const currDate = new Date();
  const currentYear = currDate.getFullYear();
  const dateString = currentYear+"-"+month+"-"+day;
  return dateString;
}

function getMonthFromString(mon){
   return new Date(Date.parse(mon +" 1, 2012")).getMonth()+1
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

// Assuming that if the flight has the same flightNumber and the same date that
// they are the same flight. We can assume this because a flightNumber will only
// fly at most once a day.
function flightEqual(flight1, flight2){
  return (flight1.flightNumber === flight2.flightNumber) &&
         (flight1.flightdate === flight2.flightdate);
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

function isFlightInArray(flight, flights){
  for(let i = 0; i<flights.length; i++){
    if(flightEqual(flight, flights[i])){
      return true;
    }
  }
  return false;
}

// The flights array are the current flights prided by the API.
// Type is either Arrival or Departed
function saveDepartedOrArrivedFlights(flights, type){
  let departedFlightsToSave = [];
  let arrivedFlightsToSave = [];
  console.log("Checking if there are flights to save.");
  if(type === "Departed"){
    console.log("er í DepartredSave");
    for(let i = 0; i<flights.length; i++){
      // The flights from the API do not have the flightDate attribute but
      // the flights from the DB do.  In order to compare them we need to add
      // flightDate attribute to the flights recieved from the API
      flights[i].flightdate = constructSqlDate(flights[i].date);
      if(flights[i].realArrival.indexOf("Departed") > -1){

        if(!isFlightInArray(flights[i], recentlySavedDepartingFlights)){
          departedFlightsToSave.push(flights[i]);
        }
      }
    }// end for
  }// end if
  else{
    currentArrivedApiFlights = flights;
    console.log("er í arrivalSave");
    for(let i = 0; i<flights.length; i++){
      // The flights from the API do not have the flightDate attribute but
      // the flights from the DB do.  In order to compare them we need to add
      // flightDate attribute to the flights recieved from the API
      flights[i].flightdate = constructSqlDate(flights[i].date);

      if(flights[i].realArrival.indexOf("Landed") > -1){
        if(!isFlightInArray(flights[i], recentlySavedArrivingFlights)){
          arrivedFlightsToSave.push(flights[i]);
        }
      }
    }// End for
  }// End else

  if(departedFlightsToSave.length > 0){
    saveFlights(departedFlightsToSave, true);
  }
  if(arrivedFlightsToSave.length > 0){
    saveFlights(arrivedFlightsToSave, false);
  }
}//End function

function setTimer() {
  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [new schedule.Range(0, 6)];
  rule.minute = new schedule.Range(0, 59, 1);

  console.log(recentlySavedArrivingFlights);

  let j = schedule.scheduleJob(rule, function(){
    flights.flights("en", "departures")
    .then((data) => {
      currentDepartedApiFlights = data.data.results;
      saveDepartedOrArrivedFlights(data.data.results, "Departed");
      //Then check the arrival flights
      flights.flights("en", "arrivals")
      .then((data) => {
        currentArrivedApiFlights = data.data.results;
        saveDepartedOrArrivedFlights(data.data.results, "Arrivals");

      })
      .catch((error) => {
        console.log(error);
      });
    })
    .catch((error) => {
      console.log(error);
    });
  });
}

module.exports = { initFlightSaver };
