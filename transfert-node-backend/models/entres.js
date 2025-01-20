const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Utilisateur = require('./utilisateurs'); 
const Partenaire = require('./partenaires'); 
const Devise = require('./devises'); 



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
  pays_exp: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Guinée",
  },
  pays_dest: {
    type: DataTypes.STRING,
    allowNull: false,
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
  montant_cfa: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  montant_payer: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  }, 
  montant_restant: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  prix_1: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  prix_2: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  signe_1: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 0,
  },
  signe_2: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 0,
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

// Définir l'association : Une Entree appartient à un 
Entre.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });
// Définir l'association : Une Entree appartient à un 
Entre.belongsTo(Partenaire, { foreignKey: 'partenaireId' });
// Définir l'association : Une Entree appartient à un 
Entre.belongsTo(Devise, { foreignKey: 'deviseId' });

module.exports = Entre;
