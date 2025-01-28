const Depense = require('../models/depense');
const Utilisateur = require('../models/utilisateurs');

const ajouterDepense = async (req, res) => {
  try {
    const { utilisateurId, motif, montant } = req.body;

    // Vérifier si tous les champs nécessaires sont fournis
    if (!utilisateurId || !motif || montant === undefined) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    // Créer un nouveau partenaire
    const depense = await Depense.create({
      utilisateurId,
      motif,
      montant,
    });

     // Mettre à jour le solde de l'utilisateur connecté
     utilisateur.solde = (utilisateur.solde || 0) - montant;
     await utilisateur.save();

    res.status(201).json({
      message: 'Depense ajouté avec succès.',
      depense,
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du depense :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

const recupererDepense = async (req, res) => {
    try {
      // Récupérer tous les partenaires avec les informations de l'utilisateur associé
      const depense = await Depense.findAll(
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
      if (depense.length === 0) {
        return res.status(404).json({ message: 'Aucun depense trouvé.' });
      }
  
      res.status(200).json(depense);
    } catch (error) {
      console.error('Erreur lors de la récupération des depense :', error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  };

module.exports = { ajouterDepense, recupererDepense};
