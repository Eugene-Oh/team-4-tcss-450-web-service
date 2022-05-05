//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const router = express.Router()

router.get('/:MemberID', (request, response) => {
    const { id } = request.params
    const theQuery = `UPDATE Members SET verification=1 WHERE memberid=$1`
    pool.query(theQuery, id)
        .then(result => {
            response.status(201).send({
                message: "success",
                success: true,
            })
        })
        .catch((error) => {
            console.log(theQuery);
            response.status(400).send({
                message: "failure"
            })
        })
})

module.exports = router