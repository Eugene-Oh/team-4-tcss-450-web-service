//express is the framework we're going to use to handle requests
const { response } = require('express')
const { request } = require('express')
const express = require('express')
const res = require('express/lib/response')

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided

const generateHash = require('../utilities').generateHash
const generateSalt = require('../utilities').generateSalt

const sendEmail = require('../utilities').sendEmail

const router = express.Router()

/**
 * @api {post} /forgot Request to change password
 * @apiName PostForgot
 * @apiGroup Forgot
 * 
 * @apiParam {String} email a users email *unique
 * @apiParam {String} password a users password
 * 
 * @apiParamExample {json} Request-Body-Example:
 *  {
 *      "email":"cfb3@fake.email",
 *      "password":"test12345"
 *  }
 * 
 * @apiSuccess (Success 201) {boolean} success true when user is found
 * @apiSuccess (Success 201) {String} message "Email sent" 
 * 
 * @apiError (400: SQL error) {String} message "other error, see detail"
 * 
 * @apiError (400: User not found) {String} message "Missing required information"
 * 
 */ 
router.post('/', async (request, response) => {

    const email = request.body.email
    const password = request.body.password

    if(isStringProvided(email) && isStringProvided(password)) {

        let theQuery = "SELECT Salt, Credentials.MemberID, Verification, SaltedHash FROM Credentials INNER JOIN Members ON Credentials.MemberID = Members.MemberID WHERE Members.Email = $1"
        let values = [email]
        await pool.query(theQuery, values)
            .then(result => {
                let checkHash = generateHash(password, result.rows[0].salt)
                if (result.rows[0].verification == 0) {
                    response.status(400).send({
                        message: "Must verify email before resetting your password."
                    })
                }
                if (result.rows[0].saltedhash == checkHash) {
                    response.status(400).send({
                        message: "You just entered your current password."
                    })
                }
                response.status(200).send({
                    message: "Email sent",
                    success: true
                })
                request.salt = result.rows[0].salt
                let salt = generateSalt(32)
                let salted_hash = generateHash(request.body.password, salt)
                let link = "https://team-4-tcss-450-web-service.herokuapp.com/forgot/" 
                    + request.salt
                    + "/"
                    + salt
                    + "/"
                    + salted_hash
                sendEmail("team4tcss450@gmail.com", request.body.email, "Password reset", "Please click the following link to update your password. \n" + link)
            })
            .catch((error) => {
                response.status(400).send({
                    message: "other error, see detail",
                    detail: error.detail
                })
            })
    } else {
        response.status(400).send({
            message: "Missing required information"
        })
    }
})

/**
 * @api {post} /forgot/:oldSalt/:newSalt/:newSaltedHash Request to register a user
 * @apiName PostForgot
 * @apiGroup Forgot
 * 
 * @apiParam {String} oldSalt the users old salt
 * @apiParam {String} newSalt the users new salt
 * @apiParam {String} newSaltedHash the users new salted hash
 * 
 * @apiSuccess (Success 201) {String} messasge "Your new password has been set, you may now close this window" 
 * 
 * @apiError (400: Other Error) {String} message "An error has occured"
 * 
 */ 
router.get('/:oldSalt/:newSalt/:newSaltedHash', async (request, response, next) => {
    const oldSalt = request.params.oldSalt
    const newSalt = request.params.newSalt
    const newSaltedHash = request.params.newSaltedHash
    const theQuery = "UPDATE Credentials SET Salt = $1, SaltedHash = $2 WHERE Salt = $3"
    
    await pool.query(theQuery, [newSalt, newSaltedHash, oldSalt])
        .then(result => {
            response.writeHead(200, {'Content-Type': 'text/html'})
            response.write('<h style="text-align:center">Your new password has been set, you may now close this window</h>')
            response.end()
        })
        .catch((error) => {
            // For some reason, outlook auto-opens hyperlinks so we need to allow the link to be reopened
            next()
        })
}, async (request, response) => {
    const newSalt = request.params.newSalt
    const theQuery = "SELECT Salt FROM Credentials WHERE Salt = $1"

    await pool.query(theQuery, [newSalt])
        .then(result => {
            response.writeHead(200, {'Content-Type': 'text/html'})
            response.write('<h style="text-align:center">Your new password has been set, you may now close this window</h>')
            response.end()
        })
        .catch((error) => {
            response.writeHead(400, {'Content-Type': 'text/html'})
            response.write('<h style="text-align:center">An error has occured</h>')
            response.end()
        })
})

module.exports = router