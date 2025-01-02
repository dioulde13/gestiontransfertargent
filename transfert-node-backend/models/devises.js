const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Devise = sequelize.define('Devise', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true, // Un seul champ peut être la clé primaire
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Définit la date et l'heure actuelles par défaut
  },
  paysDepart: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paysArriver: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  signe_1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  signe_2: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prix: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Devise;
