const bodyParts = [
    { name: 'Épaules', exercises: [
    { name: 'Pompes épaules', desc: 'Pompes classiques ciblant les épaules.', type: 'reps', baseGoal: 10 },
    { name: 'Élever les bras', desc: 'Étendre les bras latéralement.', type: 'reps', baseGoal: 15 },
    { name: 'Tirage épaules', desc: 'Tirer avec une bande de résistance.', type: 'reps', baseGoal: 12 },
    { name: 'Roulement d\'épaules', desc: 'Roulements circulaires.', type: 'reps', baseGoal: 20 },
    { name: 'Planches latérales', desc: 'Planche sur le côté.', type: 'time', baseGoal: 30 }
    ]},
    { name: 'Torse', exercises: [
    { name: 'Pompes classiques', desc: 'Pompes standard pour le torse.', type: 'reps', baseGoal: 15 },
    { name: 'Push-ups déclinés', desc: 'Pompes avec les pieds surélevés.', type: 'reps', baseGoal: 10 },
    { name: 'Dips triceps', desc: 'Dips utilisant une chaise.', type: 'reps', baseGoal: 12 },
    { name: 'Étalement poitrine', desc: 'Étendre les bras devant.', type: 'reps', baseGoal: 12 },
    { name: 'Planche torse', desc: 'Planche ventrale armée.', type: 'time', baseGoal: 45 }
    ]},
    { name: 'Bras', exercises: [
    { name: 'Curl biceps', desc: 'Flexion des biceps avec poids.', type: 'reps', baseGoal: 12 },
    { name: 'Extension triceps', desc: 'Extension des triceps.', type: 'reps', baseGoal: 10 },
    { name: 'Hammer curl', desc: 'Curl en marteau.', type: 'reps', baseGoal: 12 },
    { name: 'Dips bras', desc: 'Dips pour les bras.', type: 'reps', baseGoal: 15 },
    { name: 'Pompes diamant', desc: 'Pompes avec mains en losange.', type: 'reps', baseGoal: 10 }
    ]},
    { name: 'Jambes', exercises: [
    { name: 'Squats', desc: 'Squats corps complet.', type: 'reps', baseGoal: 15 },
    { name: 'Fentes', desc: 'Fentes alternées.', type: 'reps', baseGoal: 10 },
    { name: 'Jumping jacks', desc: 'Sauteurs classiques.', type: 'reps', baseGoal: 30 },
    { name: 'Relevés talons', desc: 'Relevés sur la pointe des pieds.', type: 'reps', baseGoal: 20 },
    { name: 'Pont fessier', desc: 'Pont en bougeant le bassin.', type: 'reps', baseGoal: 15 }
    ]},
    { name: 'Dos', exercises: [
    { name: 'Tirage dos', desc: 'Tirage avec bande.', type: 'reps', baseGoal: 12 },
    { name: 'Superman', desc: 'Positions superman au sol.', type: 'reps', baseGoal: 15 },
    { name: 'Pompes rangées', desc: 'Pompes inversées en rangée.', type: 'reps', baseGoal: 10 },
    { name: 'État dos', desc: 'Étirement du dos.', type: 'reps', baseGoal: 20 },
    { name: 'Planches archées', desc: 'Planche en inversion.', type: 'time', baseGoal: 30 }
    ]},
    { name: 'Abdos', exercises: [
    { name: 'Crunches', desc: 'Crunches classiques.', type: 'reps', baseGoal: 20 },
    { name: 'Planche abdos', desc: 'Planche ventrale statique.', type: 'time', baseGoal: 45 },
    { name: 'Russian twists', desc: 'Torsions russes.', type: 'reps', baseGoal: 15 },
    { name: 'Jambes levées', desc: 'Lever les jambes allongé.', type: 'reps', baseGoal: 12 },
    { name: 'Bicycle crunches', desc: 'Crunches en vélo.', type: 'reps', baseGoal: 20 }
    ]},
    { name: 'Corps Complet', exercises: [
    { name: 'Burpees', desc: 'Burpees complets.', type: 'reps', baseGoal: 8 },
    { name: 'Mountain climbers', desc: 'Escaladeurs de montagne.', type: 'reps', baseGoal: 30 },
    { name: 'Jumping squats', desc: 'Squats avec saut.', type: 'reps', baseGoal: 12 },
    { name: 'Push-ups burst', desc: 'Série de pompes rapides.', type: 'reps', baseGoal: 15 },
    { name: 'Circuit corps', desc: 'Circuit mixte rapide.', type: 'time', baseGoal: 60 }
    ]}
];

let selectedExerciseId = null;
let exerciseTimerInterval = null;
let startExerciseTime = null;
let currentDay = new Date().toDateString();
let exercisesData = [];
let exerciseStats = JSON.parse(localStorage.getItem('exerciseStats') || '{}');

// Charger ou générer exercices du jour
function loadDailyExercises() {
    const dayIndex = new Date().getDay();
    const bodyPart = bodyParts[dayIndex];
    document.getElementById('day-info').textContent = `Jour : ${currentDay} - Partie : ${bodyPart.name}`;

    exercisesData = bodyPart.exercises.map((ex, index) => {
    const statName = ex.name;
    const stats = exerciseStats[statName] || { avgTime: ex.baseGoal, successRate: 1 };
    const adjustment = stats.successRate > 0.8 ? 1.1 : stats.successRate < 0.6 ? 0.9 : 1;
    let adjustedGoal = ex.type === 'reps' ? Math.round(ex.baseGoal * adjustment * (stats.avgTime / ex.baseGoal || 1)) : Math.round((ex.baseGoal * adjustment) + (stats.avgTime - ex.baseGoal) / 2 || ex.baseGoal);
    if (adjustedGoal < 1) adjustedGoal = 1;
    return { ...ex, id: index, goal: adjustedGoal, completed: false, failed: false };
    });
    renderExercisesList();
}

// Rendre la liste d'exercices
function renderExercisesList() {
    const container = document.getElementById('exercises-list');
    container.innerHTML = '';
    exercisesData.forEach(ex => {
    const item = document.createElement('div');
    item.className = `exercise-item ${ex.completed ? 'completed' : ex.failed ? 'failed' : ''}`;
    item.dataset.id = ex.id;
    item.innerHTML = `
        <h3>${ex.name}</h3>
        <p class="description">${ex.desc}</p>
        <p class="goal">Objectif : ${ex.goal} ${ex.type === 'reps' ? 'répétitions' : 'secondes'}</p>
        <p class="status ${ex.completed ? 'completed' : ex.failed ? 'failed' : 'pending'}">
        ${ex.completed ? 'TERMINÉ' : ex.failed ? 'PARTIEL' : 'EN COURS'}
        </p>
        <div class="exercise-details hidden" id="details-${ex.id}">
            <div class="timer" id="exercise-timer-${ex.id}">00:00</div>
            <div class="button-container">
                <button id="start-exercise-${ex.id}" class="start-btn">
                    Commencer l'exercice
                </button>
            </div>
            <div class="completion-input hidden" id="completion-input-${ex.id}">
                <p class="input-label">Nombre réalisé :</p>
                <input type="number" id="reps-input-${ex.id}" min="0" step="1" value="${ex.type === 'reps' ? ex.goal : 0}" />
                <button id="complete-exercise-${ex.id}" class="complete-btn">
                    Terminé
                </button>
            </div>
        </div>
    `;
    item.addEventListener('click', (e) => {
        // Éviter le toggle si on clique sur un bouton ou input
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
        toggleExerciseDetails(ex.id);
    });
    container.appendChild(item);
    });
}

// Toggle des détails d'exercice dans la carte
function toggleExerciseDetails(id) {
    // Fermer tous les autres détails
    exercisesData.forEach(ex => {
        if (ex.id !== id) {
            const details = document.getElementById(`details-${ex.id}`);
            if (details) details.classList.add('hidden');
        }
    });
    
    // Toggle les détails de l'exercice sélectionné
    const details = document.getElementById(`details-${id}`);
    const isHidden = details.classList.contains('hidden');
    
    if (isHidden) {
        details.classList.remove('hidden');
        selectedExerciseId = id;
        const ex = exercisesData[id];
        
        // Reset timer et état
        document.getElementById(`exercise-timer-${id}`).textContent = '00:00';
        document.getElementById(`start-exercise-${id}`).style.display = 'block';
        document.getElementById(`completion-input-${id}`).classList.add('hidden');
        
        // Attacher les event listeners pour cette carte
        attachExerciseListeners(id);
    } else {
        details.classList.add('hidden');
        selectedExerciseId = null;
        stopExerciseTimer();
    }
}

// Attacher les event listeners pour un exercice spécifique
function attachExerciseListeners(id) {
    const startBtn = document.getElementById(`start-exercise-${id}`);
    const completeBtn = document.getElementById(`complete-exercise-${id}`);
    
    // Supprimer les anciens listeners s'ils existent
    const newStartBtn = startBtn.cloneNode(true);
    const newCompleteBtn = completeBtn.cloneNode(true);
    startBtn.parentNode.replaceChild(newStartBtn, startBtn);
    completeBtn.parentNode.replaceChild(newCompleteBtn, completeBtn);
    
    // Ajouter les nouveaux listeners
    newStartBtn.addEventListener('click', () => {
        startExerciseTime = Date.now();
        newStartBtn.style.display = 'none';
        document.getElementById(`completion-input-${id}`).classList.remove('hidden');
        startExerciseTimer(id);
    });
    
    newCompleteBtn.addEventListener('click', () => {
        const ex = exercisesData[selectedExerciseId];
        const realized = parseInt(document.getElementById(`reps-input-${id}`).value) || 0;
        const success = realized >= ex.goal;
        ex.completed = success;
        ex.failed = !success;
        const takenTime = (Date.now() - startExerciseTime) / 1000;
        updateStats(ex.name, takenTime, success, realized);
        stopExerciseTimer();
        renderExercisesList();
    });
}

// Timer pour l'exercice
function startExerciseTimer(id) {
    exerciseTimerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startExerciseTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timerElement = document.getElementById(`exercise-timer-${id}`);
    if (timerElement) {
        timerElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    }, 1000);
}

function stopExerciseTimer() {
    if (exerciseTimerInterval) {
    clearInterval(exerciseTimerInterval);
    exerciseTimerInterval = null;
    }
}

// Mettre à jour stats
function updateStats(exerciseName, takenTime, success, realized) {
    const stats = exerciseStats[exerciseName] || { avgTime: takenTime, count: 0, successCount: 0, avgRealized: realized };
    stats.count++;
    stats.avgTime = ((stats.avgTime * (stats.count - 1)) + takenTime) / stats.count;
    stats.avgRealized = ((stats.avgRealized * (stats.count - 1)) + realized) / stats.count;
    if (success) stats.successCount++;
    stats.successRate = stats.successCount / stats.count;
    exerciseStats[exerciseName] = stats;
    localStorage.setItem('exerciseStats', JSON.stringify(exerciseStats));
}

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    // Réinitialiser jour
    document.getElementById('reset-day').addEventListener('click', () => {
        localStorage.removeItem('exerciseStats');
        stopExerciseTimer();
        loadDailyExercises();
    });

    // Initialisation
    loadDailyExercises();
});