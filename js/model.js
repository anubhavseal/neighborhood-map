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


var Location=function (location){

    this.title=ko.observable(location.title);
    this.latitude=ko.observable(location.location.lat);
    this.longitude=ko.observable(location.location.lng);
}

var ViewModel=function(){

    var self=this;
    this.locationList = ko.observableArray([]);
    this.currentLocation = ko.observable(locations[0]);

    locations.forEach(function(location){
        self.locationList.push(new Location(location));
    });


    this.generateMarker = function(clickedLocation){
      position = {lat:clickedLocation.latitude(), lng:clickedLocation.longitude()};
       marker = new google.maps.Marker({
        position:position,
        map:map,
        animation: google.maps.Animation.DROP,
      });
      map.setCenter(position);
      console.log($(marker));
    };
    marker.addListener('click',function(){
        //do something
    })

}



ko.applyBindings(new ViewModel());

