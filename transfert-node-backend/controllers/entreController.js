const Entre = require("../models/entres");
const Utilisateur = require("../models/utilisateurs");
const Partenaire = require("../models/partenaires");
const Devise = require("../models/devises");
const { Sequelize } = require("sequelize");

// Récupérer les entrées avec les associations
const recupererEntreesAvecAssocies = async (req, res) => {
  try {
    const entrees = await Entre.findAll({
      include: [
        {
          model: Utilisateur,
          attributes: ["id", "nom", "prenom", "email", "solde"], // Champs nécessaires de l'utilisateur
        },
        {
          model: Partenaire,
          attributes: ["id", "nom", "prenom", "montant_preter"], // Champs nécessaires du partenaire
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
      order: [["date_creation", "DESC"]],
    });

    if (entrees.length === 0) {
      return res.status(404).json({ message: "Aucune entrée trouvée." });
    }

    res.status(200).json(entrees);
  } catch (error) {
    console.error("Erreur lors de la récupération des entrées :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Ajouter une entrée
const ajouterEntre = async (req, res) => {
  try {
    const {
      utilisateurId,
      partenaireId,
      deviseId,
      expediteur,
      receveur,
      montant_cfa,
      montant,
      telephone_receveur,
    } = req.body;

    // Vérifier si tous les champs obligatoires sont présents
    if (
      !utilisateurId ||
      !partenaireId ||
      !deviseId ||
      !expediteur ||
      !receveur ||
      !montant_cfa ||
      !telephone_receveur
    ) {
      return res.status(400).json({
        message: "Tous les champs obligatoires doivent être remplis.",
      });
    }

    // Vérifier si le partenaire existe
    const partenaire = await Partenaire.findByPk(partenaireId);
    if (!partenaire) {
      return res.status(404).json({ message: "Partenaire introuvable." });
    }

    // Récupérer les informations de l'utilisateur connecté
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Récupérer les informations de la devise
    const devise = await Devise.findByPk(deviseId);
    if (!devise) {
      return res.status(404).json({ message: "Devise introuvable." });
    }

    const Prix1 = devise.prix_1 || 0;
    const Prix2 = devise.prix_2 || 0;
    const Sign1 = devise.signe_1;
    const Sign2 = devise.signe_2;
    const PaysDest = devise.paysArriver;

    const montant_due = (montant_cfa / Prix1) * Prix2; // Calcul du montant dû

    // Générer le code automatiquement
    const lastEntry = await Entre.findOne({
      order: [["id", "DESC"]],
    });

    let newCode = "AB0001";
    if (lastEntry) {
      const lastCode = lastEntry.code || "";
      const numericPart = parseInt(lastCode.slice(2), 10);
      if (!isNaN(numericPart)) {
        const incrementedPart = (numericPart + 1).toString().padStart(4, "0");
        newCode = `AB${incrementedPart}`;
      }
    }

    if (devise.paysArriver === partenaire.pays) {
      // Créer une nouvelle entrée
      const entre = await Entre.create({
        utilisateurId,
        partenaireId,
        deviseId,
        pays_exp: "Guinée",
        pays_dest: PaysDest,
        code: newCode,
        expediteur,
        nomCLient: "",
        montant,
        receveur,
        montant_gnf: montant_due,
        signe_1: Sign1,
        signe_2: Sign2,
        montant_cfa: montant_cfa || 0,
        prix_1: Prix1,
        prix_2: Prix2,
        telephone_receveur,
      });

      // Mettre à jour le montant_prêter du partenaire
      partenaire.montant_preter =
        (partenaire.montant_preter || 0) + montant_cfa;
      await partenaire.save();

      res.status(201).json({
        message: "Entrée créée avec succès.",
        entre,
        solde: utilisateur.solde,
        montant_preter: partenaire.montant_preter,
      });
    } else {
      res.status(400).json({
        message:
          "Le pays de destination ne correspond pas au pays du partenaire.",
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'entrée :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const ajouterAutreEntre = async (req, res) => {
  try {
    const { utilisateurId, nomCLient, montantClient } = req.body;

    // Vérifier si tous les champs obligatoires sont présents
    if (!utilisateurId || !nomCLient || !montantClient) {
      return res.status(400).json({
        message: "Tous les champs obligatoires doivent être remplis.",
      });
    }

    // Récupérer les informations de l'utilisateur connecté
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Générer le code automatiquement
    const lastEntry = await Entre.findOne({
      order: [["id", "DESC"]],
    });

    let newCode = "AB0001";
    if (lastEntry) {
      const lastCode = lastEntry.code || "";
      const numericPart = parseInt(lastCode.slice(2), 10);
      if (!isNaN(numericPart)) {
        const incrementedPart = (numericPart + 1).toString().padStart(4, "0");
        newCode = `AB${incrementedPart}`;
      }
    }

    // Créer une nouvelle entrée
    const entre = await Entre.create({
      utilisateurId,
      partenaireId: null,
      deviseId: null,
      pays_exp: "",
      pays_dest: "",
      code: newCode,
      expediteur: "",
      nomCLient,
      montantClient,
      receveur: "",
      montant_gnf: 0,
      signe_1: "",
      signe_2: "",
      montant_cfa: 0,
      prix_1: 0,
      prix_2: 0,
      telephone_receveur: "",
      status: "PAYEE",
    });

    utilisateur.solde = (utilisateur.solde || 0) + montantClient;
    await utilisateur.save();

    res.status(201).json({
      message: "Entrée créée avec succès.",
      entre,
      solde: utilisateur.solde,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'entrée :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Compter le nombre d'entrées du jour actuel
const compterEntreesDuJour = async (req, res) => {
  try {
    // Obtenir la date actuelle au format YYYY-MM-DD
    const dateActuelle = new Date().toISOString().slice(0, 10);

    const nombreEntrees = await Entre.count({
      where: Sequelize.where(
        Sequelize.fn("DATE", Sequelize.col("date_creation")),
        dateActuelle
      ),
    });

    res.status(200).json({
      date: dateActuelle,
      nombre_entrees: nombreEntrees,
    });
  } catch (error) {
    console.error("Erreur lors du comptage des entrées du jour :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const annulerEntre = async (req, res) => {
  try {
    const { code } = req.params;
    const { type_annuler, montant_rembourser } = req.body;

    // Vérifier si l'entrée existe
    const entre = await Entre.findOne({ where: { code } });
    if (!entre) return res.status(404).json({ message: "Entrée introuvable." });

    const [utilisateur] = await Promise.all([
      Utilisateur.findByPk(entre.utilisateurId),
    ]);

    console.log(entre.montant_cfa);
    console.log(entre.status);

    if (entre.montant_cfa === 0 && entre.status === "PAYEE") {
      utilisateur.solde =
        (utilisateur.solde || 0) - Number(entre.montantClient);
      await utilisateur.save();
      entre.status = "ANNULEE";
      entre.type_annuler = type_annuler;
      await entre.save();
      return res.status(400).json({ message: `Entrée annulée avec succès.` });
    }
    if (entre.montant_cfa === 0 && entre.status === "ANNULEE") {
      return res
        .status(400)
        .json({ message: `Cette entrée est déjà annulée.` });
    }

    // Vérifier si le partenaire et l'utilisateur existent
    const [partenaire] = await Promise.all([
      Partenaire.findByPk(entre.partenaireId),
    ]);

    if (!partenaire)
      return res.status(404).json({ message: "Partenaire introuvable." });
    if (!utilisateur)
      return res.status(404).json({ message: "Utilisateur introuvable." });
    console.log(entre.status);
    console.log(type_annuler);

    if (entre.status === "NON PAYEE" && type_annuler === "Rembourser") {
      entre.status = "ANNULEE";
      entre.type_annuler = type_annuler;
      await entre.save();
      return res.status(400).json({ message: `Entrée annulée avec succès.` });
    }

    // if (entre.status === "ANNULEE" && entre.type_annuler === "Rembourser") {
    //   return res
    //     .status(409)
    //     .json({ message: "Cette entrée est déjà annulée." });
    // }

    // Vérification du remboursement
    const montantEnCoursPayement =
      (Number(entre.montant_rembourser) || 0) + Number(montant_rembourser);
    console.log(montantEnCoursPayement);
    console.log(entre.montant_payer);
    console.log(entre.montant_rembourser);

    if (entre.montant_payer === entre.montant_rembourser) {
      return res
        .status(400)
        .json({ message: `Aucun remboursement possible, tout a été payé.` });
    }

    if (montantEnCoursPayement > entre.montant_payer) {
      return res.status(400).json({
        message: `Le montant restant à rembourser est de : ${
          (Number(entre.montant_payer) || 0) - Number(entre.montant_rembourser)
        }`,
      });
    }

    // Gestion du remboursement
    if (
      type_annuler === "Rembourser" &&
      ["PAYEE", "EN COURS", "ANNULEE"].includes(entre.status)
    ) {
      entre.montant_rembourser = montantEnCoursPayement;
      utilisateur.solde = (utilisateur.solde || 0) - Number(montant_rembourser);
      await utilisateur.save();
    }

    // Mise à jour du montant prêté par le partenaire si l'entrée n'était pas annulée
    if (entre.status !== "ANNULEE") {
      partenaire.montant_preter =
        (partenaire.montant_preter || 0) - entre.montant_cfa;
      await partenaire.save();
    }

    // Mettre à jour le statut et le type d'annulation
    entre.status = "ANNULEE";
    entre.type_annuler = type_annuler;
    await entre.save();

    res.status(200).json({ message: "Entrée annulée avec succès.", entre });
  } catch (error) {
    console.error("Erreur lors de l'annulation de l'entrée :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const payerEntrees = async (req, res) => {
  try {
    const { ids } = req.body; // Récupérer les IDs des entrées cochées

    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "Aucune entrée sélectionnée." });
    }

    // Vérifier si une des entrées a déjà le type "R"
    const entreesExistantes = await Entre.findAll({
      where: { id: ids },
      attributes: ["id", "type"], // Sélectionner seulement les champs nécessaires
    });

    const dejaPayees = entreesExistantes.filter((entre) => entre.type === "R");

    if (dejaPayees.length > 0) {
      return res.status(400).json({
        message:
          "Certaines entrées ont déjà été payées et ne peuvent être payées deux fois.",
        entrees: dejaPayees.map((entre) => entre.id), // Retourne les IDs des entrées déjà payées
      });
    }

    // Mettre à jour le statut des entrées sélectionnées
    await Entre.update({ type: "R" }, { where: { id: ids } });

    res.status(200).json({ message: "Paiement effectué avec succès." });
  } catch (error) {
    console.error("Erreur lors du paiement des entrées :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

module.exports = {
  ajouterAutreEntre,
  ajouterEntre,
  recupererEntreesAvecAssocies,
  compterEntreesDuJour,
  annulerEntre,
  payerEntrees,
};
