const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./models/sequelize');
const utilisateurRoutes = require('./routes/utilisateurRoutes');

const app = express();
app.use(bodyParser.json());

// Synchronisation avec la base de données
sequelize
  .sync({ alter: true})
  .then(() => console.log('Tables créées avec succès'))
  .catch((error) => console.error('Erreur lors de la création des tables :', error));

// Utilisation des routes
app.use('/api/utilisateurs', utilisateurRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
