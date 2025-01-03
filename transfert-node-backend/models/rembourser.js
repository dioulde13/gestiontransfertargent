const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Rembourser = sequelize.define('Rembourser', {
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
  montant: {
    type: DataTypes.INTEGER,
    allowNull: false, // Ajout de la contrainte pour montant
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Définit la date et l'heure actuelles par défaut
  },
});

module.exports = Rembourser;
