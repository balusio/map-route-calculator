var map = null;
var directionsDisplay = null;
var directionsService = null;
var input = document.getElementById('origen');
var markers = [];
var places_travel = [];
var places_total = [];
var cantPass = 4;
var valuePass = 0;
var typeOfServ;
var firstStepFinished = false;
var sendRequest = {
    EstimatedKM: '',
    kmTxt: '',
    DestinationsCoordinates: '',
    BaseCoordinates: '',
    Directions: places_total
}
var i = 2;
// ICONO DE SUMATORIA QUE AGREGA DESTINOS
$(document).on('click', '.icon-plus', function() {

    if (i >= 9) {
        return false;
    }
    $(".toSend .second-data").append('<div class="destinos"><div class="holder-input full plus"><span  class="dest"></span><input type="text" class="full destino" id="destino' + i + '" placeholder="Destino" name="destino[]"><div class="icon-plus"></div></div>  </div>');

    // added
    var newEl = document.getElementById('destino' + i);
    setSearchInputs(newEl)
    i++;

});
// FECHA
$("#dateInput").datepicker();
// SELECCIONA LA CANTIDAD DE USUARIOS DEPENDIENDO DEL TIPO DE VEHICULO
$('select[name="tipeserv"]').on('change', function() {
    typeOfServ = $(this).val();
    if (typeOfServ === "auto") {
        cantPass = 4;
    }
    if (typeOfServ === "combi") {
        cantPass = 15;
    }
    if (typeOfServ === "minibus") {
        cantPass = 24;
    }

    $('input[name="pax"]').attr('max', cantPass);
});

// VERIFICA QUE HAYA LA CANTIDAD DE USUARIOS SEGÚ NEL TIPO DE VEHICULO
$('input[name="pax"]').on('keyup', function() {
    valuePass = parseInt($(this).val());
    console.log(valuePass);
    if (valuePass > cantPass) {
        alert('escogiste ' + typeOfServ + ' como medio de transporte, debes escoger un número de pasajeros igual o menor a ' + cantPass);
        return false;
    }

});
$('input[name="tiempo"]').mask('99:99', {
    placeholder: "00:00"
});
// limpia el destino 1 para cualquier error si esta vacio
$('#destino1').on('keyup', function() {
    if ($('#origen').val() === '' || $('#origen').val() === null || $('#origen').val() === 'undefined') {
        $('#origen').focus();
        $(this).val('');
        $(this).html('');
    }
});
// previene que se envíe el formulario presionando "ENTER"
$('#form_map').on('keyup keypress', function(e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode === 13) {
        e.preventDefault();
        return false;
    }
});

// LIMPIA EL FORMULARIO
$('.return-icon').on('click', function() {
    $(".destinos:not(#firstDestiny)").remove();
    directionsDisplay.setMap(null);
    directionsDisplay.setDirections(null);
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    sendRequest = {
        km: '',
        kmTxt: '',
        dest: '',
        orig: '',
        direcciones: places_total
    }

});

// BOTON SIGUIENTE
$('.next').on('click', function(e) {

    $('#notClient').fadeOut();
    e.preventDefault()
    // AQUI COTIZA Y ENVíA EL JSON CON LOS DATOS DEL FORMULARIO Y LOS RECABADOS DURANTE EL OBJETO sendRequest, el objeto sendRequest será el envío
    if (firstStepFinished) {
        if (highlightInputs($('.response-2'))) {
            var form = $('#form_map');
            var data = form.serializeObject();
             // DATA FORMULARIO
            console.log(data);
             sendRequest.typeUser = data.tipeserv;
            if( data.typeUser =='empresa'){
                sendRequest.NameUser = data.empresa;
            }
            else{
                sendRequest.typeUser = data.cliente;
            }
          // TODOS LOS DATOS PASAN POR EL FORMULARIO Y POR EL OBJETO SENDREQUEST
            sendRequest.Date = data.tiempo;
            sendRequest.Service =data.tipeserv;
            sendRequest.Passengers = data['pasajero[]'];
            totalCoord = sendRequest.Directions.length;
            lat_0 = sendRequest.Directions[0].coordinates.lat;
            lng_0 =  sendRequest.Directions[0].coordinates.lng;
            lat_final = sendRequest.Directions[0].coordinates.lat;
            lng_final =  sendRequest.Directions[0].coordinates.lng;
            sendRequest.DestinationsCoordinates = lat_final.toString() +','+lng_final.toString()   ;
            sendRequest.BaseCoordinates = lat_0.toString() +','+lng_0.toString()  ;
            sendRequest.PhoneNumber = data['telf-contacto'];
            console.log(sendRequest);
            $('.response-2').fadeOut();
            $('.response').fadeIn();
            $('#response .adress0').html(sendRequest.Directions[0].direccion);
            $("#kmValue").html(sendRequest.km);
            for (var total = 1; total < sendRequest.Directions.length; total++) {
                $("#response .first-data").append('<div class="data-origen"><div class="img destiny"></div><div class="text"><span>destino</span><p>' + sendRequest.Directions[total].direccion + ' </p></div></div>')
            }
            cotizar();
        }
    } else {
        if (highlightInputs($('.toSend'))) {

            sendRequest.withReturn = $('.return input').is(":checked");
            $('.toSend').fadeOut();
            $('.response-2').fadeIn();
            for (var pass = 1; pass < valuePass; pass++) {
                $(".response-2 .first-data").append('<div class="holder-input full pasajeros-inputs"><span class="pasajeros"></span><input type="text" class="full" name="pasajero[]" placeholder="Nombre del pasajero ' + (pass + 1) + '"></div>');
            }
            firstStepFinished = true;
        }
    }


});

// TABULA EL CLIENTE NO LCIENTE, HACIENDO QUE EL PRIMER CAMPO "EMPRESA" SE MODIFIQUE SI NO ES CLIENTE, de resto el formulario sigue igual
$('.tab-single').on('click', function() {
    if (firstStepFinished) {
        return false
    };
    $('.tab-single').not($(this)).removeClass('active');
    $(this).addClass('active');
    var toggleElement = $(this).data('toggle');
    if (toggleElement === 'cliente') {
        $('#typeUser input').attr('name', 'cliente');
        $('#typeUser input').attr('placeholder', 'empresa');
        $('#typeUser span').removeClass('telf');
        $('#typeUser span').addClass('empresa');
        $('#deftypeUser').attr('value', 'client');
    } else {
        $('#typeUser input').attr('name', 'empresa');
        $('#typeUser input').attr('placeholder', 'telefono');
        $('#deftypeUser').attr('value', 'noclient');
        $('#typeUser span').removeClass('empresa');
        $('#typeUser span').addClass('telf');
    }
});

function initMap() {
    var mapOptions = {
        zoom: 13,
        center: new google.maps.LatLng(-34.6204885, -58.4121957),
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

    var colores = [{
        featureType: "all",
        elementType: "all",
        stylers: [{
            saturation: -100
        }]
    }];
    var estilo = new google.maps.StyledMapType(colores);
    map.mapTypes.set('mapa-bn', estilo);
    map.setMapTypeId('mapa-bn');
    setSearchInputs(input);
    setSearchInputs($(".destino").get(0));
}

function setSearchInputs(inputnew) {
    var searchBox = new google.maps.places.Autocomplete(inputnew);
    google.maps.event.addListener(searchBox, 'place_changed', function() {
        var thisplace = searchBox.getPlace();
        if (thisplace.geometry.location != null) {
            var mark = new google.maps.Marker({
                map: map,
                icon: 'img/marker.png',
                title: thisplace.name,
                position: thisplace.geometry.location
            })
            markers.push(mark);
            places_travel.push({
                location: inputnew.value,
                stopover: false
            });
            places_total.push({
                destino : thisplace.name,
                coordinates: {
                    lat: thisplace.geometry.location.lat(),
                    lng: thisplace.geometry.location.lng()
                },
                direccion: inputnew.value
            });
            last_place = places_travel.length - 1;
            var request = {
                origin: places_travel[0].location,
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
                    directionsDisplay.setOptions({
                        suppressMarkers: true
                    });
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
                    sendRequest.EstimatedKM = response.routes[0].legs[0].distance.text;


                    cotizar();

                }
            });
        }



    });




}

function cotizar() {
    sendRequest.Directions = places_total;
    console.log(sendRequest);
}



function highlightInputs(form) {
    var res = true;

    $('.highlight').removeClass('highlight');

    form.find('input:not([type="hidden"]), select, textarea').each(function() {

        var field = $(this);
        if (field.val() == '' && field.hasClass('required')) {
            field.addClass('highlight');
            //field.focus();
            // setTimeout(function() {
            //  field.removeClass('highlight');
            // }, 850);
            res = false;
        }

    })

    if (!res) {
        form.find('.highlight').first().focus();
        // $("#validation").html("Por favor,<br>complete los campos requeridos");
    } else {
        // $("#validation").html("");
    }

    return res;
}


(function($, undefined) {
    '$:nomunge'; // Used by YUI compressor.

    $.fn.serializeObject = function() {
        var obj = {};

        $.each(this.serializeArray(), function(i, o) {
            var n = o.name,
                v = o.value;

            obj[n] = obj[n] === undefined ? v :
                $.isArray(obj[n]) ? obj[n].concat(v) :
                [obj[n], v];
        });

        return obj;
    };

})(jQuery);