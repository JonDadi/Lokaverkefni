
const Charts = (() => {
  function init() {
    // Placeholder variable, to be replaced with input number.
    const days = 10;

    const ctx1 = document.getElementById('myDepChart');
    const ctx2 = document.getElementById('myArrChart');
    const ctx3 = document.getElementById('myDepOnTimeChart');
    const ctx4 = document.getElementById('myArrDelPerDayAirlLine');
    const ctx5 = document.getElementById('myDepDelPerDayAirlLine');
    const ctx6 = document.getElementById('myArrOnTimeChart');

    const arrivalAirlineSelector = document.getElementById('airlSelectArr');
    const departureAirlineSelector = document.getElementById('airlSelectDep');
    const arrivalNumDays = document.getElementById('arrNumDays');
    const departureNumDays = document.getElementById('depNumDays');

    const departureBtn = document.getElementById('departureBtn');
    const arrivalBtn = document.getElementById('arrivalsBtn');


    function fillDepartureAirlineSelectionInput(airlines) {
      let option;
      for (let i = 0; i < airlines.length; i++) {
        option = document.createElement('option');
        option.value = airlines[i].airline;
        option.text = airlines[i].airline;
        departureAirlineSelector.appendChild(option);
      }
    }
    function fillArrivalAirlineSelectionInput(airlines) {
      let option;
      for (let i = 0; i < airlines.length; i++) {
        option = document.createElement('option');
        option.value = airlines[i].airline;
        option.text = airlines[i].airline;
        arrivalAirlineSelector.appendChild(option);
      }
    }


    function getPrettyTimeStamp(timeStamp) {
      const month = timeStamp.substring(5, 7);
      const day = timeStamp.substring(8, 10);
      return `${day}/${month}`;
    }
    function createBarChart(canvas, x, y, z, title, labels) {
      const myChart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: x,
          datasets: [{
            label: labels[0],
            data: y,
            backgroundColor: 'rgba(255,50,50,1)',
            borderWidth: 1,
          }, {
            label: labels[1],
            data: z,
            backgroundColor: 'rgba(50,50,255,1)',
            borderWidth: 1,
          }],
        },
        options: {
          hover: {
            animationDuration: 0,
          },
          animation: {
            duration: 0,
            onComplete: function () {
              // render the value of the chart above the bar
              const ctx = this.chart.ctx;
              ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, 'normal',
                Chart.defaults.global.defaultFontFamily);
              ctx.fillStyle = this.chart.config.options.defaultFontColor;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';
              this.data.datasets.forEach(function (dataset) {
                for (let i = 0; i < dataset.data.length; i++) {
                  const model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
                  ctx.fillText(dataset.data[i], model.x, model.y - 5);
                }
              });
            }
          },
          title: {
            display: true,
            text: title,
          },
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
              },
            }],
          },
        },
      });
    }


    function createLineChart(canvas, x, y, label) {
      const data = {
        labels: x,
        datasets: [{
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(75,192,192,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: y,
          spanGaps: false,
        },
        ],
      };
      const myChart = Chart.Line(canvas, {
        data,
        options: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: label,
          },
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
              },
            }],
          },
        },
      });
    }
    function parseAndCreateChart(canvas, flights, title, delayTrue) {
      const airline = [];
      const delay = [];
      const count = [];
      let labels = [];
      console.log(delayTrue);
      if (delayTrue) {

        for (let i = 0; i < flights.length; i++) {
          airline.push(flights[i].airline);
          delay.push(flights[i].avgdelay);
          count.push(flights[i].count);
        }
        labels = ['Delay in minutes', 'Nr of delayed flights'];
        createBarChart(canvas, airline, delay, count, title, labels);
      } else {
        const total = [];
        const timely = [];
        for (let i = 0; i < flights.length; i++) {
          airline.push(flights[i].airline);
          total.push(flights[i].total);
          timely.push(flights[i].timely);
        }
        labels = ['Total flights', 'Flights on time or early'];
        createBarChart(canvas, airline, total, timely, title, labels);
      }
    }

    function parseAndCreateLineChart(canvas, data, title) {
      const delayDays = [];
      const delay = [];
      for (let i = 0; i < data.length; i++) {
        // Take the substring to remove the year and min/hour/seconds as it
        // is irrelevant.  We only want day and month.
        delayDays.push(getPrettyTimeStamp(data[i].flightdate));
        delay.push(data[i].avgdelay);
      }
      createLineChart(canvas, delayDays, delay, title);
    }
    arrivalBtn.addEventListener('click', () => {
      const airline = arrivalAirlineSelector
                      .options[arrivalAirlineSelector.selectedIndex].value;
      const numDays = arrivalNumDays.value;

      $.ajax({
        url: `http://localhost:3000/json/getArrDelayXDaysBackAirline/${airline}/${numDays}`,
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: (data) => {
          parseAndCreateLineChart(ctx4, data,
            `Average arrival delay for airline ${airline} the last ${numDays} days.`);
        },
      });
    });
    departureBtn.addEventListener('click', () => {
      const airline = departureAirlineSelector
                      .options[departureAirlineSelector.selectedIndex].value;
      const numDays = departureNumDays.value;
      $.ajax({
        url: `http://localhost:3000/json/getDepDelayXDaysBackAirline/${airline}/${numDays}`,
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: (data) => {
          parseAndCreateLineChart(ctx5, data,
            `Average departure delay for airline ${airline} the last ${numDays} days.`);
        },
      });
    });

    // Fill into the airline input selections
    $.ajax({
      url: `http://localhost:3000/json/getArrAirlines/${days}`,
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: (data) => {
        fillArrivalAirlineSelectionInput(data);
      },
    });

    $.ajax({
      url: `http://localhost:3000/json/getDepAirlines/${days}`,
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: (data) => {
        fillDepartureAirlineSelectionInput(data);
      },
    });

    $.ajax({
      url: 'http://localhost:3000/json/avgDepDelay',
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: (data) => {
        parseAndCreateChart(ctx1, data, `Average departure delay per
                            airline for the past 7 days`, true);
      },
    });

    $.ajax({
      url: 'http://localhost:3000/json/avgArrDelay',
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: (data) => {
        parseAndCreateChart(ctx2, data, 'Average arrival delay per airline for the past 7 days', true);
      },
    });

    $.ajax({
      url: `http://localhost:3000/json/getTotalFlightsAndTimelyDepartures/`,
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: (data) => {
        parseAndCreateChart(ctx3, data, `Total flights per airline and the number
                            of flights on time or early`, false);
      },
    });

    $.ajax({
      url: `http://localhost:3000/json/getTotalFlightsAndTimelyArrivals/`,
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: (data) => {
        parseAndCreateChart(ctx6, data, `Total flights per airline and the number of flights that arrived on time or early`, false);
      },
    });
  }
  return {
    init,
  };
})();

document.addEventListener('DOMContentLoaded', (event) => {
  Charts.init();
});
