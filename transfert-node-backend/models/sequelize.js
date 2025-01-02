const { Sequelize } = require('sequelize');

// Initialisation de Sequelize
const sequelize = new Sequelize('transfert', 'root', 'mysql@123', {
  host: '127.0.0.1',
  dialect: 'mysql',
});

// Vérification de la connexion
sequelize
  .authenticate()
  .then(() => console.log('Connexion réussie à la base de données'))
  .catch((error) => console.error('Erreur de connexion :', error));

module.exports = sequelize;
