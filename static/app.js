//      <----------------------------- Map ----------------------------->

let map, infoWindow, colorMarkerBike, colorMarkerStand;


// Map bounds and center point
const DublinCityBounds = {
    north: 53.418945,
    south: 53.224741,
    east: -5.935707,
    west: -6.589050,
};
const Dublin = { lat: 53.349804, lng: -6.260310 };


// Function to create map
function initMap(markerSelection) {
      
    // Set current time, nightTime and dayTime hours
    let currentTime = new Date();
    let hours = currentTime.getHours();

    // Set currentInfoWindow to null
    let currentInfoWindow = null;

    // Fetch station data
    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {

        // Create Map in night mode between 8pm and 6am
        if (hours >= 20 || hours <= 6 ) {

            map = new google.maps.Map(document.getElementById("map"), {
                center: Dublin,
                zoom: 14,
                restriction: {
                    latLngBounds: DublinCityBounds,
                    strictBounds: true,
                },
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                    {
                        featureType: "administrative.locality",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "poi",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "geometry",
                        stylers: [{ color: "#263c3f" }],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#6b9a76" }],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry",
                        stylers: [{ color: "#38414e" }],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry.stroke",
                        stylers: [{ color: "#212a37" }],
                    },
                    {
                        featureType: "road",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#9ca5b3" }],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry",
                        stylers: [{ color: "#746855" }],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry.stroke",
                        stylers: [{ color: "#1f2835" }],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#f3d19c" }],
                    },
                    {
                        featureType: "transit",
                        elementType: "geometry",
                        stylers: [{ color: "#2f3948" }],
                    },
                    {
                        featureType: "transit.station",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [{ color: "#17263c" }],
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#515c6d" }],
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.stroke",
                        stylers: [{ color: "#17263c" }],
                    },
                ],
            });

        }

        // Create Map in daytime anytime before 7pm
        else {

            map = new google.maps.Map(document.getElementById("map"), {
                center: Dublin,
                zoom: 14,
                restriction: {
                    latLngBounds: DublinCityBounds,
                    strictBounds: true,
                }
            });

        }

        // Load direction variables
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer();

        // Apply directions renderer
        directionsRenderer.setMap(map);

        // Apply direction function to direction selectors
        const onChangeHandler = function() {
            calculateAndDisplayRoute(directionsService, directionsRenderer);
        };
        document.getElementById("start").addEventListener("change", onChangeHandler);
        document.getElementById("end").addEventListener("change", onChangeHandler);

        // Create the DIV to hold the marker buttons and call markerSelector()
        const markerSelectorDiv = document.createElement("div");
        markerSelector(markerSelectorDiv, map, markerSelection);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(markerSelectorDiv);

        // Close currentInfoWindow on map click
        map.addListener("click", () => {
            if(currentInfoWindow !== null){
                currentInfoWindow.close();
            }
        });

        data.forEach(station => {
            
            // Create Marker
            const marker = new google.maps.Marker({
                position: {lat: station.position_lat, lng: station.position_long},
                map: map,
            });

            // Add event listener function to station marker
            marker.addListener("click", () => {
                
                // If open close currentInfoWindow
                if(currentInfoWindow !== null){
                    currentInfoWindow.close();
                }
                
                let banking = "Unavailable";
                if(station.banking === 1){banking = "Available"}
            
                // Create infoWindow for station marker
                let infoWindow = new google.maps.InfoWindow({
                    content:'<h3> ' + station.name + '</h3><b>Stands: </b>' + station.stands + '<br><b>Banking: </b>' + banking
                    + '<br><b>Available Bikes: </b>' + station.avail_bikes + '<br><b>Available Stands: </b>' + station.avail_stands
                });

                // Open infoWindow and assign to currentInfoWindow
                infoWindow.open(map, marker);
                currentInfoWindow = infoWindow;

                // Call getDetails
                getDetails(station.number);

            });

            // Add colour markers based on selection
            if (markerSelection === "bikes") {

                // Get percent available
                let percentBikesAvailable = station.avail_bikes / station.stands;

                // Create colour marker based on percent available
                switch (true) {

                    case percentBikesAvailable > 0.8 && percentBikesAvailable <= 1.0:
                        colorMarkerBike = new google.maps.Circle({
                            strokeColor: "#00D100",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#00D100",
                            fillOpacity: 0.35,
                            map: map,
                            center: new google.maps.LatLng(station.position_lat, station.position_long),
                            radius: 50,
                        });
                        break;

                    case percentBikesAvailable > 0.6 && percentBikesAvailable <= 0.8:
                        colorMarkerBike = new google.maps.Circle({
                            strokeColor: "#bfe84f",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#bfe84f",
                            fillOpacity: 0.35,
                            map: map,
                            center: new google.maps.LatLng(station.position_lat, station.position_long),
                            radius: 50,
                        });
                        break;

                    case percentBikesAvailable > 0.4 && percentBikesAvailable <= 0.6:
                        colorMarkerBike = new google.maps.Circle({
                            strokeColor: "#e6ed13",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#e6ed13",
                            fillOpacity: 0.35,
                            map: map,
                            center: new google.maps.LatLng(station.position_lat, station.position_long),
                            radius: 50,
                        });
                        break;

                    case percentBikesAvailable > 0.2 && percentBikesAvailable <= 0.4:
                        colorMarkerBike = new google.maps.Circle({
                            strokeColor: "#eda413",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#eda413",
                            fillOpacity: 0.35,
                            map: map,
                            center: new google.maps.LatLng(station.position_lat, station.position_long),
                            radius: 50,
                        });
                        break;

                    case percentBikesAvailable > 0.0 && percentBikesAvailable <= 0.2:
                        colorMarkerBike = new google.maps.Circle({
                            strokeColor: "#B20000",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#B20000",
                            fillOpacity: 0.35,
                            map: map,
                            center: new google.maps.LatLng(station.position_lat, station.position_long),
                            radius: 50,
                        });
                        break;

                }

            } else {

                // Get percent available
                let percentStandsAvailable = station.avail_stands / station.stands;

                // Create colour marker based on percent available
                switch (true) {

                    case percentStandsAvailable > 0.8 && percentStandsAvailable <= 1.0:
                        colorMarkerStand = new google.maps.Circle({
                            strokeColor: "#00D100",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#00D100",
                            fillOpacity: 0.35,
                            map: map,
                            center: new google.maps.LatLng(station.position_lat, station.position_long),
                            radius: 50,
                        });
                        break;

                    case percentStandsAvailable > 0.6 && percentStandsAvailable <= 0.8:
                        colorMarkerStand = new google.maps.Circle({
                            strokeColor: "#bfe84f",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#bfe84f",
                            fillOpacity: 0.35,
                            map: map,
                            center: new google.maps.LatLng(station.position_lat, station.position_long),
                            radius: 50,
                        });
                        break;

                    case percentStandsAvailable > 0.4 && percentStandsAvailable <= 0.6:
                        colorMarkerStand = new google.maps.Circle({
                            strokeColor: "#e6ed13",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#e6ed13",
                            fillOpacity: 0.35,
                            map: map,
                            center: new google.maps.LatLng(station.position_lat, station.position_long),
                            radius: 50,
                        });
                        break;

                    case percentStandsAvailable > 0.2 && percentStandsAvailable <= 0.4:
                        colorMarkerStand = new google.maps.Circle({
                            strokeColor: "#eda413",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#eda413",
                            fillOpacity: 0.35,
                            map: map,
                            center: new google.maps.LatLng(station.position_lat, station.position_long),
                            radius: 50,
                        });
                        break;

                    case percentStandsAvailable > 0.0 && percentStandsAvailable <= 0.2:
                        colorMarkerStand = new google.maps.Circle({
                            strokeColor: "#B20000",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#B20000",
                            fillOpacity: 0.35,
                            map: map,
                            center: new google.maps.LatLng(station.position_lat, station.position_long),
                            radius: 50,
                        });
                        break;

                }

            }

            // Add station options to direction selectors
            let directionOption = "<option value=\"" + station.position_lat +", " + station.position_long + "\">" + station.address + "</option>";
            document.getElementById("start").innerHTML += directionOption;
            document.getElementById("end").innerHTML += directionOption;

        });

        // Add Geolocation services
        infoWindow = new google.maps.InfoWindow();
        const locationButton = document.createElement("button");
        locationButton.textContent = "Pan to Current Location";
        locationButton.classList.add("custom-map-control-button");
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
        locationButton.addEventListener("click", () => {

            // Try HTML5 geolocation
            if (navigator.geolocation) {

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        infoWindow.setPosition(pos);
                        infoWindow.setContent("Location found.");
                        infoWindow.open(map);
                        map.setCenter(pos);
                    },
                    () => {
                        handleLocationError(true, infoWindow, map.getCenter());
                    }
                );

            } else {
                // Browser doesn't support Geolocation
                handleLocationError(false, infoWindow, map.getCenter());
            }

        });

    }).catch(err => {
        console.log("Oops!", err);
    })

    // Fetch last weather update and add to weatherInfo DIV
    fetch("/weather_info").then(response => {
        return response.json();
    }).then(data => {

        let weatherData = data[0];

        let weather = "";
        weather += "<h2>" + weatherData['description'] + "   " + weatherData['temp'] + "°</h2>";

        document.getElementById("weatherInfo").innerHTML = weather;

    }).catch(err => {
        console.log("Oops!", err);
    })
}


// markerSelector function to create buttons
function markerSelector(controlDiv, map, markerSelection){

    // Set CSS for the control border.
    const controlUI = document.createElement("div");
    controlUI.style.backgroundColor = "#fff";
    controlUI.style.border = "2px solid #fff";
    controlUI.style.borderRadius = "3px";
    controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlUI.style.cursor = "pointer";
    controlUI.style.marginTop = "8px";
    controlUI.style.marginLeft = "8px";
    controlUI.style.marginBottom = "22px";
    controlUI.style.textAlign = "center";
    controlUI.title = "Click to recenter the map";
    controlDiv.appendChild(controlUI);

    // Create bike colour markers button
    infoWindow = new google.maps.InfoWindow();
    const bikesButton = document.createElement("button");
    bikesButton.setAttribute("id", "bikesButton");
    bikesButton.textContent = "Bikes";
    bikesButton.classList.add("custom-map-control-button");
    bikesButton.addEventListener("click", () => {

      document.getElementById("map").innerHTML = "Loading map with bike colour markers..."
      initMap("bikes");

    });

    // Create stand colour markers button
    infoWindow = new google.maps.InfoWindow();
    const standsButton = document.createElement("button");
    standsButton.setAttribute("id", "standsButton");
    standsButton.textContent = "Stands";
    standsButton.classList.add("custom-map-control-button");
    standsButton.addEventListener("click", () => {

      document.getElementById("map").innerHTML = "Loading map with stand colour markers..."
      initMap("stands");

    });

    // Add styling for selected button
    if (markerSelection === "bikes") {
        bikesButton.style.backgroundColor= "black";
        bikesButton.style.color= "white";
    } else {
        standsButton.style.backgroundColor= "black";
        standsButton.style.color= "white";
    }

    // Add buttons
    controlUI.appendChild(bikesButton);
    controlUI.appendChild(standsButton);

}


// Call map function
initMap("bikes");


//      <----------------------------- Station-Details (aside) ----------------------------->


// Initialising function for drop down menu for stations
function dropDownStations() {

    // Fetch station data
    fetch("/stations").then(response => {
        return response.json();
    }).then(stationData => {

        let eachStation = "<select name='station' id='selection' onchange='getDetails(this.value)' class='select'>" +
                          "<option value=\"\" disabled selected>Select a Station</option>";
      
        // for loop to access stations json
        stationData.forEach(station => {

            // Put station number to option value and listing station address
            eachStation += "<option value=" + station.number + ">" + station.address + "</option>";

        })

        document.getElementById('stationSelect').innerHTML = eachStation;

    }).catch(err => {
        console.log("Oops!", err);
    })

}


// Call dropDownStations function
dropDownStations();


// Details function to display functions when dropdown station/marker is clicked
function getDetails(stationNum){

    // Storing stationNum into localStorage
    localStorage.setItem("stationNumber", stationNum);

    // Empty divs and print loading message
    document.getElementById('stationDetails').innerHTML = "Loading details...";
    document.getElementById('hourly_chart').innerHTML = "";
    document.getElementById('daily_chart').innerHTML = "";
    document.getElementById('prediction_input').innerHTML = "";

    // Call all details functions
    showStation(stationNum)
    hourlyAvailabilityChart(stationNum)
    dailyAvailabilityChart(stationNum)

    // Generate prediction input form
    createPredictionForm(stationNum);

}


// Displays the chosen station and displays dynamic data
function showStation(stationNum) {

    // Generate URL and fetch request from availability table
    let url = "/chosen_station/" + stationNum;
    fetch(url).then(response => {
        return response.json();
    }).then(responseData => {

        // Extract station info -> first (only) item in the response list
        let stationInfo = responseData[0];

        // Create station info table
        let update = new Date(stationInfo.lastUpdate);
        let stationTable =
            "<table id='stationTable'>" + "<tr>" +
            "<th>Address</th>" +
            "<th>Status</th>" +
            "<th>Bikes</th>" +
            "<th>Stands</th>" +
            "<th>Last Updated</th>" + "</tr>" + "<tr>" +
            "<td>" + stationInfo.address + "</td>" +
            "<td>" + stationInfo.status + "</td>" +
            "<td>" + stationInfo.avail_bikes + "</td>" +
            "<td>" + stationInfo.avail_stands + "</td>" +
            "<td>" + update.toLocaleString() + "</td>" +
            "</tr>" + "</table>";

        document.getElementById('stationDetails').innerHTML = stationTable;

    }).catch(err => {
        console.log("Oops!", err);
    })

}


// Create Hourly Availability Chart Function
function hourlyAvailabilityChart(stationNum) {

    // Chart styling options
    let chartTitle = 'Average Hourly Availability';
    let options = {

        // Title of chart
        title: chartTitle,
        legend: 'top',
        focusTarget: 'category',
        colors: ['#00D9C0', '#EF233C'],
        hAxis: {
            title: 'Hour',
            format: '0.00',
            viewWindow: {
                min: [6, 30, 0],
                max: [20, 30, 0]
            },
            textStyle: {
                fontSize: 14,
                color: '#000',
                bold: true,
                italic: false
            },
            titleTextStyle: {
                fontSize: 14,
                color: '#000',
                bold: true,
                italic: false
            }
        },
        vAxis: {
            title: 'Available',
            viewWindow: {
                min: [0]
            },
            format: '0',
            textStyle: {
                fontSize: 14,
                color: '#000',
                bold: false,
                italic: false
            },
            titleTextStyle: {
                fontSize: 14,
                color: '#000',
                bold: true,
                italic: false
            }
        }

    };

    // Generate URL and fetch data
    let url = "/hourlyAvailability/" + stationNum
    fetch(url).then(response => {
        return response.json();
    }).then(data => {

        // Create chart
        let chart_data = new google.visualization.DataTable();
        chart_data.addColumn('number', 'Hour');
        chart_data.addColumn('number', 'Bikes');
        chart_data.addColumn('number', 'Stands');
        data.forEach(row => {
            chart_data.addRow([ row.hour, row.avg_bikes, row.avg_stands ]);
        });

        let chart = new google.visualization.ColumnChart(document.getElementById('hourly_chart'));
        chart.draw(chart_data, options)

    });

}


// Create Daily Availability Chart Function
function dailyAvailabilityChart(stationNum) {

    // Chart styling options
    let chartTitle = 'Average Daily Availability';
    let options = {

        // Title of chart
        title: chartTitle,
        legend: 'top',
        focusTarget: 'category',
        colors: ['#00D9C0', '#EF233C'],
        hAxis: {
            textStyle: {
                fontSize: 8,
                color: '#000',
                bold: true,
                italic: false,
            },
        },
        vAxis: {
            title: 'Available',
            viewWindow: {
                min: [0]
            },
            format: '0',
            textStyle: {
                fontSize: 14,
                color: '#000',
                bold: false,
                italic: false
            },
            titleTextStyle: {
                fontSize: 14,
                color: '#000',
                bold: true,
                italic: false
            }
        }

    };

    // Generate URL and fetch data
    let url = "/dailyAvailability/" + stationNum
    fetch(url).then(response => {
        return response.json();
    }).then(data => {

        // Create chart
        let chart_data = new google.visualization.DataTable();
        chart_data.addColumn('string', 'Day');
        chart_data.addColumn('number', 'Bikes');
        chart_data.addColumn('number', 'Stands');
        data.forEach(row => {
            chart_data.addRow([row.day, row.avg_bikes, row.avg_stands]);
        });

        let chart = new google.visualization.LineChart(document.getElementById('daily_chart'));
        chart.draw(chart_data, options)

    });

}


// Create form for predicted availability input
function createPredictionForm(stationNum){

    let form_div = document.getElementById("prediction_input");

    // Create form elements
    let heading = document.createElement("h2");
    heading.innerHTML = "Select a date for predicted availability:";

    let form = document.createElement("form");

    form.setAttribute("target", "output");
    form.setAttribute("action", "/predictionInput/" + stationNum);
    form.setAttribute("method", "POST");
    
    // Create date range for form calendar
    let today = new Date();
    let day = 864e5;
    let future = new Date(+today + day * 29);

    today = today.toISOString().slice(0, 10)
    future = future.toISOString().slice(0, 10)

    let dt_input = document.createElement("input");

    dt_input.setAttribute("type", "date");
    dt_input.setAttribute("min", today);
    dt_input.setAttribute("max", future);
    dt_input.setAttribute("id", "predict_dt");
    dt_input.setAttribute("name", "predict_dt");
    
    let submit = document.createElement("input");
    submit.setAttribute("type", "submit");
    submit.setAttribute("id", "prediction_btn");
    submit.setAttribute("value", "Go!");
    submit.setAttribute('onclick', 'showPrediction()');

    // Append elements to form and form to document
    form.appendChild(dt_input);
    form.appendChild(submit);
    form_div.appendChild(heading);
    form_div.appendChild(form);
 
}


// Show hidden prediction output div
function showPrediction() {

    let x = document.getElementById("prediction_output");
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "block";
    }

}


// Loads localStorage and loads the saved station info last selected, including charts availability.
window.onload = function() {

    // Check Storage is not empty
    if (localStorage.getItem("stationNumber") == null) {

        document.getElementById('stationDetails').innerHTML = "Select a station to see details";

    }
  
    // Calls getDetails() function if localStorage is not empty
    else {

        // Retrieve item
        let stationNum = localStorage.getItem("stationNumber");
        // call getDetails()
        getDetails(stationNum);

    }

}


// Directions calculator function
function calculateAndDisplayRoute(directionsService, directionsRenderer) {

    directionsService.route(

        {
            origin: {query: document.getElementById("start").value,},
            destination: {query: document.getElementById("end").value,},
            travelMode: google.maps.TravelMode.BICYCLING,
        },

        (response, status) => {
            if(status === "OK") {
                directionsRenderer.setDirections(response);
            } else {
                window.alert("Directions request failed due to " + status);
            }
        }

    );

}
