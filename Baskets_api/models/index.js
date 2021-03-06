const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
    host: config.HOST,
    dialect: 'mariadb'
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.basket = require("../models/basket.model.js")(sequelize, Sequelize);
db.basketinfo = require("../models/basketinfo.model.js")(sequelize, Sequelize);

db.basket.hasMany(db.basketinfo, {
    foreignKey: 'basketId'
});

module.exports = db;