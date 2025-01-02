const Devise = require('./devises');
const Echange = require('./echanger');
const Entre = require('./entres');
const Sortie = require('./sorties');
const Partenaire = require('./partenaires');
const Utilisateur = require('./utilisateurs');
const Rembourser = require('./rembourser');


// Relation One-to-Many : Une classe peut avoir plusieurs élèves
// Classe.hasMany(Eleve, { foreignKey: 'classeId' });
// Eleve.belongsTo(Classe, { foreignKey: 'classeId' });

// Relation One-to-Many : Un Partenaire peut avoir plusieurs Entres
Partenaire.hasMany(Entre, { foreignKey: 'partenaireId' });
Entre.belongsTo(Partenaire, { foreignKey: 'partenaireId' });

// Relation One-to-Many : Un Devise peut avoir plusieurs Entres
Devise.hasMany(Entre, { foreignKey: 'deviseId' });
Entre.belongsTo(Devise, { foreignKey: 'deviseId' });

// Relation One-to-Many : Un Devise peut avoir plusieurs Entres
Devise.hasMany(Sortie, { foreignKey: 'deviseId' });
Sortie.belongsTo(Devise, { foreignKey: 'deviseId' });

// Relation One-to-Many : Un Devise peut avoir plusieurs Entres
Devise.hasMany(Echange, { foreignKey: 'deviseId' });
Echange.belongsTo(Devise, { foreignKey: 'deviseId' });

module.exports = { Devise, Echange , Entre, Sortie, Partenaire, Utilisateur, Rembourser};
