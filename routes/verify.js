//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const router = express.Router()

router.get('/:MemberID', (request, response) => {
    const id = request.params
    const theQuery = `UPDATE Members SET Verification = 1 WHERE MemberID = $1`
    pool.query(theQuery, id)
        .then(result => {
            response.status(201).send({
                success: true,
            })
        })
        .catch((error) => {
            response.status(400).send({
                message: "other error, see detail",
                detail: error.detail
            })
        })
})

module.exports = router