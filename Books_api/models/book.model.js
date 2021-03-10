module.exports = (sequelize, Sequelize) => {
    const book = sequelize.define("books", {
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
  
    return book;
};