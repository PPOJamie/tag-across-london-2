(() => {
  "use strict";

  const STORAGE_KEY = "tagAcrossLondon.gameState.v1";
  const UNDO_KEY = "tagAcrossLondon.undo.v1";
  const APP_VERSION = 1;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const STATIONS = [
    { name: "Finchley Road", type: "start", lat: 51.5471, lng: -0.1803, wheel: ["Finchley", "Road"], labelSide: "left", labelDy: -38 },
    { name: "Highbury & Islington", type: "start", lat: 51.5460, lng: -0.1033, wheel: ["Highbury &", "Islington"], labelSide: "right", labelDy: -42 },
    { name: "London Bridge", type: "start", lat: 51.5055, lng: -0.0865, wheel: ["London", "Bridge"], labelSide: "left", labelDy: 25 },
    { name: "West Brompton", type: "start", lat: 51.4873, lng: -0.1953, wheel: ["West", "Brompton"], labelSide: "left", labelDy: 24 },
    { name: "Whitechapel", type: "start", lat: 51.5196, lng: -0.0594, wheel: ["Whitechapel"], labelSide: "right", labelDy: -38 },
    { name: "Wood Lane", type: "start", lat: 51.5097, lng: -0.2240, wheel: ["Wood Lane"], labelSide: "left", labelDy: -38 },

    { name: "Barking", type: "destination", lat: 51.5393, lng: 0.0817, wheel: ["Barking"], labelSide: "right", labelDy: -36 },
    { name: "Belsize Park", type: "destination", lat: 51.5504, lng: -0.1642, wheel: ["Belsize", "Park"], labelSide: "left", labelDy: 20 },
    { name: "Clapham Common", type: "destination", lat: 51.4618, lng: -0.1384, wheel: ["Clapham", "Common"], labelSide: "right", labelDy: 18 },
    { name: "Gunnersbury", type: "destination", lat: 51.4915, lng: -0.2754, wheel: ["Gunnersbury"], labelSide: "right", labelDy: 18 },
    { name: "Holland Park", type: "destination", lat: 51.5075, lng: -0.2060, wheel: ["Holland", "Park"], labelSide: "left", labelDy: 24 },
    { name: "Leyton", type: "destination", lat: 51.5566, lng: -0.0054, wheel: ["Leyton"], labelSide: "right", labelDy: -38 },
    { name: "Manor House", type: "destination", lat: 51.5708, lng: -0.0957, wheel: ["Manor", "House"], labelSide: "right", labelDy: -38 },
    { name: "Pimlico", type: "destination", lat: 51.4893, lng: -0.1334, wheel: ["Pimlico"], labelSide: "right", labelDy: 20 },
    { name: "Queen’s Park", type: "destination", lat: 51.5342, lng: -0.2048, wheel: ["Queen’s", "Park"], labelSide: "left", labelDy: -42 },
    { name: "St John’s Wood", type: "destination", lat: 51.5348, lng: -0.1741, wheel: ["St John’s", "Wood"], labelSide: "right", labelDy: 20 },
    { name: "Star Lane", type: "destination", lat: 51.5206, lng: 0.0042, wheel: ["Star Lane"], labelSide: "right", labelDy: 20 },
    { name: "Wapping", type: "destination", lat: 51.5043, lng: -0.0558, wheel: ["Wapping"], labelSide: "right", labelDy: 24 }
  ];

  const ROUTES = {
    "Finchley Road": ["Barking", "Belsize Park", "Manor House", "Pimlico", "Wapping"],
    "Highbury & Islington": ["Clapham Common", "Gunnersbury", "Holland Park", "Queen’s Park", "St John’s Wood"],
    "London Bridge": ["Barking", "Gunnersbury", "Leyton", "Manor House", "Queen’s Park"],
    "West Brompton": ["Belsize Park", "Clapham Common", "Leyton", "Star Lane", "Wapping"],
    "Whitechapel": ["Belsize Park", "Clapham Common", "Manor House", "Pimlico", "Queen’s Park"],
    "Wood Lane": ["Barking", "Manor House", "St John’s Wood", "Star Lane", "Wapping"]
  };

  const CHALLENGES = [
    { id: "church", text: "Touch a real church or a building clearly recognisable as a church." },
    { id: "bank", text: "Touch a real bank. Bank station does not count." },
    { id: "ground", text: "Lie entirely on the ground for 30 seconds while being filmed. Choose a safe place." },
    { id: "acronym", text: "Turn the name of the last Tube station into an acronym and make a grammatically correct sentence from it." },
    { id: "wait", text: "Stay exactly where you are and wait for two minutes." },
    { id: "union-jack", text: "Buy something with the Union Jack on it." },
    { id: "bus-station", text: "Take a bus to another station. The station must be within visual range when you get off." },
    { id: "hat", text: "Buy a hat and wear it." },
    { id: "charity-shop", text: "Go to a charity shop and step inside." },
    { id: "public-toilet", text: "Find a public toilet and touch the entrance." },
    { id: "number-neighbour", text: "Call your number neighbour(s) by adding 1 to the last digit of your phone number. If someone answers, explain what you are doing." },
    { id: "telephone-booth", text: "Stand inside a telephone booth." },
    { id: "grass", text: "Touch real grass." },
    { id: "abc-street", text: "Reach the nearest street beginning with A, B or C." },
    { id: "bridge", text: "Stand on a bridge. It does not have to cross a river." },
    { id: "park", text: "Sit in a park for two minutes." },
    { id: "coin", text: "Find a coin that was already lying on the ground." },
    { id: "litter", text: "Pick litter for 60 seconds. Time starts when the first piece goes in a bin. Do not create litter." },
    { id: "tube-map", text: "Find and touch a small folded paper Tube map that you did not already possess." },
    { id: "five-enjoyed", text: "Sincerely name five separate things you have enjoyed today, with at least one explanation for each." },
    { id: "draw-entrance", text: "Draw the station entrance you just left. Spend at least two minutes drawing." },
    { id: "draw-opponents", text: "Draw your opponents without reference. Spend at least three minutes and genuinely try." },
    { id: "water-head", text: "Pour water over your head." },
    { id: "wii-games", text: "Find a vendor that sells Wii games and touch one." },
    { id: "gift", text: "Buy a gift for one of the Chasers." },
    { id: "bird", text: "Film a real, living bird." },
    { id: "tea", text: "Drink tea." },
    { id: "advert", text: "Find an advertisement and read all of it aloud to the camera." },
    { id: "picture", text: "Take a memorable picture." },
    { id: "postcard", text: "Buy and post a postcard to one of the Chasers." },
    { id: "donate", text: "Donate to charity." }
  ];

  const TIMER_CONFIG = {
    headstart: { duration: 15 * 60, label: "Head-start" },
    bus: { duration: 10 * 60, label: "Bus" },
    challenge: { duration: 15 * 60, label: "Challenge" }
  };

  const MAP_BOUNDS = {
    minLat: 51.44,
    maxLat: 51.59,
    minLng: -0.31,
    maxLng: 0.11,
    left: 70,
    right: 930,
    top: 78,
    bottom: 540
  };

  const dom = {
    runnerBadge: byId("runnerBadge"),
    installButton: byId("installButton"),
    roundNumber: byId("roundNumber"),
    teamCards: [byId("teamCard0"), byId("teamCard1")],
    teamNames: [byId("teamName0"), byId("teamName1")],
    teamScores: [byId("teamScore0"), byId("teamScore1")],
    teamChallenges: [byId("teamChallenges0"), byId("teamChallenges1")],
    switchRolesButton: byId("switchRolesButton"),

    startWheel: byId("startWheel"),
    destinationWheel: byId("destinationWheel"),
    spinStartButton: byId("spinStartButton"),
    spinDestinationButton: byId("spinDestinationButton"),
    startResult: byId("startResult"),
    destinationResult: byId("destinationResult"),
    startPoolLabel: byId("startPoolLabel"),
    destinationPoolLabel: byId("destinationPoolLabel"),
    routeAvailability: byId("routeAvailability"),
    routeStepStart: byId("routeStepStart"),
    routeStepDestination: byId("routeStepDestination"),
    routeSummary: byId("routeSummary"),
    routeSummaryText: byId("routeSummaryText"),
    viewOnMapButton: byId("viewOnMapButton"),
    routeConnectedButton: byId("routeConnectedButton"),
    routeCaughtButton: byId("routeCaughtButton"),
    clearRouteButton: byId("clearRouteButton"),
    catchScoring: byId("catchScoring"),

    headstartDisplay: byId("headstartDisplay"),
    busDisplay: byId("busDisplay"),
    challengeDisplay: byId("challengeDisplay"),
    headstartStatus: byId("headstartStatus"),
    busStatus: byId("busStatus"),
    challengeTimerStatus: byId("challengeTimerStatus"),
    endBusButton: byId("endBusButton"),
    unlockBusButton: byId("unlockBusButton"),

    challengeCountPill: byId("challengeCountPill"),
    challengeSlot: byId("challengeSlot"),
    spinChallengeButton: byId("spinChallengeButton"),
    selectedChallengeText: byId("selectedChallengeText"),
    challengeSelectedPanel: byId("challengeSelectedPanel"),
    completeChallengeButton: byId("completeChallengeButton"),
    rerollChallengeButton: byId("rerollChallengeButton"),
    safetySkipButton: byId("safetySkipButton"),
    rerollStatus: byId("rerollStatus"),

    messageAction: byId("messageAction"),
    messageStation: byId("messageStation"),
    messageTime: byId("messageTime"),
    nowButton: byId("nowButton"),
    messagePreview: byId("messagePreview"),
    copyMessageButton: byId("copyMessageButton"),

    showAllRoutesToggle: byId("showAllRoutesToggle"),
    locateButton: byId("locateButton"),
    allRouteLines: byId("allRouteLines"),
    selectedRouteLine: byId("selectedRouteLine"),
    stationMarkers: byId("stationMarkers"),
    userLocationLayer: byId("userLocationLayer"),
    mapRouteText: byId("mapRouteText"),
    mapRouteNote: byId("mapRouteNote"),
    directionsLink: byId("directionsLink"),
    copyRouteButton: byId("copyRouteButton"),
    stationDetailName: byId("stationDetailName"),
    stationDetailText: byId("stationDetailText"),
    useStationButton: byId("useStationButton"),

    challengeSearch: byId("challengeSearch"),
    challengeLibrary: byId("challengeLibrary"),

    gameLog: byId("gameLog"),
    copyLogButton: byId("copyLogButton"),
    downloadLogButton: byId("downloadLogButton"),
    exportStateButton: byId("exportStateButton"),
    importStateInput: byId("importStateInput"),
    undoButton: byId("undoButton"),
    resetGameButton: byId("resetGameButton"),

    toastRegion: byId("toastRegion"),
    confirmDialog: byId("confirmDialog"),
    confirmTitle: byId("confirmTitle"),
    confirmMessage: byId("confirmMessage"),
    confirmAcceptButton: byId("confirmAcceptButton")
  };

  let state = loadState();
  let undoStack = loadUndoStack();
  let wheelRotations = { start: 0, destination: 0 };
  let isWheelSpinning = false;
  let isChallengeSpinning = false;
  let installPrompt = null;
  let userLocation = null;
  let inspectedStation = null;
  let pendingConfirmResolver = null;
  let storageWarningShown = false;

  initialise();

  function initialise() {
    populateMessageStations();
    setCurrentTime();
    bindEvents();
    renderAll();
    window.setInterval(tickTimers, 250);
    registerServiceWorker();
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function createTimer(duration) {
    return {
      duration,
      remaining: duration,
      running: false,
      endAt: null,
      expired: false
    };
  }

  function createDefaultState() {
    return {
      version: APP_VERSION,
      teams: [
        { name: "Team Orange", score: 0, challenges: 0 },
        { name: "Team Blue", score: 0, challenges: 0 }
      ],
      runners: 0,
      round: 1,
      catchScoring: "chasersPoint",
      currentStart: null,
      currentDestination: null,
      usedStarts: [],
      usedDestinations: [],
      currentChallenge: null,
      completedChallenges: [],
      freeRerollUsed: false,
      challengeTimedOut: false,
      busLocked: false,
      showAllRoutes: false,
      log: [],
      timers: {
        headstart: createTimer(TIMER_CONFIG.headstart.duration),
        bus: createTimer(TIMER_CONFIG.bus.duration),
        challenge: createTimer(TIMER_CONFIG.challenge.duration)
      }
    };
  }

  function normaliseState(candidate) {
    const base = createDefaultState();
    if (!candidate || typeof candidate !== "object") {
      return base;
    }

    const merged = {
      ...base,
      ...candidate,
      version: APP_VERSION,
      teams: Array.isArray(candidate.teams) && candidate.teams.length === 2
        ? candidate.teams.map((team, index) => ({
            name: typeof team?.name === "string" && team.name.trim() ? team.name.slice(0, 32) : base.teams[index].name,
            score: nonNegativeInteger(team?.score),
            challenges: nonNegativeInteger(team?.challenges)
          }))
        : base.teams,
      usedStarts: validStationArray(candidate.usedStarts, "start"),
      usedDestinations: validStationArray(candidate.usedDestinations, "destination"),
      completedChallenges: Array.isArray(candidate.completedChallenges)
        ? [...new Set(candidate.completedChallenges.filter((id) => CHALLENGES.some((challenge) => challenge.id === id)))]
        : [],
      log: Array.isArray(candidate.log)
        ? candidate.log.slice(-500).filter((entry) => entry && typeof entry.message === "string")
        : [],
      timers: {}
    };

    merged.runners = candidate.runners === 1 ? 1 : 0;
    merged.round = Math.max(1, nonNegativeInteger(candidate.round) || 1);
    merged.catchScoring = candidate.catchScoring === "noPoint" ? "noPoint" : "chasersPoint";
    merged.currentStart = stationExists(candidate.currentStart, "start") ? candidate.currentStart : null;
    merged.currentDestination = stationExists(candidate.currentDestination, "destination") ? candidate.currentDestination : null;
    merged.currentChallenge = CHALLENGES.some((challenge) => challenge.id === candidate.currentChallenge)
      ? candidate.currentChallenge
      : null;
    merged.freeRerollUsed = Boolean(candidate.freeRerollUsed);
    merged.challengeTimedOut = Boolean(candidate.challengeTimedOut);
    merged.busLocked = Boolean(candidate.busLocked);
    merged.showAllRoutes = Boolean(candidate.showAllRoutes);

    for (const [name, config] of Object.entries(TIMER_CONFIG)) {
      const source = candidate.timers?.[name] || {};
      const timer = {
        duration: config.duration,
        remaining: Number.isFinite(source.remaining)
          ? Math.max(0, Math.min(config.duration, Math.ceil(source.remaining)))
          : config.duration,
        running: Boolean(source.running),
        endAt: Number.isFinite(source.endAt) ? source.endAt : null,
        expired: Boolean(source.expired)
      };
      if (timer.running && !timer.endAt) {
        timer.running = false;
      }
      merged.timers[name] = timer;
    }

    if (merged.currentStart && !ROUTES[merged.currentStart]?.includes(merged.currentDestination)) {
      merged.currentDestination = null;
    }

    return merged;
  }

  function nonNegativeInteger(value) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
  }

  function validStationArray(value, type) {
    if (!Array.isArray(value)) {
      return [];
    }
    return [...new Set(value.filter((name) => stationExists(name, type)))];
  }

  function stationExists(name, type) {
    return typeof name === "string" && STATIONS.some((station) => station.name === name && station.type === type);
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? normaliseState(JSON.parse(raw)) : createDefaultState();
    } catch (error) {
      console.warn("Could not load game state", error);
      return createDefaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Could not save game state", error);
      if (!storageWarningShown) {
        storageWarningShown = true;
        toast("This browser could not save the game state. The current session will still work.");
      }
    }
  }

  function cloneState(value = state) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadUndoStack() {
    try {
      const raw = localStorage.getItem(UNDO_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.slice(-10) : [];
    } catch {
      return [];
    }
  }

  function saveUndoStack() {
    try {
      localStorage.setItem(UNDO_KEY, JSON.stringify(undoStack.slice(-10)));
    } catch {
      // Undo is a convenience; a storage failure does not block play.
    }
  }

  function pushUndo(label) {
    undoStack.push({ label, state: cloneState() });
    undoStack = undoStack.slice(-10);
    saveUndoStack();
  }

  function bindEvents() {
    document.querySelectorAll(".tab-button").forEach((button) => {
      button.addEventListener("click", () => activateTab(button.dataset.tab));
    });

    dom.teamNames.forEach((input, index) => {
      input.addEventListener("input", () => {
        state.teams[index].name = input.value.trim() || `Team ${index + 1}`;
        saveState();
        renderScoreboard({ preserveInputs: true });
      });
    });

    document.querySelectorAll("[data-score-team]").forEach((button) => {
      button.addEventListener("click", () => {
        const teamIndex = Number(button.dataset.scoreTeam);
        const delta = Number(button.dataset.scoreDelta);
        pushUndo("manual score adjustment");
        state.teams[teamIndex].score = Math.max(0, state.teams[teamIndex].score + delta);
        logEvent(`${state.teams[teamIndex].name} score adjusted to ${state.teams[teamIndex].score}.`, "score");
        saveState();
        renderAll();
      });
    });

    dom.switchRolesButton.addEventListener("click", () => {
      pushUndo("switch roles");
      state.runners = state.runners === 0 ? 1 : 0;
      logEvent(`Roles switched. ${runnerTeam().name} are now the Runners.`, "round");
      saveState();
      renderAll();
    });

    dom.spinStartButton.addEventListener("click", spinStart);
    dom.spinDestinationButton.addEventListener("click", spinDestination);
    dom.routeConnectedButton.addEventListener("click", () => finishRoute("connected"));
    dom.routeCaughtButton.addEventListener("click", () => finishRoute("caught"));
    dom.clearRouteButton.addEventListener("click", clearRoute);
    dom.viewOnMapButton.addEventListener("click", () => activateTab("map"));
    dom.catchScoring.addEventListener("change", () => {
      state.catchScoring = dom.catchScoring.value === "noPoint" ? "noPoint" : "chasersPoint";
      logEvent(`Catch scoring set to: ${state.catchScoring === "chasersPoint" ? "Chasers gain 1 point" : "no point awarded"}.`, "setting");
      saveState();
      renderRoute();
    });

    document.querySelectorAll("[data-timer-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const timerName = button.dataset.timer;
        const action = button.dataset.timerAction;
        if (action === "toggle") {
          toggleTimer(timerName);
        } else if (action === "reset") {
          resetTimer(timerName, true);
        }
      });
    });

    dom.endBusButton.addEventListener("click", endBusRide);
    dom.unlockBusButton.addEventListener("click", unlockBus);

    dom.spinChallengeButton.addEventListener("click", spinChallenge);
    dom.completeChallengeButton.addEventListener("click", completeChallenge);
    dom.rerollChallengeButton.addEventListener("click", rerollChallenge);
    dom.safetySkipButton.addEventListener("click", safetySkipChallenge);

    [dom.messageAction, dom.messageStation, dom.messageTime].forEach((control) => {
      control.addEventListener("input", renderMessagePreview);
      control.addEventListener("change", renderMessagePreview);
    });
    dom.nowButton.addEventListener("click", () => {
      setCurrentTime();
      renderMessagePreview();
    });
    dom.copyMessageButton.addEventListener("click", async () => {
      await copyText(dom.messagePreview.textContent);
      toast("Station update copied.");
    });

    dom.showAllRoutesToggle.addEventListener("change", () => {
      state.showAllRoutes = dom.showAllRoutesToggle.checked;
      saveState();
      renderMap();
    });
    dom.locateButton.addEventListener("click", locateUser);
    dom.copyRouteButton.addEventListener("click", async () => {
      if (!hasCompleteRoute()) return;
      await copyText(`${state.currentStart} → ${state.currentDestination}`);
      toast("Route copied.");
    });
    dom.useStationButton.addEventListener("click", useInspectedStation);

    dom.challengeSearch.addEventListener("input", renderChallengeLibrary);

    dom.copyLogButton.addEventListener("click", async () => {
      await copyText(buildTextLog());
      toast("Game log copied.");
    });
    dom.downloadLogButton.addEventListener("click", () => {
      downloadText(`tag-across-london-log-${dateStamp()}.txt`, buildTextLog(), "text/plain");
    });
    dom.exportStateButton.addEventListener("click", () => {
      const payload = JSON.stringify({ app: "Tag Across London Game Console", exportedAt: new Date().toISOString(), state }, null, 2);
      downloadText(`tag-across-london-state-${dateStamp()}.json`, payload, "application/json");
    });
    dom.importStateInput.addEventListener("change", importStateFromFile);
    dom.undoButton.addEventListener("click", undoLastAction);
    dom.resetGameButton.addEventListener("click", resetWholeGame);

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      installPrompt = event;
      dom.installButton.hidden = false;
    });
    dom.installButton.addEventListener("click", installApp);

    dom.confirmDialog.addEventListener("close", () => {
      if (pendingConfirmResolver) {
        const resolver = pendingConfirmResolver;
        pendingConfirmResolver = null;
        resolver(dom.confirmDialog.returnValue === "confirm");
      }
    });
  }

  function activateTab(name) {
    document.querySelectorAll(".tab-button").forEach((button) => {
      const active = button.dataset.tab === name;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      const active = panel.dataset.panel === name;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
    if (name === "map") {
      renderMap();
    } else if (name === "rules") {
      renderChallengeLibrary();
    } else if (name === "log") {
      renderLog();
    }
    window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
  }

  function renderAll() {
    renderScoreboard();
    renderRoute();
    renderTimers();
    renderChallenge();
    renderMessagePreview();
    renderMap();
    renderChallengeLibrary();
    renderLog();
  }

  function renderScoreboard(options = {}) {
    dom.roundNumber.textContent = String(state.round);
    dom.runnerBadge.textContent = `${runnerTeam().name} are the Runners`;

    state.teams.forEach((team, index) => {
      if (!options.preserveInputs || document.activeElement !== dom.teamNames[index]) {
        dom.teamNames[index].value = team.name;
      }
      dom.teamScores[index].textContent = String(team.score);
      dom.teamChallenges[index].textContent = String(team.challenges);
      dom.teamCards[index].classList.toggle("is-runner", state.runners === index);
      dom.teamCards[index].querySelector(".manual-score-controls").setAttribute(
        "aria-label",
        `Manual score adjustment for ${team.name}`
      );
    });
  }

  function runnerTeam() {
    return state.teams[state.runners];
  }

  function chaserTeam() {
    return state.teams[state.runners === 0 ? 1 : 0];
  }

  function getAvailableStarts() {
    return Object.keys(ROUTES).filter((start) => {
      return !state.usedStarts.includes(start) && getAvailableDestinations(start).length > 0;
    });
  }

  function getAvailableDestinations(start) {
    if (!start || !ROUTES[start]) return [];
    return ROUTES[start].filter((destination) => !state.usedDestinations.includes(destination));
  }

  function hasCompleteRoute() {
    return Boolean(state.currentStart && state.currentDestination);
  }

  function renderRoute() {
    const availableStarts = getAvailableStarts();
    const destinations = getAvailableDestinations(state.currentStart);

    ensureWheel(dom.startWheel, availableStarts, "start");
    ensureWheel(dom.destinationWheel, destinations, "destination");

    dom.startPoolLabel.textContent = availableStarts.length
      ? `${availableStarts.length} valid unused ${plural(availableStarts.length, "station")}`
      : "No valid starts remain";
    dom.destinationPoolLabel.textContent = state.currentStart
      ? `${destinations.length} unused ${plural(destinations.length, "destination")}`
      : "Spin a start first";
    dom.routeAvailability.textContent = `${availableStarts.length} ${plural(availableStarts.length, "start")} available`;

    dom.startResult.textContent = state.currentStart || "No start selected";
    dom.startResult.classList.toggle("is-selected", Boolean(state.currentStart));
    dom.destinationResult.textContent = state.currentDestination || "No destination selected";
    dom.destinationResult.classList.toggle("is-selected", Boolean(state.currentDestination));

    dom.routeStepStart.classList.toggle("is-active", !state.currentStart);
    dom.routeStepStart.classList.toggle("is-complete", Boolean(state.currentStart));
    dom.routeStepDestination.classList.toggle("is-active", Boolean(state.currentStart) && !state.currentDestination);
    dom.routeStepDestination.classList.toggle("is-complete", Boolean(state.currentDestination));

    dom.spinStartButton.disabled = isWheelSpinning || hasCompleteRoute() || availableStarts.length === 0;
    dom.spinDestinationButton.disabled = isWheelSpinning || !state.currentStart || hasCompleteRoute() || destinations.length === 0;

    if (hasCompleteRoute()) {
      dom.routeSummary.classList.remove("is-empty");
      dom.routeSummaryText.textContent = `${state.currentStart} → ${state.currentDestination}`;
    } else if (state.currentStart) {
      dom.routeSummary.classList.remove("is-empty");
      dom.routeSummaryText.textContent = `${state.currentStart} → spin a destination`;
    } else {
      dom.routeSummary.classList.add("is-empty");
      dom.routeSummaryText.textContent = "Spin both wheels to create a route";
    }

    const complete = hasCompleteRoute();
    dom.viewOnMapButton.disabled = !state.currentStart;
    dom.routeConnectedButton.disabled = !complete;
    dom.routeCaughtButton.disabled = !complete;
    dom.clearRouteButton.disabled = !state.currentStart && !state.currentDestination;
    dom.catchScoring.value = state.catchScoring;
    dom.routeCaughtButton.textContent = state.catchScoring === "chasersPoint"
      ? "Caught — Chasers gain 1 point"
      : "Caught — no point awarded";

    if (state.currentStart && !dom.messageStation.matches(":focus") && !dom.messageStation.dataset.userChanged) {
      dom.messageStation.value = state.currentStart;
    }
  }

  function ensureWheel(svg, options, kind) {
    const signature = options.join("|") || "__empty__";
    if (svg.dataset.signature === signature) {
      return;
    }

    svg.dataset.signature = signature;
    svg.innerHTML = "";
    wheelRotations[kind] = 0;
    svg.classList.add("is-instant");
    svg.style.transform = "rotate(0deg)";

    const outer = createSvg("circle", {
      cx: 110,
      cy: 110,
      r: 102,
      fill: "#ffffff",
      stroke: "#d8e0ea",
      "stroke-width": 3
    });
    svg.appendChild(outer);

    if (options.length === 0) {
      svg.appendChild(createSvg("circle", { cx: 110, cy: 110, r: 91, fill: "#e9eef5" }));
      const emptyText = createSvg("text", {
        x: 110,
        y: 115,
        "text-anchor": "middle",
        fill: "#667085",
        "font-size": 14,
        "font-weight": 800
      });
      emptyText.textContent = "No options";
      svg.appendChild(emptyText);
    } else if (options.length === 1) {
      svg.appendChild(createSvg("circle", {
        cx: 110,
        cy: 110,
        r: 91,
        fill: kind === "start" ? "#fde68a" : "#bbf7d0",
        stroke: "#ffffff",
        "stroke-width": 2
      }));
      appendWheelLabel(svg, options[0], 0, 1);
    } else {
      const slice = 360 / options.length;
      options.forEach((option, index) => {
        const startAngle = index * slice - slice / 2;
        const endAngle = startAngle + slice;
        const fill = wheelFill(kind, index);
        const path = createSvg("path", {
          d: describeArc(110, 110, 91, startAngle, endAngle),
          fill,
          stroke: "#ffffff",
          "stroke-width": 2
        });
        svg.appendChild(path);
        appendWheelLabel(svg, option, index * slice, options.length);
      });
    }

    svg.appendChild(createSvg("circle", {
      cx: 110,
      cy: 110,
      r: 23,
      fill: "#142033",
      stroke: "#ffffff",
      "stroke-width": 5
    }));
    const centerText = createSvg("text", {
      x: 110,
      y: 115,
      "text-anchor": "middle",
      fill: "#ffffff",
      "font-size": 12,
      "font-weight": 900,
      "letter-spacing": 1
    });
    centerText.textContent = "SPIN";
    svg.appendChild(centerText);

    requestAnimationFrame(() => svg.classList.remove("is-instant"));
  }

  function wheelFill(kind, index) {
    const startPalette = ["#fcd34d", "#fdba74", "#fbbf24", "#fed7aa", "#f59e0b", "#fde68a"];
    const destinationPalette = ["#86efac", "#6ee7b7", "#a7f3d0", "#4ade80", "#99f6e4", "#bbf7d0"];
    const palette = kind === "start" ? startPalette : destinationPalette;
    return palette[index % palette.length];
  }

  function appendWheelLabel(svg, stationName, angle, optionCount) {
    const station = STATIONS.find((item) => item.name === stationName);
    const lines = station?.wheel || [stationName];
    const radius = optionCount <= 2 ? 58 : optionCount <= 5 ? 66 : 69;
    const point = polarPoint(110, 110, radius, angle);
    const text = createSvg("text", {
      x: point.x,
      y: point.y - ((lines.length - 1) * 6),
      "text-anchor": "middle",
      fill: "#142033",
      "font-size": optionCount >= 6 ? 9.2 : 10,
      "font-weight": 850,
      "paint-order": "stroke",
      stroke: "rgba(255,255,255,0.55)",
      "stroke-width": 2,
      "stroke-linejoin": "round"
    });
    lines.forEach((line, index) => {
      const tspan = createSvg("tspan", { x: point.x, dy: index === 0 ? 0 : 12 });
      tspan.textContent = line;
      text.appendChild(tspan);
    });
    svg.appendChild(text);
  }

  function describeArc(cx, cy, radius, startAngle, endAngle) {
    const start = polarPoint(cx, cy, radius, endAngle);
    const end = polarPoint(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    return [
      `M ${cx} ${cy}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      "Z"
    ].join(" ");
  }

  function polarPoint(cx, cy, radius, angleDegrees) {
    const radians = (angleDegrees - 90) * Math.PI / 180;
    return {
      x: cx + radius * Math.cos(radians),
      y: cy + radius * Math.sin(radians)
    };
  }

  async function spinStart() {
    if (isWheelSpinning) return;
    const options = getAvailableStarts();
    if (!options.length) {
      toast("No valid unused start stations remain. Reset the game to begin a fresh station pool.");
      return;
    }
    const index = randomIndex(options.length);
    const selected = options[index];
    await animateWheel("start", dom.startWheel, options.length, index);
    state.currentStart = selected;
    state.currentDestination = null;
    logEvent(`Start rolled: ${selected}.`, "route");
    saveState();
    renderAll();
    toast(`Start: ${selected}`);
  }

  async function spinDestination() {
    if (isWheelSpinning || !state.currentStart) return;
    const options = getAvailableDestinations(state.currentStart);
    if (!options.length) {
      toast("No unused destinations remain for this start. Clear the route and roll another start.");
      return;
    }
    const index = randomIndex(options.length);
    const selected = options[index];
    await animateWheel("destination", dom.destinationWheel, options.length, index);
    state.currentDestination = selected;
    logEvent(`Destination rolled: ${selected}. Route is ${state.currentStart} → ${selected}.`, "route");
    saveState();
    renderAll();
    toast(`${state.currentStart} → ${selected}`);
  }

  function animateWheel(kind, svg, optionCount, selectedIndex) {
    return new Promise((resolve) => {
      isWheelSpinning = true;
      renderRoute();
      const slice = optionCount > 0 ? 360 / optionCount : 360;
      const current = wheelRotations[kind];
      const currentMod = ((current % 360) + 360) % 360;
      const desiredMod = ((-selectedIndex * slice) % 360 + 360) % 360;
      const delta = ((desiredMod - currentMod + 360) % 360) + (prefersReducedMotion.matches ? 360 : 1440);
      wheelRotations[kind] = current + delta;
      svg.style.transform = `rotate(${wheelRotations[kind]}deg)`;
      window.setTimeout(() => {
        isWheelSpinning = false;
        renderRoute();
        resolve();
      }, prefersReducedMotion.matches ? 80 : 3260);
    });
  }

  function clearRoute() {
    if (!state.currentStart && !state.currentDestination) return;
    const previous = hasCompleteRoute()
      ? `${state.currentStart} → ${state.currentDestination}`
      : state.currentStart;
    state.currentStart = null;
    state.currentDestination = null;
    logEvent(`Route selection cleared${previous ? ` (${previous})` : ""}.`, "route");
    saveState();
    renderAll();
  }

  async function finishRoute(outcome) {
    if (!hasCompleteRoute()) return;
    const route = `${state.currentStart} → ${state.currentDestination}`;
    const runnersName = runnerTeam().name;
    const chasersIndex = state.runners === 0 ? 1 : 0;
    const chasersName = state.teams[chasersIndex].name;

    pushUndo(`route ${outcome}`);
    if (outcome === "connected") {
      state.teams[state.runners].score += 1;
      logEvent(`${runnersName} connected ${route} and gained 1 point.`, "score");
    } else if (state.catchScoring === "chasersPoint") {
      state.teams[chasersIndex].score += 1;
      logEvent(`${chasersName} caught the Runners on ${route} and gained 1 point.`, "score");
    } else {
      logEvent(`${runnersName} were caught on ${route}; no point was awarded.`, "score");
    }

    if (!state.usedStarts.includes(state.currentStart)) state.usedStarts.push(state.currentStart);
    if (!state.usedDestinations.includes(state.currentDestination)) state.usedDestinations.push(state.currentDestination);

    advanceRound();
    saveState();
    renderAll();
    toast(outcome === "connected" ? `${runnersName} score!` : "Runners caught — round complete.");
  }

  function advanceRound() {
    state.round += 1;
    state.runners = state.runners === 0 ? 1 : 0;
    state.currentStart = null;
    state.currentDestination = null;
    state.currentChallenge = null;
    state.freeRerollUsed = false;
    state.challengeTimedOut = false;
    state.busLocked = false;
    resetAllTimersSilently();
    logEvent(`Round ${state.round} ready. ${runnerTeam().name} are the Runners.`, "round");
  }

  function resetAllTimersSilently() {
    Object.entries(TIMER_CONFIG).forEach(([name, config]) => {
      state.timers[name] = createTimer(config.duration);
    });
  }

  function getTimerRemaining(name) {
    const timer = state.timers[name];
    if (!timer.running || !timer.endAt) {
      return timer.remaining;
    }
    return Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000));
  }

  function toggleTimer(name) {
    const timer = state.timers[name];
    if (!timer || !(name in TIMER_CONFIG)) return;
    if (name === "bus" && state.busLocked) {
      toast("Another bus is blocked until a non-bus leg is completed.");
      return;
    }

    if (timer.running) {
      timer.remaining = getTimerRemaining(name);
      timer.running = false;
      timer.endAt = null;
      logEvent(`${TIMER_CONFIG[name].label} timer paused at ${formatDuration(timer.remaining)}.`, "timer");
    } else {
      if (timer.remaining <= 0) {
        timer.remaining = timer.duration;
        timer.expired = false;
        if (name === "challenge") state.challengeTimedOut = false;
      }
      timer.running = true;
      timer.endAt = Date.now() + timer.remaining * 1000;
      logEvent(`${TIMER_CONFIG[name].label} timer started.`, "timer");
    }
    saveState();
    renderTimers();
  }

  function resetTimer(name, log = false) {
    const config = TIMER_CONFIG[name];
    if (!config) return;
    state.timers[name] = createTimer(config.duration);
    if (name === "challenge") state.challengeTimedOut = false;
    if (log) logEvent(`${config.label} timer reset.`, "timer");
    saveState();
    renderTimers();
    renderChallenge();
  }

  function tickTimers() {
    let expiredName = null;
    for (const name of Object.keys(TIMER_CONFIG)) {
      const timer = state.timers[name];
      if (timer.running && getTimerRemaining(name) <= 0) {
        expiredName = name;
        handleTimerExpired(name);
      }
    }
    renderTimers();
    if (expiredName === "challenge") renderChallenge();
  }

  function handleTimerExpired(name) {
    const timer = state.timers[name];
    if (!timer.running) return;
    timer.running = false;
    timer.remaining = 0;
    timer.endAt = null;
    timer.expired = true;

    if (name === "headstart") {
      logEvent("The 15-minute head start ended. Chasers may begin.", "timer");
      timerAlert("Head start finished — Chasers may begin!");
    } else if (name === "bus") {
      state.busLocked = true;
      logEvent("The 10-minute bus limit was reached. Another bus is blocked until a non-bus leg is completed.", "timer");
      timerAlert("10-minute bus limit reached — get off the bus.");
    } else if (name === "challenge") {
      state.challengeTimedOut = true;
      logEvent("The 15-minute challenge limit ended. A new challenge may be rolled.", "timer");
      timerAlert("15 minutes elapsed — challenge reroll available.");
    }
    saveState();
  }

  function renderTimers() {
    renderTimer("headstart", dom.headstartDisplay, dom.headstartStatus);
    renderTimer("bus", dom.busDisplay, dom.busStatus);
    renderTimer("challenge", dom.challengeDisplay, dom.challengeTimerStatus);

    const busButton = document.querySelector('[data-timer-action="toggle"][data-timer="bus"]');
    if (busButton) busButton.disabled = state.busLocked;
    dom.endBusButton.disabled = state.busLocked;
    dom.unlockBusButton.hidden = !state.busLocked;
  }

  function renderTimer(name, display, status) {
    const timer = state.timers[name];
    const remaining = getTimerRemaining(name);
    display.textContent = formatDuration(remaining);

    const card = document.querySelector(`[data-timer-card="${name}"]`);
    card?.classList.toggle("is-running", timer.running);
    card?.classList.toggle("is-finished", remaining <= 0 || (name === "bus" && state.busLocked));

    const toggle = document.querySelector(`[data-timer-action="toggle"][data-timer="${name}"]`);
    if (toggle) {
      if (timer.running) {
        toggle.textContent = "Pause";
      } else if (remaining < timer.duration && remaining > 0) {
        toggle.textContent = "Resume";
      } else {
        toggle.textContent = "Start";
      }
    }

    if (name === "headstart") {
      status.textContent = timer.running
        ? "Chasers are waiting"
        : remaining <= 0
          ? "Chasers released"
          : remaining < timer.duration
            ? "Paused"
            : "Ready";
    } else if (name === "bus") {
      status.textContent = state.busLocked
        ? "Next bus blocked — complete a non-bus leg first"
        : timer.running
          ? "Bus time is running"
          : remaining < timer.duration
            ? "Paused"
            : "Ready";
    } else {
      status.textContent = state.challengeTimedOut
        ? "Reroll is now available"
        : timer.running
          ? "Challenge time is running"
          : state.currentChallenge
            ? "Paused"
            : "Starts automatically after a challenge spin";
    }
  }

  function formatDuration(totalSeconds) {
    const safe = Math.max(0, Math.ceil(totalSeconds));
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function endBusRide() {
    if (state.busLocked) return;
    const timer = state.timers.bus;
    if (timer.running) {
      timer.remaining = getTimerRemaining("bus");
    }
    timer.running = false;
    timer.endAt = null;
    state.busLocked = true;
    logEvent("Bus leg ended. Another bus is blocked until a non-bus leg is completed.", "timer");
    saveState();
    renderTimers();
    toast("Bus ended. Complete another type of leg before boarding a new bus.");
  }

  function unlockBus() {
    state.busLocked = false;
    state.timers.bus = createTimer(TIMER_CONFIG.bus.duration);
    logEvent("A non-bus leg was completed; bus use is available again.", "timer");
    saveState();
    renderTimers();
    toast("Bus use unlocked.");
  }

  function availableChallenges(excludeId = null) {
    return CHALLENGES.filter((challenge) => {
      return !state.completedChallenges.includes(challenge.id) && challenge.id !== excludeId;
    });
  }

  async function spinChallenge() {
    if (isChallengeSpinning || state.currentChallenge) return;
    const options = availableChallenges();
    if (!options.length) {
      toast("Every challenge has been completed.");
      return;
    }
    const selected = options[randomIndex(options.length)];
    await animateChallenge(selected);
    state.currentChallenge = selected.id;
    state.challengeTimedOut = false;
    logEvent(`Challenge rolled: ${selected.text}`, "challenge");
    startChallengeTimerSilently();
    saveState();
    renderAll();
  }

  async function rerollChallenge() {
    const current = getCurrentChallenge();
    if (!current || isChallengeSpinning) return;
    const timedOut = state.challengeTimedOut;
    if (state.freeRerollUsed && !timedOut) {
      toast("The free reroll has already been used this round.");
      return;
    }
    const options = availableChallenges(current.id);
    if (!options.length) {
      toast("No different uncompleted challenge is available.");
      return;
    }

    if (!timedOut) state.freeRerollUsed = true;
    const selected = options[randomIndex(options.length)];
    await animateChallenge(selected);
    state.currentChallenge = selected.id;
    state.challengeTimedOut = false;
    logEvent(`Challenge rerolled ${timedOut ? "after 15 minutes" : "using the free reroll"}: ${selected.text}`, "challenge");
    startChallengeTimerSilently();
    saveState();
    renderAll();
  }

  function startChallengeTimerSilently() {
    state.timers.challenge = createTimer(TIMER_CONFIG.challenge.duration);
    state.timers.challenge.running = true;
    state.timers.challenge.endAt = Date.now() + TIMER_CONFIG.challenge.duration * 1000;
  }

  function animateChallenge(selected) {
    return new Promise((resolve) => {
      isChallengeSpinning = true;
      renderChallenge();
      dom.challengeSlot.classList.add("is-spinning");

      if (prefersReducedMotion.matches) {
        dom.challengeSlot.textContent = selected.text;
        dom.challengeSlot.classList.remove("is-spinning");
        isChallengeSpinning = false;
        resolve();
        return;
      }

      const pool = availableChallenges();
      let ticks = 0;
      const interval = window.setInterval(() => {
        const sample = pool[randomIndex(pool.length)] || selected;
        dom.challengeSlot.textContent = sample.text;
        ticks += 1;
        if (ticks >= 22) {
          window.clearInterval(interval);
          dom.challengeSlot.textContent = selected.text;
          dom.challengeSlot.classList.remove("is-spinning");
          isChallengeSpinning = false;
          resolve();
        }
      }, 70);
    });
  }

  function completeChallenge() {
    const challenge = getCurrentChallenge();
    if (!challenge) return;
    pushUndo("complete challenge");
    if (!state.completedChallenges.includes(challenge.id)) {
      state.completedChallenges.push(challenge.id);
      state.teams[state.runners].challenges += 1;
    }
    logEvent(`${runnerTeam().name} completed the challenge: ${challenge.text}`, "challenge");
    state.currentChallenge = null;
    state.challengeTimedOut = false;
    state.timers.challenge = createTimer(TIMER_CONFIG.challenge.duration);
    saveState();
    renderAll();
    toast("Challenge completed and recorded.");
  }

  function safetySkipChallenge() {
    const challenge = getCurrentChallenge();
    if (!challenge) return;
    logEvent(`Safety override used for challenge: ${challenge.text}`, "challenge");
    state.currentChallenge = null;
    state.challengeTimedOut = false;
    state.timers.challenge = createTimer(TIMER_CONFIG.challenge.duration);
    saveState();
    renderAll();
    toast("Safety override logged.");
  }

  function getCurrentChallenge() {
    return CHALLENGES.find((challenge) => challenge.id === state.currentChallenge) || null;
  }

  function renderChallenge() {
    const current = getCurrentChallenge();
    const remainingCount = CHALLENGES.length - state.completedChallenges.length;
    dom.challengeCountPill.textContent = `${remainingCount} available`;

    if (!isChallengeSpinning) {
      dom.challengeSlot.textContent = current?.text || "Press “Spin challenge” after exiting the station.";
    }
    dom.selectedChallengeText.textContent = current?.text || "No active challenge";
    dom.challengeSelectedPanel.classList.toggle("is-empty", !current);

    dom.spinChallengeButton.disabled = isChallengeSpinning || Boolean(current) || remainingCount === 0;
    dom.completeChallengeButton.disabled = !current || isChallengeSpinning;
    dom.safetySkipButton.disabled = !current || isChallengeSpinning;

    const canUseFree = !state.freeRerollUsed;
    const canReroll = Boolean(current) && (canUseFree || state.challengeTimedOut) && !isChallengeSpinning;
    dom.rerollChallengeButton.disabled = !canReroll;
    dom.rerollChallengeButton.textContent = state.challengeTimedOut
      ? "Reroll after 15 minutes"
      : canUseFree
        ? "Use free reroll"
        : "Free reroll used";

    dom.rerollStatus.textContent = state.challengeTimedOut
      ? "Timed reroll available"
      : state.freeRerollUsed
        ? "Free reroll used"
        : "1 free reroll this round";
  }

  function populateMessageStations() {
    dom.messageStation.innerHTML = "";
    const starts = STATIONS.filter((station) => station.type === "start");
    const destinations = STATIONS.filter((station) => station.type === "destination");
    appendStationGroup("Start stations", starts);
    appendStationGroup("Destination stations", destinations);
    dom.messageStation.addEventListener("change", () => {
      dom.messageStation.dataset.userChanged = "true";
    });

    function appendStationGroup(label, stations) {
      const group = document.createElement("optgroup");
      group.label = label;
      stations.forEach((station) => {
        const option = document.createElement("option");
        option.value = station.name;
        option.textContent = station.name;
        group.appendChild(option);
      });
      dom.messageStation.appendChild(group);
    }
  }

  function setCurrentTime() {
    const now = new Date();
    dom.messageTime.value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  }

  function renderMessagePreview() {
    const action = dom.messageAction.value || "Leaving";
    const station = dom.messageStation.value || STATIONS[0].name;
    const time = dom.messageTime.value || "--:--";
    dom.messagePreview.textContent = `${action} ${station} at ${time}`;
  }

  function projectStation(station) {
    const xRatio = (station.lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);
    const yRatio = (MAP_BOUNDS.maxLat - station.lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
    return {
      x: MAP_BOUNDS.left + xRatio * (MAP_BOUNDS.right - MAP_BOUNDS.left),
      y: MAP_BOUNDS.top + yRatio * (MAP_BOUNDS.bottom - MAP_BOUNDS.top)
    };
  }

  function renderMap() {
    dom.showAllRoutesToggle.checked = state.showAllRoutes;
    dom.allRouteLines.innerHTML = "";
    dom.selectedRouteLine.innerHTML = "";
    dom.stationMarkers.innerHTML = "";
    dom.userLocationLayer.innerHTML = "";

    if (state.showAllRoutes) {
      Object.entries(ROUTES).forEach(([startName, destinations]) => {
        const start = STATIONS.find((station) => station.name === startName);
        const startPoint = projectStation(start);
        destinations.forEach((destinationName) => {
          const destination = STATIONS.find((station) => station.name === destinationName);
          const destinationPoint = projectStation(destination);
          dom.allRouteLines.appendChild(createSvg("line", {
            x1: startPoint.x,
            y1: startPoint.y,
            x2: destinationPoint.x,
            y2: destinationPoint.y,
            class: "map-route-all"
          }));
        });
      });
    }

    if (hasCompleteRoute()) {
      const start = STATIONS.find((station) => station.name === state.currentStart);
      const destination = STATIONS.find((station) => station.name === state.currentDestination);
      const startPoint = projectStation(start);
      const destinationPoint = projectStation(destination);
      dom.selectedRouteLine.appendChild(createSvg("line", {
        x1: startPoint.x,
        y1: startPoint.y,
        x2: destinationPoint.x,
        y2: destinationPoint.y,
        class: "map-route-selected-back"
      }));
      dom.selectedRouteLine.appendChild(createSvg("line", {
        x1: startPoint.x,
        y1: startPoint.y,
        x2: destinationPoint.x,
        y2: destinationPoint.y,
        class: "map-route-selected"
      }));
    }

    STATIONS.forEach((station) => dom.stationMarkers.appendChild(createStationMarker(station)));

    if (userLocation) {
      const point = projectStation(userLocation);
      dom.userLocationLayer.appendChild(createSvg("circle", {
        cx: point.x,
        cy: point.y,
        r: 17,
        class: "user-location-halo"
      }));
      dom.userLocationLayer.appendChild(createSvg("circle", {
        cx: point.x,
        cy: point.y,
        r: 8,
        class: "user-location-core"
      }));
    }

    renderMapRouteDetails();
    renderInspectedStation();
  }

  function createStationMarker(station) {
    const point = projectStation(station);
    const used = station.type === "start"
      ? state.usedStarts.includes(station.name)
      : state.usedDestinations.includes(station.name);
    const selected = station.name === state.currentStart || station.name === state.currentDestination;
    const width = Math.max(72, Math.min(164, station.name.length * 7.1 + 16));
    const boxX = station.labelSide === "left" ? point.x - width - 18 : point.x + 18;
    const boxY = point.y + station.labelDy;

    const group = createSvg("g", {
      class: `station-marker is-${station.type}${used ? " is-used" : ""}${selected ? " is-selected" : ""}`,
      role: "button",
      tabindex: 0,
      "aria-label": `${station.name}, ${station.type} station${used ? ", used" : ""}`
    });
    group.dataset.station = station.name;

    const title = createSvg("title");
    title.textContent = `${station.name} — ${station.type}${used ? " (used)" : ""}`;
    group.appendChild(title);
    group.appendChild(createSvg("rect", {
      x: boxX,
      y: boxY,
      width,
      height: 28,
      rx: 9,
      class: "station-label-bg"
    }));
    const label = createSvg("text", {
      x: boxX + 8,
      y: boxY + 18,
      class: `station-label${used ? " station-label-used" : ""}`
    });
    label.textContent = station.name;
    group.appendChild(label);
    group.appendChild(createSvg("circle", { cx: point.x, cy: point.y, r: 15, class: "station-halo" }));
    group.appendChild(createSvg("circle", { cx: point.x, cy: point.y, r: 9, class: "station-core" }));

    group.addEventListener("click", () => inspectStation(station.name));
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        inspectStation(station.name);
      }
    });
    return group;
  }

  function inspectStation(name) {
    inspectedStation = name;
    renderInspectedStation();
  }

  function renderInspectedStation() {
    const station = STATIONS.find((item) => item.name === inspectedStation);
    if (!station) {
      dom.stationDetailName.textContent = "Tap a station marker";
      dom.stationDetailText.textContent = "The map is schematic and intended for game planning, not turn-by-turn navigation.";
      dom.useStationButton.hidden = true;
      return;
    }

    const used = station.type === "start"
      ? state.usedStarts.includes(station.name)
      : state.usedDestinations.includes(station.name);
    dom.stationDetailName.textContent = station.name;

    if (station.type === "start") {
      const valid = ROUTES[station.name];
      const available = getAvailableDestinations(station.name);
      dom.stationDetailText.textContent = `${used ? "Already used. " : ""}${valid.length} valid destinations; ${available.length} remain unused.`;
      dom.useStationButton.textContent = "Use as start";
      dom.useStationButton.hidden = used || available.length === 0;
      dom.useStationButton.disabled = hasCompleteRoute();
    } else {
      const validForCurrent = Boolean(state.currentStart && ROUTES[state.currentStart]?.includes(station.name));
      dom.stationDetailText.textContent = used
        ? "This destination has already been used."
        : !state.currentStart
          ? "Select or spin a start station before using this destination."
          : validForCurrent
            ? `Valid for ${state.currentStart}.`
            : `Not a valid destination for ${state.currentStart}.`;
      dom.useStationButton.textContent = "Use as destination";
      dom.useStationButton.hidden = used || !state.currentStart || !validForCurrent;
      dom.useStationButton.disabled = hasCompleteRoute();
    }
  }

  function useInspectedStation() {
    const station = STATIONS.find((item) => item.name === inspectedStation);
    if (!station) return;
    if (station.type === "start") {
      if (state.usedStarts.includes(station.name) || getAvailableDestinations(station.name).length === 0) return;
      state.currentStart = station.name;
      state.currentDestination = null;
      logEvent(`Start manually selected from map: ${station.name}.`, "route");
      toast(`Start set to ${station.name}.`);
    } else {
      if (!state.currentStart || !ROUTES[state.currentStart]?.includes(station.name) || state.usedDestinations.includes(station.name)) return;
      state.currentDestination = station.name;
      logEvent(`Destination manually selected from map: ${station.name}.`, "route");
      toast(`Destination set to ${station.name}.`);
    }
    saveState();
    renderAll();
  }

  function renderMapRouteDetails() {
    if (hasCompleteRoute()) {
      const routeText = `${state.currentStart} → ${state.currentDestination}`;
      dom.mapRouteText.textContent = routeText;
      dom.mapRouteNote.textContent = "The blue line shows the selected game link, not the exact rail route.";
      const origin = encodeURIComponent(`${state.currentStart} Station, London`);
      const destination = encodeURIComponent(`${state.currentDestination} Station, London`);
      dom.directionsLink.href = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=transit`;
      dom.directionsLink.setAttribute("aria-disabled", "false");
      dom.copyRouteButton.disabled = false;
    } else if (state.currentStart) {
      dom.mapRouteText.textContent = `${state.currentStart} → destination not selected`;
      dom.mapRouteNote.textContent = `${getAvailableDestinations(state.currentStart).length} valid unused destinations remain for this start.`;
      dom.directionsLink.href = "#";
      dom.directionsLink.setAttribute("aria-disabled", "true");
      dom.copyRouteButton.disabled = true;
    } else {
      dom.mapRouteText.textContent = "No route selected";
      dom.mapRouteNote.textContent = "Spin a start and destination, or inspect a marker and use the manual selection button.";
      dom.directionsLink.href = "#";
      dom.directionsLink.setAttribute("aria-disabled", "true");
      dom.copyRouteButton.disabled = true;
    }
  }

  function locateUser() {
    if (!navigator.geolocation) {
      toast("Geolocation is not supported by this browser.");
      return;
    }
    dom.locateButton.disabled = true;
    dom.locateButton.textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        dom.locateButton.disabled = false;
        dom.locateButton.textContent = "Refresh my location";
        if (lat < MAP_BOUNDS.minLat || lat > MAP_BOUNDS.maxLat || lng < MAP_BOUNDS.minLng || lng > MAP_BOUNDS.maxLng) {
          toast("Your location is outside the schematic London map area.");
          return;
        }
        userLocation = { lat, lng };
        renderMap();
        toast("Location shown on this device only.");
      },
      (error) => {
        dom.locateButton.disabled = false;
        dom.locateButton.textContent = "Show my location";
        toast(error.code === 1 ? "Location permission was not granted." : "Your location could not be found.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
    );
  }

  function renderChallengeLibrary() {
    const query = (dom.challengeSearch.value || "").trim().toLowerCase();
    const filtered = CHALLENGES.filter((challenge) => challenge.text.toLowerCase().includes(query));
    dom.challengeLibrary.innerHTML = "";
    filtered.forEach((challenge, index) => {
      const complete = state.completedChallenges.includes(challenge.id);
      const item = document.createElement("article");
      item.className = `challenge-library-item${complete ? " is-complete" : ""}`;
      const text = document.createElement("p");
      text.textContent = challenge.text;
      const status = document.createElement("small");
      status.textContent = complete ? "Completed" : `Challenge ${CHALLENGES.indexOf(challenge) + 1}`;
      item.append(text, status);
      dom.challengeLibrary.appendChild(item);
    });
    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "helper-text";
      empty.textContent = "No challenges match that search.";
      dom.challengeLibrary.appendChild(empty);
    }
  }

  function logEvent(message, type = "info") {
    state.log.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      time: new Date().toISOString(),
      round: state.round,
      type,
      message
    });
    state.log = state.log.slice(-500);
  }

  function renderLog() {
    dom.gameLog.innerHTML = "";
    const entries = [...state.log].reverse();
    if (!entries.length) {
      const empty = document.createElement("li");
      empty.className = "empty-log";
      empty.textContent = "Nothing has been recorded yet. Spins, timer events, scores and round outcomes will appear here.";
      dom.gameLog.appendChild(empty);
    } else {
      entries.forEach((entry, index) => {
        const item = document.createElement("li");
        item.dataset.index = String(entries.length - index);
        const main = document.createElement("span");
        main.className = "log-entry-main";
        main.textContent = entry.message;
        const meta = document.createElement("span");
        meta.className = "log-entry-meta";
        meta.textContent = `Round ${entry.round || "–"} · ${formatDateTime(entry.time)}`;
        item.append(main, meta);
        dom.gameLog.appendChild(item);
      });
    }
    dom.undoButton.disabled = undoStack.length === 0;
    dom.copyLogButton.disabled = state.log.length === 0;
    dom.downloadLogButton.disabled = state.log.length === 0;
  }

  function buildTextLog() {
    const teamA = state.teams[0];
    const teamB = state.teams[1];
    const lines = [
      "TAG ACROSS LONDON — GAME LOG",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      `${teamA.name}: ${teamA.score} point(s), ${teamA.challenges} challenge(s)`,
      `${teamB.name}: ${teamB.score} point(s), ${teamB.challenges} challenge(s)`,
      `Current round: ${state.round}`,
      `Current Runners: ${runnerTeam().name}`,
      `Catch scoring: ${state.catchScoring === "chasersPoint" ? "Chasers gain 1 point" : "No point awarded"}`,
      "",
      "EVENTS"
    ];
    if (!state.log.length) {
      lines.push("No events recorded.");
    } else {
      state.log.forEach((entry, index) => {
        lines.push(`${index + 1}. [${formatDateTime(entry.time)} · Round ${entry.round}] ${entry.message}`);
      });
    }
    return lines.join("\n");
  }

  async function undoLastAction() {
    const last = undoStack.pop();
    if (!last) {
      toast("Nothing is available to undo.");
      return;
    }
    state = normaliseState(last.state);
    saveUndoStack();
    saveState();
    renderAll();
    toast(`Undid ${last.label || "the last action"}.`);
  }

  async function resetWholeGame() {
    const confirmed = await confirmAction(
      "Reset the whole game?",
      "This clears scores, used stations, completed challenges, timers and the log on this device.",
      "Reset game"
    );
    if (!confirmed) return;
    state = createDefaultState();
    undoStack = [];
    inspectedStation = null;
    userLocation = null;
    saveState();
    saveUndoStack();
    renderAll();
    toast("A new game is ready.");
  }

  async function importStateFromFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const candidate = parsed?.state || parsed;
      const imported = normaliseState(candidate);
      const confirmed = await confirmAction(
        "Import this game state?",
        "The current game on this device will be replaced. You can export it first if needed.",
        "Import"
      );
      if (!confirmed) return;
      pushUndo("state import");
      state = imported;
      saveState();
      renderAll();
      toast("Game state imported.");
    } catch (error) {
      console.warn(error);
      toast("That file is not a valid Tag Across London game state.");
    }
  }

  function formatDateTime(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "Unknown time";
    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function dateStamp() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function downloadText(filename, text, mimeType) {
    const blob = new Blob([text], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // Fall through for file:// and restrictive browser contexts.
      }
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  function createSvg(tag, attributes = {}) {
    const element = document.createElementNS(SVG_NS, tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, String(value));
    });
    return element;
  }

  function randomIndex(length) {
    if (length <= 1) return 0;
    if (window.crypto?.getRandomValues) {
      const max = 0x100000000;
      const limit = max - (max % length);
      const values = new Uint32Array(1);
      do {
        window.crypto.getRandomValues(values);
      } while (values[0] >= limit);
      return values[0] % length;
    }
    return Math.floor(Math.random() * length);
  }

  function plural(count, singular, pluralForm = `${singular}s`) {
    return count === 1 ? singular : pluralForm;
  }

  function toast(message) {
    const item = document.createElement("div");
    item.className = "toast";
    item.textContent = message;
    dom.toastRegion.appendChild(item);
    window.setTimeout(() => {
      item.remove();
    }, 3600);
  }

  function timerAlert(message) {
    toast(message);
    if (navigator.vibrate) {
      navigator.vibrate([180, 100, 180]);
    }
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 720;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.38);
      oscillator.addEventListener("ended", () => context.close());
    } catch {
      // Sound is optional.
    }
  }

  function confirmAction(title, message, acceptLabel = "Confirm") {
    if (!dom.confirmDialog?.showModal) {
      return Promise.resolve(window.confirm(`${title}\n\n${message}`));
    }
    dom.confirmTitle.textContent = title;
    dom.confirmMessage.textContent = message;
    dom.confirmAcceptButton.textContent = acceptLabel;
    dom.confirmDialog.returnValue = "";
    dom.confirmDialog.showModal();
    return new Promise((resolve) => {
      pendingConfirmResolver = resolve;
    });
  }

  async function installApp() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    dom.installButton.hidden = true;
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
      navigator.serviceWorker.register("sw.js").catch((error) => {
        console.warn("Service worker registration failed", error);
      });
    }
  }
})();
