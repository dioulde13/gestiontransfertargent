const Eleve = require('./eleve');
const Classe = require('./classe');

// Relation One-to-Many : Une classe peut avoir plusieurs élèves
Classe.hasMany(Eleve, { foreignKey: 'classeId' });
Eleve.belongsTo(Classe, { foreignKey: 'classeId' });

module.exports = { Eleve, Classe };
