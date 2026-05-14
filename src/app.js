const express = require('express');
const path = require('path');
const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// 1. Service des fichiers statiques (Frontend)
// Cette ligne permet d'afficher ton index.html quand on arrive sur le site
app.use(express.static(path.join(__dirname, '../public')));

// 2. Route API pour la gestion des étudiants
// Ces données seront consommées par ton frontend
app.get('/api/students', (req, res) => {
  const students = [
    { id: 1, name: 'Ray', grade: 'A', status: 'Admis' },
    { id: 2, name: 'Alice', grade: 'B', status: 'Admis' },
    { id: 3, name: 'Bob', grade: 'C', status: 'En attente' }
  ];
  res.json(students);
});

// 3. Route de test initiale
app.get('/health', (req, res) => {
  res.send('Le serveur SecureAPI est opérationnel !');
});

module.exports = app;