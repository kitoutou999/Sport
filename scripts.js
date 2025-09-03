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

// Persisted user data (history, current goals, settings)
const STORAGE_KEY = 'userExercises:v1';
const defaultSettings = {
  decreaseOnFailPct: 0.10,
  smallIncreasePct: 0.05,
  bigIncreaseMultiplier: 1.2,
  successThreshold: 0.8,
  trendWindow: 6,
  trendWeeks: 3,
  maxStepPct: 0.20,
  // rythme / durée : si l'utilisateur est plus rapide que sa moyenne, augmenter légèrement
  paceThreshold: 0.10, // 10% de différence pour déclencher
  paceFastPct: 0.08, // % d'augmentation si plus rapide
  paceSlowPct: 0.04, // % de diminution si plus lent
  defaultSecPerRep: 2 // valeur de secours (secondes par répétition)
};

// Paramètres additionnels inspirés du README
defaultSettings.paceBeta = 0.2; // EMA pour pace_ref
defaultSettings.bonusBasePct = 0.10; // B = +10%
defaultSettings.kSpeed = 0.5; // impact de la vitesse
defaultSettings.maxIncreasePct = 0.20; // +20% max
defaultSettings.maxDecreasePct = 0.15; // -15% max
defaultSettings.minRepIncrement = 1;
defaultSettings.minTimeIncrement = 5; // secondes
defaultSettings.hardCapMinDefault = 1;
defaultSettings.hardCapMaxDefault = 9999;
defaultSettings.acwrEnabled = false;
defaultSettings.acwrHigh = 1.5;
defaultSettings.acwrLow = 0.6;

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function roundToGranularity(val, type, settings) {
  if (type === 'time') {
    const step = settings.minTimeIncrement || defaultSettings.minTimeIncrement;
    return Math.max(step, Math.round(Math.ceil(val / step) * step));
  } else {
    const step = settings.minRepIncrement || defaultSettings.minRepIncrement;
    return Math.max(1, Math.round(Math.ceil(val / step) * step));
  }
}

// Calculer la prochaine cible pour un enregistrement récent (entry)
function calculateNextTarget(record, entry, exerciseMeta, settings) {
  // record: userData.exercises[exerciseName]
  // entry: { ts, target, realized, duration, success }
  settings = settings || (userData.settings || defaultSettings);
  const type = exerciseMeta && exerciseMeta.type ? exerciseMeta.type : 'reps';
  const T = entry.target;
  const r = entry.realized || 0;
  const t = entry.duration || 0; // secondes
  let deltaPct = 0;

  // helpers for bounds
  const maxInc = settings.maxIncreasePct;
  const maxDec = settings.maxDecreasePct;

  if (type === 'reps') {
    // pace = t / r
    const baseline = record.pace_ref || settings.defaultSecPerRep || 2;
    let pace = (r > 0 && t > 0) ? (t / r) : baseline;
    // compute S only if we have a valid pace
    let S = 0;
    try {
      S = clamp((baseline - pace) / (settings.paceThreshold * baseline), -1, 1);
    } catch (e) {
      S = 0;
    }

    if (r > T) {
      // dépassement : augmentation plus marquée, proportionnelle mais plafonnée
      const exceedPct = (r - T) / Math.max(1, T); // fraction dépassée
      const extra = Math.min(exceedPct, 0.5) * (settings.bonusBasePct || 0.1); // jusqu'à 50% de B en bonus
      deltaPct = (settings.bonusBasePct || 0.1) * (1 + (settings.kSpeed || 0.5) * S) + extra;
    } else if (r === T) {
      // atteint pile : petite augmentation, moins que dépassement
      deltaPct = (settings.bonusBasePct || 0.1) * 0.6 * (1 + (settings.kSpeed || 0.5) * S);
    } else if (r >= Math.ceil(0.8 * T)) {
      // échec partiel
      deltaPct = -0.05;
    } else {
      // échec net
      const ratio = r / Math.max(1, T);
      if (ratio >= 0.6) deltaPct = -0.10;
      else deltaPct = -0.15;
    }

    // clamp
    deltaPct = clamp(deltaPct, -maxDec, maxInc);

    // appliquer
    let next = Math.round(T * (1 + deltaPct));
    next = roundToGranularity(next, 'reps', settings);

    // update pace_ref only on success
    if (r >= T && t > 0) {
      const beta = settings.paceBeta || 0.2;
      record.pace_ref = record.pace_ref ? ((1 - beta) * record.pace_ref + beta * pace) : pace;
    }

    // streaks
    if (r >= T) {
      record.success_streak = (record.success_streak || 0) + 1;
      record.fail_streak = 0;
    } else {
      record.fail_streak = (record.fail_streak || 0) + 1;
      record.success_streak = 0;
    }

    // hard caps
    const hardMin = record.hard_cap_min || settings.hardCapMinDefault || 1;
    const hardMax = record.hard_cap_max || settings.hardCapMaxDefault || 9999;
    next = clamp(next, hardMin, hardMax);
    return next;
  } else {
    // type === 'time'
    if (t >= T) {
      deltaPct = settings.bonusBasePct;
      // bonus for overhold
      const over = (t / T) - 1;
      if (over > 0.1) {
        deltaPct += 0.05 * Math.min(over * 100, 10); // scaled small
      }
    } else if (t >= 0.8 * T) {
      deltaPct = -0.05;
    } else {
      deltaPct = -0.10;
    }
    deltaPct = clamp(deltaPct, -maxDec, maxInc);
    let next = Math.round(T * (1 + deltaPct));
    next = roundToGranularity(next, 'time', settings);
    const hardMin = record.hard_cap_min || settings.hardCapMinDefault || 1;
    const hardMax = record.hard_cap_max || settings.hardCapMaxDefault || 9999;
    next = clamp(next, hardMin, hardMax);

    // streaks
    if (t >= T) { record.success_streak = (record.success_streak || 0) + 1; record.fail_streak = 0; }
    else { record.fail_streak = (record.fail_streak || 0) + 1; record.success_streak = 0; }
    return next;
  }
}
let userData = {
  version: 1,
  updatedAt: Date.now(),
  exercises: {},
  settings: { ...defaultSettings }
};

function loadUserData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // merge safely
      userData = { ...userData, ...parsed };
      userData.settings = { ...defaultSettings, ...(parsed.settings || {}) };
    }
  } catch (e) {
    console.warn('loadUserData failed', e);
  }
}

function saveUserData() {
  try {
    userData.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  } catch (e) {
    console.warn('saveUserData failed', e);
  }
}

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
    const saved = userData.exercises[ex.name];
    const displayGoal = (saved && saved.currentGoal) ? saved.currentGoal : ex.goal;

    const item = document.createElement('div');
    item.className = `exercise-item ${ex.completed ? 'completed' : ex.failed ? 'failed' : ''}`;
    item.dataset.id = ex.id;
    item.innerHTML = `
        <div class="exercise-summary">
            <h3>${ex.name}</h3>
            <span class="status ${ex.completed ? 'completed' : ex.failed ? 'failed' : 'pending'}">
                ${ex.completed ? '✅' : ex.failed ? '❌' : '⏳'}
            </span>
        </div>
        <div class="exercise-details hidden" id="details-${ex.id}">
            <p class="description">${ex.desc}</p>
            <p class="goal">Objectif : <span id="display-goal-${ex.id}">${displayGoal}</span> ${ex.type === 'reps' ? 'répétitions' : 'secondes'}</p>
            <div class="timer" id="exercise-timer-${ex.id}">00:00</div>
            <div class="button-container">
                <button id="start-exercise-${ex.id}" class="start-btn">
                    Commencer l'exercice
                </button>
            </div>
            <div class="completion-input hidden" id="completion-input-${ex.id}">
                <p class="input-label">Nombre réalisé :</p>
                <input type="number" id="reps-input-${ex.id}" min="0" step="1" value="${ex.type === 'reps' ? displayGoal : 0}" />
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
    if (!startBtn || !completeBtn) return;
    
    // Supprimer les anciens listeners s'ils existent
    const newStartBtn = startBtn.cloneNode(true);
    const newCompleteBtn = completeBtn.cloneNode(true);
    startBtn.parentNode.replaceChild(newStartBtn, startBtn);
    completeBtn.parentNode.replaceChild(newCompleteBtn, completeBtn);
    
    // Ajouter les nouveaux listeners
    newStartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startExerciseTime = Date.now();
        newStartBtn.style.display = 'none';
        const completion = document.getElementById(`completion-input-${id}`);
        if (completion) completion.classList.remove('hidden');
        // définir la valeur de l'input sur le goal courant (sauvegardé si présent)
        const ex = exercisesData[id];
        const saved = userData.exercises && userData.exercises[ex.name];
        const currentGoal = (saved && saved.currentGoal) ? saved.currentGoal : ex.goal;
        const input = document.getElementById(`reps-input-${id}`);
        if (input) input.value = currentGoal;
        startExerciseTimer(id);
    });
    
    newCompleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ex = exercisesData[id];
        // target = currentGoal at time of completion
        const saved = userData.exercises && userData.exercises[ex.name];
        const target = (saved && saved.currentGoal) ? saved.currentGoal : ex.goal;
        const realized = parseInt(document.getElementById(`reps-input-${id}`).value) || 0;
        const success = realized >= target;
        ex.completed = success;
        ex.failed = !success;
        const takenTime = (Date.now() - startExerciseTime) / 1000;
        // Passer le target explicitement à updateStats
        updateStats(ex.name, takenTime, success, realized, target);
        stopExerciseTimer();
        // Mettre à jour l'affichage du goal (au cas où computeNewGoal l'a changé)
        const savedAfter = userData.exercises && userData.exercises[ex.name];
        const newGoal = (savedAfter && savedAfter.currentGoal) ? savedAfter.currentGoal : ex.goal;
        const goalEl = document.getElementById(`display-goal-${id}`);
        if (goalEl) goalEl.textContent = newGoal;
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

// Enregistrer une occurrence d'exercice dans userData.history
function recordExerciseResult(exerciseName, target, realized, duration, success) {
  if (!userData.exercises[exerciseName]) {
  userData.exercises[exerciseName] = { history: [], currentGoal: target, pace_ref: null, success_streak: 0, fail_streak: 0, hard_cap_min: null, hard_cap_max: null };
  }
  const entry = { ts: Date.now(), target, realized, duration, success };
  userData.exercises[exerciseName].history.push(entry);
  // garder histoire raisonnable (ex: 200 entrées max)
  if (userData.exercises[exerciseName].history.length > 200) {
    userData.exercises[exerciseName].history.shift();
  }
  // mettre à jour currentGoal immédiatement selon les règles avancées (pacing, Δ% ...)
  try {
    const exerciseMeta = exercisesData.find(e => e.name === exerciseName) || {};
    const rec = userData.exercises[exerciseName];
    const next = calculateNextTarget(rec, entry, exerciseMeta, userData.settings);
    userData.exercises[exerciseName].currentGoal = next;
    rec.last_done_at = entry.ts;
  } catch (e) {
    // fallback sur l'ancien calcul global
    const newGoal = computeNewGoal(exerciseName);
    userData.exercises[exerciseName].currentGoal = newGoal;
  }
  saveUserData();
  return entry;
}

// Récupérer la fenêtre d'historique récente
function getRecentHistory(exerciseName, n) {
  const ex = userData.exercises[exerciseName];
  if (!ex || !ex.history) return [];
  return ex.history.slice(-n);
}

// Calculer nouveau goal selon règles
function computeNewGoal(exerciseName) {
  const settings = userData.settings || defaultSettings;
  const record = userData.exercises[exerciseName];
  if (!record) return null;
  const currentGoal = record.currentGoal || (exercisesData.find(e => e.name === exerciseName) || {}).goal || 1;
  const window = getRecentHistory(exerciseName, settings.trendWindow);
  if (!window.length) return currentGoal;

  // calculer la moyenne par semaine sur les dernières `trendWeeks` semaines si possible
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const weeks = settings.trendWeeks || 3;
  const weekBuckets = [];
  for (let w = 0; w < weeks; w++) {
    const start = now - (w + 1) * weekMs;
    const end = now - w * weekMs;
    const entries = (record.history || []).filter(h => h.ts >= start && h.ts < end);
    weekBuckets.push(entries);
  }
  // calculer moyenne réalisée sur les semaines non vides
  const weeklyAverages = weekBuckets.map(b => b.length ? b.reduce((s, r) => s + r.realized, 0) / b.length : null).filter(v => v !== null);
  const weeklyAvg = weeklyAverages.length ? (weeklyAverages.reduce((s, v) => s + v, 0) / weeklyAverages.length) : null;

  const successes = window.filter(r => r.success).length;
  const successRate = successes / window.length;
  const avgRealized = window.reduce((s, r) => s + r.realized, 0) / window.length;
  const avgTarget = window.reduce((s, r) => s + r.target, 0) / window.length;

  let newGoal = currentGoal;

  const last = window[window.length - 1];
  if (!last.success) {
    newGoal = Math.max(1, Math.ceil(currentGoal * (1 - settings.decreaseOnFailPct)));
  } else if (successRate >= settings.successThreshold && avgRealized >= avgTarget * 1.05) {
    // tendance positive — utiliser la moyenne hebdomadaire si disponible
    const effectiveRealized = weeklyAvg !== null ? weeklyAvg : avgRealized;
    const ratio = effectiveRealized / Math.max(1, avgTarget);
    // si l'utilisateur dépasse largement l'objectif, rapprocher du realized moyen
    // sans utiliser une multiplication répétée qui peut exploser.
    if (effectiveRealized > currentGoal) {
      const desired = Math.round(effectiveRealized);
      const delta = Math.max(0, desired - currentGoal);
      // permettre des sauts plus grands lorsque la marge est énorme, mais plafonner
      const capMultiplier = ratio >= 2 ? 3 : ratio >= 1.5 ? 2 : 1;
      const stepCap = Math.ceil(currentGoal * (settings.maxStepPct || 0.2) * capMultiplier);
      // rapprochement amorti vers la valeur réalisée (60% du delta), puis limiter
      const rawStep = Math.ceil(delta * 0.6);
      const minStep = Math.max(1, Math.ceil(currentGoal * settings.smallIncreasePct));
      const step = Math.max(minStep, Math.min(rawStep, stepCap));
      newGoal = Math.min(currentGoal + step, desired);
    } else {
      // si on n'a pas dépassé, appliquer une petite augmentation standard
      const recent = window.slice(-3);
      const strictlyIncreasing = recent.length === 3 && recent[0].realized < recent[1].realized && recent[1].realized < recent[2].realized;
      if (strictlyIncreasing) {
        newGoal = Math.ceil(currentGoal * settings.bigIncreaseMultiplier);
      } else {
        newGoal = Math.ceil(currentGoal * (1 + settings.smallIncreasePct));
      }
    }
    // Ajustement additionnel basé sur la durée (rythme)
    try {
      // calculer secs par répétition moyen sur la fenêtre
      const repsEntries = window.filter(r => r.realized && r.duration && r.duration > 0);
      if (repsEntries.length) {
        const secsPerRepAvg = repsEntries.reduce((s, r) => s + (r.duration / Math.max(1, r.realized)), 0) / repsEntries.length;
        const baseline = settings.defaultSecPerRep || 2;
        if (secsPerRepAvg < baseline * (1 - settings.paceThreshold)) {
          // plus rapide : augmenter légèrement le goal
          const paceIncrease = Math.ceil(newGoal * settings.paceFastPct);
          newGoal = Math.min(newGoal + paceIncrease, Math.ceil(effectiveRealized));
        } else if (secsPerRepAvg > baseline * (1 + settings.paceThreshold)) {
          // plus lent : réduire légèrement le goal
          const paceDecrease = Math.ceil(newGoal * settings.paceSlowPct);
          newGoal = Math.max(1, newGoal - paceDecrease);
        }
      }
    } catch (e) {
      // si problème, ignorer l'ajustement de rythme
    }
  } else {
    // peu ou pas de changement — rapprocher de avgRealized
    const suggested = Math.round(avgRealized);
    // limiter variation
    const maxUp = Math.ceil(currentGoal * settings.maxStepPct);
    const maxDown = Math.ceil(currentGoal * settings.maxStepPct);
    if (suggested > currentGoal) {
      newGoal = Math.min(currentGoal + maxUp, suggested);
    } else if (suggested < currentGoal) {
      newGoal = Math.max(currentGoal - maxDown, suggested, 1);
    } else {
      newGoal = currentGoal;
    }
  }

  if (newGoal < 1) newGoal = 1;
  return newGoal;
}

// Hook: remplacer updateStats pour appeler recordExerciseResult
function updateStats(exerciseName, takenTime, success, realized, target) {
  const stats = exerciseStats[exerciseName] || { avgTime: takenTime, count: 0, successCount: 0, avgRealized: realized };
  stats.count++;
  stats.avgTime = ((stats.avgTime * (stats.count - 1)) + takenTime) / stats.count;
  stats.avgRealized = ((stats.avgRealized * (stats.count - 1)) + realized) / stats.count;
  if (success) stats.successCount++;
  stats.successRate = stats.successCount / stats.count;
  exerciseStats[exerciseName] = stats;
  localStorage.setItem('exerciseStats', JSON.stringify(exerciseStats));

  // target peut être passé explicitement (la valeur courante affichée)
  const usedTarget = typeof target !== 'undefined' ? target : Math.round(exercisesData.find(e => e.name === exerciseName).goal || 0);
  recordExerciseResult(exerciseName, usedTarget, realized, takenTime, success);
}

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
  // Charger les données utilisateur
  loadUserData();

  // Réinitialiser jour
  document.getElementById('reset-day').addEventListener('click', () => {
    localStorage.removeItem('exerciseStats');
    stopExerciseTimer();
    loadDailyExercises();
  });

  // Initialisation
  loadDailyExercises();
});

// import/export UI removed