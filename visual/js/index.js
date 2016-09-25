// The following example creates a marker in Stockholm, Sweden using a DROP
// animation. Clicking on the marker will toggle the animation between a BOUNCE
// animation and no animation.

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
    } catch (e) {
        alert('An error has occurred: ' + e.message);
    }
}


function showRequestData(requests)
{
    try {
      if(requests) {
          var jsonObject = requests;
          var length = jsonObject.length;
          var i =0;
          for(i =0;i<length;i++) {
              if(jsonObject[i].status == 'pending'){
                addMarkersOnMap(jsonObject[i].location.lat, jsonObject[i].location.lng,'Requestor', "Count="+jsonObject[i].count+" Status="+jsonObject[i].status, jsonObject[i].count, 'FE7569');
              }
              else{
                addMarkersOnMap(jsonObject[i].location.lat, jsonObject[i].location.lng,'Requestor', "Count="+jsonObject[i].count+" Status="+jsonObject[i].status, jsonObject[i].count, 'AAAAAA');
              }
          }
      }
    }
    catch(e) {
      alert('An error has occurred 1 : ' + e.message);
    }
}


function showMealData(mealData)
{
    try {
      if(mealData) {
          var jsonObject = mealData;
          var length = jsonObject.length;
          var i =0;
          for(i =0;i<length;i++){
              addMarkersOnMap(jsonObject[i].location.lat, jsonObject[i].location.lng,'Meals', getTypeString(jsonObject[i].type) + " " + getMealText(jsonObject[i].count) + " available.", jsonObject[i].count, 'FFF000');
          }
      }
    }
    catch(e){
      alert('An error has occurred 2 : ' + e.message);
    }
}

function getTypeString(type){
    switch(type) {
        case "vegetarian":
            return "Vegetarian";
            break;
        case "non-vegetarian":
            return "Non-vegetarian";
            break;
        case "vegan":
            return "Vegan";
            break;
        case "halal":
            return "Halal";
            break;
        case "any":
        default:
            return "Any";
    }
}

function getMealText(count){
    return count > 1 ? "meals":"meal";
}

function addMarkersOnMap(latitude, longitude, title, description, count, color)
{
    try{
    var position = new google.maps.LatLng(latitude, longitude);
    bounds.extend(position);
    var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld="+count+"|" + color,
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

function getDate(unix_timestamp)
{
    // Create a new JavaScript Date object based on the timestamp
// multiplied by 1000 so that the argument is in milliseconds, not seconds.
var date = new Date(unix_timestamp*1000);
return date;
}
