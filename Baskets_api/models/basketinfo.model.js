module.exports = (sequelize, Sequelize) => {
    const basketinfo = sequelize.define("basketinfos", {
      idBook: {
        type: Sequelize.INTEGER
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      author: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      }
    });
  
    return basketinfo;
};