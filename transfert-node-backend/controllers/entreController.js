const Entre = require('../models/entres');
const Utilisateur = require('../models/utilisateurs');
const Partenaire = require('../models/partenaires');
const Devise = require('../models/devises');

// Récupérer les entrées avec les associations
const recupererEntreesAvecAssocies = async (req, res) => {
  try {
    const entrees = await Entre.findAll({
      include: [
        {
          model: Utilisateur,
          attributes: ['id', 'nom', 'prenom', 'email', 'solde'], // Champs nécessaires de l'utilisateur
        },
        {
          model: Partenaire,
          attributes: ['id', 'nom', 'prenom', 'montant_preter'], // Champs nécessaires du partenaire
        },
        {
          model: Devise,
          attributes: ['id', 'paysDepart', 'paysArriver', 'signe_1', 'signe_2', 'prix_1', 'prix_2'], // Champs nécessaires de la devise
        },
      ],
    });

    if (entrees.length === 0) {
      return res.status(404).json({ message: 'Aucune entrée trouvée.' });
    }

    res.status(200).json(entrees);
  } catch (error) {
    console.error('Erreur lors de la récupération des entrées :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
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
      telephone_receveur
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
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
    }

    // Vérifier si le partenaire existe
    const partenaire = await Partenaire.findByPk(partenaireId);
    if (!partenaire) {
      return res.status(404).json({ message: 'Partenaire introuvable.' });
    }

    // Récupérer les informations de l'utilisateur connecté
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
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
    const PaysDest = devise.paysArriver;

    const montant_due = (montant_cfa / Prix1) * Prix2; // Calcul du montant dû
    const soldeCaise = montant_due; // Solde ajouté à l'utilisateur connecté

    // Générer le code automatiquement
    const lastEntry = await Entre.findOne({
      order: [['id', 'DESC']],
    });

    let newCode = 'AB0001';
    if (lastEntry) {
      const lastCode = lastEntry.code || '';
      const numericPart = parseInt(lastCode.slice(2), 10);
      if (!isNaN(numericPart)) {
        const incrementedPart = (numericPart + 1).toString().padStart(4, '0');
        newCode = `AB${incrementedPart}`;
      }
    }

    if (devise.paysArriver === partenaire.pays) {
      // Créer une nouvelle entrée
      const entre = await Entre.create({
        utilisateurId,
        partenaireId,
        deviseId,
        pays_exp: 'Guinée',
        pays_dest: PaysDest,
        code: newCode,
        expediteur,
        receveur,
        montant_gnf: montant_due,
        signe_1: Sign1,
        signe_2: Sign2,
        montant_cfa: montant_cfa || 0,
        prix_1: Prix1,
        prix_2: Prix2,
        telephone_receveur
      });

      // Mettre à jour le solde de l'utilisateur connecté
      utilisateur.solde = (utilisateur.solde || 0) + soldeCaise;
      await utilisateur.save();

      // Mettre à jour le montant_prêter du partenaire
      partenaire.montant_preter = (partenaire.montant_preter || 0) + montant_due;
      await partenaire.save();

      res.status(201).json({
        message: 'Entrée créée avec succès.',
        entre,
        solde: utilisateur.solde,
        montant_preter: partenaire.montant_preter,
      });
    } else {
      res.status(400).json({ message: 'Le pays de destination ne correspond pas au pays du partenaire.' });
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'entrée :", error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

module.exports = { ajouterEntre, recupererEntreesAvecAssocies };
