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
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  montant_cfa: {
    type: DataTypes.BIGINT,
    allowNull: false, // Ajout de la contrainte pour montant
  },
  montant_gnf: {
    type: DataTypes.BIGINT,
    allowNull: false, // Ajout de la contrainte pour montant
  },
  prix: {
    type: DataTypes.BIGINT,
    allowNull: false, // Ajout de la contrainte pour montant
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Définit la date et l'heure actuelles par défaut
  },
});

module.exports = Echange;
