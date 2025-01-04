const express = require('express');
const deviseController = require('../controllers/deviseController');

const router = express.Router();

// Route pour ajouter une devise
router.post('/create', deviseController.ajouterDevise);

// Route pour récupérer la liste des devises
router.get('/liste', deviseController.recupererDevises);

module.exports = router;
