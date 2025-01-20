const Rembourser = require('../models/rembourser'); // Modèle Rembourser
const Utilisateur = require('../models/utilisateurs'); // Modèle Utilisateur
const Partenaire = require('../models/partenaires'); // Modèle Partenaire

// Ajouter une nouvelle entrée dans la table Rembourser
const ajouterRemboursement = async (req, res) => {
  try {
    const { utilisateurId, partenaireId, montant } = req.body;

    // Vérification des champs requis
    if (!utilisateurId || !partenaireId || !montant) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    // Vérifier si le partenaire existe
    const partenaire = await Partenaire.findByPk(partenaireId);
    if (!partenaire) {
      return res.status(404).json({ message: 'Partenaire introuvable.' });
    }

     // Calcul du montant_preter
     const montant_due = montant;
     console.log(partenaire.montant_preter);


    // Ajouter une entrée dans la table Rembourser
    const remboursement = await Rembourser.create({
      utilisateurId,
      partenaireId,
      montant,
    });

     // Mettre à jour le montant_preter du partenaire
     partenaire.montant_preter = (partenaire.montant_preter || 0) - montant_due;
     console.log(partenaire.montant_preter);
     await partenaire.save(); // Sauvegarder les modifications dans la base de données
 

    res.status(201).json({
      message: 'Remboursement ajouté avec succès.',
      remboursement,
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du remboursement :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

// Lister toutes les entrées de la table Rembourser avec associations
const listerRemboursements = async (req, res) => {
  try {
    const remboursements = await Rembourser.findAll({
      include: [
        {
          model: Utilisateur,
          attributes: ['id', 'nom', 'prenom', 'email'], // Champs à inclure pour l'utilisateur
        },
        {
          model: Partenaire,
          attributes: ['id', 'nom', 'prenom', 'montant_preter'], // Champs à inclure pour le partenaire
        },
      ],
    });

    if (remboursements.length === 0) {
      return res.status(404).json({ message: 'Aucun remboursement trouvé.' });
    }

    res.status(200).json(remboursements);
  } catch (error) {
    console.error('Erreur lors de la récupération des remboursements :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

module.exports = { ajouterRemboursement, listerRemboursements };
