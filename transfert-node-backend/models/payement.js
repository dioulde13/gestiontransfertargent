const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Utilisateur = require('./utilisateurs'); 
const Entre = require('./entres'); 


const Payement = sequelize.define('Payement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Ou true si facultatif
  },
  entreId: {
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
  montant: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  }
});

// Définir l'association : Une Entree appartient à un 
Payement.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });
// Définir l'association : Une Entree appartient à un 
Payement.belongsTo(Entre, { foreignKey: 'entreId' });

module.exports = Payement;
