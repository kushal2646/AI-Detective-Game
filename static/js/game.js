// ===== AI DETECTIVE GAME — GAME LOGIC =====

// ---- State ----
let state = {
  currentLevel: null,
  unlockedLevels: [],
  scores: {},
  foundClues: [],
  questionedSuspects: [],
  puzzleSolved: false,
  timerInterval: null,
  timeLeft: 600,
  score: 0,
  chatSuspect: null,
  chatHistory: [],
  apiKey: '',
  demoMode: false
};

// ---- Persistence ----
function saveState() {
  try {
    localStorage.setItem('detectiveGame', JSON.stringify({
      unlockedLevels: state.unlockedLevels,
      scores: state.scores,
      apiKey: state.apiKey
    }));
  } catch (e) {}
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('detectiveGame') || '{}');
    state.unlockedLevels = saved.unlockedLevels || [1];
    state.scores = saved.scores || {};
    state.apiKey = saved.apiKey || '';
  } catch (e) {
    state.unlockedLevels = [1];
  }
}

// ---- API Key ----
function checkApiKey() {
  if (!state.apiKey) {
    const modal = document.getElementById('apiModal');
    modal.classList.add('show');
    if (modal.showModal) modal.showModal();
  }
}

function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (key.startsWith('sk-ant-')) {
    state.apiKey = key;
    saveState();
    const modal = document.getElementById('apiModal');
    modal.classList.remove('show');
    if (modal.close) modal.close();
    state.demoMode = false;
    showToast('API key saved. AI features enabled!');
  } else {
    showToast('Invalid key format. Should start with sk-ant-');
  }
}

function closeApiModal() {
  state.demoMode = true;
  const modal = document.getElementById('apiModal');
  modal.classList.remove('show');
  if (modal.close) modal.close();
  showToast('Demo mode active. AI responses will use fallbacks.');
}

function openApiSettings() {
  const modal = document.getElementById('apiModal');
  const input = document.getElementById('apiKeyInput');
  if (state.apiKey) input.value = state.apiKey;
  modal.classList.add('show');
  if (modal.showModal) modal.showModal();
  input.focus();
}

// ---- Screen Navigation ----
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  state.currentScreen = id;
  if (id === 'levelSelect') renderLevels();
}

// ---- UI Helpers ----
function showLoading(text = 'Thinking...') {
  document.getElementById('loadingText').textContent = text;
  document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('show');
}

function showToast(msg, duration = 3500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

// ---- Level Select ----
function renderLevels() {
  const grid = document.getElementById('levelsGrid');
  grid.innerHTML = LEVELS.map(l => {
    const unlocked = state.unlockedLevels.includes(l.id);
    const completed = state.scores[l.id];
    const dots = [1, 2, 3].map(i =>
      `<div class="diff-dot ${i <= l.difficulty ? 'on' : ''}"></div>`
    ).join('');
    return `
      <div class="level-card ${unlocked ? '' : 'locked'}"
           onclick="${unlocked ? `startLevel(${l.id})` : `showToast('Complete previous cases first')`}">
        ${!unlocked ? '<div class="lc-lock">🔒</div>' : ''}
        <div class="lc-num">CASE #00${l.id}</div>
        <h3 class="lc-title">${l.title}</h3>
        <p class="lc-desc">${l.subtitle}</p>
        <div class="lc-diff">${dots}</div>
        ${completed ? `<div class="lc-status">✓ SOLVED — ${completed.toLocaleString()} pts</div>` : ''}
      </div>`;
  }).join('');
}

// ---- Start Level ----
function startLevel(id) {
  const level = LEVELS.find(l => l.id === id);
  if (!level) return;

  state.currentLevel = level;
  state.foundClues = [];
  state.questionedSuspects = [];
  state.puzzleSolved = false;
  state.score = 1000;
  state.timeLeft = level.timeLimit;

  document.getElementById('invLevelNum').textContent = `LEVEL ${id}`;
  document.getElementById('invTitle').textContent = level.title;
  document.getElementById('scoreVal').textContent = state.score;
  document.getElementById('cluesVal').textContent = `0/${level.clues.length}`;
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('progressBar')?.setAttribute('aria-valuenow', '0');
  document.getElementById('hintBox').className = 'hint-box empty';
  document.getElementById('hintBox').textContent = 'Click "AI Hint" for a clue from your AI partner...';
  document.getElementById('notebook').textContent = 'Begin investigating to uncover clues...';
  document.getElementById('hintBtn').disabled = false;

  renderSuspects();
  renderClues();
  updateEvidenceBoard();

  if (state.timerInterval) clearInterval(state.timerInterval);
  updateTimer();
  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    state.score = Math.max(0, Math.floor((state.timeLeft / level.timeLimit) * 500) + 500);
    document.getElementById('scoreVal').textContent = state.score;
    updateTimer();
    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval);
      showResult(false, 'time', null, level);
    }
  }, 1000);

  showScreen('investigation');
  loadStory();
}

function updateTimer() {
  const m = Math.floor(state.timeLeft / 60).toString().padStart(2, '0');
  const s = (state.timeLeft % 60).toString().padStart(2, '0');
  document.getElementById('timerVal').textContent = `${m}:${s}`;
  document.getElementById('timerStat').className = state.timeLeft < 60 ? 'stat timer-urgent' : 'stat';
  const visibleClues = state.currentLevel.clues.filter(c => !c.hidden).length;
  const pct = Math.min(100,
    (state.foundClues.length / Math.max(1, state.currentLevel.clues.length)) * 40 +
    (state.questionedSuspects.length / Math.max(1, state.currentLevel.suspects.length)) * 30 +
    (state.puzzleSolved ? 30 : 0)
  );
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressBar')?.setAttribute('aria-valuenow', String(Math.round(pct)));
}

// ---- Story ----
async function loadStory() {
  const l = state.currentLevel;
  document.getElementById('storyBox').innerHTML =
    '<p class="placeholder">Generating crime scene report...</p>';
  try {
    const prompt = `You are a noir crime fiction writer. Write a gripping detective case opening report in 3-4 sentences for this case:
Title: "${l.title}"
Synopsis: "${l.subtitle}"
Suspects: ${l.suspects.map(s => s.name + ' (' + s.role + ')').join(', ')}
Write in past tense, noir style. Describe the location, time, and what was discovered. Create atmosphere. Do NOT name the culprit or reveal the solution.`;
    const story = await callClaude(prompt, 200);
    document.getElementById('storyBox').innerHTML =
      `<div class="story-label">Case Report — Level ${l.id}</div><p>${story}</p>`;
  } catch (e) {
    document.getElementById('storyBox').innerHTML =
      `<div class="story-label">Case Report — Level ${l.id}</div><p>${l.subtitle}. Three suspects, multiple clues, one truth. Investigate the scene, question every suspect, and solve the logic puzzle to crack the case before time runs out.</p>`;
  }
}

// ---- Suspects ----
function renderSuspects() {
  const l = state.currentLevel;
  document.getElementById('suspectsGrid').innerHTML = l.suspects.map((s, i) => {
    const questioned = state.questionedSuspects.includes(i);
    return `
      <div class="suspect-btn ${questioned ? 'questioned' : ''}" onclick="openChat(${i})">
        <div class="sb-avatar">${s.avatar}</div>
        <div class="sb-name">${s.name}</div>
        <div class="sb-role">${s.role}</div>
      </div>`;
  }).join('');
}

// ---- Clues ----
function renderClues() {
  const l = state.currentLevel;
  document.getElementById('cluesGrid').innerHTML = l.clues.map((c, i) => {
    const found = state.foundClues.includes(i);
    const hidden = c.hidden && !found;
    return `
      <div class="clue-card ${found ? 'found' : ''} ${hidden ? 'hidden-clue' : ''}"
           ${hidden ? `onclick="discoverClue(${i})"` : ''}>
        <div class="clue-icon">${found || !c.hidden ? c.icon : '❓'}</div>
        <div class="clue-name">${found || !c.hidden ? c.name : 'Hidden Evidence'}</div>
        <div class="clue-desc">${found || !c.hidden ? c.desc : 'Click to investigate this area...'}</div>
      </div>`;
  }).join('');
  const foundCount = state.foundClues.length + state.currentLevel.clues.filter(c => !c.hidden).length;
  document.getElementById('cluesVal').textContent =
    `${Math.min(foundCount, state.currentLevel.clues.length)}/${state.currentLevel.clues.length}`;
}

function discoverClue(i) {
  if (state.foundClues.includes(i)) return;
  state.foundClues.push(i);
  const clue = state.currentLevel.clues[i];
  showToast(`🔍 Evidence found: ${clue.name}`);
  renderClues();
  updateEvidenceBoard();
  addNote(`Discovered: ${clue.name} — ${clue.desc}`);
  updateTimer();
}

function updateEvidenceBoard() {
  const l = state.currentLevel;
  const all = l.clues.filter((c, i) => !c.hidden || state.foundClues.includes(i));
  if (all.length === 0) {
    document.getElementById('evidenceBoard').innerHTML =
      '<p class="placeholder-sm">No evidence collected yet.</p>';
    return;
  }
  document.getElementById('evidenceBoard').innerHTML = all.map(c => `
    <div class="evidence-item">
      <div class="ev-icon">${c.icon}</div>
      <div class="ev-text"><strong>${c.name}</strong>${c.desc}</div>
    </div>`).join('');
}

function addNote(text) {
  const nb = document.getElementById('notebook');
  const existing = nb.textContent === 'Begin investigating to uncover clues...' ? [] : nb.textContent.split('\n');
  existing.unshift(`• ${text}`);
  nb.textContent = existing.slice(0, 8).join('\n');
}

// ---- AI Hint ----
async function getHint() {
  const btn = document.getElementById('hintBtn');
  btn.disabled = true;
  const hb = document.getElementById('hintBox');
  hb.className = 'hint-box';
  hb.textContent = 'Consulting AI partner...';
  const l = state.currentLevel;
  const evidenceFound = l.clues.filter((c, i) => !c.hidden || state.foundClues.includes(i)).map(c => c.name).join(', ');
  const questioned = state.questionedSuspects.map(i => l.suspects[i].name).join(', ') || 'none yet';
  try {
    const hint = await callClaude(
      `You are a senior detective AI assistant helping a junior detective solve a case.
Give ONE concise hint (2 sentences max) for this case:
Case: "${l.title}" — ${l.subtitle}
Evidence collected: ${evidenceFound}
Suspects questioned: ${questioned}
The real culprit is ${l.criminal} but DO NOT reveal this name directly.
Give a subtle investigative hint that points toward the truth without spoiling it.`,
      120
    );
    hb.textContent = hint;
    state.score = Math.max(0, state.score - 100);
    document.getElementById('scoreVal').textContent = state.score;
    showToast('💡 Hint obtained (−100 pts)');
  } catch (e) {
    hb.textContent = 'Trust the evidence. The most incriminating detail is already in your hands.';
  }
  setTimeout(() => btn.disabled = false, 15000);
}

// ---- Chat ----
function openChat(i) {
  const l = state.currentLevel;
  const s = l.suspects[i];
  state.chatSuspect = { ...s, index: i };
  state.chatHistory = [];

  document.getElementById('chatAvatar').textContent = s.avatar;
  document.getElementById('chatName').textContent = s.name;
  document.getElementById('chatRole').textContent = s.role + ' · Interview Room';

  const msgs = document.getElementById('chatMessages');
  msgs.innerHTML = `
    <div class="msg msg-system">— Interview started. You are questioning ${s.name} —</div>
    <div class="msg msg-suspect"><strong>${s.name}:</strong> ${getOpeningLine(s)}</div>`;

  document.getElementById('chatInput').value = '';
  showScreen('chatScreen');
}

function getOpeningLine(s) {
  const lines = {
    "Security Guard": "Look, I've been working here for 6 years. My record is spotless. Ask whatever you need.",
    "Museum Cleaner": "I just clean the floors, Detective. I don't ask questions about what others do.",
    "Visitor": "I already spoke to two officers. This is becoming tiresome.",
    "Research Partner": "I'm devastated about Dr. Reeves. Whatever I can do to help, just ask.",
    "Lab Technician": "I clocked out at 5:30. I don't know anything about what happened after.",
    "Corporate Spy": "The cameras clearly show I was denied entry. I was never inside that building.",
    "Bank IT Admin": "I discovered the breach and flagged it immediately. I'm trying to help here.",
    "External Auditor": "My credentials expired three days before the incident. I can prove it."
  };
  return lines[s.role] || "I'll cooperate fully with your investigation, Detective.";
}

async function sendChat() {
  const input = document.getElementById('chatInput');
  const q = input.value.trim();
  if (!q || !state.chatSuspect) return;
  input.value = '';
  const btn = document.getElementById('chatSendBtn');
  btn.disabled = true;

  const msgs = document.getElementById('chatMessages');
  msgs.innerHTML += `<div class="msg msg-detective"><strong>Detective:</strong> ${q}</div>`;
  msgs.innerHTML += `<div class="msg msg-suspect msg-loading" id="loadMsg"><strong>${state.chatSuspect.name}:</strong> <span>.</span><span>.</span><span>.</span></div>`;
  msgs.scrollTop = msgs.scrollHeight;

  const l = state.currentLevel;
  const s = state.chatSuspect;
  const isGuilty = s.name === l.criminal;

  const systemPrompt = `You are ${s.name}, a ${s.role} being questioned by a detective about: "${l.title}".
Background about you: ${s.bg}
You are ${isGuilty
    ? 'GUILTY — you committed this crime. You are nervous but trying to act innocent and calm. Be slightly evasive, occasionally contradict yourself in subtle ways, deflect difficult questions, but avoid confessing. Never admit guilt.'
    : 'INNOCENT — you had nothing to do with the crime. Be cooperative but you noticed suspicious things about others. If asked the right questions, subtly hint at the real culprit without directly naming them.'
  }
Respond in 2-3 sentences only. Stay completely in character. Never break the fourth wall or mention being an AI.`;

  try {
    const reply = await callClaude(systemPrompt + '\n\nDetective asks: ' + q, 150);
    const loadEl = document.getElementById('loadMsg');
    if (loadEl) loadEl.remove();
    msgs.innerHTML += `<div class="msg msg-suspect"><strong>${s.name}:</strong> ${reply}</div>`;
    if (!state.questionedSuspects.includes(s.index)) {
      state.questionedSuspects.push(s.index);
      addNote(`Questioned ${s.name} (${s.role})`);
      renderSuspects();
      updateTimer();
    }
  } catch (e) {
    const loadEl = document.getElementById('loadMsg');
    if (loadEl) loadEl.remove();
    const fallback = isGuilty
      ? "I've already answered that. You're grasping at straws, Detective."
      : "I don't know exactly what happened. I just know what I saw that day.";
    msgs.innerHTML += `<div class="msg msg-suspect"><strong>${s.name}:</strong> ${fallback}</div>`;
    if (!state.questionedSuspects.includes(s.index)) {
      state.questionedSuspects.push(s.index);
      renderSuspects();
    }
  }
  msgs.scrollTop = msgs.scrollHeight;
  btn.disabled = false;
  input.focus();
}

// ---- Puzzle ----
function openPuzzle() {
  if (state.puzzleSolved) { showToast('Puzzle already solved! +200 pts already awarded.'); return; }
  const l = state.currentLevel;
  const p = l.puzzle;
  const modal = document.getElementById('puzzleModal');
  modal.classList.add('show');
  if (modal.showModal) modal.showModal();
  document.getElementById('puzzleSub').textContent = `Case ${l.id} — Logic Deduction Challenge`;
  document.getElementById('puzzleQ').textContent = p.q;
  document.getElementById('puzzleOptions').innerHTML = p.opts.map((o, i) =>
    `<button class="opt-btn" id="opt-${i}" onclick="checkPuzzle(${i})">${String.fromCharCode(65 + i)}. ${o}</button>`
  ).join('');
  document.getElementById('puzzleBtns').innerHTML =
    `<button class="action-btn btn-gold" onclick="closePuzzle()">Close</button>`;
}

function checkPuzzle(chosen) {
  const l = state.currentLevel;
  const correct = l.puzzle.answer;
  document.querySelectorAll('.opt-btn').forEach(b => b.onclick = null);
  if (chosen === correct) {
    document.getElementById(`opt-${chosen}`).classList.add('correct-ans');
    state.puzzleSolved = true;
    state.score += 200;
    document.getElementById('scoreVal').textContent = state.score;
    showToast('✅ Correct! +200 pts. Critical clue unlocked!');
    addNote('Puzzle solved! Critical logic deduction complete.');
    updateTimer();
    setTimeout(() => {
      closePuzzle();
      const lastClueIdx = l.clues.length - 1;
      if (!state.foundClues.includes(lastClueIdx)) {
        discoverClue(lastClueIdx);
      }
    }, 1600);
  } else {
    document.getElementById(`opt-${chosen}`).classList.add('wrong-ans');
    document.getElementById(`opt-${correct}`).classList.add('correct-ans');
    state.score = Math.max(0, state.score - 150);
    document.getElementById('scoreVal').textContent = state.score;
    showToast('❌ Wrong answer. −150 pts. Re-examine your evidence!');
    addNote('Puzzle attempt failed. Review the clues again.');
    setTimeout(closePuzzle, 2200);
  }
}

function closePuzzle() {
  const modal = document.getElementById('puzzleModal');
  modal.classList.remove('show');
  if (modal.close) modal.close();
}

// ---- Accusation ----
function showAccuse() {
  const l = state.currentLevel;
  document.getElementById('accuseGrid').innerHTML = l.suspects.map((s, i) =>
    `<div class="accuse-card" onclick="makeAccusation(${i})">
      <div class="ac-avatar">${s.avatar}</div>
      <div class="ac-name">${s.name}</div>
      <div class="ac-role">${s.role}</div>
    </div>`
  ).join('');
  showScreen('accuseScreen');
}

function makeAccusation(i) {
  const l = state.currentLevel;
  const chosen = l.suspects[i];
  const correct = chosen.name === l.criminal;
  clearInterval(state.timerInterval);
  if (correct) {
    const allQuestioned = state.questionedSuspects.length >= l.suspects.length;
    const bonus = (allQuestioned ? 200 : 0) + (state.puzzleSolved ? 200 : 0);
    const finalScore = state.score + bonus;
    state.scores[l.id] = finalScore;
    const nextId = l.id + 1;
    if (LEVELS.find(lv => lv.id === nextId) && !state.unlockedLevels.includes(nextId)) {
      state.unlockedLevels.push(nextId);
    }
    saveState();
    showResult(true, finalScore, chosen, l);
  } else {
    showResult(false, 'wrong', chosen, l);
  }
}

// ---- Result ----
async function showResult(correct, data, chosen, level) {
  const rs = document.getElementById('resultScreen');
  rs.className = 'screen';
  const icon = document.getElementById('resultIcon');
  const title = document.getElementById('resultTitle');
  const msg = document.getElementById('resultMsg');
  const scoreEl = document.getElementById('resultScore');
  const btns = document.getElementById('resultBtns');

  if (correct) {
    rs.classList.add('result-correct');
    icon.textContent = '🏆';
    title.textContent = 'Case Closed!';
    scoreEl.textContent = data.toLocaleString();
    const nextLevel = LEVELS.find(l => l.id === level.id + 1);
    btns.innerHTML = `
      <button class="action-btn btn-gold" onclick="showScreen('levelSelect')">← Case Files</button>
      ${nextLevel ? `<button class="action-btn btn-green" onclick="startLevel(${nextLevel.id})">Next Case →</button>` : ''}`;
    try {
      const explanation = await callClaude(
        `Write a 2-sentence dramatic noir detective deduction explaining exactly why ${chosen.name} (${chosen.role}) is guilty of the crime in "${level.title}". Be specific to the evidence. Satisfying conclusion.`,
        120
      );
      msg.textContent = explanation;
    } catch (e) {
      msg.textContent = `Your investigation was flawless. ${chosen.name} had the means, motive, and opportunity. The evidence was irrefutable. Justice is served.`;
    }
  } else if (data === 'time') {
    rs.classList.add('result-wrong');
    icon.textContent = '⏰';
    title.textContent = 'Time Expired!';
    msg.textContent = `The case went cold before you could close it. The criminal walked free into the night. The real culprit was ${level ? level.criminal : 'still unknown'}.`;
    scoreEl.textContent = '0';
    btns.innerHTML = `
      <button class="action-btn btn-gold" onclick="showScreen('levelSelect')">← Case Files</button>
      <button class="action-btn btn-red" onclick="startLevel(${state.currentLevel.id})">Retry →</button>`;
  } else {
    rs.classList.add('result-wrong');
    icon.textContent = '💀';
    title.textContent = 'Wrong Accusation!';
    msg.textContent = `You accused ${chosen.name} — an innocent person. The real culprit is still at large. The investigation has been compromised. Start over and follow the evidence.`;
    scoreEl.textContent = '0';
    btns.innerHTML = `
      <button class="action-btn btn-gold" onclick="showScreen('levelSelect')">← Case Files</button>
      <button class="action-btn btn-red" onclick="startLevel(${state.currentLevel.id})">Retry →</button>`;
  }
  showScreen('resultScreen');
}

// ---- Claude API ----
async function callClaude(prompt, maxTokens = 300) {
  if (state.demoMode || !state.apiKey) {
    throw new Error('Demo mode / no API key');
  }
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': state.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!response.ok) throw new Error('API error: ' + response.status);
  const data = await response.json();
  return data.content.map(b => b.text || '').join('').trim();
}

// ---- Init ----
loadState();
checkApiKey();
