const Entre = require('../models/entres');
const Utilisateur = require('../models/utilisateurs');
const Partenaire = require('../models/partenaires');
const Devise = require('../models/devises');


const recupererEntreesAvecAssocies = async (req, res) => {
  try {
    // Récupérer toutes les entrées avec les informations de l'utilisateur et du partenaire associés
    const entrees = await Entre.findAll({
      include: [
        {
          model: Utilisateur,
          attributes: ['id', 'nom', 'prenom', 'email'], // Ajouter les champs nécessaires de l'utilisateur
        },
        {
          model: Partenaire,
          attributes: ['id', 'nom', 'prenom', 'montant_preter'], // Ajouter les champs nécessaires du partenaire
        },
        {
            model: Devise,
            attributes: ['id', 'paysDepart', 'paysArriver', 'signe_1', 'signe_2', 'prix_1', 'prix_2', 'prix_1'], // Ajouter les champs nécessaires du partenaire
          },
      ],
    });

    // Si aucune entrée n'est trouvée
    if (entrees.length === 0) {
      return res.status(404).json({ message: 'Aucune entrée trouvée.' });
    }

    res.status(200).json(entrees);
  } catch (error) {
    console.error('Erreur lors de la récupération des entrées :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

const ajouterEntre = async (req, res) => {
  try {
    const {
      utilisateurId,
      partenaireId,
      deviseId,
      expediteur,
      receveur,
      montant_gnf,
      telephone_receveur,
      payement_type,
      status,
    } = req.body;

    // Vérifier si tous les champs obligatoires sont présents
    if (
      !utilisateurId ||
      !partenaireId ||
      !deviseId ||
      !expediteur ||
      !receveur ||
      !telephone_receveur ||
      !payement_type ||
      !status
    ) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
    }

    // Validation des champs ENUM
    const validPayementTypes = ['COMPLET', 'NON COMPLET'];
    const validStatuses = ['NON PAYEE', 'PAYEE', 'CREDIT', 'ANNULEE'];

    if (!validPayementTypes.includes(payement_type)) {
      return res.status(400).json({ message: `Type de paiement invalide. Les valeurs acceptées sont : ${validPayementTypes.join(', ')}` });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Statut invalide. Les valeurs acceptées sont : ${validStatuses.join(', ')}` });
    }

    // Vérifier si le partenaire existe
    const partenaire = await Partenaire.findByPk(partenaireId);
    if (!partenaire) {
      return res.status(404).json({ message: 'Partenaire introuvable.' });
    }

    // Récupérer le prix_1, prix_2, signe_1, signe_2 et paysArriver depuis la table Devise
    const devise = await Devise.findByPk(deviseId);
    if (!devise) {
      return res.status(404).json({ message: 'Devise introuvable.' });
    }

    const Prix1 = devise.prix_1 || 0;
    const Prix2 = devise.prix_2 || 0;
    const Sign1 = devise.signe_1;
    const Sign2 = devise.signe_2;
    const PaysDest = devise.paysArriver;

    // Calcul du montant_preter
    const montant_due = montant_gnf;

    // Générer le code automatiquement
    const lastEntry = await Entre.findOne({
      order: [['id', 'DESC']], // Récupérer la dernière entrée
    });

    let newCode = 'AB0001'; // Code par défaut si aucune entrée n'existe
    if (lastEntry) {
      const lastCode = lastEntry.code || ''; // S'assurer que lastCode est défini
      const numericPart = parseInt(lastCode.slice(2), 10); // Extraire la partie numérique
      if (!isNaN(numericPart)) {
        const incrementedPart = (numericPart + 1).toString().padStart(4, '0'); // Incrémenter et formater
        newCode = `AB${incrementedPart}`; // Exemple : "AB0024"
      }
    }

    if(devise.paysArriver === partenaire.pays){
       // Créer une nouvelle entrée
    const entre = await Entre.create({
      utilisateurId,
      partenaireId,
      deviseId,
      pays_exp: 'Guinée',
      pays_dest: PaysDest,
      code: newCode, // Utiliser le code généré
      expediteur,
      receveur,
      signe_1: Sign1,
      signe_2: Sign2,
      montant_gnf: montant_gnf || 0, // Par défaut 0 si non fourni
      prix_1: Prix1, // Utiliser le prix_1 de Devise par défaut si non fourni
      prix_2: Prix2, // Par défaut 0 si non fourni
      telephone_receveur,
      payement_type,
      status,
    });

    // Mettre à jour le montant_preter du partenaire
    partenaire.montant_preter = (partenaire.montant_preter || 0) + montant_due;
    await partenaire.save(); // Sauvegarder les modifications dans la base de données

    res.status(201).json({
      message: 'Entrée créée avec succès.',
      entre,
      montant_preter: partenaire.montant_preter, // Inclure le montant préter dans la réponse
    });
    } else{
      res.status(400).json({ message: 'Le pays de destination ne correspond pas au pays du partenaire.' });
    }
  
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'entrée :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};


module.exports = { ajouterEntre, recupererEntreesAvecAssocies};
