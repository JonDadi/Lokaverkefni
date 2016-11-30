const flights = require('./schedule');

const db = require('./dbConnect');
const schedule = require('node-schedule');

// Keeping track of recently saved flights to avoid saving duplicates.
let recentlySavedDepartingFlights = [];
let recentlySavedArrivingFlights = [];
let hasRecentFlights = false;


// Assuming that if the flight has the same flightNumber and the same date that
// they are the same flight. We can assume this because a flightNumber will only
// fly at most once a day.
function flightEqual(flight1, flight2) {
  return (flight1.flightNumber === flight2.flightNumber) &&
         (flight1.flightdate === flight2.flightdate);
}


// We want to keep the recentFlights array at 50 flights
// to improve perfomance.
function trimRecentFlightsArray() {
  const departureLength = recentlySavedDepartingFlights.length;
  const arrivalLength = recentlySavedArrivingFlights.length;

  if (departureLength > 50) {
    recentlySavedDepartingFlights = recentlySavedDepartingFlights
                                    .slice((departureLength - 50), 51);
  }
  if (arrivalLength > 50) {
    recentlySavedArrivingFlights = recentlySavedArrivingFlights
                                  .slice((arrivalLength - 50), 51);
  }
}


// Takes two strings in the form day.month (8. Nov)
// and hour:minutes (12:31).
// returns a legal Js Date object
function constructDate(flightDate, time) {
  const currDate = new Date();
  const currentYear = currDate.getFullYear();
  const month = flightDate.substring(flightDate.length - 3, flightDate.length);
  const day = flightDate.substring(0, 2);
  const dateString = `${currentYear}/${month}/${day} ${time}`;

  const returnDate = new Date(dateString);
  return returnDate;
}

function getMonthFromString(mon) {
  return new Date(Date.parse(`${mon} 1, 2012`)).getMonth() + 1;
}

function getFormatedDate(flight) {
  const flightDate = flight.date;
  const currDate = new Date();
  const currentYear = currDate.getFullYear();
  const month = flightDate.substring(flightDate.length - 3, flightDate.length);
  const day = flightDate.substring(0, 2);
  const formatedDate = `${day}-${month}-${currentYear}`;
  return formatedDate;
}

function constructSqlDate(flightDate) {
  let fdate = constructDate(flightDate, '00:00');
  const currDate = new Date();
  const currentYear = currDate.getFullYear();
  fdate = `${currentYear}-${fdate.getMonth() + 1}-${fdate.getDate()}`;
  return fdate;
}
function trimSqlDate(flightDate) {
  const stringFlightDate = `${flightDate} `;
  let month = stringFlightDate.substring(4, 7);
  month = getMonthFromString(month);
  const day = stringFlightDate.substring(8, 10);
  const currDate = new Date();
  const currentYear = currDate.getFullYear();
  const dateString = `${currentYear}-${month}-${day}`;
  return dateString;
}
function getDelay(dFlight, departure) {
  const flight = dFlight;
  let minutes;
  if (flight.realArrival.includes('Departed') ||
  flight.realArrival.includes('Landed')) {
    const plannedTime = flight.plannedArrival;

    let realTime = '';
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
    minutes = Math.floor((timeDiff / 1000) / 60);

    // If minutes is negative then that means the plane has departed
    // earlier than planned.  This is normal up to a certain extent,
    // because flights might leave a little early.
    // If minutes is a large negative number then that indicates
    // that the flight was planned just before midnight but left after midnight.
    // If we see that a flight is leaving/arriving more than 60 minutes before
    // planned time then we assume the flight is close to midnight,  and we
    // add a day to the confirmed landing/departed date.
    if (minutes < -60) {
      realDate.setDate(realDate.getDate() + 1);
      timeDiff = realDate - plannedDate;
      minutes = Math.floor((timeDiff / 1000) / 60);
      flight.onTime = false;
      return minutes;
    } else if (minutes > -60 && minutes <= 0) {
      flight.onTime = true;
    } else {
      flight.onTime = false;
    }

    if (isNaN(minutes)) return 0;
  }
  return minutes;
}

function saveFlights(flightsToSaveParam, departure) {
  const flightsToSave = flightsToSaveParam;
  for (let i = 0; i < flightsToSave.length; i++) {
    // Calculate the delay
    flightsToSave[i].delay = getDelay(flightsToSave[i], departure);
    // Change the date to something postgresql can understand
    flightsToSave[i].date = getFormatedDate(flightsToSave[i]);
    if (departure) {
      db.insertDepartureFlight(flightsToSave[i]);
      recentlySavedDepartingFlights.push(flightsToSave[i]);
    } else {
      db.insertArrivalFlight(flightsToSave[i]);
      recentlySavedArrivingFlights.push(flightsToSave[i]);
    }
  }
  trimRecentFlightsArray();
}
function isFlightInArray(flight, flightArray) {
  for (let i = 0; i < flightArray.length; i++) {
    if (flightEqual(flight, flightArray[i])) {
      return true;
    }
  }
  return false;
}
// The flights array are the current flights prided by the API.
// Type is either Arrival or Departed
function saveDepartedOrArrivedFlights(flightsFromApi, type) {
  const apiFlights = flightsFromApi;
  const departedFlightsToSave = [];
  const arrivedFlightsToSave = [];
  if (type === 'Departed') {
    for (let i = 0; i < apiFlights.length; i++) {
      // The flights from the API do not have the flightDate attribute but
      // the flights from the DB do.  In order to compare them we need to add
      // flightDate attribute to the flights recieved from the API
      apiFlights[i].flightdate = constructSqlDate(apiFlights[i].date);
      if (apiFlights[i].realArrival.indexOf('Departed') > -1) {
        if (!isFlightInArray(apiFlights[i], recentlySavedDepartingFlights)) {
          departedFlightsToSave.push(apiFlights[i]);
        }
      }
    }// end for
  } else {
    for (let i = 0; i < apiFlights.length; i++) {
      // The flights from the API do not have the flightDate attribute but
      // the flights from the DB do.  In order to compare them we need to add
      // flightDate attribute to the flights recieved from the API
      apiFlights[i].flightdate = constructSqlDate(apiFlights[i].date);
      if (apiFlights[i].realArrival.indexOf('Landed') > -1) {
        if (!isFlightInArray(apiFlights[i], recentlySavedArrivingFlights)) {
          arrivedFlightsToSave.push(apiFlights[i]);
        }
      }
    }// End for
  }// End else

  if (departedFlightsToSave.length > 0) {
    saveFlights(departedFlightsToSave, true);
  }
  if (arrivedFlightsToSave.length > 0) {
    saveFlights(arrivedFlightsToSave, false);
  }
}// End function

function setTimer() {
  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [new schedule.Range(0, 6)];
  rule.minute = new schedule.Range(0, 59, 1);
  const j = schedule.scheduleJob(rule, () => {
    flights.flights('en', 'departures')
    .then((departureData) => {
      saveDepartedOrArrivedFlights(departureData.data.results, 'Departed');
      // Then check the arrival flights
      flights.flights('en', 'arrivals')
      .then((arrivalData) => {
        saveDepartedOrArrivedFlights(arrivalData.data.results, 'Arrivals');
      });
    });
  });
}

function formatDates() {
  for (let i = 0; i < recentlySavedArrivingFlights.length; i++) {
    const date = recentlySavedArrivingFlights[i].flightdate;
    recentlySavedArrivingFlights[i].flightdate = trimSqlDate(date);
    const fnumber = recentlySavedArrivingFlights[i].flightnumber;
    recentlySavedArrivingFlights[i].flightNumber = fnumber;
  }
  for (let i = 0; i < recentlySavedDepartingFlights.length; i++) {
    const date = recentlySavedDepartingFlights[i].flightdate;
    recentlySavedDepartingFlights[i].flightdate = trimSqlDate(date);
    const fnumber = recentlySavedDepartingFlights[i].flightnumber;
    recentlySavedDepartingFlights[i].flightNumber = fnumber;
  }
}

function getLastInsertedFlights(numFlights) {
  db.getRecentlySavedArriving(numFlights)
  .then((arrivingFlights) => {
    recentlySavedArrivingFlights = arrivingFlights;
    db.getRecentlySavedDeparting(numFlights)
    .then((departingFlights) => {
      recentlySavedDepartingFlights = departingFlights;
      hasRecentFlights = true;
      setTimer();
      formatDates();
    })
    .catch((error) => {
      // This statement will give us an error if the database is empty.
      // set recent departed flights to [].
      // recentlySavedDepartingFlights = []
    });
  })
  .catch((error) => {
    // This statement will give us an error if the database is empty.
    // set recent departed flights to [].
    // recentlySavedArrivingFlights = []
  });
}


function initFlightSaver() {
  if (!hasRecentFlights) getLastInsertedFlights(50);
}

module.exports = { initFlightSaver };
