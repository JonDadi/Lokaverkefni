document.addEventListener("DOMContentLoaded", function(event) {
  Flights.init();
});

let Flights = (function() {



  function init() {
    let flights = document.getElementsByClassName('flights');

    console.log(flights);

    for (var i = 0; i < flights.length; i++) {
      flights[i].addEventListener('click', createIFrame, false);
    }
  }

  function createIFrame(e){
    e.preventDefault();

    let callSign = e.target.parentElement.getAttribute("name");

    let link = "https://www.flightradar24.com/"+callSign;

    let iframeDiv = document.getElementById("iframe");

    let iframeExists = document.querySelector('.iframeExists')
    console.log(iframeExists);
    if(iframeExists != null) iframeDiv.removeChild(iframeDiv.childNodes[0]);

    let iframe = document.createElement('iframe');
  //  iframe.frameBorder=0;
    iframe.width="600px";
    iframe.height="600px";
    iframe.setAttribute("class", "iframeExists");
    iframe.setAttribute("src", link);


    console.log(iframeDiv);
    iframeDiv.appendChild(iframe);
  }

  return {
    init: init
  };

})();
