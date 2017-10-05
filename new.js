
    // var input2 =document.querySelectorAll('.icon-plus');
    console.log(input);
    var markers = [];
    var places_travel = [];
    var searchBox = {};
    i = 2;
    $('.next').on('click',function(e){
        e.preventDefault()
        $('.toSend').fadeOut();
        $('.response').fadeIn();
    });
    $('.icon-plus').on('click',function(){
        if (i > 10) return false;
        console.log('duplicate');
        $( ".destinos").last().clone({withDataAndEvents: true}).insertAfter( ".second-data" );

        var duplicated =$( ".destino").last();
        searchBox[i] = setSearchInputs(duplicated.get(0),i);

        i++;
        console.log(searchBox);
    });


    $('#form_map').on('keyup keypress', function(e) {
      var keyCode = e.keyCode || e.which;
      if (keyCode === 13) {
        e.preventDefault();
        return false;
      }
    });
    function setSearchInputs(inputnew,i){
        searchBox[i] = new google.maps.places.Autocomplete(inputnew);

    }


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
