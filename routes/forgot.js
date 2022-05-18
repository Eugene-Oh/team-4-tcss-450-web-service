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
 * @api {post} /auth Request to register a user
 * @apiName PostAuth
 * @apiGroup Auth
 * 
 * @apiParam {String} first a users first name
 * @apiParam {String} last a users last name
 * @apiParam {String} email a users email *unique
 * @apiParam {String} password a users password
 * @apiParam {String} [username] a username *unique, if none provided, email will be used
 * 
 * @apiParamExample {json} Request-Body-Example:
 *  {
 *      "first":"Charles",
 *      "last":"Bryan",
 *      "email":"cfb3@fake.email",
 *      "password":"test12345"
 *  }
 * 
 * @apiSuccess (Success 201) {boolean} success true when the name is inserted
 * @apiSuccess (Success 201) {String} email the email of the user inserted 
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: Username exists) {String} message "Username exists"
 * 
 * @apiError (400: Email exists) {String} message "Email exists"
 *  
 * @apiError (400: Other Error) {String} message "other error, see detail"
 * @apiError (400: Other Error) {String} detail Information about th error
 * 
 */ 
router.post('/', async (request, response) => {

    const email = request.body.email
    const password = request.body.password

    if(isStringProvided(email) && isStringProvided(password)) {

        let theQuery = "SELECT Salt, Credentials.MemberID FROM Credentials INNER JOIN Members ON Credentials.MemberID = Members.MemberID WHERE Members.Email = $1"
        let values = [email]
        await pool.query(theQuery, values)
            .then(result => {
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
 * @api {post} /auth Request to register a user
 * @apiName PostAuth
 * @apiGroup Auth
 * 
 * @apiParam {String} first a users first name
 * @apiParam {String} last a users last name
 * @apiParam {String} email a users email *unique
 * @apiParam {String} password a users password
 * @apiParam {String} [username] a username *unique, if none provided, email will be used
 * 
 * @apiParamExample {json} Request-Body-Example:
 *  {
 *      "first":"Charles",
 *      "last":"Bryan",
 *      "email":"cfb3@fake.email",
 *      "password":"test12345"
 *  }
 * 
 * @apiSuccess (Success 201) {boolean} success true when the name is inserted
 * @apiSuccess (Success 201) {String} email the email of the user inserted 
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: Username exists) {String} message "Username exists"
 * 
 * @apiError (400: Email exists) {String} message "Email exists"
 *  
 * @apiError (400: Other Error) {String} message "other error, see detail"
 * @apiError (400: Other Error) {String} detail Information about th error
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