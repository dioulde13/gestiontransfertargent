const express = require("express");
const bodyParser = require("body-parser");
// const sql = require("mssql");
const cors = require("cors");
const sequelize = require("./models/sequelize");
const utilisateurRoutes = require("./routes/utilisateurRoutes");
const partenaireRoutes = require("./routes/partenaireRoutes");
const deviseRoutes = require("./routes/deviseRoutes"); // Importer les routes des devises
const entreRoutes = require("./routes/entreRoutes"); // Importer les routes des entrées
const sortieRoutes = require("./routes/sortieRoute"); // Importer les routes des entrées
const rembourserRoutes = require("./routes/rembourserRoutes"); // Importer les routes des entrées
const payementRoutes = require("./routes/payementRoutes"); // Importer les routes des entrées
const authRoutes = require("./routes/authRoute"); // Importer les routes des entrées
const depenseRoute = require("./routes/depenseRoute"); // Importer les routes des entrées
const creditRoute = require("./routes/creditRoute"); // Importer les routes des entrées
const payementCreditRoute = require("./routes/payementCreditRoute"); // Importer les routes des entrées
const echangeRoute = require("./routes/echangeRoute"); // Importer les routes des entrées
const payementEchangeRoute = require("./routes/payementEchangeRoute"); // Importer les routes des entrées
const beneficeRoute = require("./routes/beneficeRoute"); // Importer les routes des entrées
const calculBeneficeRoute = require("./routes/calculBeneficeRoute"); // Importer les routes des entrées

const verifierCaisseRoute = require("./routes/verifierCaisseRoute"); // Importer les routes des entrées

const dbConfig = require("./configs/dbConfig");



const app = express();
app.use(bodyParser.json());

const sql = require("mssql/msnodesqlv8");

app.post("/api/insertProduit", async (req, res) => {
  try {
    const { nomProduit, quantite } = req.body;

    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input("nomProduit", sql.NVarChar, nomProduit)
      .input("quantite", sql.Int, quantite)
      .execute("insererProduit");  

    res.status(200).json({ message: "Produit inséré avec succès !" });
    
  } catch (error) {
    console.error("Erreur lors de l'insertion :", error);
    res.status(500).json({ error: "Erreur lors de l'insertion du produit." });
  }
});


// app.get("/api/getAllProduit", async (req, res) => {
//   try {
//     const pool = await sql.connect(dbConfig);

//     const result = await pool.request().query("SELECT * FROM listProduit");

//     res.status(200).json({
//       status: 200,
//       message: "Récupération réussie avec succès",
//       data: result.recordset
//     });
//   } catch (error) {
//     console.error(error); // Ajout pour afficher les erreurs dans la console
//     res.status(500).json({
//       status: 500,
//       message: "Erreur lors de la récupération des produits",
//       error: error.message
//     });
//   }
// });


app.get("/check-db-connection", async (req, res) => {
  try {
    await sql.connect(dbConfig);
    res.json({
      success: true,
      message: "Connexion à la base de données réussie",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur de connexion à la base de données",
      error: error.message,
    });
  }
});


// sql.connect(dbConfig, function (err) {
//   if (err) {
//     console.log("Erreur de connexion :", err.message);
//     return;
//   }

//   const request = new sql.Request();

//   request.query("SELECT * FROM produit", function (err, result) {
//     if (err) {
//       console.log("Erreur dans la requête :", err.message);
//     } else {
//       console.log("Résultats :", result.recordset);
//     }
//   });
// });


app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

sequelize
  .sync({
    alter: true,
    // force: true,
  })
  .then(() => console.log("Tables créées avec succès"))
  .catch((error) =>
    console.error("Erreur lors de la création des tables :", error)
  );

 app.use("/api/utilisateurs", utilisateurRoutes);

 app.use("/api/partenaires", partenaireRoutes);

app.use("/api/verifierCaisse", verifierCaisseRoute);

 app.use("/api/devises", deviseRoutes);

 app.use("/api/entrees", entreRoutes);

 app.use("/api/sorties", sortieRoutes);

app.use("/api/rembourser", rembourserRoutes);

app.use("/api/payement", payementRoutes);

app.use("/api/payementCredit", payementCreditRoute);

app.use("/api/depense", depenseRoute);

app.use("/api/echange", echangeRoute);

app.use("/api/payementEchange", payementEchangeRoute);

app.use("/api/credit", creditRoute);

app.use("/api/benefices", beneficeRoute);

app.use("/api/calculBenefices", calculBeneficeRoute);

 app.use("/api/auth", authRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
