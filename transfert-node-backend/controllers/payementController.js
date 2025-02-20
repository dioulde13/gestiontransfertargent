const Utilisateur = require('../models/utilisateurs'); // Modèle Utilisateur
const Entre = require('../models/entres'); // Modèle Partenaire
const Payement = require('../models/payement');
const { Sequelize } = require('sequelize');


const ajouterPayement = async (req, res) => {
  try {
    const { utilisateurId, code, montant } = req.body;

    // Vérification des champs requis
    if (!utilisateurId || !code || !montant) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    // Vérifier si l'entrée (Entre) existe à travers le code
    const entre = await Entre.findOne({ where: { code } });
    if (!entre) {
      return res.status(404).json({ message: 'Entre introuvable avec ce code.' });
    }

    // Mettre à jour le solde de l'utilisateur connecté
    utilisateur.solde = (utilisateur.solde || 0) + montant;
    await utilisateur.save();

    const montantEnCoursPayement = montant + entre.montant_payer;
    console.log(montantEnCoursPayement);
    if (montantEnCoursPayement > entre.montant_gnf) {
      return res.status(400).json({ message: 'Le montant payé est supérieur au montant restant.' });
    } else {
      // Mettre à jour le montant payé et restant dans l'entrée
      entre.montant_payer = (entre.montant_payer ?? 0) + montant;
      entre.montant_restant = (entre.montant_gnf ?? 0) - entre.montant_payer;
    }


    // Ajouter une entrée dans la table Payement
    const payement = await Payement.create({
      utilisateurId,
      entreId: entre.id, // Inclure entreId
      code: code, // Inclure entreId
      montant,
    });


    // Vérification du montant restant pour définir le type de paiement
    if (entre.montant_restant === 0) {
      entre.status = "PAYEE";
    } else if (entre.montant_payer < entre.montant_gnf) {
      entre.status = "EN COURS";
    }
    await entre.save();

    res.status(201).json({
      message: 'Payement ajouté avec succès.',
      payement,
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du payement :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

// Compter le nombre d'entrées du jour actuel
const compterPayementDuJour = async (req, res) => {
  try {
    // Obtenir la date actuelle au format YYYY-MM-DD
    const dateActuelle = new Date().toISOString().slice(0, 10);

    const nombrePayement = await Payement.count({
      where: Sequelize.where(
        Sequelize.fn('DATE', Sequelize.col('date_creation')),
        dateActuelle
      )
    });

    res.status(200).json({
      date: dateActuelle,
      nombre_payement: nombrePayement
    });
  } catch (error) {
    console.error('Erreur lors du comptage des sorties du jour :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};



// Lister toutes les entrées de la table Rembourser avec associations
const listerPayement = async (req, res) => {
  try {
    const Payements = await Payement.findAll({
      include: [
        {
          model: Utilisateur,
          attributes: ['id', 'nom', 'prenom', 'email'], // Champs à inclure pour l'utilisateur
        },
        {
          model: Entre,
          attributes: ['id', 'code', 'expediteur', 'pays_dest', 'montant_cfa', 'montant_payer', 'montant_restant'], // Champs à inclure pour le partenaire
        },
      ],
    });

    if (Payements.length === 0) {
      return res.status(404).json({ message: 'Aucun payement trouvé.' });
    }

    res.status(200).json(Payements);
  } catch (error) {
    console.error('Erreur lors de la récupération des payement :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

module.exports = { ajouterPayement, listerPayement, compterPayementDuJour };
