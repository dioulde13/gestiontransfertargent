// const { Sequelize } = require('sequelize');

// // Initialisation de Sequelize
// const sequelize = new Sequelize('transfert', 'root', 'mysql@123', {
//   host: '127.0.0.1',
//   dialect: 'mysql',
// });

// // Vérification de la connexion
// sequelize
//   .authenticate()
//   .then(() => console.log('Connexion réussie à la base de données'))
//   .catch((error) => console.error('Erreur de connexion :', error));

// module.exports = sequelize;

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

