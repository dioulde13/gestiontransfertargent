const Partenaire = require('../models/partenaires');
const Utilisateur = require('../models/utilisateurs');

const ajouterPartenaire = async (req, res) => {
  try {
    const { utilisateurId, nom, prenom, pays, montant_preter } = req.body;

    // Vérifier si tous les champs nécessaires sont fournis
    if (!utilisateurId || !nom || !prenom || !pays || montant_preter === undefined) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    // Créer un nouveau partenaire
    const partenaire = await Partenaire.create({
      utilisateurId,
      nom,
      prenom,
      pays,
      montant_preter,
    });

    res.status(201).json({
      message: 'Partenaire ajouté avec succès.',
      partenaire,
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du partenaire :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

const recupererPartenaires = async (req, res) => {
    try {
      // Récupérer tous les partenaires avec les informations de l'utilisateur associé
      const partenaires = await Partenaire.findAll(
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
      if (partenaires.length === 0) {
        return res.status(404).json({ message: 'Aucun partenaire trouvé.' });
      }
  
      res.status(200).json(partenaires);
    } catch (error) {
      console.error('Erreur lors de la récupération des partenaires :', error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  };

module.exports = { ajouterPartenaire, recupererPartenaires};
