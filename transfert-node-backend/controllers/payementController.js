const Utilisateur = require('../models/utilisateurs'); // Modèle Utilisateur
const Entre = require('../models/entres'); // Modèle Partenaire
const Payement = require('../models/payement');

// Ajouter une nouvelle entrée dans la table Rembourser
const ajouterPayement = async (req, res) => {
  try {
    const { utilisateurId, entreId, montant } = req.body;

    // Vérification des champs requis
    if (!utilisateurId || !entreId || !montant) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    // Vérifier si le entre existe
    const entre = await Entre.findByPk(entreId);
    if (!entre) {
      return res.status(404).json({ message: 'Entre introuvable.' });
    }

    // Calcul du montant_preter
    const montant_due = montant;
    console.log(entre.montant_gnf);


    // Ajouter une entrée dans la table Rembourser
    const payement = await Payement.create({
      utilisateurId,
      entreId,
      montant,
    });

    // Mettre à jour le montant_preter du partenaire
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
          attributes: ['id', 'code', 'expediteur', 'montant_cfa', 'montant_payer', 'montant_restant'], // Champs à inclure pour le partenaire
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
