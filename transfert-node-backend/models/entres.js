const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Entre = sequelize.define('Entre', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
    type: DataTypes.ENUM('NON PAYEE', 'PAYEE', 'ANNULEE'),
    allowNull: false,
    defaultValue: 'NON PAYEE', // Définir une valeur par défaut
  },
});

module.exports = Entre;
