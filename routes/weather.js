const API_KEY = process.env.API_KEY

//express is the framework we're going to use to handle requests
const express = require('express')

//request module is needed to make a request to a web service
const request = require('request')

var router = express.Router()

// figure out why no of the declared variables are workingin the API link

/**
 * @api {get} Live Active Weather Data from OpenWeatherMap
 * @apiName OpenWeatherMap
 * @apiGroup OpenWeatherMap
 * @apiHeader {String} s
 * @apiDescription This end point is a pass through to the openweathermap.org API. 
 * All parameters will pass on to https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid=API_KEY.
 */ 
//change this
router.get("/",(req, res) => {

    //trying to inialize these variables
    var lat = 47.2529 // latitude for tacoma
    var lon = 122.4443 // longitude for tacoma

    // for info on use of tilde (`) making a String literal, see below. 
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
   
    let url = `https://api.openweathermap.org/data/2.5/onecall?lat=47.2529&lon=-122.443&units=imperial&exclude=alerts&appid=0757b2b6f8d336798e66e507f6b9fbe7`
    //let url2 = `https://api.openweathermap.org/data/2.5/weather?q={city name}&appid=API_KEY` // url2gives lon and lat info to pass into url
    
    //find the query string (parameters) sent to this end point and pass them on to
    // openweathermap.org api call 
    let n = req.originalUrl.indexOf('?') + 1
    if(n > 0) {
        url += '&' + req.originalUrl.substring(n)
    }

    //When this web service gets a request, make a request to the OpenWeatherMap Web service
    request(url, function (error, response, body) {
        if (error) {
            res.send(error)
        } else {
            // pass on everything (try out each of these in Postman to see the difference)
            // res.send(response);
            
            // or just pass on the body

            var n = body.indexOf("{")
            var nakidBody = body.substring(n - 1)

            res.send(nakidBody)
        }
    })

})

module.exports = router