require('dotenv').config()
const express = require("express")
const bodyParser = require('body-parser')
const app = express()
const Sequelize = require('sequelize');
const models = require('./functions/models')
const routes = require('./functions/routes')
const cors = require("cors")

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cors());

const sequelize = new Sequelize(process.env.POSTGRES, {logging:false});
const {User, Admin, Transactions} = models(sequelize)
sequelize.sync()  ///process.env.NODE_ENV=='production'?true:false

routes(app, User, Admin, Transactions, sequelize)

app.listen(5000, ()=>{
    console.log("listening on port 5000")
})

setTimeout(()=>{}, 5000)
module.exports = app
