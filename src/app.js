require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const logger = require ('./logger')

//1. require the bookmarks router:
const bookmarksRouter = require('./bookmarks/bookmarks-router') 

const app = express()
const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

//R1. Configure logging and API key 
//    handling middleware on the server
app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
  
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        //if the authorization fails, create an error log statement 
        //with some information:
        logger.error(`Unauthorized request to path: ${req.path}`);
      return res.status(401).json({ error: 'Unauthorized request' })
    }
    // move to the next middleware
    next()
})

//2. after validation, import bookmarks router + connect it w/ app.use
app.use(bookmarksRouter)

app.get('/', (req, res) => {
    res.send('Hello, Grader!')
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})
     
module.exports = app