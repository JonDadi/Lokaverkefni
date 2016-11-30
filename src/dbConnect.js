const pgp = require('pg-promise')();

const db = pgp('postgres://postgres:dadi@localhost:5432/FlightData');

// Create the tables!
function createTables() {
  // Arrival table created.
  db.none('CREATE TABLE IF NOT EXISTS arrivals( \
            id             SERIAL PRIMARY KEY,  \
            flightDate     timestamp,                \
            flightNumber   varchar(20),         \
            airline        varchar(64),         \
            fromDest       varchar(64),         \
            plannedArrival varchar(20),         \
            realArrival    varchar(20),         \
            flightStatus   varchar(20),         \
            delay          int,                 \
            onTimeOrEarly  boolean              \
  )')
  .then(() => {
    console.log('Arrival table created!');
  })
  .catch((error) => {
    console.log('Failed to create Arrival table!', error);
  });

  // Departure table created.
  db.none('CREATE TABLE IF NOT EXISTS departures( \
            id               SERIAL PRIMARY KEY,  \
            flightDate       timestamp,                \
            flightNumber     varchar(20),         \
            airline          varchar(64),         \
            toDest           varchar(64),         \
            plannedDeparture varchar(20),         \
            realDeparture    varchar(20),         \
            flightStatus     varchar(20),         \
            delay            int,                 \
            onTimeOrEarly    boolean              \
  )')
  .then(() => {
    console.log('Departure table created!');
  })
  .catch((error) => {
    console.log('Failed to create Departure table!', error);
  });
}

// Inserts information about an arriving flight.
function insertArrivalFlight(flightData) {
  db.none('INSERT INTO arrivals(flightDate, flightNumber, fromDest, airline,\
                                plannedArrival, realArrival,                \
                                flightStatus, delay, onTimeOrEarly)         \
                      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                      [flightData.date, flightData.flightNumber,
                       flightData.from, flightData.airline,
                       flightData.plannedArrival, flightData.realArrival,
                       flightData.status, flightData.delay,
                       flightData.onTime])
  .then(() => {
    console.log('Successfully inserted data into Arrivals table!');
  })
  .catch((error) => {
    console.log('Could not insert into Arrivals !', error);
  });
}

// Inserts information about an departing flight.
function insertDepartureFlight(flightData) {
  db.none('INSERT INTO departures(flightDate, flightNumber, toDest, airline,    \
                                  plannedDeparture, realDeparture,              \
                                  flightStatus, delay, onTimeOrEarly)           \
                      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                      [flightData.date, flightData.flightNumber,
                       flightData.to, flightData.airline,
                       flightData.plannedArrival, flightData.realArrival,
                       flightData.status, flightData.delay,
                       flightData.onTime])
  .then(() => {
    console.log('Successfully inserted data into Departures table!');
  })
  .catch((error) => {
    console.log('Could not insert into Departures !', error);
  });
}

// Gets all the values from departure table and
// returns a promise
function getAllDepartures(callBack) {
  return db.any('SELECT * FROM departures', [true]);
}

// Gets all the values from arrivals table and returns
// a promise.
function getAllArrivals(callBack) {
  return db.any('SELECT * FROM arrivals', [true]);
}

function getAvgDepartureDelayAllAirlines() {
  return db.any('SELECT airline, ROUND(AVG(delay)) AS avgDelay FROM departures \
                 WHERE onTimeOrEarly = false GROUP BY airline', [true]);
}

function getAvgArrivalDelayAllAirlines() {
  return db.any('SELECT airline, ROUND(AVG(delay)) AS avgDelay FROM arrivals \
                 WHERE onTimeOrEarly = false GROUP BY airline', [true]);
}

function getAllAirlines() {
  return db.any('SELECT airline, FROM departures \
                 GROUP BY airline', [true]);
}

// Next two functions take the number of days you want to see back in time,
// returns the average delay for each airline from those days.
function getAvgArrivalDelayPastXDays(numDays){
  return db.any("SELECT airline, ROUND(AVG(delay)) AS avgDelay FROM arrivals \
                 WHERE onTimeOrEarly = false AND                             \
                 flightDate >= CURRENT_DATE - INTERVAL '$1 DAY'             \
                 GROUP BY airline", [numDays]);
}
function getAvgDepartureDelayPastXDays(numDays){
  return db.any("SELECT airline, ROUND(AVG(delay)) AS avgDelay FROM departures \
                 WHERE onTimeOrEarly = false AND                             \
                 flightDate >= CURRENT_DATE - INTERVAL '$1 DAY'             \
                 GROUP BY airline", [numDays]);
}

function getAvgDepartureDelayPastXDaysForAirline(numDays, airline){
  return db.any("SELECT flightDate, ROUND(AVG(delay)) AS avgDelay FROM departures \
                 WHERE onTimeOrEarly = false AND                             \
                 flightDate >= CURRENT_DATE - INTERVAL '$1 DAY' AND   \
                 airline = $2             \
                 GROUP BY flightDate", [numDays, airline]);
}
function getAvgArrivalDelayPastXDaysForAirline(numDays, airline){
  return db.any("SELECT flightDate, ROUND(AVG(delay)) AS avgDelay FROM arrivals \
                 WHERE onTimeOrEarly = false AND                             \
                 flightDate >= CURRENT_DATE - INTERVAL '$1 DAY' AND      \
                 airline = $2             \
                 GROUP BY  flightDate", [numDays, airline]);
}

function getAllArrivalsAirlineNamesPastXDays(days){
  return db.any("SELECT airline FROM arrivals WHERE   \
                 flightDate >= CURRENT_DATE - INTERVAL '$1 DAY' \
                 GROUP BY airline" , [days]);
}
function getAllDeparturesAirlineNamesPastXDays(days){
  return db.any("SELECT airline FROM departures WHERE   \
                 flightDate >= CURRENT_DATE - INTERVAL '$1 DAY' \
                 GROUP BY airline" , [days]);
}

function getRecentlySavedArriving(NumFlights){
  return db.any("SELECT flightNumber, flightDate FROM arrivals  \
                 WHERE id > (SELECT MAX(id) FROM arrivals)-$1" , [NumFlights]);
}

function getRecentlySavedDeparting(NumFlights){
  return db.any("SELECT flightNumber, flightDate FROM departures  \
                 WHERE id > (SELECT MAX(id) FROM departures)-$1" , [NumFlights]);
}

function test(){
  return db.any("SELECT flightDate from arrivals where    \
                flightDate >= CURRENT_DATE - INTERVAL '50 DAY'",[true]);
}

module.exports = {
  createTables,
  insertArrivalFlight,
  insertDepartureFlight,
  getAllArrivals,
  getAllDepartures,
  getAvgDepartureDelayAllAirlines,
  getAvgArrivalDelayAllAirlines,
  getAvgArrivalDelayPastXDays,
  test,
  getAvgDepartureDelayPastXDays,
  getAvgArrivalDelayPastXDaysForAirline,
  getAvgDepartureDelayPastXDaysForAirline,
  getAllArrivalsAirlineNamesPastXDays,
  getAllDeparturesAirlineNamesPastXDays,
  getRecentlySavedArriving,
  getRecentlySavedDeparting,
};
