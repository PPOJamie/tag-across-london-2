const STORAGE_KEY = 'tag-across-london-state-v3';

const STARTS = [
  'Finchley Road',
  'Highbury & Islington',
  'London Bridge',
  'West Brompton',
  'Whitechapel',
  'Wood Lane'
];

const DESTINATIONS = {
  'Finchley Road': ['Barking', 'Belsize Park', 'Manor House', 'Pimlico', 'Wapping'],
  'Highbury & Islington': ['Clapham Common', 'Gunnersbury', 'Holland Park', 'Queens Park', 'St Johns Wood'],
  'London Bridge': ['Barking', 'Gunnersbury', 'Leyton', 'Manor House', 'Queens Park'],
  'West Brompton': ['Belsize Park', 'Clapham Common', 'Leyton', 'Star Lane', 'Wapping'],
  'Whitechapel': ['Belsize Park', 'Clapham Common', 'Manor House', 'Pimlico', 'Queens Park'],
  'Wood Lane': ['Barking', 'Manor House', 'St Johns Wood', 'Star Lane', 'Wapping']
};

const CHALLENGES = [
  'Touch a church. It must be a real church or recognisable as a church building.',
  'Touch a bank. It must be a real bank. Not Bank station.',
  'Lay, entirely, on the ground for thirty seconds. You must be filmed. You may go to a safe place to do this.',
  'Using the name of the last tube station you were at, pretend it is an acronym and come up with a sentence it could stand for.',
  'Wait for two minutes. You must stay where you are.',
  'You must buy something with the union jack on it.',
  'Take the bus to another station. The station must be within visual range when you get off.',
  'You must buy and wear a hat.',
  'Go to a charity shop (you must step inside).',
  'Find a public toilet. You must touch the entrance.',
  'You must call your number neighbours.',
  'Stand inside a telephone booth.',
  'Touch grass. It must be real grass. You must touch it.',
  'Get to the nearest street beginning with A, B, or C.',
  'Stand on a bridge. Does not have to be a river bridge.',
  'Sit in a park for two minutes.',
  'Find a coin on the ground. It must have already been on the ground.',
  'Pick litter for 60 seconds. Time starts when the first litter goes in the bin. Do not litter.',
  'Find a small, folded paper tube map and touch it. You must not already be in possession of it.',
  'Say five separate points of things you have enjoyed about today sincerely, with one explanation for each one.',
  'Draw the station entrance you have just left. You must spend at least 2 minutes drawing.',
  'Draw your opponents (without reference). Spend at least 3 minutes and genuinely try.',
  'Pour water over your head.',
  'Find a vendor that sells Wii games. Touch one.',
  'Buy a gift for one of the chasers.',
  'Film a bird.',
  'Drink tea.',
  'Find an advertisement and read the entirety of it out to the camera.',
  'Take a memorable picture.',
  'Buy and post a postcard to one of the chasers.',
  'Donate to charity.'
];

function defaultTimer(duration) {
  return { duration, remaining: duration, running: false, endAt: null };
}

function defaultState() {
  return {
    theme: 'light',
    teamA: 'Team A',
    teamB: 'Team B',
    scores: { A: 0, B: 0 },
    role: 'Runners',
    currentStart: '',
    currentDestination: '',
    routeLocked: false,
    usedStarts: [],
    usedDestinationsByStart: {},
    lastChallenge: '',
    challengeCompleted: [],
    timers: {
      headStart: defaultTimer(15 * 60),
      busLimit: defaultTimer(10 * 60),
      challenge: defaultTimer(15 * 60)
    },
    routeHistory: []
  };
}

let state = loadState();
let timerTickHandle = null;
let activeTimerButtons = new Map();

const $ = (id) => document.getElementById(id);
const themeToggle = $('themeToggle');
const resetGameBtn = $('resetGame');
const startChip = $('startChip');
const destinationChip = $('destinationChip');
const mapStart = $('mapStart');
const mapDestination = $('mapDestination');
const mapText = $('mapText');
const routeStatus = $('routeStatus');
const spinStartBtn = $('spinStart');
const spinDestinationBtn = $('spinDestination');
const lockRouteBtn = $('lockRoute');
const newRouteBtn = $('newRoute');
const openMapsBtn = $('openMaps');
const copyRouteBtn = $('copyRoute');
const teamAName = $('teamAName');
const teamBName = $('teamBName');
const teamALabel = $('teamALabel');
const teamBLabel = $('teamBLabel');
const teamAScore = $('teamAScore');
const teamBScore = $('teamBScore');
const currentRole = $('currentRole');
const scoreABtn = $('scoreA');
const scoreBBtn = $('scoreB');
const switchRoleBtn = $('switchRole');
const challengeChip = $('challengeChip');
const challengeText = $('challengeText');
const challengeCount = $('challengeCount');
const spinChallengeBtn = $('spinChallenge');
const markChallengeDoneBtn = $('markChallengeDone');
const rerollChallengeBtn = $('rerollChallenge');
const challengeCompleted = new Set();
const messageType = $('messageType');
const messageStation = $('messageStation');
const messageTime = $('messageTime');
const messagePreview = $('messagePreview');
const copyMessageBtn = $('copyMessage');
const historyList = $('historyList');
const historyTemplate = $('historyTemplate');

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultState();
    const parsed = JSON.parse(saved);
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      scores: { ...base.scores, ...(parsed.scores || {}) },
      timers: {
        headStart: { ...base.timers.headStart, ...(parsed.timers?.headStart || {}) },
        busLimit: { ...base.timers.busLimit, ...(parsed.timers?.busLimit || {}) },
        challenge: { ...base.timers.challenge, ...(parsed.timers?.challenge || {}) }
      }
    };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  metaThemeColor(theme === 'dark' ? '#0d1117' : '#f4f7fb');
}

function metaThemeColor(color) {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', color);
}

function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function formatTime(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function nowTimeValue() {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}

function renderRoute() {
  startChip.textContent = state.currentStart || 'Spin a start';
  destinationChip.textContent = state.currentDestination || 'Spin a destination';
  mapStart.textContent = state.currentStart || 'Start';
  mapDestination.textContent = state.currentDestination || 'Destination';
  const locked = state.routeLocked && state.currentStart && state.currentDestination;
  routeStatus.textContent = locked ? 'Route locked' : 'Route not locked';
  mapText.textContent = locked
    ? `Locked route: ${state.currentStart} to ${state.currentDestination}. Use the link to open transit directions on your phone.`
    : 'Spin a start and destination, then lock the route to continue.';
  openMapsBtn.disabled = !locked;
  copyRouteBtn.disabled = !locked;
  lockRouteBtn.disabled = !state.currentStart || !state.currentDestination || state.routeLocked;
  markChallengeDoneBtn.disabled = !state.lastChallenge;
  rerollChallengeBtn.disabled = !state.lastChallenge;
}

function renderTeams() {
  teamAName.value = state.teamA;
  teamBName.value = state.teamB;
  teamALabel.textContent = state.teamA;
  teamBLabel.textContent = state.teamB;
  teamAScore.textContent = state.scores.A;
  teamBScore.textContent = state.scores.B;
  currentRole.textContent = state.role;
}

function renderChallenge() {
  challengeChip.textContent = state.lastChallenge || 'Spin a challenge';
  challengeText.textContent = state.lastChallenge
    ? 'Mark it complete when done, or reroll once per round if needed.'
    : 'Completed challenges are removed from future spins.';
  const completedCount = state.challengeCompleted.length;
  challengeCount.textContent = `${CHALLENGES.length - completedCount} remaining`;
}

function renderMessage() {
  if (!messageTime.value) messageTime.value = nowTimeValue();
  messagePreview.textContent = `${messageType.value} ${messageStation.value.trim() || 'Charing Cross'} at ${messageTime.value || nowTimeValue()}`;
}

function renderHistory() {
  historyList.innerHTML = '';
  if (!state.routeHistory.length) {
    const empty = document.createElement('div');
    empty.className = 'history-item';
    empty.innerHTML = '<div class="history-title">No routes locked yet</div><div class="history-meta">Locked routes will appear here.</div>';
    historyList.appendChild(empty);
    return;
  }
  state.routeHistory.slice().reverse().forEach((item) => {
    const node = historyTemplate.content.cloneNode(true);
    node.querySelector('.history-title').textContent = `${item.start} → ${item.destination}`;
    node.querySelector('.history-meta').textContent = `${item.time} · ${item.role} · ${item.challenge ? `Challenge: ${item.challenge}` : 'No challenge logged'}`;
    historyList.appendChild(node);
  });
}

function renderTimers() {
  ['headStart', 'busLimit', 'challenge'].forEach((key) => {
    const timer = state.timers[key];
    const valueEl = $(`${key}Value`);
    if (valueEl) valueEl.textContent = formatTime(timer.remaining);
    const row = document.querySelector(`.timer-row[data-timer="${key}"]`);
    if (row) {
      const toggle = row.querySelector('.timer-toggle');
      toggle.textContent = timer.running ? 'Pause' : 'Start';
    }
  });
}

function renderAll() {
  applyTheme(state.theme);
  renderRoute();
  renderTeams();
  renderChallenge();
  renderMessage();
  renderHistory();
  renderTimers();
  saveState();
}

function addHistory(start, destination, challenge) {
  state.routeHistory.push({
    start,
    destination,
    challenge: challenge || '',
    role: state.role,
    time: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
  });
}

function availableStarts() {
  const used = new Set(state.usedStarts);
  return STARTS.filter((station) => !used.has(station));
}

function availableDestinations(start) {
  const used = new Set(state.usedDestinationsByStart[start] || []);
  return (DESTINATIONS[start] || []).filter((station) => !used.has(station));
}

function spinStart() {
  const pool = availableStarts();
  if (!pool.length) {
    state.usedStarts = [];
    renderAll();
    return spinStart();
  }
  state.currentStart = randomChoice(pool);
  state.currentDestination = '';
  state.routeLocked = false;
  renderAll();
}

function spinDestination() {
  if (!state.currentStart) return;
  const pool = availableDestinations(state.currentStart);
  if (!pool.length) {
    state.usedDestinationsByStart[state.currentStart] = [];
    renderAll();
    return spinDestination();
  }
  state.currentDestination = randomChoice(pool);
  state.routeLocked = false;
  renderAll();
}

function lockRoute() {
  if (!state.currentStart || !state.currentDestination) return;
  state.routeLocked = true;
  if (!state.usedStarts.includes(state.currentStart)) state.usedStarts.push(state.currentStart);
  state.usedDestinationsByStart[state.currentStart] ||= [];
  if (!state.usedDestinationsByStart[state.currentStart].includes(state.currentDestination)) {
    state.usedDestinationsByStart[state.currentStart].push(state.currentDestination);
  }
  addHistory(state.currentStart, state.currentDestination, state.lastChallenge);
  renderAll();
}

function newRoute() {
  state.currentStart = '';
  state.currentDestination = '';
  state.routeLocked = false;
  renderAll();
}

function routeUrl() {
  if (!state.currentStart || !state.currentDestination) return '';
  const origin = encodeURIComponent(`${state.currentStart}, London, UK`);
  const destination = encodeURIComponent(`${state.currentDestination}, London, UK`);
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=transit`;
}

async function openMaps() {
  const url = routeUrl();
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

async function copyRoute() {
  const text = `${state.currentStart} -> ${state.currentDestination} (transit)`;
  await copyText(text);
}

function spinChallenge() {
  const remaining = CHALLENGES.filter((item) => !state.challengeCompleted.includes(item));
  if (!remaining.length) {
    state.challengeCompleted = [];
    renderAll();
    return spinChallenge();
  }
  state.lastChallenge = randomChoice(remaining);
  renderAll();
}

function markChallengeDone() {
  if (!state.lastChallenge) return;
  if (!state.challengeCompleted.includes(state.lastChallenge)) {
    state.challengeCompleted.push(state.lastChallenge);
  }
  renderAll();
}

function rerollChallenge() {
  spinChallenge();
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  renderAll();
}

function resetGame() {
  state = defaultState();
  stopAllTimers();
  renderAll();
  startClock();
}

function adjustScore(team, delta) {
  state.scores[team] = Math.max(0, (state.scores[team] || 0) + delta);
  renderAll();
}

function switchRole() {
  state.role = state.role === 'Runners' ? 'Chasers' : 'Runners';
  renderAll();
}

function updateTimerDisplay(key) {
  const timer = state.timers[key];
  const valueEl = $(`${key}Value`);
  if (valueEl) valueEl.textContent = formatTime(timer.remaining);
  const row = document.querySelector(`.timer-row[data-timer="${key}"]`);
  if (row) {
    const toggle = row.querySelector('.timer-toggle');
    toggle.textContent = timer.running ? 'Pause' : 'Start';
  }
}

function startTimer(key) {
  const timer = state.timers[key];
  if (timer.running) {
    timer.running = false;
    timer.endAt = null;
    updateTimerDisplay(key);
    saveState();
    return;
  }
  if (timer.remaining <= 0) timer.remaining = timer.duration;
  timer.running = true;
  timer.endAt = Date.now() + timer.remaining * 1000;
  updateTimerDisplay(key);
  saveState();
}

function resetTimer(key) {
  const timer = state.timers[key];
  timer.running = false;
  timer.remaining = timer.duration;
  timer.endAt = null;
  updateTimerDisplay(key);
  saveState();
}

function stopAllTimers() {
  ['headStart', 'busLimit', 'challenge'].forEach((key) => {
    const timer = state.timers[key];
    timer.running = false;
    timer.endAt = null;
  });
  if (timerTickHandle) {
    clearInterval(timerTickHandle);
    timerTickHandle = null;
  }
}

function tickTimers() {
  let changed = false;
  ['headStart', 'busLimit', 'challenge'].forEach((key) => {
    const timer = state.timers[key];
    if (!timer.running || !timer.endAt) return;
    const remaining = Math.ceil((timer.endAt - Date.now()) / 1000);
    if (remaining <= 0) {
      timer.remaining = 0;
      timer.running = false;
      timer.endAt = null;
      changed = true;
    } else if (remaining !== timer.remaining) {
      timer.remaining = remaining;
      changed = true;
    }
    updateTimerDisplay(key);
  });
  if (changed) saveState();
}

function syncTimerButtons() {
  document.querySelectorAll('.timer-row').forEach((row) => {
    const key = row.dataset.timer;
    const toggle = row.querySelector('.timer-toggle');
    const reset = row.querySelector('.timer-reset');
    toggle.addEventListener('click', () => startTimer(key));
    reset.addEventListener('click', () => resetTimer(key));
  });
}

function bindEvents() {
  themeToggle.addEventListener('click', toggleTheme);
  resetGameBtn.addEventListener('click', resetGame);
  spinStartBtn.addEventListener('click', spinStart);
  spinDestinationBtn.addEventListener('click', spinDestination);
  lockRouteBtn.addEventListener('click', lockRoute);
  newRouteBtn.addEventListener('click', newRoute);
  openMapsBtn.addEventListener('click', openMaps);
  copyRouteBtn.addEventListener('click', copyRoute);
  scoreABtn.addEventListener('click', () => adjustScore('A', 1));
  scoreBBtn.addEventListener('click', () => adjustScore('B', 1));
  switchRoleBtn.addEventListener('click', switchRole);
  spinChallengeBtn.addEventListener('click', spinChallenge);
  markChallengeDoneBtn.addEventListener('click', markChallengeDone);
  rerollChallengeBtn.addEventListener('click', rerollChallenge);
  copyMessageBtn.addEventListener('click', async () => {
    await copyText(messagePreview.textContent || '');
  });

  teamAName.addEventListener('input', () => {
    state.teamA = teamAName.value.trim() || 'Team A';
    renderAll();
  });
  teamBName.addEventListener('input', () => {
    state.teamB = teamBName.value.trim() || 'Team B';
    renderAll();
  });

  [messageType, messageStation, messageTime].forEach((node) => node.addEventListener('input', renderMessage));
  if (!messageTime.value) messageTime.value = nowTimeValue();
  syncTimerButtons();
}

function startClock() {
  if (timerTickHandle) clearInterval(timerTickHandle);
  timerTickHandle = setInterval(tickTimers, 1000);
}

function init() {
  if (!state.message) state.message = {};
  if (!messageTime.value) messageTime.value = nowTimeValue();
  bindEvents();
  renderAll();
  startClock();
}

document.addEventListener('DOMContentLoaded', init);
