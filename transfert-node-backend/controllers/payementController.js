const Utilisateur = require('../models/utilisateurs'); // Modèle Utilisateur
const Entre = require('../models/entres'); // Modèle Partenaire
const Payement = require('../models/payement');

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

    // Calcul du montant_due
    const montant_due = montant;
    const soldeCaise = montant_due; // Solde ajouté à l'utilisateur connecté

    // Ajouter une entrée dans la table Payement
    const payement = await Payement.create({
      utilisateurId,
      entreId: entre.id, // Inclure entreId
      code: code, // Inclure entreId
      montant,
    });

    // Mettre à jour le solde de l'utilisateur connecté
    utilisateur.solde = (utilisateur.solde || 0) + soldeCaise;
    await utilisateur.save();

    // Mettre à jour le montant payé et restant dans l'entrée
    entre.montant_payer = (entre.montant_payer ?? 0) + montant_due;
    entre.montant_restant = (entre.montant_gnf ?? 0) - entre.montant_payer;

    // Vérification du montant restant pour définir le type de paiement
    if (entre.montant_restant === 0) {
      entre.payement_type = "COMPLET";
    }

    // Enregistrement des modifications
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
          attributes: ['id', 'code', 'expediteur','pays_dest', 'montant_cfa', 'montant_payer', 'montant_restant'], // Champs à inclure pour le partenaire
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

module.exports = { ajouterPayement, listerPayement };
