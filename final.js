
var start = (function(){
	// VARIABLES HANDLER
	var objetos = {
		canvas : $("#map_canvas"),
		directionsDisplay : null,
		directionsService : null,
		input :document.getElementById('origen'),
		markers :[],
		places_travel : [],
		places_total :[],
		sendRequest : {
		     km : '',
		     kmTxt : '',
		     dest : '',
		     orig : '',
		     direcciones: '',
		},
		i : 1,
	}
	// MAP HANDLER
	var map = function(){
	    var mapOptions = {
	        zoom: 13,
	        center: new google.maps.LatLng(-34.6204885,-58.4121957),
	        disableDefaultUI: false,
	        zoomControl: false,
	        mapTypeControl: false,
	        scaleControl: false,
	        streetViewControl: false,
	        rotateControl: false,
	        mapTypeId: google.maps.MapTypeId.ROADMAP
	    };
	    map = new google.maps.Map(objetos.canvas.get(0), mapOptions);
	    directionsDisplay = new google.maps.DirectionsRenderer();
	    directionsService = new google.maps.DirectionsService();

	    var colores = [
	        {
	          featureType: "all",
	          elementType: "all",
	          stylers: [
	            { saturation: -100 }
	          ]
	        }
	    ];
	    var estilo = new google.maps.StyledMapType(colores);
	    map.mapTypes.set('mapa-bn', estilo);
	    map.setMapTypeId('mapa-bn');

	};
	// MAP HANDLER
	var eventsAttach = function(){
		$('#form_map').on('keyup keypress', function(e) {
		  var keyCode = e.keyCode || e.which;
		  if (keyCode === 13) {
		    e.preventDefault();
		    return false;
		  }
		});

		$(document).on( 'click','.icon-plus', function(){
		    if ( objetos.i >= 8) {
		        return false;
		    }
		    $(".toSend .second-data").append('<div class="destinos"><div class="holder-input full plus"><span  class="dest"></span><input type="text" class="full destino" id="destino'+objetos.i+'" placeholder="Destino" name="destino[]"><div class="icon-plus"></div></div>  </div>');

		    var newEl = document.getElementById('destino' + objetos.i);
		    setSearchInputs(newEl)
		    objetos.i++;

		});

	}

	function setSearchInputs(inputnew){
	    var searchBox = new google.maps.places.Autocomplete(inputnew);
	    google.maps.event.addListener(searchBox, 'place_changed', function () {
	        var thisplace = searchBox.getPlace();
	        if (thisplace.geometry.location != null) {

	        	var newMark = new google.maps.Marker({
	              map: map,
	              icon: 'img/marker.png',
	              title: thisplace.name,
	              position: thisplace.geometry.location
	            })

	            markers.push(newMark);

	            places_travel.push({
	                location: inputnew.value,
	                stopover: false
	            });

	            places_total.push({
	                nombre: thisplace.name,
	                coordinates: thisplace.geometry.location,
	                direccion: inputnew.value
	            });

	            last_place = places_travel.length -1;

	            var request = {
	                origin:places_travel[0].location,
	                destination: places_travel[last_place].location,
	                waypoints: places_travel,
	                travelMode: google.maps.DirectionsTravelMode.DRIVING,
	                //travelMode: google.maps.DirectionsTravelMode[$('#travelMode').val()],
	                //unitSystem: google.maps.DirectionsUnitSystem[$('#unitSystem').val()],
	                provideRouteAlternatives: false,
	            };

	            directionsService.route(request, function(response, status) {
	                if (status == google.maps.DirectionsStatus.OK) {
	                    //directionsDisplay.setPanel($("#panel_ruta").get(0));
	                    directionsDisplay.setOptions( { suppressMarkers: true } );
	                    directionsDisplay.setOptions({
	                      polylineOptions: {
	                        strokeColor: '#c7372d',
	                        strokeOpacity: 0.6,
	                        strokeWeight: 4
	                      }
	                    });
	                    directionsDisplay.setMap(map);
	                    directionsDisplay.setDirections(response);

	                    var myRoute = response.routes[0].legs[0];

	                    // var marker = new google.maps.Marker({
	                    //  position: myRoute.steps[0].start_point,
	                    //  map: map,
	                    //  icon: 'img/marker.png'
	                    //   });
	                    //   console.log(myRoute.steps.length)
	                    // var marker = new google.maps.Marker({
	                    //   position: myRoute.steps[myRoute.steps.length - 1].end_point,
	                    //   map: map,
	                    //   icon: 'img/marker.png'
	                    // });

	                    sendRequest.km = response.routes[0].legs[0].distance.value / 1000;
	                    sendRequest.kmTxt = response.routes[0].legs[0].distance.text;
	                    sendRequest.dest = request.destination;
	                    sendRequest.orig = request.origin;


	                    cotizar();

	                }
	            });
	        }



	    });




	}
	function startMagic(){
		map();
		eventsAttach();
		setSearchInputs(objetos.input);
    	setSearchInputs($(".destino").get(0));
	};

	return {
		init : startMagic,


	}


})();
