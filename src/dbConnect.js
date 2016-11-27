const pgp = require('pg-promise')();
const db = pgp('postgres://postgres:dadi@localhost:5432/FlightData');

//Create the tables!
function createTables(){
  // Arrival table created.
  db.none("CREATE TABLE IF NOT EXISTS arrivals( \
            id             SERIAL PRIMARY KEY,  \
            flightDate     varchar(20),         \
            flightNumber   varchar(20),         \
            airline        varchar(64),         \
            fromDest       varchar(64),         \
            plannedArrival varchar(20),         \
            realArrival    varchar(20),         \
            flightStatus   varchar(20),         \
            delay          varChar(5)           \
  )")
  .then( () => {
    console.log("Arrival table created!");
  })
  .catch( (error) => {
    console.log("Failed to create Arrival table!", error)
  })

  //Departure table created.
  db.none("CREATE TABLE IF NOT EXISTS departures( \
            id               SERIAL PRIMARY KEY,  \
            flightDate       varchar(20),         \
            flightNumber     varchar(20),         \
            airline          varchar(64),         \
            toDest           varchar(64),         \
            plannedDeparture varchar(20),         \
            realDeparture    varchar(20),         \
            flightStatus     varchar(20),         \
            delay            varChar(5)           \
  )")
  .then( () => {
    console.log("Departure table created!");
  })
  .catch( (error) => {
    console.log("Failed to create Departure table!", error)
  });
}

// Inserts information about an arriving flight.
function insertArrivalFlight(flightData){
  db.none("INSERT INTO arrivals(flightDate, flightNumber, fromDest, airline,\
                                plannedArrival, realArrival,                \
                                flightStatus, delay)                        \
                      VALUES($1, $2, $3, $4, $5, $6, $7, $8)",
                      [flightData.date, flightData.flightNumber,
                       flightData.airline, flightData.from,
                       flightData.plannedArrival, flightData.realArrival,
                       flightData.status, flightData.delay])
  .then( () => {
    console.log("Successfully inserted data into Arrivals table!");
  })
  .catch( (error) => {
    console.log("Could not insert into Arrivals !", error)
  });
};

// Inserts information about an departing flight.
function insertDepartureFlight(flightData){
  db.none("INSERT INTO departures(flightDate, flightNumber, toDest, airline,    \
                                  plannedDeparture, realDeparture,              \
                                  flightStatus, delay)                          \
                      VALUES($1, $2, $3, $4, $5, $6, $7, $8)",
                      [flightData.date, flightData.flightNumber,
                       flightData.airline, flightData.to,
                       flightData.plannedArrival, flightData.realArrival,
                       flightData.status, flightData.delay])
  .then( () => {
    console.log("Successfully inserted data into Departures table!");
  })
  .catch( (error) => {
    console.log("Could not insert into Departures !", error)
  });
};

// Gets all the values from departure table and
// returns a promise
function getAllDepartures(callBack){
  return db.any('SELECT * FROM departures', [true]);
}

// Gets all the values from arrivals table and returns
// a promise.
function getAllArrivals(callBack){
  return db.any('SELECT * FROM arrivals', [true]);
}

module.exports = {
    createTables,
    insertArrivalFlight,
    insertDepartureFlight,
    getAllArrivals,
    getAllDepartures,
  };