const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./models/sequelize');
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const partenaireRoutes = require('./routes/partenaireRoutes');
const deviseRoutes = require('./routes/deviseRoutes'); // Importer les routes des devises
const entreRoutes = require('./routes/entreRoutes'); // Importer les routes des entrées
const sortieRoutes = require('./routes/sortieRoute'); // Importer les routes des entrées
const rembourserRoutes = require('./routes/rembourserRoutes'); // Importer les routes des entrées
const payementRoutes = require('./routes/payementRoutes'); // Importer les routes des entrées
const authRoutes = require('./routes/authRoute'); // Importer les routes des entrées
const depenseRoute = require('./routes/depenseRoute'); // Importer les routes des entrées
const creditRoute = require('./routes/creditRoute'); // Importer les routes des entrées
const payementCreditRoute = require('./routes/payementCreditRoute'); // Importer les routes des entrées
const echangeRoute = require('./routes/echangeRoute'); // Importer les routes des entrées
const payementEchangeRoute = require('./routes/payementEchangeRoute'); // Importer les routes des entrées
const beneficeRoute = require('./routes/beneficeRoute'); // Importer les routes des entrées
const calculBeneficeRoute = require('./routes/calculBeneficeRoute'); // Importer les routes des entrées




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

// Utilisation des routes pour les sortie
app.use('/api/sorties', sortieRoutes); 

// Utilisation des routes pour les sortie
app.use('/api/rembourser', rembourserRoutes);

app.use('/api/payement', payementRoutes);

app.use('/api/payementCredit', payementCreditRoute);


app.use('/api/depense', depenseRoute);

app.use('/api/echange', echangeRoute);

app.use('/api/payementEchange', payementEchangeRoute);

app.use('/api/credit', creditRoute);

app.use('/api/benefices', beneficeRoute);

app.use('/api/calculBenefices', calculBeneficeRoute);

app.use('/api/auth', authRoutes);



const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
