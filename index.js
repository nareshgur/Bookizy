const winston = require('winston')
const express = require("express")
const app = express()


require('dotenv').config()
require('./src/config/routes')(app)
require('./src/config/db')()



const port = process.env.port || 3000

const server = app.listen(port, ()=>{
    console.log(`The server listening ${port} .....`);
    winston.info(`The server listening ${port} .....`);
    
})

module.exports = server


