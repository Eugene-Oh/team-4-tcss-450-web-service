//express is the framework we're going to use to handle requests
const { response } = require('express')
const express = require('express')
const { noExceptions } = require('npm/lib/utils/parse-json')
const sendEmail = require('../utilities').sendEmail

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const router = express.Router()

/**
 * @api {get} /verify/:id Verify a member using their member id
 * @apiName GetVerify
 * @apiGroup Verify
 * 
 * @apiHeader {String} authorization "username:password" uses Basic Auth 
 * 
 * @apiSuccess {String} message "success"
 * @apiSuccess {boolean} success true when the verification column is updated
 * 
 *  * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "success"
 *       "success": true
 *     }
 * 
 * @apiError (400: Incorrect member id) {String} message "FAILED"
 * 
 */ 
router.get('/:salt', async (request, response, next) => {
    const { salt } = request.params
    const getMemIdQuery = 'select memberid from Credentials where salt=$1'
    await pool.query(getMemIdQuery, [salt])
        .then(result => {
            request.memberid = result.rows[0].memberid;
            next()
        })
        .catch((error) => {
            response.status(400).send({
                message: "invaild link"
            })
        })
}, async (request, response) => {
    const theQuery = `UPDATE members SET verification=1 WHERE memberid=$1`
    await pool.query(theQuery, [request.memberid])
    .then(result => {

        response.writeHead(200, {'Content-Type': 'text/html'});

        response.write('<h style="text-align: center" >Thank you for verifying your email, you may now close this window</h>'); 

        response.end();
    })
    .catch((error) => {
        response.status(400).send({
            message: "FAILED"
        })
    })
})

module.exports = router
