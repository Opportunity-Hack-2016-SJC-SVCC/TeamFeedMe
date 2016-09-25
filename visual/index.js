// The following example creates a marker in Stockholm, Sweden using a DROP
// animation. Clicking on the marker will toggle the animation between a BOUNCE
// animation and no animation.


// Multiple Markers
var markers = [
    [37.4, -121.92, 'Ankits House', 'Description 1', "FE7569"],
    [37.3769713, -121.9227678, 'PayPal', 'Description 2', "FFFFFF"],
    [37.403, -121.9304, 'Cresent Village', 'Description 3', "000000"]
    //,[33.388414, -111.931782, 'Tempe', 'Description 4','FFF000']
];

var bounds;
var map;
var infoWindow;
var i=0;

function initMap() {
    try {
        var marker;
        bounds = new google.maps.LatLngBounds();
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 13,
            center: {
                lat: 37.376,
                lng: -121.921
                }
            });

        var i;
        infoWindow = new google.maps.InfoWindow();

        getRequestData();
        getMealData();
    } catch (e) {
        alert('An error has occurred: ' + e.message);
    }
}


function getRequestData()
{
    try{
    var sampleResponse = '{"requests":[{"count":"3","created_on":"1474749729317","id":"1","location":{"lat":"37.4","lng":"-121.92"},"status":"completed","updated_on":"1474749729317"},{"count":"5","created_on":"1474749729317","id":"2","location":{"lat":"37.3769713","lng":"-121.9227678"},"status":"pending","updated_on":"1474749729317"},{"count":"5","created_on":"1474749729317","id":"2","location":{"lat":"37.403","lng":"-121.9304"},"status":"pending","updated_on":"1474749729317"}]}';
    var jsonObject = JSON.parse(sampleResponse);
    var length = Object.keys(jsonObject.requests).length;
    var i =0;
    for(i =0;i<length;i++)
    {
        addMarkersOnMap(jsonObject.requests[i].location.lat, jsonObject.requests[i].location.lng,'Requestor', "Count="+jsonObject.requests[i].count+" Status="+jsonObject.requests[i].status, 'FE7569');
    }
    }
    catch(e)
    {alert('An error has occurred: ' + e.message);}
}

function getMealData()
{
    try{
    var sampleResponse = '{"requests":[{"count":"3","created_on":"1474749729317","id":"1","location":{"lat":"37.279518","lng":"-121.867905"},"status":"completed","updated_on":"1474749729317"},{"count":"5","created_on":"1474749729317","id":"2","location":{"lat":"37.41118","lng":"-121.927391"},"status":"pending","updated_on":"1474749729317"},{"count":"5","created_on":"1474749729317","id":"2","location":{"lat":"37.323","lng":"-122.0527"},"status":"pending","updated_on":"1474749729317"}]}';
    var jsonObject = JSON.parse(sampleResponse);
    var length = Object.keys(jsonObject.requests).length;
    var i =0;
    for(i =0;i<length;i++)
    {
        addMarkersOnMap(jsonObject.requests[i].location.lat, jsonObject.requests[i].location.lng,'Donator', "Count="+jsonObject.requests[i].count+" Status="+jsonObject.requests[i].status, 'FFF000');
    }
    }
    catch(e)
    {alert('An error has occurred: ' + e.message);}
}

function addMarkersOnMap(latitude, longitude, title, description, color)
{
    try{
    var position = new google.maps.LatLng(latitude, longitude);
    bounds.extend(position);
    var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color,
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34));

    marker = new google.maps.Marker({
        position: position,
        icon: pinImage,
        map: map,
        draggable: true,
        title: title
    });
    // Allow each marker to have an info window    
    google.maps.event.addListener(marker, 'click', (function(marker,i) {
        return function() {
            infoWindow.setContent(description);
            infoWindow.open(map, marker);
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        }
    })(marker,i));
        map.fitBounds(bounds);
        i++;
    }
            catch(e)
    {alert('An error has occurred: ' + e.message);}
}