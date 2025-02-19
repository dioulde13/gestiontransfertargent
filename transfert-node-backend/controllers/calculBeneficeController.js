const express = require('express');
const { Op } = require('sequelize');
const Entre = require('../models/entres');  // Le modèle Entre
const app = express();
app.use(express.json());

const calculBenefice = async (req, res) => {
  const { dateDebut, dateFin, montant, prix_1, prix } = req.body;

  if (!dateDebut || !dateFin) {
    return res.status(400).json({ message: 'Tous les paramètres sont requis.' });
  }

  try {
    // Convertir les dates en format Date
    const startDate = new Date(dateDebut);
    const endDate = new Date(dateFin);

    // Calculer le montant total en CFA et en GNF
    let totalMontantCfa = 0;
    let totalMontantGnf = 0;

    const entreData = await Entre.findAll({
      where: {
        date_creation: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    entreData.forEach(entry => {
      if (entry.status !== 'ANNULEE') {
          totalMontantCfa += entry.montant_cfa;
          totalMontantGnf += entry.montant_gnf;
      }
    });

    // Calcul du montant total en GNF pour le montant CFA saisi par l'utilisateur en utilisant prix_1
    const montantGnfSaisi = (montant / prix_1) * prix;

    return res.json({
      totalMontantCfa,
      totalMontantGnf,
      montantGnfSaisi,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

module.exports = { calculBenefice };

