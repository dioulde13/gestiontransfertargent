const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/utilisateurs'); // Assurez-vous d'importer votre modèle Sequelize
const { ValidationError } = require('sequelize');

// Clé secrète JWT
const JWT_SECRET = 'votre_clé_secrète_pour_jwt';

// Ajouter un utilisateur
const ajouterUtilisateur = async (req, res) => {
  try {
    const { nom, prenom, telephone, email, password } = req.body;

    // Validation des champs
    if (!nom || !prenom || !telephone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Les champs nom, prénom, numéro de téléphone, email, mot de passe sont requis.',
      });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un utilisateur dans la base de données
    const utilisateur = await Utilisateur.create({
      nom,
      prenom,
      telephone,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur ajouté avec succès.',
      userId: utilisateur.id,
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({
        success: false,
        message: 'Erreur de validation des données.',
        error: err.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'ajout de l\'utilisateur.',
        error: err.message,
      });
    }
  }
};

const getAllUser = async (req, res) => {
  try {
    // Récupérer toutes les devises
    const utilisateurs = await Utilisateur.findAll();
    // Si aucune devise n'est trouvée
    if (utilisateurs.length === 0) {
      return res.status(404).json({ message: 'Aucune utilisateurs trouvée.' });
    }

    res.status(200).json(utilisateurs);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}

// Connexion de l'utilisateur
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des champs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis.',
      });
    }

    // Rechercher l'utilisateur dans la base de données
    const utilisateur = await Utilisateur.findOne({
      where: { email },
    });

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé.',
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, utilisateur.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe incorrect.',
      });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: utilisateur.id, email: utilisateur.email, role: utilisateur.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Retourner le token et les informations de l'utilisateur
    res.json({
      success: true,
      message: 'Connexion réussie.',
      token,
      user: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        telephone: utilisateur.telephone,
        solde: utilisateur.solde,
        role: utilisateur.role,
        btEnabled: utilisateur.btEnabled
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion.',
      error: err.message,
    });
  }
};

module.exports = { ajouterUtilisateur, login , getAllUser};
