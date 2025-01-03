const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Echange = sequelize.define('Echange', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Ou true si facultatif
  },
  deviseId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Ou true si facultatif
  },
  montant: {
    type: DataTypes.INTEGER,
    allowNull: false, // Ajout de la contrainte pour montant
  },
  type: {
    type: DataTypes.ENUM('ACHAT', 'VENTE'),
    allowNull: false,
    defaultValue: 'ACHAT', // Définir une valeur par défaut
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Définit la date et l'heure actuelles par défaut
  },
});

module.exports = Echange;
