const pgp = require('pg-promise')();

const env = process.env.DATABASE_URL;
const db = pgp(env || 'postgres://postgres:dadi@localhost:5432/FlightData');

// Create the tables!
function createTables() {
  // Arrival table created.
  db.none(`CREATE TABLE IF NOT EXISTS arrivals(
            id             SERIAL PRIMARY KEY,
            flightDate     timestamp,
            flightNumber   varchar(20),
            airline        varchar(64),
            fromDest       varchar(64),
            plannedArrival varchar(20),
            realArrival    varchar(20),
            flightStatus   varchar(20),
            delay          int,
            onTimeOrEarly  boolean
  )`)
  .then(() => {
  })
  .catch((error) => {
  });

  // Departure table created.
  db.none(`CREATE TABLE IF NOT EXISTS departures(
            id               SERIAL PRIMARY KEY,
            flightDate       timestamp,
            flightNumber     varchar(20),
            airline          varchar(64),
            toDest           varchar(64),
            plannedDeparture varchar(20),
            realDeparture    varchar(20),
            flightStatus     varchar(20),
            delay            int,
            onTimeOrEarly    boolean
  )`)
  .then(() => {
  })
  .catch((error) => {
  });
}

// Inserts information about an arriving flight.
function insertArrivalFlight(flightData) {
  db.none(`INSERT INTO arrivals(flightDate, flightNumber, fromDest, airline,
              plannedArrival, realArrival,
              flightStatus, delay, onTimeOrEarly)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [flightData.flightdate, flightData.flightNumber,
      flightData.from, flightData.airline,
      flightData.plannedArrival, flightData.realArrival,
      flightData.status, flightData.delay,
      flightData.onTime])
  .then(() => {
    console.log("Inserted into arrivals");
  })
  .catch((error) => {
  });
}

// Inserts information about an departing flight.
function insertDepartureFlight(flightData) {
  db.none(`INSERT INTO departures(flightDate, flightNumber, toDest, airline,
                plannedDeparture, realDeparture,
                flightStatus, delay, onTimeOrEarly)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [flightData.flightdate, flightData.flightNumber,
      flightData.to, flightData.airline,
      flightData.plannedArrival, flightData.realArrival,
      flightData.status, flightData.delay,
      flightData.onTime])
  .then(() => {
    console.log("Inserted into departures");
  })
  .catch((error) => {
  });
}

// Gets all the values from departure table and
// returns a promise
function getAllDepartures() {
  return db.any('SELECT * FROM departures', [true]);
}

// Gets all the values from arrivals table and returns
// a promise.
function getAllArrivals() {
  return db.any('SELECT * FROM arrivals', [true]);
}

function getAvgDepartureDelayAllAirlines() {
  return db.any(`SELECT airline, ROUND(AVG(delay)) AS avgDelay,
                 COUNT(onTimeOrEarly) FROM departures
                 WHERE onTimeOrEarly = false GROUP BY airline`, [true]);
}

function getAvgArrivalDelayAllAirlines() {
  return db.any(`SELECT airline, ROUND(AVG(delay)) AS avgDelay,
                 COUNT(onTimeOrEarly) FROM arrivals
                 WHERE onTimeOrEarly = false GROUP BY airline`, [true]);
}

// Next two functions take the number of days you want to see back in time,
// returns the average delay for each airline from those days.
function getAvgArrivalDelayPastXDays(numDays) {
  return db.any(`SELECT airline, ROUND(AVG(delay)) AS avgDelay,
                 COUNT(onTimeOrEarly) FROM arrivals
                 WHERE onTimeOrEarly = false AND
                 flightDate >= CURRENT_DATE - INTERVAL '$1 DAY'
                 GROUP BY airline`, [numDays]);
}
function getAvgDepartureDelayPastXDays(numDays) {
  return db.any(`SELECT airline, ROUND(AVG(delay)) AS avgDelay,
                 COUNT(onTimeOrEarly) FROM departures
                 WHERE onTimeOrEarly = false AND
                 flightDate >= CURRENT_DATE - INTERVAL '$1 DAY'
                 GROUP BY airline`, [numDays]);
}

function getAvgDepartureDelayPastXDaysForAirline(numDays, airline) {
  return db.any(`SELECT flightDate, ROUND(AVG(delay)) AS avgDelay
                 FROM departures
                 WHERE onTimeOrEarly = false AND
                 flightDate >= CURRENT_DATE - INTERVAL '$1 DAY' AND
                 airline = $2
                 GROUP BY flightDate`, [numDays, airline]);
}
function getAvgArrivalDelayPastXDaysForAirline(numDays, airline) {
  return db.any(`SELECT flightDate, ROUND(AVG(delay)) AS avgDelay FROM arrivals
                 WHERE onTimeOrEarly = false AND
                 flightDate >= CURRENT_DATE - INTERVAL '$1 DAY' AND
                 airline = $2
                 GROUP BY  flightDate`, [numDays, airline]);
}

function getAllArrivalsAirlineNamesPastXDays(days) {
  return db.any(`SELECT airline FROM arrivals WHERE
                 flightDate >= CURRENT_DATE - INTERVAL '$1 DAY'
                 GROUP BY airline`, [days]);
}
function getAllDeparturesAirlineNamesPastXDays(days) {
  return db.any(`SELECT airline FROM departures WHERE
                 flightDate >= CURRENT_DATE - INTERVAL '$1 DAY'
                 GROUP BY airline`, [days]);
}

function getRecentlySavedArriving(NumFlights) {
  return db.any(`SELECT flightNumber, flightDate FROM arrivals
                 WHERE id > (SELECT MAX(id) FROM arrivals)-$1`, [NumFlights]);
}

function getRecentlySavedDeparting(NumFlights) {
  return db.any(`SELECT flightNumber, flightDate FROM departures
                 WHERE id > (SELECT MAX(id) FROM departures)-$1`, [NumFlights]);
}

// returns columns: airline - total - timely
function getTotalFlightsAndTimelyDepartures() {
  return db.any(`with tot as ( SELECT airline, COUNT(onTimeOrEarly) as Total
                 FROM departures
                 GROUP BY airline )
                 SELECT tot.airline, total, timely
                 FROM tot JOIN (SELECT airline, COUNT(onTimeOrEarly) as Timely
                 FROM departures
                 WHERE onTimeOrEarly = true
                 GROUP BY airline) AS d
                 ON tot.airline = d.airline`, [true]);
}

function getTotalFlightsAndTimelyArrivals() {
  return db.any(`with tot as ( SELECT airline, COUNT(onTimeOrEarly) as Total
                           FROM arrivals
                           GROUP BY airline
                          )
                 SELECT tot.airline, total, timely
                 FROM tot JOIN (SELECT airline, COUNT(onTimeOrEarly) as Timely
                            FROM arrivals
                            WHERE onTimeOrEarly = true
                            GROUP BY airline
                            ) AS d
                 ON tot.airline = d.airline`, [true]);
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
  getAvgDepartureDelayPastXDays,
  getAvgArrivalDelayPastXDaysForAirline,
  getAvgDepartureDelayPastXDaysForAirline,
  getAllArrivalsAirlineNamesPastXDays,
  getAllDeparturesAirlineNamesPastXDays,
  getRecentlySavedArriving,
  getRecentlySavedDeparting,
  getTotalFlightsAndTimelyDepartures,
  getTotalFlightsAndTimelyArrivals,
};
