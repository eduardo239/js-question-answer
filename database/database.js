const Sequelize = require('sequelize');
const connection = new Sequelize('db_perguntas', 'root', '123', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = connection;
