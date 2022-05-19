const express = require('express')

const pool = require('../utilities').pool

const validation = require('../utilities').validation

const router = express.Router()

/** 
 * @api {get} /contact Request get contacts
 * @apiName GetContact
 * @apiGroup Contact
 * 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * @apiSuccess (Success 200) {JSONArray[]} the list of contacts of a user
 * 
 *  * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "success": true,
 *       "message": "Authentication successful!",
 *       "token": "eyJhbGciO...abc123"
 *     }
 * 
 * @apiError (400: Error) {String} message "error"
 * 
 */
 router.get('/', (request, response) => {

    let userInfo = request.decoded;

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

/** 
 * @api {post} /contact Add a contact
 * @apiName PostContact
 * @apiGroup Contact
 * 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * @apiSuccess (Success 200) {JSONObject} newContact the contact added
 * @apiSuccess (Success 200) {String} message "contact successfully added"
 * 
 *  * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "newContact": result.rows[0]
 *       "message": "Authentication successful!"
 *     }
 * 
 * @apiError (400: User not found) {String} message "email doesnt exist in system"
 * 
 * @apiError (400: SQL error) {String} message "error checking if member is alread a contact"
 * 
 * @apiError (400: Failed to add member) {String} message "failed to add member"
 * 
 * @apiError (400: User not found) {String} message "Member does not exist"
 * 
 */
router.post('/', (request, response, next) => {

    const getMemBIDQuery = "SELECT MemberID FROM Members WHERE Email = $1";

    pool.query(getMemBIDQuery, [request.body.email])
        .then(result => {
            request.body.memberid = result.rows[0].memberid
            next();
        })
        .catch((error) => {{
            response.status(400).send({
                message: "email doesnt exist in system"
            })
        }})
}, (request, response, next) => {
    const checkQuery = "SELECT * FROM Contacts WHERE memberid_a = $1 AND memberid_b=$2"
    pool.query(checkQuery, [request.decoded.memberid, request.body.memberid])
        .then(result => {
            if(result.rows.length > 0) {
                response.status(400).send({
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
}, (request, response) =>{
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

/** 
 * @api {post} /contact/delete Delete a contact
 * @apiName DeleteContact
 * @apiGroup Contact
 * 
 * @apiParam {String} email the users email
 * 
 *  * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "message": "successfully removed contact"
 *     }
 * 
 * @apiError (400: User not found) {String} message "email doesnt exist in system"
 * 
 * @apiError (400: SQL error) {String} message "error checking if member is alread a contact"
 * 
 * @apiError (400: Failed to add member) {String} message "error removing member from contact"
 * 
 */
router.post('/delete', (request, response, next) => {
    const getMemBIDQuery = "SELECT MemberID FROM Members WHERE Email = $1";
    pool.query(getMemBIDQuery, [request.body.email])
        .then(result => {
            request.body.memberid = result.rows[0].memberid
            next();
        })
        .catch((error) => {{
            response.status(400).send({
                message: "email doesnt exist in system"
            })
        }})
}, (request, response, next) => {
    const checkQuery = "SELECT * FROM Contacts WHERE memberid_a = $1 AND memberid_b=$2"
    pool.query(checkQuery, [request.decoded.memberid, request.body.memberid])
        .then(result => {
            if(result.rows.length > 0) {
                next()
            } else if (result.rows.length === 0) {
                response.status(400).send({
                    message: "This contact is not a contact"
                })
            }
        })
        .catch((error) => {
            response.status(400).send({
                message:"error checking if member is already a contact"
            })
        }) 

}, (request, response, next) => {
    const deleteQuery = "DELETE FROM Contacts WHERE memberid_a = $1 AND memberid_b=$2"
    pool.query(deleteQuery, [request.decoded.memberid, request.body.memberid])
        .then(result => {
            response.status(200).send({
                message:"successfully remove from contact"
            })
        })
        .catch((error) => {
            response.status(400).send({
                message:"error removing member from contact"
            })
        })
})

/** 
 * @api {get} /contact/:email Get contact information
 * @apiName GetContact
 * @apiGroup Contact
 * 
 * @apiParam {String} email the users email
 * 
 * @apiSuccess (200: Success) {JSONObject} result.rows[0]
 * 
 * @apiError (400: User not found) {String} message "error"
 * 
 */
router.get('/:email', (request, response, next) => {
    const {email} = request.params;
    //console.log(request.decoded.email);
    // console.log(request.decoded)
    //let userInfo = request.decoded;
    //console.log(userInfo.memberid);
    //const theQuery = "SELECT * FROM Members INNER JOIN messages ON messages.memberid = members.memberid WHERE members.email = $1";
        //get memeberBid using email
        const getMemBIDQuery = "SELECT MemberID FROM Members WHERE Email = $1";
        pool.query(getMemBIDQuery, [email])
            .then(result => {
                request.body.memberid = result.rows[0].memberid;
                next();
            })
            .catch((error) => {{
                response.status(400).send({
                    message: "email doesnt exist in system"
                })
            }})
}, (request, response, next) =>{
    // get nummber of messages
    const theQuery = "Select Count(*) from messages where memberid = $1"
    pool.query(theQuery, [request.body.memberid])
        .then(result => {
            // response.status(200).send(result.rows[0]);
            request.body.numOfMessages = result.rows[0].count;
            next();
        })
        .catch((error) => {
            response.status(400).send({
                message: "error"
            })
        })
}, (request, response, next) => {
    // get number of contact
    const theQuery = "Select count(*) from contacts where memberid_a = $1"
    pool.query(theQuery, [request.body.memberid])
        .then(result => {
            request.body.numOfContact = result.rows[0].count;
            next();
            
        })
        .catch((error) => {
            response.status(400).send({
                message: "error"
            })
        })
},(request, response, next) => {
    // get memberinfo
    const theQuery = "Select * from members where memberid = $1"
    pool.query(theQuery, [request.body.memberid])
        .then(result => {
            response.status(200).send({
                numOfContact: request.body.numOfContact,
                numOfMessages: request.body.numOfMessages,
                userInfo: result.rows[0]
            })
        })
        .catch((error) => {
            response.status(400).send({
                message: "error"
            })
        })
})

module.exports = router