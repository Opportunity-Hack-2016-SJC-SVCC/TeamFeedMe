## Get all meals

  curl -X GET "http://localhost:3000/meals"

## Get all requests
   
   curl -X GET "http://localhost:3000/meal/requests"
   
## Request a meal 
   
   curl -X POST -H "Content-Type: application/json" -d '{
      "count" : "1",
      "type":"vegan",
      "contact_no":"1212",
      "location" : {
        "lat" : "100",
        "lng" : "1"
      }
    }' "http://localhost:3000/meal/request"

## Donate a meal
   
   curl -X POST -H "Content-Type: application/json" -d '{
      "count" : "1",
      "expiry":"1474768062414",
      "type":"vegan",
      "location" : {
        "lat" : "100",
        "lng" : "1"
      }
    }' "http://localhost:3000/meal/donate"

## Start node server using node api.js

