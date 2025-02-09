const Echange = require('../models/echanger');
const Utilisateur = require('../models/utilisateurs');
const Devise = require('../models/devises');


const ajouterEchange = async (req, res) => {
    try {
        const { utilisateurId, nom, montant_devise, deviseId } = req.body;

        // ✅ Vérification des champs requis
        if (!utilisateurId || !nom || !montant_devise || !deviseId) {
            return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
        }

        // ✅ Vérification de l'existence de l'utilisateur
        const utilisateur = await Utilisateur.findByPk(utilisateurId);
        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur introuvable.' });
        }

        // ✅ Vérification de l'existence de la devise
        const devise = await Devise.findByPk(deviseId);
        if (!devise) {
            return res.status(404).json({ message: 'Devise introuvable.' });
        }

        // ✅ Récupération des informations de la devise
        const Prix1 = devise.prix_1 || 0;
        const Prix2 = devise.prix_2 || 0;
        const Sign1 = devise.signe_1 || '';
        const Sign2 = devise.signe_2 || '';

        // ✅ Calcul du montant dû
        const montant_due = (montant_devise / Prix1) * Prix2;

        // ✅ Génération d'un code de référence unique
        const generateUniqueCode = async () => {
            let newCode = 'AB0001';
            const lastEntry = await Echange.findOne({ order: [['createdAt', 'DESC']] });

            if (lastEntry) {
                const lastCode = lastEntry.code || '';
                const numericPart = parseInt(lastCode.slice(2), 10);

                if (!isNaN(numericPart)) {
                    newCode = `AB${(numericPart + 1).toString().padStart(4, '0')}`;
                }
            }

            // Vérification de l'unicité du code
            while (await Echange.findOne({ where: { code: newCode } })) {
                const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
                newCode = `REF${randomSuffix}`;
            }

            return newCode;
        };

        const newCode = await generateUniqueCode();

        // ✅ Création d'un nouvel échange
        const echange = await Echange.create({
            utilisateurId,
            deviseId,
            nom,
            code: newCode,
            montant_gnf: montant_due,
            montant_devise,
            signe_1: Sign1,
            signe_2: Sign2,
            prix_1: Prix1,
            prix_2: Prix2,
        });

        // ✅ Réponse en cas de succès
        res.status(201).json({
            message: 'Échange ajouté avec succès.',
            echange,
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'échange :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};

module.exports = { ajouterEchange };

const recupererEchange = async (req, res) => {
    try {
        // Récupérer tous les partenaires avec les informations de l'utilisateur associé
        const echange = await Echange.findAll(
            {
                include: [
                    {
                      model: Utilisateur,
                      attributes: ['id', 'nom', 'prenom', 'email', 'solde'], // Champs nécessaires de l'utilisateur
                    },
                    {
                      model: Devise,
                      attributes: ['id', 'paysDepart', 'paysArriver', 'signe_1', 'signe_2', 'prix_1', 'prix_2'], // Champs nécessaires de la devise
                    },
                  ],
                  order: [['date_creation', 'DESC']]
            }
        );
                                                          
        // Si aucun partenaire n'est trouvé
        if (echange.length === 0) {
            return res.status(404).json({ message: 'Aucun credit trouvé.' });
        }

        res.status(200).json(echange);
    } catch (error) {
        console.error('Erreur lors de la récupération des echange :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};

module.exports = { ajouterEchange, recupererEchange };
