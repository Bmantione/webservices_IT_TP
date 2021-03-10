const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize('postgres://'+config.USER+':'+config.PASSWORD+'@'+config.HOST+'/'+config.DB)

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.book = require("../models/book.model.js")(sequelize, Sequelize);

module.exports = db;