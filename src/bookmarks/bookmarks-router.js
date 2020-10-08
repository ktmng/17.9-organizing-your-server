const express = require('express')
const { v4: uuid } = require('uuid')
const logger = require ('../logger')
const { bookmarks } = require('../store')

const bookmarksRouter = express.Router()
const bodyParser = express.json()


//R2. Write a route handler for the endpoint 
//    GET /bookmarks that returns a list of bookmarks
bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks);
    })
//R4. Write a route handler for POST /bookmarks that 
//    accepts a JSON object representing a bookmark and 
//    adds it to the list of bookmarks after validation.
    .post(bodyParser, (req, res) => {
        //get data from the body:
        const { title, url, rating } = req.body;
        //validatie all 3: title/url/rating exist: 
        if (!title) {
            logger.error(`title is required`)
            return res.status(400).send('invalid data, title is required');
        }
        if (!url) {
            logger.error(`url is required`)
            return res.status(400).send('invalid data, url is required');
        }
        if (!rating) {
            logger.error(`rating is Required`)
            return res.status(400).send('invalid data, rating is required');
        }
        //validate rating is a # 
        if (rating) {
            const numRating = parseFloat(rating);
            if (Number.isNaN(numRating)) {
                return res.status(400).send('rating must be a #');
            }
            if (numRating < 0 || numRating > 5) {
                return res.status(400).send('rating must be between 0-5')
            }
        }
        //all 3 exist, generate id, push bmk obj into array:
        const id = uuid();
        const bookmark = {
            id, 
            title,
            url,
            rating
        };
        bookmarks.push(bookmark)
        //log bmk creation, send response, include location header:
        logger.info(`bookmark with id ${id} created`)
        res.status(201)
        .location(`http://localhost:8000/bookmarks/${id}`)
        .json(bookmark)
    })

//R3. Write a route handler for the endpoint 
//    GET /bookmarks/:id that returns a single bookmark
//    with the given ID, return 404 Not Found 
//    if the ID is not valid
bookmarksRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params; 
        const bookmark = bookmarks.find(bookmark => bookmark.id == id);
        //make sure you found the bookmark 
        //error msg: 
        if (!bookmark) {
            logger.error(`bookmark with the id ${id} cannot be found`)
            return res.status(404).send('sorry, bookmark not found')
        }
        res.json(bookmark)
    })
//R5. Write a route handler for the endpoint 
//    DELETE /bookmarks/:id that deletes the bookmark 
//    with the given ID.
    .delete((req, res) => {
        const { id } = req.params; 
        const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.id == id);
        if (bookmarkIndex === -1) {
            logger.error(`bookmark with id ${id} cannot be found`)
            return res.status(404).send('sorry, bookmark not found')
        }
        //remove bookmark from bookmarks 
        bookmarks.splice(bookmarkIndex, 1);
        logger.info(`bookmark with id ${id} deleted`)
        
        res.status(204).end();
    })


//export all routers
module.exports = bookmarksRouter