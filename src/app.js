const express = require("express");
const path = require("path");
const helmet = require("helmet"); // Pour la sécurité des headers
const app = express();

// Sécurité DevSecOps : Ajout de headers de protection
app.use(
  helmet({
    contentSecurityPolicy: false, // Désactivé pour simplifier le chargement des scripts CDN si besoin
  }),
);

app.use(express.json());

// 1. Service des fichiers statiques
app.use(express.static(path.join(__dirname, "../public")));

// 2. Base de données simulée des étudiants
let students = [
  { id: 1, name: "Tonny", grade: 18, status: "Admis" },
  { id: 2, name: "Maddie", grade: 14, status: "Admis" },
  { id: 3, name: "Ray", grade: 9, status: "En attente" },
];

// --- ROUTES CRUD ---

// 3. API : Liste des étudiants
app.get("/api/students", (req, res) => {
  res.json(students);
});

// CRÉER (Create)
app.post("/api/students", (req, res) => {
  const newStudent = { id: Date.now(), ...req.body };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

// SUPPRIMER (Delete)
app.delete("/api/students/:id", (req, res) => {
  const studentId = parseInt(req.params.id);
  students = students.filter((s) => s.id !== studentId);
  res.status(204).send();
});

// 4. API : Système d'Orientation (Fusion de ton idée)
app.post("/api/orient", (req, res) => {
  const { grade } = req.body;
  let recommendation = "";

  if (grade >= 16)
    recommendation =
      "Filière Excellence : Intelligence Artificielle & Data Science (IA/DS)";
  else if (grade >= 12)
    recommendation =
      "Filière Technique : Développement Web & Mobile (Dev) ou Cybersécurité (Réseaux)";
  else if (grade >= 8)
    recommendation =
      "Filière de Remise à Niveau : Informatique Fondamentale & Support Technique";
  else recommendation = "Filière de Rattrapage : Études Complémentaires";

  res.json({ recommendation });
});

// 5. Santé du serveur
app.get("/health", (req, res) => {
  res.status(200).send("Le serveur SecureAPI est opérationnel !");
});

module.exports = app;
