const express = require('express');
const sortieController = require('../controllers/sortieController');

const router = express.Router();

// Route pour ajouter une sortie
router.post('/create', sortieController.ajouterSortie);

// Route pour récupérer la liste des sorties avec les informations des utilisateurs et des partenaires associés
router.get('/liste', sortieController.recupererSortiesAvecAssocies);

router.get('/compte', sortieController.compterSortieDuJour);

router.put("/annuler/:code", sortieController.annulerSortie);

router.put("/valider/:id", sortieController.validerSortie);

module.exports = router;
