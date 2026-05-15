// afficher la liste des étudiants
function loadStudents() {
    fetch('/api/students')
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById('student-list');
            if (data.length === 0) {
                list.innerHTML = '<p>Aucun étudiant enregistré.</p>';
                return;
            }
            
            list.innerHTML = '<ul>' + data.map(s => `
                <li>
                    <strong>${s.name}</strong> - Note: ${s.grade}/20 
                    <button class="delete-btn" onclick="deleteStudent(${s.id})">Supprimer</button>
                </li>
            `).join('') + '</ul>';
        })
        .catch(err => console.error("Erreur chargement:", err));
}

// ajouter
function addStudent() {
    const name = document.getElementById('newName').value;
    const grade = document.getElementById('newGrade').value;

    if (!name || !grade) return alert("Remplis tous les champs !");

    fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, grade: parseInt(grade), status: 'Inscrit' })
    })
    .then(() => {
        document.getElementById('newName').value = '';
        document.getElementById('newGrade').value = '';
        loadStudents(); // Rafraîchir la liste
    });
}

// supprimer
function deleteStudent(id) {
    if (!confirm("Supprimer cet étudiant ?")) return;

    fetch(`/api/students/${id}`, {
        method: 'DELETE'
    })
    .then(() => loadStudents());
}

// Fonction pour l'Orientation
function getOrientation() {
    const grade = document.getElementById('userGrade').value;
    if (!grade) return;

    fetch('/api/orient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: parseInt(grade) })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('orientationResult').innerText = "💡 Suggestion : " + data.recommendation;
    });
}

// Charger les données au démarrage
document.addEventListener('DOMContentLoaded', loadStudents);