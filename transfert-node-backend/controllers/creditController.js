const Credit = require("../models/credit");
const Utilisateur = require("../models/utilisateurs");

const ajouterCredit = async (req, res) => {
  try {
    const { utilisateurId, nom, montant } = req.body;

    // Vérification des champs requis
    if (!utilisateurId || !nom || !montant) {
      return res
        .status(400)
        .json({ message: "Tous les champs sont obligatoires." });
    }

    // Vérification de l'existence de l'utilisateur
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const generateUniqueCode = async () => {
      let newCode = "AB0001"; // Code par défaut
      const lastEntry = await Credit.findOne({
        order: [["createdAt", "DESC"]],
      }); // Récupère le dernier crédit

      if (lastEntry) {
        const lastCode = lastEntry.code || "";
        const numericPart = parseInt(lastCode.slice(2), 10);

        if (!isNaN(numericPart)) {
          const incrementedPart = (numericPart + 1).toString().padStart(4, "0");
          newCode = `AB${incrementedPart}`;
        }
      }

      // Vérification de l'unicité
      const checkUniqueCode = async (code) => {
        const existingCredit = await Credit.findOne({
          where: { reference: code },
        });
        return existingCredit ? false : true;
      };

      // Si le code généré existe déjà, générer un autre aléatoire
      while (!(await checkUniqueCode(newCode))) {
        const randomSuffix = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();
        newCode = `REF${randomSuffix}`;
      }

      return newCode;
    };

    newCode = await generateUniqueCode();

    if (utilisateur.solde > montant) {
      const credit = await Credit.create({
        utilisateurId,
        nom,
        reference: newCode,
        montant,
      });
      res.status(201).json({
        message: "Crédit ajouté avec succès.",
        credit,
      });
    } else {
      return res.status(400).json({ message: "Solde est insuffisant." });
    }

    utilisateur.solde = (utilisateur.solde || 0) - montant;
    await utilisateur.save();
  } catch (error) {
    console.error("Erreur lors de l'ajout du crédit :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const recupererCredit = async (req, res) => {
  try {
    // Récupérer tous les partenaires avec les informations de l'utilisateur associé
    const credit = await Credit.findAll({
      include: [
        {
          model: Utilisateur,
          attributes: ["id", "nom", "prenom", "email"], // Vous pouvez spécifier les attributs que vous voulez afficher
        },
      ],
      order: [["date_creation", "DESC"]],
    });

    // Si aucun partenaire n'est trouvé
    if (credit.length === 0) {
      return res.status(404).json({ message: "Aucun credit trouvé." });
    }

    res.status(200).json(credit);
  } catch (error) {
    console.error("Erreur lors de la récupération des credit :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

module.exports = { ajouterCredit, recupererCredit };
