const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Partenaire = sequelize.define('Partenaire', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Ou true si facultatif
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
  montant_preter: {
    type: DataTypes.INTEGER, // Champ normal sans auto-incrément
    allowNull: false,
    defaultValue: 0, // Vous pouvez définir une valeur par défaut si nécessaire
  },
});

module.exports = Partenaire;
