const Credit = require('../models/credit');
const Utilisateur = require('../models/utilisateurs');

const ajouterCredit = async (req, res) => {
  try {
    const { utilisateurId, nom, montant } = req.body;

    // Vérification des champs requis
    if (!utilisateurId || !nom || !montant) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    // Vérification de l'existence de l'utilisateur
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    // Générer une nouvelle référence unique
    let newCode = '';
    const generateUniqueCode = async () => {
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      newCode = `REF${randomSuffix}`;

      // Vérifier si le code généré existe déjà
      const existingCredit = await Credit.findOne({
        where: { reference: newCode }
      });

      // Si un crédit avec cette référence existe déjà, générer un autre code
      if (existingCredit) {
        return generateUniqueCode();
      }

      return newCode;
    };

    // Générer la référence unique
    newCode = await generateUniqueCode();

    // Création d'un nouveau crédit
    const credit = await Credit.create({
      utilisateurId,
      nom,
      reference: newCode,
      montant
    });

    // Mettre à jour le solde de l'utilisateur
    utilisateur.solde = (utilisateur.solde || 0) - montant;

    // Sauvegarde des modifications de l'utilisateur
    await utilisateur.save();

    // Réponse en cas de succès
    res.status(201).json({
      message: 'Crédit ajouté avec succès.',
      credit,
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du crédit :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

const recupererCredit = async (req, res) => {
    try {
      // Récupérer tous les partenaires avec les informations de l'utilisateur associé
      const credit = await Credit.findAll(
        {
        include: [
          {
            model: Utilisateur,
            attributes: ['id', 'nom', 'prenom', 'email'], // Vous pouvez spécifier les attributs que vous voulez afficher
          },
        ],
      }
    );
  
      // Si aucun partenaire n'est trouvé
      if (credit.length === 0) {
        return res.status(404).json({ message: 'Aucun credit trouvé.' });
      }
  
      res.status(200).json(credit);
    } catch (error) {
      console.error('Erreur lors de la récupération des credit :', error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  };

module.exports = { ajouterCredit, recupererCredit};
