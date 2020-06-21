const Sequelize = require('sequelize');
const sequelize = new Sequelize("mysql://alejo:alejo@192.168.64.2:3306/home_banking");

module.exports = { sequelize, Sequelize }