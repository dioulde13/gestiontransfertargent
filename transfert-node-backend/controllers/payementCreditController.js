const PayementCreadit = require('../models/payementCredit');
const Utilisateur = require('../models/utilisateurs');
const Credit = require('../models/credit');

const ajouterPayementCredit = async (req, res) => {
    try {
        const { utilisateurId, reference, montant } = req.body;

        // Vérifier si l'utilisateur existe
        const utilisateur = await Utilisateur.findByPk(utilisateurId);
        if (!utilisateur) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Vérifier si l'entrée (Entre) existe à travers le code
        const credit = await Credit.findOne({ where: { reference } });
        if (!credit) {
            return res.status(404).json({ message: 'Entre introuvable avec ce reference.' });
        }

        // Vérifier si le montant payé ne dépasse pas le montant restant à payer
        if (montant <= credit.montantRestant) {
            return res.status(400).json({ message: "Le montant dépasse le reste à payer" });
        }

        // Créer le paiement de crédit
        const paiement = await PayementCreadit.create({
            utilisateurId,
            creditId: credit.id,  // Utiliser l'ID du crédit récupéré
            reference: reference,  // Utiliser la référence du crédit
            montant,
        });

        // Mettre à jour le reste à payer du crédit
        await Credit.update(
            {
                montantPaye: credit.montantPaye + montant,
                montantRestant: credit.montant - montantPaye
            },
            { where: { reference } }  // Mise à jour du crédit basé sur la référence
        );

        res.status(201).json({
            message: "Paiement ajouté avec succès",
            paiement
        });

    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'ajout du paiement", error });
    }
};

const findAllPayements = async (req, res) => {
    try {
        const payements = await PayementCreadit.findAll({
            include: [
                {
                    model: Utilisateur,
                    attributes: ['id', 'nom', 'prenom', 'email'] // Infos de l'utilisateur
                },
                {
                    model: Credit,
                    attributes: ['id', 'montant', 'montantPaye', 'montantRestant'] // Infos du crédit
                }
            ],
            order: [['date_creation', 'DESC']] // Trier par date décroissante
        });

        res.status(200).json(payements);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des paiements", error });
    }
};

module.exports = { ajouterPayementCredit, findAllPayements };
