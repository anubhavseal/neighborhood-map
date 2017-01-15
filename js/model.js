        var map;
        var marker;
        var infoWindow;
        var streetView;


        var locations = [{
                title: 'Howrah Bridge',
                location: {
                    lat: 22.5851477,
                    lng: 88.34680530000001
                }
            },
            {
                title: 'Bhawanipore',
                location: {
                    lat: 22.5332356,
                    lng: 88.3459362
                }
            },
            {
                title: 'Gariahat',
                location: {
                    lat: 22.5160356,
                    lng: 88.3664876
                }
            },
            {
                title: 'Ultadanga',
                location: {
                    lat: 22.594817,
                    lng: 88.38685940000001
                }
            },
            {
                title: 'Esplanade',
                location: {
                    lat: 22.5609409,
                    lng: 88.35406160000001
                }
            },
            {
                title: 'Shyam Bazar',
                location: {
                    lat: 22.5982031,
                    lng: 88.36868659999999
                }
            }
        ];

        var contentString = '<ul class="list-group" data-bind="foreach:restaurantList" id="restaurantList">'+
                    '<a data-bind="attr:{href:url}" target="_blank"><li class="list-group-item" data-bind="text:name"></li></a>'+
                '</ul>'


        var Location = function(location) {
            var self = this;
            this.title = ko.observable(location.title);
            this.latitude = ko.observable(location.location.lat);
            this.longitude = ko.observable(location.location.lng);
            this.marker = new google.maps.Marker({
                position: {
                    lat: this.latitude(),
                    lng: this.longitude()
                },
                map: map,
                animation: google.maps.Animation.DROP
            });
            this.infoWindow = new google.maps.InfoWindow();
            this.marker.addListener('click', function() {
                self.marker.setAnimation(google.maps.Animation.DROP);
                self.infoWindow.open(map, self.marker);
                self.infoWindow.setContent(location.title);
            });
        };

        var restaurant = function() {
            var name;
            var url;
            this.setName = function(name) {
                this.name = name;
            };
            this.setUrl = function(url) {
                this.url = url;
            };
        };

        var stringStartsWith = function(string, startsWith) {
            string = string || "";
            if (startsWith.length > string.length)
                return false;
            return string.substring(0, startsWith.length) === startsWith;
        };

        var ViewModel = function() {

            var self = this;
            this.locationList = ko.observableArray([]);
            this.restaurantList = ko.observableArray([]);

            locations.forEach(function(location) {
                self.locationList.push(new Location(location));
            });

            this.filter = ko.observable("");
            this.filteredItems = ko.computed(function() {
                var filter = this.filter().toLowerCase();
                if (!filter) {
                    for (var i = 0; i < self.locationList().length; i++)
                        self.locationList()[i].marker.setVisible(true);
                    return this.locationList();
                } else {
                    for (var i = 0; i < self.locationList().length; i++)
                        self.locationList()[i].marker.setVisible(false);
                    return ko.utils.arrayFilter(this.locationList(), function(item) {
                        var result = stringStartsWith(item.title().toLowerCase(), filter);
                        if (result) {
                            item.marker.setVisible(true);
                            map.setCenter({
                                lat: item.latitude(),
                                lng: item.longitude()
                            })
                            item.marker.setAnimation(google.maps.Animation.DROP);
                        }
                        return result;
                    });
                }
            }, this);



            this.generateMarker = function(clickedLocation) {
                for (var i = 0; i < self.locationList().length; i++) {
                    self.locationList()[i].marker.setVisible(false);
                    self.locationList()[i].infoWindow.close();
                }
                clickedLocation.marker.setVisible(true);
                clickedLocation.marker.setAnimation(google.maps.Animation.DROP);
                position = {
                    lat: clickedLocation.latitude(),
                    lng: clickedLocation.longitude()
                }
                map.setCenter(position);
                clickedLocation.infoWindow.open(map, clickedLocation.marker);
                //self.generateStreetView(clickedLocation);
                clickedLocation.marker.addListener('click', function() {
                    clickedLocation.infoWindow.open(map, clickedLocation.marker);
                    //self.generateStreetView(clickedLocation);
                    self.getNearByRestaurants(clickedLocation);
                });

            };

            this.generateStreetView = function(clickedLocation) {
                streetView = new google.maps.StreetViewService();
                var radius = 50;

                function getStreetView(data, status) {
                    if (status == google.maps.StreetViewStatus.OK) {
                        var nearStreetViewLocation = data.location.latLng;
                        var heading = google.maps.geometry.spherical.computeHeading(
                            nearStreetViewLocation, clickedLocation.marker.position);
                        clickedLocation.infoWindow.setContent('<div id="pano"></div>');
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
                        clickedLocation.infoWindow.setContent('<div>No Street View Found</div>');
                    }
                }
                streetView.getPanoramaByLocation(clickedLocation.marker.position, radius, getStreetView);
            };

            this.getNearByRestaurants = function(clickedLocation) {
                self.restaurantList.removeAll();
                $.ajax({
                    "url": "https://developers.zomato.com/api/v2.1/geocode",
                    "headers": {
                        "user-key": "603656ae0c5a28376df662d4962699e8"
                    },
                    "dataType": "json",
                    "data": {
                        "lat": clickedLocation.latitude(),
                        "lon": clickedLocation.longitude()
                    },
                    "success": function(response) {
                        response.nearby_restaurants.forEach(function(index) {
                            var resto = new restaurant();
                            resto.setName(index.restaurant.name);
                            resto.setUrl(index.restaurant.url);
                            self.restaurantList.push(resto);
                            clickedLocation.infoWindow.setContent('<p>' + index.restaurant.name + '</p>');
                            //clickedLocation.infoWindow.setContent(contentString);
                            clickedLocation.infoWindow.open(map, clickedLocation.marker);
                        });
                    }
                }).error(function(e){
                    $('#restaurantList').text("Sorry Cannot Find Right Now");
                });
            };
        };

        ko.applyBindings(new ViewModel());


