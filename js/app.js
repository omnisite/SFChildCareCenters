$(document).ready(function() {

  var styles = [{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#e0efef"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"hue":"#1900ff"},{"color":"#c0e8e8"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill"},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#7dcdcd"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"},{"lightness":700}]}];

  var markerClusterChildCare;
  var markerClusterCrime;
  var markerClusterGrocery;
  var markerClusterBikes;
  var childcareSwitch = 1;
  var crimeSwitch = 1;
  var grocerySwitch = 1;
  var bikeSwicth = 1;
  var map;
  var markersChildCare;
  var markersCrime;
  var markersGrocery;
  var markersBikes;

  google.maps.event.addDomListener(window, 'load', initialize);

  function initialize() {

    var latitude = 37.7695743,
      longitude = -122.4444665,
      radius = 8000,
      center = new google.maps.LatLng(latitude,longitude),
      bounds = new google.maps.Circle({center: center, radius: radius}).getBounds(),
      mapOptions = {
        center: center,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: true,
        styles: styles
      };

    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    var mc = new MarkerClusterer(map);

    setMarkers(center, radius, map);

  };

  markersChildCare = [];
  markersGrocery = [];
  markersCrime = [];
  markersBikes = [];
  function setMarkers(center, radius, map) {
    // load child care json (saved from http://public.opendatasoft.com/explore/dataset/scisf_licensed_child_care_centers_san_francisco_ca/?tab=table)
    $.ajax({ 
        'async': true, 
        'global': false, 
        'url': "js/child-care-centers.json", 
        'dataType': "json", 
        'success': function (data) {
           jsonChildCare = data.features;
           // console.log(jsonChildCare);
           doChildCare(jsonChildCare);
           $( '#loadingChildCare' ).hide();
         }
    });

    // load bicycle parking data json (saved from http://data.sfgov.org/resource/w969-5mn4.json)
    $.ajax({ 
        'async': true, 
        'global': false, 
        'url': "http://data.sfgov.org/resource/w969-5mn4.json", 
        'dataType': "json", 
        'success': function (data) {
           jsonBikes = data;
           // console.log(jsonBikes);
           doBikes(jsonBikes);
           $( '#loadingBikes' ).hide();
         }
    });

    // load grocery stores from https://data.sfgov.org/api/views/sfdn-328a/rows.json?accessType=DOWNLOAD, imported into mysql, geocoded, exported and converted to json
    $.ajax({ 
        'async': true, 
        'global': false, 
        // 'url': "https://data.sfgov.org/api/views/sfdn-328a/rows.json?accessType=DOWNLOAD",
        'url': "js/grocery.json",
        'dataType': "json", 
        'success': function (data) {
           jsonGrocery = data;
           // console.log(jsonGrocery);
           doGrocery(jsonGrocery);
           $( '#loadingGrocery' ).hide();
         }
    });

    // load crime data from https://data.sfgov.org/api/views/gxxq-x39z/rows.json?accessType=DOWNLOAD
    $.ajax({ 
        'async': true, 
        'global': false, 
        // 'url': "https://data.sfgov.org/api/views/gxxq-x39z/rows.json?accessType=DOWNLOAD",
        'url': "js/crime.json",
        'dataType': "json", 
        'success': function (data) {
           jsonCrime = data.data;
           // console.log(jsonCrime);
           doCrime(jsonCrime);
           $( '#loadingCrime' ).hide();
         }
    });

    function doChildCare(jsonChildCare) {
      //loop between each of the jsonChildCare elements
      for (var i = 0, length = jsonChildCare.length; i < length; i++) {
          var data = jsonChildCare[i],
          latLng = new google.maps.LatLng(data.geometry.coordinates[1],data.geometry.coordinates[0]);

          var marker = new google.maps.Marker({
              position: latLng,
              map: map,
              title: data.properties.fac_name,
              slots: data.properties.slots_cnt,
              address: data.properties.address,
              lat: data.geometry.coordinates[1],
              lng: data.geometry.coordinates[0],
              icon: 'img/daycare.png'
          });
          markersChildCare.push(marker);

          google.maps.event.addListener(marker, 'click', function() {
            $( '#intro' ).slideUp();
            $( '#sectionTitle').html( '<h2>Child Care Center</h2>' );
            $( '#streetview' ).html ('<div class="photo" style="max-width: 300px; height: 250px; background-image: url(http://maps.googleapis.com/maps/api/streetview?size=300x250&amp;location=' + this.lat + ',' + this.lng + ');"></div> ');
            $( '#title' ).html( '<strong>Name:</strong><br>' + this.title.toLowerCase() );
            $( '#address' ).html( '<strong>Address:</strong><br>' + this.address.toLowerCase() );
            $( '#slots' ).html( '<strong>Slots:</strong><br>' + this.slots );
            // console.log(this.title);
          });

      }

      markerClusterChildCare = new MarkerClusterer(map, markersChildCare);
    }

    function doCrime(jsonCrime) {               
      //loop between each of the jsonCrime elements
      for (var i = 0, length = jsonCrime.length; i < length; i++) {
          var data = jsonCrime[i],
          latLng = new google.maps.LatLng(data[18],data[17]);

          var theDate = new Date( data[12] * 1000 );
          theDate = ( theDate.getMonth() + 1 ) + '/' + theDate.getDate() + '/' + ( 1900 + theDate.getYear() );

          var marker = new google.maps.Marker({
              position: latLng,
              map: map,
              title: data[10],
              slots: theDate,
              address: data[16],
              lat: data[18],
              lng: data[17],
              icon: 'img/crime.png'
          });
          markersCrime.push(marker);

          google.maps.event.addListener(marker, 'click', function() {
            $( '#intro' ).slideUp();
            $( '#sectionTitle').html( '<h2>Crime Incident</h2>' );
            $( '#streetview' ).html ('<div class="photo" style="max-width: 300px; height: 250px; background-image: url(http://maps.googleapis.com/maps/api/streetview?size=300x250&amp;location=' + this.lat + ',' + this.lng + ');"></div> ');
            $( '#title' ).html( '<strong>Crime:</strong><br>' + this.title.toLowerCase() );
            $( '#address' ).html( '<strong>Address:</strong><br>' + this.address.toLowerCase() );
            $( '#slots' ).html( '<strong>Date:</strong><br>' + this.slots );
            // console.log(this.title);
          });

      }

      markerClusterCrime = new MarkerClusterer(map, markersCrime);
    }

    function doGrocery(jsonGrocery) {
      //loop between each of the jsonGrocery elements
      for (var i = 0, length = jsonGrocery.length; i < length; i++) {
        var data = jsonGrocery[i],
          latLng = new google.maps.LatLng(data.LATITUDE,data.LONGITUDE);

          var marker = new google.maps.Marker({
              position: latLng,
              map: map,
              title: data.NAME,
              slots: data.DATE,
              address: data.ADDRESS,
              lat: data.LATITUDE,
              lng: data.LONGITUDE,
              icon: 'img/grocery.png'
          });
          markersGrocery.push(marker);

          google.maps.event.addListener(marker, 'click', function() {
            $( '#intro' ).slideUp();
            $( '#sectionTitle').html( '<h2>Grocery Store</h2>' );
            $( '#streetview' ).html ('<div class="photo" style="max-width: 300px; height: 250px; background-image: url(http://maps.googleapis.com/maps/api/streetview?size=300x250&amp;location=' + this.lat + ',' + this.lng + ');"></div> ');
            $( '#title' ).html( '<strong>Name:</strong><br>' + this.title.toLowerCase() );
            $( '#address' ).html( '<strong>Address:</strong><br>' + this.address.toLowerCase() );
            $( '#slots' ).html( '<strong>Since:</strong><br>' + this.slots );
            // console.log(this.title);
          });

      }

      markerClusterGrocery = new MarkerClusterer(map, markersGrocery);
    }

    function doBikes(jsonBikes) {               
      //loop between each of the jsonBikes elements
      for (var i = 0, length = jsonBikes.length; i < length; i++) {
          var data = jsonBikes[i],
          latLng = new google.maps.LatLng(data.latitude.latitude,data.latitude.longitude);

          var marker = new google.maps.Marker({
              position: latLng,
              map: map,
              title: data.addr_num,
              slots: data.spaces,
              address: data.yr_inst,
              lat: data.latitude.latitude,
              lng: data.latitude.longitude,
              icon: 'img/bikes.png'
          });
          markersBikes.push(marker);

          google.maps.event.addListener(marker, 'click', function() {
            $( '#intro' ).slideUp();
            $( '#sectionTitle').html( '<h2>Bicycle Parking Spot</h2>' );
            $( '#streetview' ).html ('<div class="photo" style="max-width: 300px; height: 250px; background-image: url(http://maps.googleapis.com/maps/api/streetview?size=300x250&amp;location=' + this.lat + ',' + this.lng + ');"></div> ');
            $( '#title' ).html( '<strong>Spot:</strong><br>' + this.title.toLowerCase() );
            $( '#address' ).html( '<strong>Address:</strong><br>' + this.address.toLowerCase() );
            $( '#slots' ).html( '<strong>Spaces:</strong><br>' + this.slots );
            // console.log(this.title);
          });

      }

      markerClusterBikes = new MarkerClusterer(map, markersBikes);
    }

  }

  function toggleCheckmark( data, flag ) {
    if ( !flag ) {
      data.children('span').removeClass('glyphicon-ok-circle').addClass('glyphicon-remove-circle');
    } else {
      data.children('span').removeClass('glyphicon-remove-circle').addClass('glyphicon-ok-circle');
    }
  }

  $( '.toggle' ).click( function() {
    if ( $(this).data('src') == 'crime' ) {
      if ( crimeSwitch ) {
        markerClusterCrime.clearMarkers();
        crimeSwitch = 0;
        toggleCheckmark( $(this), false );
      } else {
        markerClusterCrime = new MarkerClusterer(map, markersCrime);
        crimeSwitch = 1;
        toggleCheckmark( $(this), true );
      }
    } else if ( $(this).data('src') == 'childcare' ) {
      if ( childcareSwitch ) {
        markerClusterChildCare.clearMarkers();
        childcareSwitch = 0;
        toggleCheckmark( $(this), false );
      } else {
        markerClusterChildCare = new MarkerClusterer(map, markersChildCare);
        childcareSwitch = 1;
        toggleCheckmark( $(this), true );
      }
    } else if ( $(this).data('src') == 'grocery' ) {
      if ( grocerySwitch ) {
        markerClusterGrocery.clearMarkers();
        grocerySwitch = 0;
        toggleCheckmark( $(this), false );
      } else {
        markerClusterGrocery = new MarkerClusterer(map, markersGrocery);
        grocerySwitch = 1;
        toggleCheckmark( $(this), true );
      }
    } else if ( $(this).data('src') == 'bikes' ) {
      if ( bikeSwicth ) {
        markerClusterBikes.clearMarkers();
        bikeSwicth = 0;
        toggleCheckmark( $(this), false );
      } else {
        markerClusterBikes = new MarkerClusterer(map, markersBikes);
        bikeSwicth = 1;
        toggleCheckmark( $(this), true );
      }
    }
    return false;
  } );
  
});