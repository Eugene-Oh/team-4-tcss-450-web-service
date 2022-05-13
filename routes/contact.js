// express is the framework we're going to use to handle requests
const express = require('express')
const res = require('express/lib/response')

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
 * @apiName Getcontact
 * @apiGroup contact
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
    //console.log(userInfo.memberid);
    const theQuery = "SELECT memberid_a, memberid_b, firstname, lastname, email FROM Contacts INNER JOIN Members on (Contacts.memberid_b = Members.MemberID) WHERE Contacts.memberid_a = $1;"

    pool.query(theQuery, [userInfo.memberid])
        .then(result => {
            response.status(200).send(result.rows)
        })
        .catch((error) => {
            response.status(400).send({
                message: "error"
            })
        })
})

// add new contact
router.post('/', (request, response, next) => {
    // console.log(request.decoded.memberid)
    // console.log(request.body.email)
    // let memberAID = request.decoded.memberid;
    // let MemberBEmail = request.body.email;
    // check for valid email

    // get memberBID
    const getMemBIDQuery = "SELECT MemberID FROM Members WHERE Email = $1";
    pool.query(getMemBIDQuery, [request.body.email])
        .then(result => {
            // console.log(result.rows[0].memberid)
            // response.status(200).send({
            //     message: "sup sup"
            // })
            request.body.memberid = result.rows[0].memberid
            //console.log(request.body);
            next();
        })
        .catch((error) => {{
            response.status(400).send({
                message: "email doesnt exist in system"
            })
        }})
}, (request, response, next) => {
    // check to see if memberB is already in memberA's contact
    const checkQuery = "SELECT * FROM Contacts WHERE memberid_a = $1 AND memberid_b=$2"
    pool.query(checkQuery, [request.decoded.memberid, request.body.memberid])
        .then(result => {
            if(result.rows.length > 0) {
                response.status(200).send({
                    message: "This contact has already been added"
                })
            } else if (result.rows.length === 0) {
                next();
            }
        })
        .catch((error) => {
            response.status(400).send({
                message:"error checking if member is already a contact"
            })
        }) 
}, (request, response, next) => {
    // add memberB to memberA's contact
    const addMemBQuery = "INSERT INTO Contacts(MemberID_A, MemberID_B) VALUES ($1, $2)"
    pool.query(addMemBQuery, [request.decoded.memberid, request.body.memberid])
        .then(result => {
            next();
        })
        .catch((error) => {
            response.status(400).send({
                message:"fail to add member"
            })
        })
}, (request, response, next) =>{
    // get new member information and send it
    const MemBInfoQuery = "SELECT * FROM Members WHERE MemberID=$1"
    pool.query(MemBInfoQuery, [request.body.memberid])
        .then(result => {
            console.log(result.rows[0]);
            response.status(200).send({
                newContact : result.rows[0],
                message: "contact added successfully"
            })
        })
        .catch((error) => {
            response.status(400).send({
                message: "memeber does not exist"
            })
        })
})



module.exports = router