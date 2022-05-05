//express is the framework we're going to use to handle requests
const express = require('express')

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

module.exports = router