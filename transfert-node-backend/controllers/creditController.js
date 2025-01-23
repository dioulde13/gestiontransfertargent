const Credit = require('../models/credit');
const Utilisateur = require('../models/utilisateurs');

const ajouterCredit = async (req, res) => {
  try {
    const { utilisateurId, nom, montant } = req.body;

    // Vérifier si tous les champs nécessaires sont fournis
    if (!utilisateurId || !nom || montant === undefined) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    // Créer un nouveau partenaire
    const credit = await Credit.create({
      utilisateurId,
      nom,
      montant,
    });

    res.status(201).json({
      message: 'Credit ajouté avec succès.',
      credit,
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du credit :', error);
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
