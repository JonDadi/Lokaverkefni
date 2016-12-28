
const Charts = (() => {
  function init() {
    // Placeholder variable, to be replaced with input number.
    const days = 10;

    const ctx1 = document.getElementById('myDepChart');
    const ctx2 = document.getElementById('myArrChart');
    const ctx3 = document.getElementById('myDepOnTimeChart');
    const ctx6 = document.getElementById('myArrOnTimeChart');

    const arrivalAirlineSelector1 = document.getElementById('airlSelectArr1');
    const arrivalAirlineSelector2 = document.getElementById('airlSelectArr2');
    const departureAirlineSelector1 = document.getElementById('airlSelectDep1');
    const departureAirlineSelector2 = document.getElementById('airlSelectDep2');
    const arrivalNumDays = document.getElementById('arrNumDays');
    const departureNumDays = document.getElementById('depNumDays');

    const departureBtn = document.getElementById('departureBtn');
    const arrivalBtn = document.getElementById('arrivalsBtn');


    function fillDepartureAirlineSelectionInput(airlines) {
      let option, option2;
      for (let i = 0; i < airlines.length; i++) {
        option = document.createElement('option');
        option.value = airlines[i].airline;
        option.text = airlines[i].airline;
        option2 = document.createElement('option');
        option2.value = airlines[i].airline;
        option2.text = airlines[i].airline;
        departureAirlineSelector1.appendChild(option);
        departureAirlineSelector2.appendChild(option2);
      }
    }
    function fillArrivalAirlineSelectionInput(airlines) {
      let option, option2;
      for (let i = 0; i < airlines.length; i++) {
        option = document.createElement('option');
        option.value = airlines[i].airline;
        option.text = airlines[i].airline;
        option2 = document.createElement('option');
        option2.value = airlines[i].airline;
        option2.text = airlines[i].airline;
        arrivalAirlineSelector1.appendChild(option);
        arrivalAirlineSelector2.appendChild(option2);
      }
    }

    function getPrettyTimeStamp(timeStamp) {
      const month = timeStamp.substring(5, 7);
      const day = timeStamp.substring(8, 10);
      return `${day}/${month}`;
    }
    function createBarChart(canvas, x, y, z, title, labels) {
      let bgColor = 'rgba(255,50,50,1)';
      // Color bar differently for "Total flights"
      if (labels[0] === 'Total flights') {
        bgColor = 'rgba(255,165,0,1)';
      }

      const myChart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: x,
          datasets: [{
            label: labels[0],
            data: y,
            backgroundColor: bgColor,
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
            onComplete: function comp() {
              // render the value of the chart above the bar
              const ctx = this.chart.ctx;
              ctx.fillStyle = this.chart.config.options.defaultFontColor;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';
              this.data.datasets.forEach((dataset) => {
                for (let i = 0; i < dataset.data.length; i++) {
                  const model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
                  ctx.fillText(dataset.data[i], model.x, model.y - 5);
                }
              });
            },
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

    // x = flightDate
    // y = airline1 delays
    // z = airline2 delays
    function createLineChart(canvas, x, y, z, airlines, caption, comparison) {
      // Everytime a chart is created, a hidden iframe is added to the DOM.
      // Those iframes contain the info on the previous charts that were
      // rendered. We need to clear them so there won't be ghost instances
      // of them "behind" the data we're looking at.
      const iframeList = document.querySelectorAll('.chartjs-hidden-iframe');
      if (iframeList != null) {
        for (let i = 0; i < iframeList.length; i++) {
          iframeList[i].parentNode.removeChild(iframeList[i]);
        }
      }

      // In addition to the above, we need to completely remove the previous
      // canvas and create another one in its stead.
      const ctx = canvas.getContext('2d');
      const canvasId = ctx.canvas.id;
      const parent = ctx.canvas.parentNode;
      const newCanvas = document.createElement('canvas');
      newCanvas.setAttribute('id', canvasId);
      parent.removeChild(canvas);
      parent.appendChild(newCanvas);

      let data;
      if (comparison) {
        data = {
          labels: x,
          datasets: [{
            label: airlines[0],
            fill: false,
            lineTension: 0.1,
            backgroundColor: '#03b8ff',
            borderColor: '#03b8ff',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: '#03b8ff',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#03b8ff',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: y,
            spanGaps: true,
          },
          {
            label: airlines[1],
            fill: false,
            lineTension: 0.1,
            backgroundColor: '#2903ff',
            borderColor: '#2903ff',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: '#2903ff',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#2903ff',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: z,
            spanGaps: true,
          }],
        };
      } else {
        data = {
          labels: x,
          datasets: [{
            fill: false,
            lineTension: 0.1,
            backgroundColor: 'rgba(75,192,192,0.4)',
            borderColor: '#03b8ff',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: '#03b8ff',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#03b8ff',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: y,
            spanGaps: true,
          }],
        }
      }

      const myChart = Chart.Line(newCanvas, {
        data,
        options: {
          legend: {
            display: comparison,
          },
          title: {
            display: true,
            text: caption,
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

    function parseAndCreateLineChart(canvas, data, title, comparison) {
      const delayDays = [];
      const delay1 = [];
      const delay2 = [];
      let airlines = [];

      // For when we are comparing two airlines
      if (comparison) {
        for (let i = 0; i < data.length; i++) {
          // Take the substring to remove the year and min/hour/seconds as it
          // is irrelevant.  We only want day and month.
          delayDays.push(getPrettyTimeStamp(data[i].flightdate));
          delay1.push(data[i].avgdelay1);
          delay2.push(data[i].avgdelay2);
        }
        airlines = [data[0].airline1, data[0].airline2];
        createLineChart(canvas, delayDays, delay1, delay2, airlines, title, comparison);
      } else {
        for (let i = 0; i < data.length; i++) {
          // Take the substring to remove the year and min/hour/seconds as it
          // is irrelevant.  We only want day and month.
          delayDays.push(getPrettyTimeStamp(data[i].flightdate));
          delay1.push(data[i].avgdelay);
        }
        createLineChart(canvas, delayDays, delay1, delay2, airlines, title, comparison);
      }
    }

    arrivalBtn.addEventListener('click', () => {
      const airline1 = arrivalAirlineSelector1
                      .options[arrivalAirlineSelector1.selectedIndex].value;
      const airline2 = arrivalAirlineSelector2
                      .options[arrivalAirlineSelector2.selectedIndex].value;
      const numDays = arrivalNumDays.value;

      if (airline1 === airline2) {
        $.ajax({
          url: `http://localhost:3000/json/getArrDelayXDaysBackAirline/${airline1}/${numDays}`,
          type: 'GET',
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          success: (data) => {
            const ctx4 = document.getElementById('myArrDelPerDayAirline');
            parseAndCreateLineChart(ctx4, data,
              `Average arrival delay for airline ${airline1} the last ${numDays} days. (neg. num. means flights arriving ahead of scheduled time)`, false);
          },
        });
      } else {
        $.ajax({
          url: `http://localhost:3000/json/getArrDelayXDaysBackTwoAirlines/${airline1}/${airline2}/${numDays}`,
          type: 'GET',
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          success: (data) => {
            const ctx4 = document.getElementById('myArrDelPerDayAirline');
            parseAndCreateLineChart(ctx4, data,
              `Comparing arrival delay between ${airline1} and ${airline2} the last ${numDays} days. (neg. num. means flights arriving ahead of scheduled time)`, true);
          },
        });
      }
    });

    departureBtn.addEventListener('click', () => {
      const airline1 = departureAirlineSelector1
                      .options[departureAirlineSelector1.selectedIndex].value;
      const airline2 = departureAirlineSelector2
                      .options[departureAirlineSelector2.selectedIndex].value;
      const numDays = departureNumDays.value;

      if (airline1 === airline2) {
        $.ajax({
          url: `http://localhost:3000/json/getDepDelayXDaysBackAirline/${airline1}/${numDays}`,
          type: 'GET',
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          success: (data) => {
            const ctx5 = document.getElementById('myDepDelPerDayAirline');
            parseAndCreateLineChart(ctx5, data,
              `Avg. departure delay for airline ${airline1} the last ${numDays} days. (neg. num. means flights leaving ahead of scheduled time)`, false);
          },
        });
      } else {
        $.ajax({
          url: `http://localhost:3000/json/getDepDelayXDaysBackTwoAirlines/${airline1}/${airline2}/${numDays}`,
          type: 'GET',
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          success: (data) => {
            const ctx5 = document.getElementById('myDepDelPerDayAirline');
            parseAndCreateLineChart(ctx5, data,
              `Comparing departure delay between ${airline1} and ${airline2} the last ${numDays} days. (neg. num. means flights leaving ahead of scheduled time)`, true);
          },
        });
      }
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
        parseAndCreateChart(ctx1, data,
        'Average departure delay per airline for the past 7 days', true);
      },
    });

    $.ajax({
      url: 'http://localhost:3000/json/avgArrDelay',
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: (data) => {
        parseAndCreateChart(ctx2, data,
          'Average arrival delay per airline for the past 7 days', true);
      },
    });

    $.ajax({
      url: 'http://localhost:3000/json/getTotalFlightsAndTimelyDepartures/',
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: (data) => {
        parseAndCreateChart(ctx3, data,
        `Total flights per airline and the number of flights that departed on time or earlier (in the past 7 days)`, false);
      },
    });

    $.ajax({
      url: 'http://localhost:3000/json/getTotalFlightsAndTimelyArrivals/',
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: (data) => {
        parseAndCreateChart(ctx6, data,
        `Total flights per airline and the number of flights that arrived on time
        or earlier (in the past 7 days)`, false);
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
