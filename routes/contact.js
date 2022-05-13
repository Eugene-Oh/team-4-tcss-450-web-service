// express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided

//Pull in the JWT module along with out a secret key
const jwt = require('jsonwebtoken')
const config = {
    secret: process.env.JSON_WEB_TOKEN
}

const router = express.Router()

// router.get('/', (request, response, next) => {
//     console.log("test");
//     response.status(200).send({message:"welcome to contact"})
// })

/** 
 * @api {get} /contact Request get contacts
 * @apiName GetAuth
 * @apiGroup Auth
 * 
 * @apiHeader {String} authorization "username:password" uses Basic Auth 
 * 
 * @apiSuccess {boolean} success true when the name is found and password matches
 * @apiSuccess {String} message "Authentication successful!""
 * @apiSuccess {String} token JSON Web Token
 * 
 *  * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "success": true,
 *       "message": "Authentication successful!",
 *       "token": "eyJhbGciO...abc123"
 *     }
 */
 router.get('/', (request, response, next) => {
    // console.log(request.decoded)
    let userInfo = request.decoded;
    console.log(userInfo.memberid);
    const theQuery = "SELECT memberid_a, memberid_b, firstname, lastname, email FROM Contacts INNER JOIN Members on (Contacts.memberid_b = Members.MemberID) WHERE Contacts.memberid_a = $1;"

    pool.query(theQuery, [userInfo.memberid])
        .then(result => {
            response.status(200).send(result.rows)
        })

})

module.exports = router