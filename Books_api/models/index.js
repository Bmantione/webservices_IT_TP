const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
    host: config.HOST,
    dialect: 'mariadb'
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.book = require("../models/book.model.js")(sequelize, Sequelize);

module.exports = db;