const ctx = document.getElementById("myChart");

$.ajax({
    'url': 'http://localhost:3000/json',
    'type': 'GET',
    'contentType': 'application/json; charset=utf-8',
    'dateType': 'json',
    'success': function (data) {
      console.log(data);
        parseAndCreateChart(data);
    }
});



function parseAndCreateChart(flights){
  let airline = [];
  let delay = [];
  for(let i = 0; i<flights.length; i++){
    airline.push(flights[i].airline);
    delay.push(flights[i].avgdelay);
  }

  createBarChart(airline, delay);
}



function createBarChart(x, y){
  const myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: x,
          datasets: [{
              label: 'Total average departure delay for airline',
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
