module.exports = (sequelize, Sequelize) => {
    const basketinfo = sequelize.define("basketinfos", {
      idBook: {
        type: Sequelize.INTEGER
      }
    });
  
    return basketinfo;
};