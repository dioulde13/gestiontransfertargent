const Sortie = require('../models/sorties');
const Utilisateur = require('../models/utilisateurs');
const Partenaire = require('../models/partenaires');
const Devise = require('../models/devises');
const { Sequelize} = require('sequelize');


const recupererSortiesAvecAssocies = async (req, res) => {
  try {
    const sorties = await Sortie.findAll({
      include: [
        {
          model: Utilisateur,
          attributes: ['id', 'nom', 'prenom', 'email'], // Champs nécessaires
        },
        {
          model: Partenaire,
          attributes: ['id', 'nom', 'prenom', 'montant_preter'], // Champs nécessaires
        },
        {
          model: Devise,
          attributes: ['id', 'paysDepart', 'paysArriver', 'signe_1', 'signe_2', 'prix_1', 'prix_2'], // Champs nécessaires
        },
      ],
    });

    if (sorties.length === 0) {
      return res.status(404).json({ message: 'Aucune sortie trouvée.' });
    }

    res.status(200).json(sorties);
  } catch (error) {
    console.error('Erreur lors de la récupération des sorties :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

// Compter le nombre d'entrées du jour actuel
const compterSortieDuJour = async (req, res) => {
  try {
    // Obtenir la date actuelle au format YYYY-MM-DD
    const dateActuelle = new Date().toISOString().slice(0, 10);

    const nombreSortie = await Sortie.count({
      where: Sequelize.where(
        Sequelize.fn('DATE', Sequelize.col('date_creation')),
        dateActuelle
      )
    });

    res.status(200).json({
      date: dateActuelle,
      nombre_Sortie: nombreSortie
    });
  } catch (error) {
    console.error('Erreur lors du comptage des sorties du jour :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};


const ajouterSortie = async (req, res) => {
  try {
    const {
      utilisateurId,
      partenaireId,
      deviseId,
      expediteur,
      receveur,
      montant,
      telephone_receveur
    } = req.body;

    if (
      !utilisateurId ||
      !partenaireId ||
      !deviseId ||
      !expediteur ||
      !receveur ||
      !montant ||
      !telephone_receveur
    ) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
    }

    const partenaire = await Partenaire.findByPk(partenaireId);
    if (!partenaire) {
      return res.status(404).json({ message: 'Partenaire introuvable.' });
    }

     // Récupérer les informations de l'utilisateur connecté
     const utilisateur = await Utilisateur.findByPk(utilisateurId);
     if (!utilisateur) {
       return res.status(404).json({ message: 'Utilisateur introuvable.' });
     }

    const devise = await Devise.findByPk(deviseId);
    if (!devise) {
      return res.status(404).json({ message: 'Devise introuvable.' });
    }

    const Prix1 = devise.prix_1 || 0;
    const Prix2 = devise.prix_2 || 0;
    const Sign1 = devise.signe_1;
    const Sign2 = devise.signe_2;

    const montant_due = (montant / Prix1) * Prix2; // Calcul du montant dû
    const soldeCaise = montant_due; // Solde ajouté à l'utilisateur connecté


    const lastEntry = await Sortie.findOne({ order: [['id', 'DESC']] });
    let newCode = 'ABS0001';
    if (lastEntry) {
      const numericPart = parseInt(lastEntry.code?.slice(2), 10);
      if (!isNaN(numericPart)) {
        newCode = `AB${(numericPart + 1).toString().padStart(4, '0')}`;
      }
    }

    const sortie = await Sortie.create({
      utilisateurId,
      partenaireId,
      deviseId,
      pays_exp: devise.paysArriver,
      pays_dest: devise.paysDepart,
      code: newCode,
      expediteur,
      telephone_receveur,
      receveur,
      montant_gnf: montant_due,
      signe_1: Sign1,
      signe_2: Sign2,
      prix_1: Prix1, // Utiliser le prix_1 de Devise par défaut si non fourni
      prix_2: Prix2,
      montant: montant,
    });

      // Mettre à jour le solde de l'utilisateur connecté
      utilisateur.solde = (utilisateur.solde || 0) - soldeCaise;
      await utilisateur.save();

      // Mettre à jour le montant_prêter du partenaire
      partenaire.montant_preter = (partenaire.montant_preter || 0) - montant;
      await partenaire.save();

    return res.status(201).json({
      message: 'Sortie créée avec succès.',
      sortie,
      // montant_preter: partenaire.montant_preter,
    });

  } catch (error) {
    console.error("Erreur lors de l'ajout de la sortie :", error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

module.exports = { ajouterSortie, recupererSortiesAvecAssocies, compterSortieDuJour };
