const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Utilisateur = sequelize.define('Utilisateur', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Définit la date et l'heure actuelles par défaut
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'UTILISATEUR'),
    allowNull: false,
    defaultValue: 'ADMIN', // Définir une valeur par défaut
  },
});

module.exports = Utilisateur;
