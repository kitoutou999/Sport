// Simulateur autonome pour l'algorithme computeNewGoal

const defaultSettings = {
  decreaseOnFailPct: 0.10,
  smallIncreasePct: 0.05,
  bigIncreaseMultiplier: 1.2,
  successThreshold: 0.8,
  trendWindow: 6,
  maxStepPct: 0.20
};

function computeNewGoalSim(currentGoal, windowEntries, settings = defaultSettings) {
  if (!windowEntries || !windowEntries.length) return currentGoal;
  const successes = windowEntries.filter(r => r.success).length;
  const successRate = successes / windowEntries.length;
  const avgRealized = windowEntries.reduce((s, r) => s + r.realized, 0) / windowEntries.length;
  const avgTarget = windowEntries.reduce((s, r) => s + r.target, 0) / windowEntries.length;

  // weekly averages simulation: assume each entry spaced by 2 days going back
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const historyWithTs = windowEntries.map((e, i) => ({...e, ts: now - (windowEntries.length - 1 - i) * 2 * dayMs}));
  const weeks = settings.trendWeeks || 3;
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const weekBuckets = [];
  for (let w = 0; w < weeks; w++) {
    const start = now - (w + 1) * weekMs;
    const end = now - w * weekMs;
    const entries = historyWithTs.filter(h => h.ts >= start && h.ts < end);
    weekBuckets.push(entries);
  }
  const weeklyAverages = weekBuckets.map(b => b.length ? b.reduce((s, r) => s + r.realized, 0) / b.length : null).filter(v => v !== null);
  const weeklyAvg = weeklyAverages.length ? (weeklyAverages.reduce((s, v) => s + v, 0) / weeklyAverages.length) : null;

  let newGoal = currentGoal;
  const last = windowEntries[windowEntries.length - 1];
  if (!last.success) {
    newGoal = Math.max(1, Math.ceil(currentGoal * (1 - settings.decreaseOnFailPct)));
  } else if (successRate >= settings.successThreshold && avgRealized >= avgTarget * 1.05) {
    // accélération si avgRealized >> avgTarget
  const effectiveRealized = weeklyAvg !== null ? weeklyAvg : avgRealized;
  const ratio = effectiveRealized / Math.max(1, avgTarget);
    // rapprocher du realized moyen sans multiplication répétée
    if (effectiveRealized > currentGoal) {
      const desired = Math.round(effectiveRealized);
      const delta = Math.max(0, desired - currentGoal);
      const capMultiplier = ratio >= 2 ? 3 : ratio >= 1.5 ? 2 : 1;
      const stepCap = Math.ceil(currentGoal * (settings.maxStepPct || 0.2) * capMultiplier);
      const rawStep = Math.ceil(delta * 0.6);
      const minStep = Math.max(1, Math.ceil(currentGoal * settings.smallIncreasePct));
      const step = Math.max(minStep, Math.min(rawStep, stepCap));
      newGoal = Math.min(currentGoal + step, desired);
    } else {
      const recent = windowEntries.slice(-3);
      const strictlyIncreasing = recent.length === 3 && recent[0].realized < recent[1].realized && recent[1].realized < recent[2].realized;
      if (strictlyIncreasing) {
        newGoal = Math.ceil(currentGoal * settings.bigIncreaseMultiplier);
      } else {
        newGoal = Math.ceil(currentGoal * (1 + settings.smallIncreasePct));
      }
    }
  } else {
    const suggested = Math.round(avgRealized);
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

function runScenario(type, initialGoal, n) {
  let goal = initialGoal;
  const history = [];
  const out = [];
  for (let i = 0; i < n; i++) {
    let entry;
    if (type === 'success') {
      // simulate slightly improving realized
      const realized = Math.round(goal * (1 + i * 0.02));
      entry = { target: goal, realized, success: realized >= goal };
    } else if (type === 'fail') {
      const realized = Math.max(0, Math.round(goal * 0.8));
      entry = { target: goal, realized, success: realized >= goal };
    } else if (type === 'mix') {
      const realized = (i % 2 === 0) ? Math.round(goal * 1.02) : Math.round(goal * 0.85);
      entry = { target: goal, realized, success: realized >= goal };
    }
    history.push(entry);
    const window = history.slice(-6);
    const newGoal = computeNewGoalSim(goal, window);
    out.push({i: i+1, entry, newGoal});
    goal = newGoal;
  }
  return out;
}

// UI hookup
const outEl = document.getElementById('output');
document.getElementById('run-success').addEventListener('click', () => {
  const g = parseInt(document.getElementById('initial-goal').value) || 10;
  const n = parseInt(document.getElementById('window-n').value) || 6;
  const res = runScenario('success', g, n);
  outEl.textContent = JSON.stringify(res, null, 2);
});

document.getElementById('run-fail').addEventListener('click', () => {
  const g = parseInt(document.getElementById('initial-goal').value) || 10;
  const n = parseInt(document.getElementById('window-n').value) || 6;
  const res = runScenario('fail', g, n);
  outEl.textContent = JSON.stringify(res, null, 2);
});

document.getElementById('run-mix').addEventListener('click', () => {
  const g = parseInt(document.getElementById('initial-goal').value) || 10;
  const n = parseInt(document.getElementById('window-n').value) || 6;
  const res = runScenario('mix', g, n);
  outEl.textContent = JSON.stringify(res, null, 2);
});

document.getElementById('run-custom').addEventListener('click', () => {
  const g = parseInt(document.getElementById('initial-goal').value) || 10;
  const n = parseInt(document.getElementById('window-n').value) || 6;
  const arr = [];
  for (let i = 0; i < n; i++) arr.push(prompt(`Entrer realized pour tentative ${i+1} (target initial: ${g})`, `${Math.round(g)}`));
  const history = arr.map(v => ({target:g, realized: parseInt(v)||0, success: (parseInt(v)||0) >= g }));
  const out = [];
  let goal = g;
  for (let i=0;i<n;i++){
    const window = history.slice(0,i+1).slice(-6);
    const newGoal = computeNewGoalSim(goal, window);
    out.push({i:i+1, entry:history[i], newGoal});
    goal=newGoal;
  }
  outEl.textContent = JSON.stringify(out, null, 2);
});
