const Sequelize = require('sequelize');
const sequelize = new Sequelize("mysql://root@localhost:3306/home_banking");

module.exports = { sequelize, Sequelize }