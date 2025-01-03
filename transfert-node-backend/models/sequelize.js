
const { Sequelize } = require('sequelize');
const dbConfig = require('../config/dbConfig');

// Configuration Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: 'mysql',
    port: dbConfig.port,
    logging: false, // Désactive les logs pour rendre la sortie plus propre
  }
);

module.exports = sequelize;

