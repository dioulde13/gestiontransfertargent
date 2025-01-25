const Rembourser = require('../models/rembourser'); // Modèle Rembourser
const Utilisateur = require('../models/utilisateurs'); // Modèle Utilisateur
const Partenaire = require('../models/partenaires'); // Modèle Partenaire
const Devise = require('../models/devises');

// Ajouter une nouvelle entrée dans la table Rembourser
const ajouterRemboursement = async (req, res) => {
  try {
    const { utilisateurId, deviseId, partenaireId, nom, prix, montant } = req.body;

    // Vérification des champs requis
    if (!utilisateurId || !partenaireId || !deviseId || !nom || !prix || !montant) {
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

     // Récupérer les informations de la devise
     const devise = await Devise.findByPk(deviseId);
     if (!devise) {
       return res.status(404).json({ message: 'Devise introuvable.' });
     }

     const Prix1 = devise.prix_1 || 0;
     const Prix2 = devise.prix_2 || 0;
     const Sign1 = devise.signe_1;
     const Sign2 = devise.signe_2;

     // Calcul du montant_preter
     const montant_due = (montant / Prix1) * Prix2; // Calcul du montant dû
     console.log(partenaire.montant_preter);

     const soldeCaise =  montant_due; // Solde ajouté à l'utilisateur connecté



    // Ajouter une entrée dans la table Rembourser
    const remboursement = await Rembourser.create({
      utilisateurId,
      partenaireId,
      deviseId,
      montant_gnf: montant_due,
      montant,
      signe_1: Sign1,
      signe_2: Sign2,
      prix_1: Prix1,
      prix_2: Prix2,
    });

    // Mettre à jour le solde de l'utilisateur connecté
    utilisateur.solde = (utilisateur.solde || 0) - soldeCaise;
    await utilisateur.save();

     // Mettre à jour le montant_preter du partenaire
     partenaire.montant_preter = (partenaire.montant_preter || 0) - montant;
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
        {
          model: Devise,
          attributes: ['id', 'paysDepart', 'paysArriver', 'signe_1', 'signe_2', 'prix_1', 'prix_2'], // Champs nécessaires de la devise
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
