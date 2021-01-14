const Sequelize = require('sequelize');

function models(sq) {
    //model for user
    const User = sq.define('user', {
        // attributes
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    firstName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email:{
        type: Sequelize.STRING,
        allowNull: false,
        isEmail: true,
    },
    country:{
        type: Sequelize.STRING,
        allowNull: false
    },
    currency:{
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "USD"
    },
    currency1:{
        type: Sequelize.STRING,
        defaultValue: null
    },
    currency2:{
        type: Sequelize.STRING,
        defaultValue: null
    },
    currency3:{
        type: Sequelize.STRING,
        defaultValue: null
    },
    level:{
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Noob"
    },
    balance:{
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: "0.00"
    },
    balance1:{
        type: Sequelize.FLOAT,
        defaultValue: null
    },
    balance2:{
        type: Sequelize.FLOAT,
        defaultValue: null
    },
    balance3:{
        type: Sequelize.FLOAT,
        defaultValue: null
    },
    password:{
        type: Sequelize.STRING,
        allowNull: false
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
    }, {
        freezeTableName: true,
      })

    const Admin = sq.define("admin", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        firstName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email:{
            type: Sequelize.STRING,
            allowNull: false,
            isEmail: true,
        },
        country:{
            type: Sequelize.STRING,
            allowNull: false
        },
        password:{
            type: Sequelize.STRING,
            allowNull: false
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
    }, {
        freezeTableName: true,
      })

    const Transactions = sq.define('transactions', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        userId:{
            type: Sequelize.INTEGER,
            allowNull: false
        },
        recipientId:{
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        amount:{
            type: Sequelize.REAL,
            allowNull: false,
        },
        credit:{
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        currency:{
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: "USD"
        },
        name:{
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: "anonymous"
        },
        status:{
            type: Sequelize.STRING,
            allowNull: false,
        },
        approved:{
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        type:{
            type: Sequelize.STRING,
            allowNull: false,
        },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }, {
        freezeTableName: true,
      })
    
    User.hasMany(Transactions , {foreignKey: 'userId'})
    //sq.sync({force: process.env.NODE_ENV=='development'?false:true})
    
    return {User, Admin, Transactions}
}
module.exports = models
