const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./models/sequelize');
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const partenaireRoutes = require('./routes/partenaireRoutes');
const deviseRoutes = require('./routes/deviseRoutes'); // Importer les routes des devises
const entreRoutes = require('./routes/entreRoutes'); // Importer les routes des entrées

const app = express();
app.use(bodyParser.json());


app.use(cors({
  origin: 'http://localhost:4200', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

// Synchronisation avec la base de données
sequelize
  .sync({ 
    alter: true
    // force: true
  })
  .then(() => console.log('Tables créées avec succès'))
  .catch((error) => console.error('Erreur lors de la création des tables :', error));

// Utilisation des routes
app.use('/api/utilisateurs', utilisateurRoutes);

// Utilisation des routes
app.use('/api/partenaires', partenaireRoutes);

// Utilisation des routes pour les devises
app.use('/api/devises', deviseRoutes);

// Utilisation des routes pour les entrées
app.use('/api/entrees', entreRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
