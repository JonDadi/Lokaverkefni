document.addEventListener("DOMContentLoaded", function(event) {
  Charts.init();
});

let Charts = (function() {
  function init() {
    //Placeholder variable, to be replaced with input number.
    const days = 10;

    const ctx1 = document.getElementById("myDepChart");
    const ctx2 = document.getElementById("myArrChart");
    const ctx3 = document.getElementById("myDepXDaysChart");
    const ctx4 = document.getElementById("myArrDelPerDayAirlLine");
    const ctx5 = document.getElementById("myDepDelPerDayAirlLine");

    const arrivalAirlineSelector = document.getElementById("airlSelectArr");
    const departureAirlineSelector = document.getElementById("airlSelectDep");
    const arrivalNumDays = document.getElementById("arrNumDays");
    const departureNumDays = document.getElementById("depNumDays");

    let departureBtn = document.getElementById("departureBtn");
    let arrivalBtn = document.getElementById("arrivalsBtn");

    arrivalBtn.addEventListener("click", () => {
      const airline = arrivalAirlineSelector
                      .options[ arrivalAirlineSelector.selectedIndex ].value
      const numDays = arrivalNumDays.value;
      console.log(airline)

      $.ajax({
          'url': 'http://localhost:3000/json/getArrDelayXDaysBackAirline/'+airline+'/'+numDays,
          'type': 'GET',
          'contentType': 'application/json; charset=utf-8',
          'dataType': 'json',
          'success': function (data) {
            console.log(data);
            parseAndCreateLineChart(ctx4, data,
                "Average arrival delay for airline "+airline+" the last "+numDays+" days.");
          }
      });
    });
  departureBtn.addEventListener("click", () => {
    const airline = departureAirlineSelector
                    .options[ departureAirlineSelector.selectedIndex ].value
    const numDays = departureNumDays.value;
    $.ajax({
        'url': 'http://localhost:3000/json/getDepDelayXDaysBackAirline/'+airline+'/'+numDays,
        'type': 'GET',
        'contentType': 'application/json; charset=utf-8',
        'dataType': 'json',
        'success': function (data) {
          console.log(data);
          parseAndCreateLineChart(ctx5, data,
              "Average departure delay for airline "+airline+" the last "+numDays+" days.");
        }
    });
  });

    // Fill into the airline input selections
    $.ajax({
        'url': 'http://localhost:3000/json/getArrAirlines/'+days,
        'type': 'GET',
        'contentType': 'application/json; charset=utf-8',
        'dataType': 'json',
        'success': function (data) {
          fillArrivalAirlineSelectionInput(data);
        }
    });
    $.ajax({
        'url': 'http://localhost:3000/json/getDepAirlines/'+days,
        'type': 'GET',
        'contentType': 'application/json; charset=utf-8',
        'dataType': 'json',
        'success': function (data) {
          fillDepartureAirlineSelectionInput(data);
        }
    });

    $.ajax({
        'url': 'http://localhost:3000/json/avgDepDelay',
        'type': 'GET',
        'contentType': 'application/json; charset=utf-8',
        'dataType': 'json',
        'success': function (data) {
          parseAndCreateChart(ctx1, data, "Average departure delay for airline");
        }
    });

    $.ajax({
        'url': 'http://localhost:3000/json/avgArrDelay',
        'type': 'GET',
        'contentType': 'application/json; charset=utf-8',
        'dataType': 'json',
        'success': function (data) {
          parseAndCreateChart(ctx2, data, "Average arrival delay for airline");
        }
    });

    $.ajax({
        'url': 'http://localhost:3000/json/getArrDelayXDaysBack/'+days,
        'type': 'GET',
        'contentType': 'application/json; charset=utf-8',
        'dataType': 'json',
        'success': function (data) {
          parseAndCreateChart(ctx3, data, "Average arrival delay for airline last "+days+" days");
        }
    });









    function fillDepartureAirlineSelectionInput(airlines){
      let option;
      for(let i = 0; i<airlines.length; i++){
        option = document.createElement("option");
        option.value = airlines[i].airline;
        option.text = airlines[i].airline;
        departureAirlineSelector.appendChild(option);
      }
    }
    function fillArrivalAirlineSelectionInput(airlines){
      let option;
      for(let i = 0; i<airlines.length; i++){
        option = document.createElement("option");
        option.value = airlines[i].airline;
        option.text = airlines[i].airline;
        arrivalAirlineSelector.appendChild(option);
      }
    }

    function parseAndCreateChart(canvas, flights, title){
      let airline = [];
      let delay = [];
      for(let i = 0; i<flights.length; i++){
        airline.push(flights[i].airline);
        delay.push(flights[i].avgdelay);
      }
      createBarChart(canvas, airline, delay, title)
    }

    function getPrettyTimeStamp(timeStamp){
      const month = timeStamp.substring(5,7);
      const day = timeStamp.substring(8,10)
      return day+'/'+month;
    }
    function createBarChart(canvas, x, y, title){
      const myChart = new Chart(canvas, {
          type: 'bar',
          data: {
              labels: x,
              datasets: [{
                  label: title,
                  data: y,
                  backgroundColor: [
                      'rgba(255, 99, 132, 0.6)',
                      'rgba(54, 162, 235, 0.6)',
                      'rgba(255, 206, 86, 0.6)',
                      'rgba(75, 192, 192, 0.6)',
                      'rgba(153, 102, 255, 0.6)',
                      'rgba(255, 159, 64, 0.6)'
                  ],
                  borderColor: [
                      'rgba(255,99,132,1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      'rgba(153, 102, 255, 1)',
                      'rgba(255, 159, 64, 1)'
                  ],
                  borderWidth: 1
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero:true
                      }
                  }]
              }
          }
      });
    }

    function parseAndCreateLineChart(canvas, data, title){
      let days = [];
      let delay = [];
      for(let i = 0; i<data.length; i++){
        //Take the substring to remove the year and min/hour/seconds as it
        //is irrelevant.  We only want day and month.
        days.push(getPrettyTimeStamp(data[i].flightdate));
        console.log(typeof(data[i].flightdate))
        delay.push(data[i].avgdelay);
      }
      createLineChart(canvas, days, delay, title)
    }
    function createLineChart(canvas, x, y, label){
      var data = {
        labels: x,
        datasets: [ {
            label: label,
            fill: false,
            lineTension: 0.1,
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: "rgba(75,192,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: y,
            spanGaps: false,
          }
        ]
      };
      const myChart = Chart.Line(canvas, {
          data: data,
          options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero:true
                      }
                  }]
              }
          }
      });
    }
  }
  return {
    init: init
  };
})();
