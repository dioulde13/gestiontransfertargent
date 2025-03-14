const Rembourser = require("../models/rembourser"); // Modèle Rembourser
const Utilisateur = require("../models/utilisateurs"); // Modèle Utilisateur
const Partenaire = require("../models/partenaires"); // Modèle Partenaire
const Devise = require("../models/devises");
const { Sequelize } = require("sequelize");

const ajouterRemboursement = async (req, res) => {
  try {
    const { utilisateurId, deviseId, partenaireId, nom, montant } = req.body;

    // Vérification des champs requis
    if (!utilisateurId || !partenaireId || !deviseId || !nom || !montant) {
      return res
        .status(400)
        .json({ message: "Tous les champs sont obligatoires." });
    }

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Vérifier si le partenaire existe
    const partenaire = await Partenaire.findByPk(partenaireId);
    if (!partenaire) {
      return res.status(404).json({ message: "Partenaire introuvable." });
    }

    // Récupérer les informations de la devise
    const devise = await Devise.findByPk(deviseId);
    if (!devise) {
      return res.status(404).json({ message: "Devise introuvable." });
    }

    const Prix1 = devise.prix_1 || 0;
    const Prix2 = devise.prix_2 || 0;
    const Sign1 = devise.signe_1 || "N/A"; // Fournir une valeur par défaut si null
    const Sign2 = devise.signe_2 || "N/A"; // Fournir une valeur par défaut si null

    // Vérifications supplémentaires pour les signes
    if (!Sign1 || !Sign2) {
      return res
        .status(400)
        .json({ message: "Les informations de la devise sont incomplètes." });
    }

    // Calcul du montant dû
    const montant_due = (montant / Prix1) * Prix2;

    if (partenaire.montant_preter >= montant) {
      if (utilisateur.solde > montant_due) {
        const remboursement = await Rembourser.create({
          utilisateurId,
          partenaireId,
          deviseId,
          montant_gnf: montant_due,
          montant,
          nom,
          signe_1: Sign1,
          signe_2: Sign2,
          prix_1: Prix1,
          prix_2: Prix2,
        });

        // Mettre à jour le solde de l'utilisateur connecté
        utilisateur.solde = (utilisateur.solde || 0) - montant_due;
        await utilisateur.save();

        // Mettre à jour le montant_preter du partenaire
        partenaire.montant_preter = (partenaire.montant_preter || 0) - montant;
        await partenaire.save();

        res.status(201).json({
          message: "Remboursement ajouté avec succès.",
          remboursement,
        });
      } else {
        return res
          .status(400)
          .json({ message: "Le solde dans la caisse est insuffisant." });
      }
    } else {
      return res.status(400).json({
        message: "Le montant saisi est supérieur au montant restant.",
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout du remboursement :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Compter le nombre d'entrées du jour actuel
const compterRembourserDuJour = async (req, res) => {
  try {
    // Obtenir la date actuelle au format YYYY-MM-DD
    const dateActuelle = new Date().toISOString().slice(0, 10);

    const nombreRembourser = await Rembourser.count({
      where: Sequelize.where(
        Sequelize.fn("DATE", Sequelize.col("date_creation")),
        dateActuelle
      ),
    });

    res.status(200).json({
      date: dateActuelle,
      nombre_rembourser: nombreRembourser,
    });
  } catch (error) {
    console.error("Erreur lors du comptage des sorties du jour :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Lister toutes les entrées de la table Rembourser avec associations
const listerRemboursements = async (req, res) => {
  try {
    const remboursements = await Rembourser.findAll({
      include: [
        {
          model: Utilisateur,
          attributes: ["id", "nom", "prenom", "email"], // Champs à inclure pour l'utilisateur
        },
        {
          model: Partenaire,
          attributes: ["id", "nom", "prenom", "montant_preter"], // Champs à inclure pour le partenaire
        },
        {
          model: Devise,
          attributes: [
            "id",
            "paysDepart",
            "paysArriver",
            "signe_1",
            "signe_2",
            "prix_1",
            "prix_2",
          ], // Champs nécessaires de la devise
        },
      ],
    });

    if (remboursements.length === 0) {
      return res.status(404).json({ message: "Aucun remboursement trouvé." });
    }

    res.status(200).json(remboursements);
  } catch (error) {
    console.error("Erreur lors de la récupération des remboursements :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

module.exports = {
  ajouterRemboursement,
  listerRemboursements,
  compterRembourserDuJour,
};
