 var locations = [
          {
            title: 'Park Ave Penthouse',
            location: {lat: 40.7713024, lng: -73.9632393}
          },
          {
            title: 'Chelsea Loft',
            location: {lat: 40.7444883, lng: -73.9949465}
          },
          {
            title: 'Union Square Open Floor Plan',
            location: {lat: 40.7347062, lng: -73.9895759}
          },
          {
            title: 'East Village Hip Studio',
            location: {lat: 40.7281777, lng: -73.984377}
          },
          {
            title: 'TriBeCa Artsy Bachelor Pad',
            location: {lat: 40.7195264, lng: -74.0089934}
          },
          {
            title: 'Chinatown Homey Space',
            location: {lat: 40.7180628, lng: -73.9961237}
          }
        ];


var Location = function(location) {

    this.title = ko.observable(location.title);
    this.latitude = ko.observable(location.location.lat);
    this.longitude = ko.observable(location.location.lng);
};

var ViewModel = function() {

    var self = this;
    this.locationList = ko.observableArray([]);
    this.currentLocation = ko.observable(locations[0]);

    locations.forEach(function(location) {
        self.locationList.push(new Location(location));
    });


    this.generateMarker = function(clickedLocation) {
        position = {
            lat: clickedLocation.latitude(),
            lng: clickedLocation.longitude()
        };
        marker = new google.maps.Marker({
            position: position,
            map: map,
            animation: google.maps.Animation.DROP,
        });
        map.setCenter(position);
        marker.addListener('click', function() {
            self.generateInfoWindow(marker);
            self.generateStreetViewService(marker);
        });
    };

    this.generateInfoWindow = function(marker) {
        if (typeof(infoWindow) === 'undefined') {
            console.log(5);
            infoWindow = new google.maps.InfoWindow({
                caption: 'hello there!!!'
            });
        }
        infoWindow.open(map,marker);
    };

    this.generateStreetViewService = function(marker) {
        if (typeof(streetViewService) === 'undefined') {
            streetViewServie = new google.maps.StreetViewService();
            var radius = 50;

            function getStreetView(data, status) {
                if (status == google.maps.StreetViewStatus.OK) {
                    var nearStreetViewLocation = data.location.latLng;
                    var heading = google.maps.geometry.spherical.computeHeading(
                        nearStreetViewLocation, marker.position);
                    infoWindow.setContent('<div id="pano"></div>');
                    var panoramaOptions = {
                        position: nearStreetViewLocation,
                        pov: {
                            heading: heading,
                            pitch: 30
                        }
                    };
                    var panorama = new google.maps.StreetViewPanorama(
                        document.getElementById('pano'), panoramaOptions);
                } else {
                    infoWindow.setContent('<div>' + marker.title + '</div>' +
                        '<div>No Street View Found</div>');
                }
            }
            streetViewServie.getPanoramaByLocation(marker.position, radius, getStreetView);
            infoWindow.open(map, marker);
        }
    };

};

ko.applyBindings(new ViewModel());
