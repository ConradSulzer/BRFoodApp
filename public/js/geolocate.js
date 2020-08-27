var data = window.restList;
var userCoords;

var app = {
  setUserLoc: function() {
    findLoc.getUserLocation(function(coords) {
      userCoords = [coords.coords.latitude, coords.coords.longitude]
    });
  },

  dataPrep: function() {
    
  }
}

var findLoc = {
  testGeo: function() {
    if (navigator.geolocation) {
      return true
      }
    else {
      return false
    }
  },

  getUserLocation: function(callback) { 
    navigator.geolocation.getCurrentPosition( 
      function success(position) {
        callback(position); 
      }
    )
  },

  calcDistance: function(oLat, oLong, dLat, dLong, i) {
    var origin = new google.maps.LatLng(oLat, oLong);
    var dest = new google.maps.LatLng(dLat, dLong);
    var unitSystem = google.maps.UnitSystem.IMPERIAL
    var getDistance;

    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [dest],
        travelMode: 'DRIVING',
        unitSystem: unitSystem,
        avoidHighways: false,
        avoidTolls: false,
      }, 
      function (response, status) {
        array[i]['distance'] = response['rows'][0]['elements'][0]['distance']['text']
      }
    );
  },
}

// app.init();