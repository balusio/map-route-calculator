 <script type="text/javascript">	
	var map = null;
	var directionsDisplay = null;
	var directionsService = null;

	function initMap() {		
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
	    map = new google.maps.Map($("#map_canvas").get(0), mapOptions);
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
			
		var input = document.getElementById('start');
		var input2 = document.getElementById('end');
		var autocomplete = new google.maps.places.Autocomplete(input);
		var autocomplete2 = new google.maps.places.Autocomplete(input2);
	
	}

	function getDirections(){
		var price = $('#price').val()
		var start = $('#start').val();
		var end = $('#end').val();
		var wp = $('#wpoint-1').val();
		var waypts=[];
		if(!start || !end){
			alert("Se requieren dirección de origen y destino.");
			return;
		}
		waypts.push({location:wp,stopover:true});
		var request = {
		        origin: start,
		        destination: end,
				waypoints: waypts,
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
				
				var marker = new google.maps.Marker({
					position: myRoute.steps[0].start_point, 
					map: map,
					icon: 'img/marker.png'
				  });
				  console.log(myRoute.steps.length)
				var marker = new google.maps.Marker({
				  position: myRoute.steps[myRoute.steps.length - 1].end_point, 			
				  map: map,				  
				  icon: 'img/marker.png'
				});

				var km = response.routes[0].legs[0].distance.value / 1000;
				var kmTxt = response.routes[0].legs[0].distance.text;
				var dest = request.destination;
				var orig = request.origin;
				
				console.log(dest)
				console.log(orig)
				console.log(km);
				console.log(price);
				console.log(kmTxt);
				cotizar(dest, orig, km, price, kmTxt);
				
	        } else {
	            alert("No hay direcciones disponibles entre estos dos puntos");
	        }
	    });
	}

	$('#search').on('click', function(){ getDirections(); });
	$('.routeOptions').on('change', function(){ getDirections(); });

	function cotizar(D, O, K, P, T){
		$('.result').fadeIn(200);
	var valor = Number(K) * Number(P);
		$('.result .desde span').html(O);
		$('.result .hasta span').html(D);
		$('.result .kms span').html(T);
		$('.result .valor strong').html(Math.round(valor));
		setTimeout(function(){
			$('.result').addClass('bgResult');	
			$('.result *').delay(200).fadeIn(400);
		}, 300);
	}
	$('.routes').on('click', '#reset', function(){
		$('.result').fadeOut(300, function(){
			$('.result').removeClass('bgResult');
			$('.result *').fadeOut();	
		})	
	});
	
	$('.routes').on('click', '#reservar', function(e){
		e.preventDefault();
	var start = $('.result .desde span').html(),
		end = $('.result .hasta span').html();
		$('#form_reservar').find('input[name="lugar_origen"]').val(start);
		$('#form_reservar').find('input[name="lugar_destino"]').val(end);
		$('#form_reservar').fadeIn()	
	});
	$('#arrow').on('click', function(){
		$('.routes').slideToggle();
		$('#arrow').toggleClass('h');	
	});
	//
	$('input:not([type="hidden"]), textarea').on('keypress', function(){
		$(this).parent().removeClass('error');
	});
	$('#form_reservar form').append('<div class="msg"></div>');
	//FORMULARIO
	$("#form_reservar form").submit(function(e) {
		e.preventDefault();
	
		var form = $(this);
		
		var validForm = true;
		form.find('input:not([type="hidden"]), textarea').each(function(){
			if( $(this).val().trim() ==''){
				$(this).focus();
				$(this).parent().addClass('error');
				validForm = false;
				return false;
			}
		})
	
	
		if(validForm){
	
			var overlay = $('form .msg');
			var action = 'service/mail.php';
			var data = form.serializeObject();
			console.log(action);console.log(data);
	
			overlay.html('Estamos enviando tu consulta...').fadeIn(300).delay(1500).fadeOut(300);
	
	
				$.ajax({
					type: 'POST',
					url: action,
					data: data,
					error: function(data){
						console.log("form:error");
						overlay.html('Error al enviar formulario. Volvé a intentarlo más tarde.').fadeIn(300).delay(1500).fadeOut(300);
						console.log(data);
					},
					success: function(data){
						console.log("form:success");
						overlay.html('¡Gracias! Pronto nos pondremos en contacto.').fadeIn(300).delay(1500).fadeOut(300);
						form.find('input:not([type="hidden"]), textarea').each(function() {
							$(this).val('');
							$('#form_reservar').fadeOut();
						});
						console.log(data);
					}
				});
	
	
		}
		else{
			//overlay.html('Por favor, complete todos los campos requeridos.').fadeIn(300).delay(1500).fadeOut(300);
	
		}
	
	
	});
	// serializes a form into an object.
	(function($,undefined){
	  '$:nomunge'; // Used by YUI compressor.
	
	  $.fn.serializeObject = function(){
		var obj = {};
	
		$.each( this.serializeArray(), function(i,o){
		  var n = o.name,
			v = o.value;
	
			obj[n] = obj[n] === undefined ? v
			  : $.isArray( obj[n] ) ? obj[n].concat( v )
			  : [ obj[n], v ];
		});
	
		return obj;
	  };
	
	})(jQuery);
	
    </script>