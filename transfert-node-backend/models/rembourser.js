const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Utilisateur = require('./utilisateurs'); 
const Partenaire = require('./partenaires'); 
const Devise = require('./devises'); 


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
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prix_1: {
    type: DataTypes.BIGINT,
    allowNull: false, // Ajout de la contrainte pour montant
  },
  prix_2: {
    type: DataTypes.BIGINT,
    allowNull: false, // Ajout de la contrainte pour montant
  },
  sign_1: {
    type: DataTypes.BIGINT,
    allowNull: false, // Ajout de la contrainte pour montant
  },
  sign_2: {
    type: DataTypes.BIGINT,
    allowNull: false, // Ajout de la contrainte pour montant
  },
    montant: {
    type: DataTypes.BIGINT,
    allowNull: false, // Ajout de la contrainte pour montant
  },
  montant_gnf: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Définit la date et l'heure actuelles par défaut
  },
});

// Définir l'association : Une Entree appartient à un 
Rembourser.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });
// Définir l'association : Une Entree appartient à un 
Rembourser.belongsTo(Partenaire, { foreignKey: 'partenaireId' });

Rembourser.belongsTo(Devise, { foreignKey: 'deviseId' });


module.exports = Rembourser;
