var express = require('express');
require('console');
var firebase = require("firebase");
var GeoFire = require("geofire");
var moment = require('moment');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use('/', express.static('../visual'));

// Initialize Firebase
var config = {
  apiKey: "AIzaSyBLz0kqlStvYQvE1G3dewkoSfaL9OLvko8",
  authDomain: "feedme-54baa.firebaseapp.com",
  databaseURL: "https://feedme-54baa.firebaseio.com",
  storageBucket: "feedme-54baa.appspot.com",
  messagingSenderId: "112147807038"
};
firebase.initializeApp(config);
var dbRef = firebase.database();
var geoFireMealsDbRef = new GeoFire(dbRef.ref('geoFire-meals'));
var geoFireReqDbRef = new GeoFire(dbRef.ref('geoFire-requests'));
var searchRadius = 8.04672;


//Donate food.
app.post('/meal/donate', function (req, res) {
  var reqData = req.body;
  var mReqJson = {
      "count":reqData.count,
      "expiry":reqData.expiry,
      "location": {
         "lat":reqData.location.lat,
         "lng":reqData.location.lng
      },
      "type":reqData.type === undefined?"any":reqData.type,
      "created_on":moment().valueOf(),
      "updated_on":moment().valueOf()
   };
  var mDbData = dbRef.ref('meals').push(mReqJson);
  //Also set it in geoFire schema
  geoFireMealsDbRef.set(mDbData.key, [reqData.location.lat, reqData.location.lng]);

  fulfillDonationRequest(mReqJson);

  mReqJson.id = mDbData.key;
  res.setHeader("content-type", "application/json")
  res.send(mReqJson);
});

//Make a request.
app.post('/meal/request', function (req, res) {
  var reqData = req.body;
  var mReqJson = {
      "count":reqData.count,
      "location": {
         "lat":reqData.location.lat,
         "lng":reqData.location.lng
      },
      "status":"pending",
      "type":reqData.type === undefined?"any":reqData.type,
      "contact_no":reqData.contact_no === undefined?"":reqData.contact_no,
      "created_on":moment().valueOf(),
      "updated_on":moment().valueOf()
   };
  var mDbData = dbRef.ref('requests').push(mReqJson);

  //Also set it in geoFire schema
  geoFireReqDbRef.set(mDbData.key, [reqData.location.lat, reqData.location.lng]);

  mReqJson.id = mDbData.key;

  fulfillMealRequest(mReqJson);

  res.setHeader("content-type", "application/json")
  res.send(mReqJson);
});


//Get all the requests.
app.get('/meal/requests', function (req, res) {
  getAll('requests', filterMealRequest, function buildResp(data) {
    res.setHeader("content-type", "application/json")
    res.send(data);
    });
});

//Get all the meals.
app.get('/meals',function (req, res) {
  getAll('meals', filterMealDonations, function buildResp(data) {
    res.setHeader("content-type", "application/json")
    res.send(data);
    });
});

function filterMealDonations(mDonation) {
    return mDonation.count === "0" || mDonation.expiry <= moment().valueOf();
}

function filterMealRequest(mReq) {
    return mReq.status === "completed" || mReq.count === "0"
}

//Find the donations in 5 mile radius for the request and adjust the data.
function fulfillMealRequest(reqData){
  //Search for all donation in radius of this request
  var geoQuery = geoFireMealsDbRef.query({
    center: [reqData.location.lat, reqData.location.lng],
    radius: searchRadius //5 miles
  });

  geoQuery.on("key_entered", function(key, location, distance) {
    var mealDbRef = dbRef.ref('meals').child(key);
    //We need to check if the meal is of the requested type and there are enough meal.
    mealDbRef.once("value", function(oneMeal) {
        var mealJson = oneMeal.exportVal();
        var reqJson = reqData;
        var reqDbRef = dbRef.ref('requests').child(reqData.id);
        adjustCounts(mealJson,reqJson,mealDbRef,reqDbRef);
    });
  });

  geoQuery.on("ready", function() {
    geoQuery.cancel();
  })
}

//Find the request in 5 mile radius for the request and fulfill it
function fulfillDonationRequest(donationData){
  //Search for all request in radius of this donation
  var geoQuery = geoFireReqDbRef.query({
    center: [donationData.location.lat, donationData.location.lng],
    radius: searchRadius //5 miles
  });

  geoQuery.on("key_entered", function(key, location, distance) {
    var reqDbRef = dbRef.ref('requests').child(key);
    //We need to check if the meal is of the requested type and there are enough meal.
    reqDbRef.once("value", function(oneReq) {
        var mealJson = donationData;
        var reqJson = oneReq.exportVal();
        var mealDbRef = dbRef.ref('meals').child(donationData.id);
        adjustCounts(mealJson,reqJson,mealDbRef,reqDbRef);
    });
  });

  geoQuery.on("ready", function() {
    geoQuery.cancel();
  })
}

function adjustCounts(mealJson,reqJson,mealDbRef,reqDbRef) {
    if(mealJson.count > 0 && reqJson.count > 0 && (reqJson.type === "any" || mealJson.type === reqJson.type)) {
        if (reqJson.count > mealJson.count) {
            reqJson.count = reqJson.count - mealJson.count;
            mealJson.count = 0;
        } else {
            mealJson.count = mealJson.count - reqJson.count;
            reqJson.count = 0;
        }
        mealDbRef.update({ "count": mealJson.count});
        reqJson.status = (reqJson.count == 0)?"completed":"pending";
        reqDbRef.update({"count":reqJson.count , "status":reqJson.status});
        console.log("Request %j", reqJson);
    }
}

//Returns all data in a path
function getAll(path,filter,callback) {
  var rootRef = dbRef.ref(path);
  var data = [];
  rootRef.once('value').then(function(d) {
       d.forEach(function (oneReq) {
            var json = oneReq.exportVal();
            json.id = oneReq.key;
            if (!filter(json)) {
                data.push(json);
            }
       });
       callback(data);
  });
}

app.listen(3000, function () {
  console.log('App fired up on port 3000!');
});


