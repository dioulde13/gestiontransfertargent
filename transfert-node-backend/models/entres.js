const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Entre = sequelize.define('Entre', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Ou true si facultatif
  },
  partenaireId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Ou true si facultatif
  },
  deviseId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Ou true si facultatif
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Définit la date et l'heure actuelles par défaut
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expediteur: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  receveur: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telephone_receveur: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payement_type: {
    type: DataTypes.ENUM('COMPLET', 'NON COMPLET'),
    allowNull: false,
    defaultValue: 'NON COMPLET', // Définir une valeur par défaut
  },
  status: {
    type: DataTypes.ENUM('NON PAYEE', 'PAYEE','CREDIT', 'ANNULEE'),
    allowNull: false,
    defaultValue: 'NON PAYEE', // Définir une valeur par défaut
  },
});

module.exports = Entre;
