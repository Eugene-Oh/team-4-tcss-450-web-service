//express is the framework we're going to use to handle requests
const { response } = require('express')
const express = require('express')
const { noExceptions } = require('npm/lib/utils/parse-json')
const sendEmail = require('../utilities').sendEmail

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const router = express.Router()

router.get('/:id', async (request, response) => {
    const { id } = request.params
    const theQuery = `UPDATE members SET verification=1 WHERE memberid=$1`
    
    await pool.query(theQuery, [id])
        .then(result => {
            response.status(200).send({
                message: "success",
                success: true,
            })
        })
        .catch((error) => {
            response.status(400).send({
                message: "FAILED"
            })
        })
})

router.post('/email', (request, response) => {
    const email = request.body.email
    let link = "https://team-4-tcss-450-web-service.herokuapp.com/verify/" + request.body.memberid
    sendEmail("team4tcss450@gmail.com", email,"Welcome to our App!", "Please verify your Email account.\n" + link)
    response.status(200).send({
        message: "success"
    })
})


module.exports = router
