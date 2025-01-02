// Importer les modules nécessaires
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const dbConfig = require('./config/dbConfig');
const sequelize = require('./models/sequelize');
const Entre = require('./models/entres');
const Devise = require('./models/devises');
const Echange = require('./models/echanger');
const Partenaire = require('./models/partenaires');
const Rembourser = require('./models/rembourser');
const Sortie = require('./models/sorties');
const Utilisateur = require('./models/utilisateurs');


// Créer une instance d'Express
const server = express();
server.use(bodyParser.json());


// Synchronisation avec la base de données
sequelize
  .sync({ force: true }) // Force recréera les tables à chaque exécution
  .then(() => {
    console.log('Tables créées avec succès jjj');
  })
  .catch((error) => {
    console.error('Erreur lors de la création des tables :', error);
  });

// Créer la connexion à la base de données
const db = mysql.createConnection(dbConfig);

// Établir la connexion à la base de données
db.connect((error) => {
  if (error) {
    console.error('Erreur de connexion à la base de données :', error.message);
  } else {
    console.log('Connexion réussie à la base de données.');
  }
});

// Gérer les erreurs de connexion persistantes
db.on('error', (error) => {
  console.error('Erreur dans la connexion à MySQL :', error.message);
});

// Démarrer le serveur Express
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

module.exports = db;
