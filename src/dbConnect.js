const pgp = require('pg-promise')();
const db = pgp('postgres://postgres:dadi@localhost:5432/FlightData');

//Create the tables!
function createTables(){
  // Arrival table created.
  db.none("CREATE TABLE IF NOT EXISTS arrivals( \
            id             SERIAL PRIMARY KEY,  \
            flightDate     varchar(20),         \
            flightNumber   varchar(20),         \
            fromDest       varchar(64),         \
            airline        varchar(64),         \
            plannedArrival varchar(20),         \
            realArrival    varchar(20),         \
            flightStatus   varchar(20)          \
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
            toDest           varchar(64),         \
            airline          varchar(64),         \
            plannedDeparture varchar(20),         \
            realDeparture    varchar(20),         \
            flightStatus     varchar(20)          \
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
                                plannedArrival, realArrival, flightStatus)  \
                      VALUES($1, $2, $3, $4, $5, $6, $7)",
                      [flightData[0], flightData[1],
                       flightData[2], flightData[3],
                       flightData[4], flightData[5],
                       flightData[6]])
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
                                  plannedDeparture, realDeparture, flightStatus)\
                      VALUES($1, $2, $3, $4, $5, $6, $7)",
                      [flightData[0], flightData[1],
                       flightData[2], flightData[3],
                       flightData[4], flightData[5],
                       flightData[6]])
  .then( () => {
    console.log("Successfully inserted data into Departures table!");
  })
  .catch( (error) => {
    console.log("Could not insert into Departures !", error)
  });
};

//Gets all the values from departure table and
//calls the callBack function with the results.
//The callBack function should take one parameter.
function getAllDepartures(callBack){
 var returnValue;
   db.any('SELECT * FROM departures', [true])
    .then( (data) => {
      callBack(data);
    })
    .catch( (error) => {
      callBack(data);
    });

}

//Gets all the values from arrivals table and
//calls the callBack function with the results.
//The callBack function should take one parameter.
function getAllArrivals(callBack){

   db.any('SELECT * FROM arrivals', [true])
    .then( (data) => {
      callBack(data);
    })
    .catch( (error) => {
      callBack(error);
    });
}

module.exports = {
    createTables,
    insertArrivalFlight,
    insertDepartureFlight,
    getAllArrivals,
    getAllDepartures,
  };
