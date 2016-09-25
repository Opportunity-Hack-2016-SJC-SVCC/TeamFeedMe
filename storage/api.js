var express = require('express');
require('console');
var firebase = require("firebase");
var moment = require('moment');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

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
  mReqJson.id = mDbData.key;
  res.setHeader("content-type", "application/json")
  res.send(mReqJson);
});

//Get all the requests.
app.get('/meal/requests', function (req, res) {
  getAll('requests',function buildResp(data) {
    res.setHeader("content-type", "application/json")
    res.send(data);
    });
});

//Get all the meals.
app.get('/meals',function (req, res) {
  getAll('meals',function buildResp(data) {
    res.setHeader("content-type", "application/json")
    res.send(data);
    });
});

//Returns all data in a path
function getAll(path,callback) {
  var rootRef = dbRef.ref(path);
  var data = [];
  rootRef.once('value').then(function(d) {
       d.forEach(function (oneReq) {
            var json = oneReq.exportVal();
            json.id = oneReq.key;
            data.push(json);
       });
       callback(data);
  });
}

app.listen(3000, function () {
  console.log('App fired up on port 3000!');
});


