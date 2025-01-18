const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Utilisateur = require('./utilisateurs'); 
const Partenaire = require('./partenaires'); 
const Devise = require('./devises'); 

const Sortie = sequelize.define('Sortie', {
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
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pays_exp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pays_dest: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Guinée",
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Définit la date et l'heure actuelles par défaut
  },
  expediteur: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  receveur: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  montant: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
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

// Définir l'association : Une Entree appartient à un 
Sortie.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });
// Définir l'association : Une Entree appartient à un 
Sortie.belongsTo(Partenaire, { foreignKey: 'partenaireId' });
// Définir l'association : Une Entree appartient à un 
Sortie.belongsTo(Devise, { foreignKey: 'deviseId' });

module.exports = Sortie;
