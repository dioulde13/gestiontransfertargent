const Sortie = require("../models/sorties");
const Utilisateur = require("../models/utilisateurs");
const Partenaire = require("../models/partenaires");
const Devise = require("../models/devises");
const { Sequelize } = require("sequelize");

const recupererSortiesAvecAssocies = async (req, res) => {
  try {
    const sorties = await Sortie.findAll({
      include: [
        {
          model: Utilisateur,
          attributes: ["id", "nom", "prenom", "email"], // Champs nécessaires
        },
        {
          model: Partenaire,
          attributes: ["id", "nom", "prenom", "montant_preter"], // Champs nécessaires
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
          ], // Champs nécessaires
        },
      ],
    });

    if (sorties.length === 0) {
      return res.status(404).json({ message: "Aucune sortie trouvée." });
    }

    res.status(200).json(sorties);
  } catch (error) {
    console.error("Erreur lors de la récupération des sorties :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Compter le nombre d'entrées du jour actuel
const compterSortieDuJour = async (req, res) => {
  try {
    // Obtenir la date actuelle au format YYYY-MM-DD
    const dateActuelle = new Date().toISOString().slice(0, 10);

    const nombreSortie = await Sortie.count({
      where: Sequelize.where(
        Sequelize.fn("DATE", Sequelize.col("date_creation")),
        dateActuelle
      ),
    });

    res.status(200).json({
      date: dateActuelle,
      nombre_Sortie: nombreSortie,
    });
  } catch (error) {
    console.error("Erreur lors du comptage des sorties du jour :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const ajouterSortie = async (req, res) => {
  try {
    const {
      utilisateurId,
      partenaireId,
      deviseId,
      expediteur,
      codeEnvoyer,
      receveur,
      montant,
      telephone_receveur,
    } = req.body;

    if (
      !utilisateurId ||
      !partenaireId ||
      !deviseId ||
      !expediteur ||
      !codeEnvoyer ||
      !receveur ||
      !montant ||
      !telephone_receveur
    ) {
      return res.status(400).json({
        message: "Tous les champs obligatoires doivent être remplis.",
      });
    }

    // Récupérer les informations de l'utilisateur connecté
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const partenaire = await Partenaire.findByPk(partenaireId);
    if (!partenaire) {
      return res.status(404).json({ message: "Partenaire introuvable." });
    }

    const devise = await Devise.findByPk(deviseId);
    if (!devise) {
      return res.status(404).json({ message: "Devise introuvable." });
    }

    const Prix1 = devise.prix_1 || 0;
    const Prix2 = devise.prix_2 || 0;
    const Sign1 = devise.signe_1;
    const Sign2 = devise.signe_2;

    const montant_due = (montant / Prix1) * Prix2; // Calcul du montant dû

    const lastEntry = await Sortie.findOne({ order: [["id", "DESC"]] });

    let newCode = "ABS0001";

    if (lastEntry && lastEntry.code) {
      const numericPart = parseInt(lastEntry.code.slice(3), 10); // Extraire la partie numérique après "ABS"
      if (!isNaN(numericPart)) {
        newCode = `ABS${(numericPart + 1).toString().padStart(4, "0")}`;
      }
    }
    console.log(utilisateur.solde);
    console.log(montant_due);
    if (utilisateur.solde > montant_due) {
      if (devise.paysArriver === partenaire.pays) {
        const sortie = await Sortie.create({
          utilisateurId,
          partenaireId,
          deviseId,
          pays_exp: devise.paysArriver,
          pays_dest: devise.paysDepart,
          code: newCode,
          expediteur,
          codeEnvoyer,
          telephone_receveur,
          receveur,
          montant_gnf: montant_due,
          signe_1: Sign1,
          signe_2: Sign2,
          prix_1: Prix1, // Utiliser le prix_1 de Devise par défaut si non fourni
          prix_2: Prix2,
          montant: montant,
        });

        return res.status(201).json({
          message: "Sortie créée avec succès.",
          sortie,
          // montant_preter: partenaire.montant_preter,
        });
      } else {
        res.status(400).json({
          message: `Le pays de destination ne correspond pas au pays du partenaire.`,
        });
      }
    } else {
      const solde = Number(utilisateur.solde);
      res.status(400).json({
        message: `On ne peut pas faire une sortie de ${montant_due.toLocaleString(
          "fr-FR",
          { minimumFractionDigits: 0, maximumFractionDigits: 0 }
        )} GNF,
        le solde dans la caisse est: ${solde.toLocaleString("fr-FR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })} GNF`,
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de la sortie :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const validerSortie = async (req, res) => {
  try {
    const { code } = req.params; // Récupération du code depuis l'URL
    const { utilisateurId, partenaireId, prix_2 } = req.body;

    // Vérifier si la sortie existe en fonction du code
    const sortie = await Sortie.findOne({ where: { code } });
    if (!sortie) {
      console.log("Sortie non trouvée pour le code :", code);
      return res.status(404).json({ message: "Sortie non trouvée." });
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

    // Vérification de l'état de la sortie
    if (sortie.status === "PAYEE") {
      return res.status(400).json({ message: "Cette sortie est déjà PAYÉE." });
    }

    if (sortie.status === "ANNULEE") {
      return res
        .status(400)
        .json({ message: "Impossible de valider une sortie ANNULÉE." });
    }

    // Recalculer le montant en fonction du prix_2 s'il est fourni
    let montant_due = sortie.montant_gnf; // Valeur par défaut (ancienne valeur)
    if (prix_2 !== undefined) {
      montant_due = (sortie.montant / sortie.prix_1) * prix_2;
    }

    if (utilisateur.solde > montant_due) {
      await sortie.update({
        utilisateurId: utilisateurId || sortie.utilisateurId,
        partenaireId: partenaireId || sortie.partenaireId,
        prix_2: prix_2 || sortie.prix_2,
        montant_gnf: montant_due,
        status: "PAYEE",
      });
    } else {
      const solde = Number(utilisateur.solde);
      res.status(400).json({
        message: `On ne peut pas faire une sortie de ${montant_due.toLocaleString(
          "fr-FR",
          { minimumFractionDigits: 0, maximumFractionDigits: 0 }
        )} GNF, le solde dans la caisse est: ${solde.toLocaleString("fr-FR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })} GNF`,
      });
    }

    utilisateur.solde = (utilisateur.solde || 0) - montant_due;
    await utilisateur.save();

    // Mise à jour du montant prêté du partenaire
    partenaire.montant_preter =
      (partenaire.montant_preter || 0) - sortie.montant;
    await partenaire.save();

    res.status(200).json({
      message: "Sortie validée avec succès.",
      sortie,
    });
  } catch (error) {
    console.error("Erreur lors de la validation de la sortie :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// const validerSortie = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { utilisateurId, partenaireId, prix_2 } = req.body;

//     // Vérifier si la sortie existe
//     const sortie = await Sortie.findByPk(id);
//     if (!sortie) {
//       console.log("Sortie non trouvée pour l'ID :", id); // Ajoute ce log pour voir l'ID reçu
//       return res.status(404).json({ message: "Sortie non trouvée." });
//     }

//     // Vérifier si l'utilisateur existe
//     const utilisateur = await Utilisateur.findByPk(utilisateurId);
//     if (!utilisateur) {
//       return res.status(404).json({ message: "Utilisateur introuvable." });
//     }

//     // Vérifier si le partenaire existe
//     const partenaire = await Partenaire.findByPk(partenaireId);
//     if (!partenaire) {
//       return res.status(404).json({ message: "Partenaire introuvable." });
//     }

//     if (sortie.status === "PAYEE") {
//       return res
//         .status(400)
//         .json({ message: `On ne peut valider deux fois une sortie` });
//     }

//     if (sortie.status === "ANNULEE") {
//       return res
//         .status(400)
//         .json({ message: `On ne peut valider une sortie ANNULEE` });
//     }

//     // Recalculer le montant en fonction du prix_2 s'il est fourni
//     let montant_due = sortie.montant_gnf; // Valeur par défaut (ancienne valeur)
//     if (prix_2 !== undefined) {
//       montant_due = (sortie.montant / sortie.prix_1) * prix_2;
//     }

//     // Mise à jour de la sortie
//     await sortie.update({
//       utilisateurId: utilisateurId || sortie.utilisateurId,
//       partenaireId: partenaireId || sortie.partenaireId,
//       prix_2: prix_2 || sortie.prix_2,
//       montant_gnf: montant_due,
//     });

//     // Mise à jour du solde de l'utilisateur
//     utilisateur.solde = (utilisateur.solde || 0) - montant_due;
//     await utilisateur.save();

//     // Mise à jour du montant_prêter du partenaire
//     partenaire.montant_preter =
//       (partenaire.montant_preter || 0) - sortie.montant;
//     await partenaire.save();

//     sortie.status = "PAYEE";
//     await sortie.save();

//     res.status(200).json({
//       message: "Sortie mise à jour avec succès.",
//       sortie,
//     });
//   } catch (error) {
//     console.error("Erreur lors de la mise à jour de la sortie :", error);
//     res.status(500).json({ message: "Erreur interne du serveur." });
//   }
// };

const annulerSortie = async (req, res) => {
  try {
    const { code } = req.params; // Récupération du code

    // Vérifier si l'entrée existe
    const sortie = await Sortie.findOne({ where: { code } });
    if (!sortie) {
      return res.status(404).json({ message: "Sortie introuvable." });
    }

    // Vérifier si le partenaire existe
    const partenaire = await Partenaire.findByPk(sortie.partenaireId);
    if (!partenaire) {
      return res.status(404).json({ message: "Partenaire introuvable." });
    }

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findByPk(sortie.utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Vérifier si l'entrée est déjà annulée
    if (sortie.status === "ANNULEE") {
      return res
        .status(400)
        .json({ message: "Cette sortie est déjà annulée." });
    }

    if (sortie.status === "PAYEE") {
      if (utilisateur.solde < 0) {
        utilisateur.solde = (utilisateur.solde || 0) - -sortie.montant_gnf;
      } else if (utilisateur.solde > 0) {
        utilisateur.solde = (utilisateur.solde || 0) - sortie.montant_gnf;
      }
      await utilisateur.save();
    }

    if (partenaire.montant_preter < 0) {
      partenaire.montant_preter =
        (partenaire.montant_preter || 0) - -sortie.montant;
    } else if (partenaire.montant_preter > 0) {
      partenaire.montant_preter =
        (partenaire.montant_preter || 0) - sortie.montant;
    }
    await partenaire.save();

    // Mettre à jour le statut de l'entrée et le type d'annulation
    sortie.status = "ANNULEE";
    await sortie.save();

    res.status(200).json({
      message: "Sortie annulée avec succès.",
      sortie,
    });
  } catch (error) {
    console.error("Erreur lors de l'annulation de la sortie :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

module.exports = {
  ajouterSortie,
  recupererSortiesAvecAssocies,
  compterSortieDuJour,
  annulerSortie,
  validerSortie,
};
