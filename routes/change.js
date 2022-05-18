const express = require('express')
const { noExceptions } = require('npm/lib/utils/parse-json')

const pool = require('../utilities').pool

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided

const generateHash = require('../utilities').generateHash
const generateSalt = require('../utilities').generateSalt

const router = express.Router()

/**
 * @api {post} /change Request to change a users password
 * @apiName ChangeRequest
 * @apiGroup Change
 * 
 * @apiParam {String} email a users email *unique
 * @apiParam {String} oldPassword the users current password
 * @apiParam {String} newPassword the users new password
 * 
 * @apiSuccess {String} message "Password successfully changed!"
 * 
 *  * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Password successfully changed!"
 *     }
 * 
 * @apiError (404: User Not Found) {String} message "User not found"
 * 
 * @apiError (400: Invalid Credentials) {String} message "Credentials did not match"
 * 
 */ 
router.post('/', async (request, response, next) => {

    const email = request.body.email
    const oldPassword = request.body.oldPassword

    if(isStringProvided(email) && isStringProvided(oldPassword)) {
        let theQuery = "SELECT saltedhash, salt, Credentials.memberid, Members.verification FROM Credentials INNER JOIN Members ON Credentials.memberid=Members.memberid WHERE Members.email=$1"
        await pool.query(theQuery, [email])
            .then(result => {
                let salt = result.rows[0].salt
                request.oldSalt = salt
                let storedSaltedHash = result.rows[0].saltedhash
                let providedSaltedHash = generateHash(oldPassword, salt)
                if (storedSaltedHash === providedSaltedHash) {
                    next()
                } else {
                    response.status(400).send({
                        message: 'Credentials did not match'
                    })
                }
            })
            .catch((err) => {
                //log the error
                console.log("Error on SELECT************************")
                console.log(err)
                console.log("************************")
                console.log(err.stack)
                response.status(400).send({
                    message: err.detail
                })
            })
    }
}, async (request, response) => {
    let salt = generateSalt(32)
    let salted_hash = generateHash(request.body.newPassword, salt)
    let theQuery = "UPDATE Credentials SET Salt = $1, SaltedHash = $2 WHERE Salt = $3"
    await pool.query(theQuery, [salt, salted_hash, request.oldSalt])
        .then(result => {
            response.status(200).send({
                message: "Password successfully changed!"
            })
        })
        .catch((err) => {
            response.status(404).send({
                message: "User not found"
            })
        })
})

module.exports = router