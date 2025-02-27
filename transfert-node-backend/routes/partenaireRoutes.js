const express = require('express');
const partenaireController = require('../controllers/partenaireController');

const router = express.Router();

// Route pour ajouter un partenaire
router.post('/create', partenaireController.ajouterPartenaire);

// Route pour récupérer la liste des partenaires
router.get('/liste', partenaireController.recupererPartenaires);

router.put('/rembourserDevise/:id', partenaireController.rembourserDevise);


module.exports = router;
