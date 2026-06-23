(() => {
  'use strict';

  const STORAGE_KEY = 'laurent360-state-v1';
  const THEME_KEY = 'laurent360-theme';
  const PHOTO_LIMIT = 6;
  const CONTRACT = {
    request: {
      event: 'health_checkin.created', version: '1.0', occurred_at: '2026-06-23T08:15:00.000Z',
      input: { text: 'Poids 85,8 kg, sommeil 7h, énergie 7/10, 8 200 pas.', type: 'daily', photos: [{ id: 'local-id', mime_type: 'image/jpeg', data_url: 'data:image/jpeg;base64,…' }] },
      current_state: { profile: {}, targets: {}, latest_measurement: {}, gamification: {} }
    },
    response: {
      version: '1.0',
      extracted: { weight: 85.8, waist: null, steps: 8200, sleep: 7, energy: 7, mood: null, pain: null, workout: false },
      patch: { targets: {}, challenge: null },
      coach: { headline: 'Belle régularité', message: 'Tu consolides ta trajectoire.', tone: 'encouragement', xp_awarded: 20 },
      safety: { level: 'green', message: '' }
    }
  };

  const demoMeasurements = [
    { date: daysAgo(56), weight: 87.4, waist: 102, steps: 4800, sleep: 6.25, energy: 5, mood: 6, pain: 2, activityMinutes: 42, strengthSessions: 0 },
    { date: daysAgo(49), weight: 87.1, waist: 101.5, steps: 5200, sleep: 6.4, energy: 5, mood: 6, pain: 2, activityMinutes: 65, strengthSessions: 1 },
    { date: daysAgo(42), weight: 86.9, waist: 101, steps: 5700, sleep: 6.5, energy: 6, mood: 6, pain: 1, activityMinutes: 80, strengthSessions: 1 },
    { date: daysAgo(35), weight: 86.6, waist: 100.8, steps: 6100, sleep: 6.65, energy: 6, mood: 7, pain: 1, activityMinutes: 95, strengthSessions: 2 },
    { date: daysAgo(28), weight: 86.4, waist: 100.5, steps: 6500, sleep: 6.75, energy: 6, mood: 7, pain: 1, activityMinutes: 105, strengthSessions: 2 },
    { date: daysAgo(21), weight: 86.2, waist: 100.2, steps: 6900, sleep: 6.9, energy: 7, mood: 7, pain: 1, activityMinutes: 120, strengthSessions: 2 },
    { date: daysAgo(14), weight: 86.0, waist: 99.5, steps: 7200, sleep: 7.0, energy: 7, mood: 7, pain: 1, activityMinutes: 135, strengthSessions: 2 },
    { date: daysAgo(7), weight: 85.9, waist: 99, steps: 7340, sleep: 7.08, energy: 7, mood: 8, pain: 1, activityMinutes: 148, strengthSessions: 2 }
  ];

  const DEFAULT_STATE = {
    version: 1,
    demoMode: true,
    profile: { name: 'Laurent', startDate: daysAgo(56), goalWeeks: 36, why: "Disposer de plus d'énergie, de mobilité et de confiance dans la durée." },
    goal: { title: 'Retrouver un corps sain, dynamique et durable', waistReduction: 8, activityMinutes: 150, adherence: 80, energy: 8 },
    targets: { steps: 8000, sleep: 7, strengthSessions: 2 },
    measurements: demoMeasurements,
    checkins: [
      { id: uid(), date: daysAgoIso(1, 18), type: 'checkin', title: 'Check-in du soir', text: "Bonne énergie. Marche terminée et dîner simple. J'ai respecté mon minimum utile.", energy: 7, mood: 8, pain: 1, xp: 20 },
      { id: uid(), date: daysAgoIso(2, 8), type: 'measurement', title: 'Mesure hebdomadaire', text: 'Poids moyen 85,9 kg · tour de taille 99 cm.', weight: 85.9, waist: 99, xp: 15 },
      { id: uid(), date: daysAgoIso(3, 19), type: 'reward', title: 'Badge débloqué : chaîne de 4 jours', text: 'La régularité devient visible.', xp: 50 },
      { id: uid(), date: daysAgoIso(5, 12), type: 'checkin', title: 'Séance de renforcement', text: 'Séance complète, intensité maîtrisée, douleur 1/10.', workout: true, pain: 1, xp: 25 }
    ],
    photos: [],
    dailyActions: [
      { id: 'walk', title: '20 min de marche active', note: 'Fractionnable en 2 × 10 min', done: true, xp: 15 },
      { id: 'meal', title: 'Un dîner structuré', note: '½ légumes · ¼ protéines · ¼ féculents', done: true, xp: 10 },
      { id: 'sleep', title: 'Écran coupé 30 min avant le coucher', note: 'Préparer le sommeil plutôt que le subir', done: false, xp: 10 }
    ],
    weeklyContract: [
      { id: 'steps', title: 'Objectif de pas', target: '5 jours / 7', done: 3, total: 5 },
      { id: 'strength', title: 'Renforcement', target: '2 séances', done: 1, total: 2 },
      { id: 'sleep', title: 'Routine de sommeil', target: '5 soirs', done: 3, total: 5 },
      { id: 'checkin', title: 'Check-in rapide', target: '5 jours', done: 4, total: 5 }
    ],
    weekDays: [true, true, true, true, false, false, false],
    gamification: { xp: 460, level: 3, streak: 4, badges: ['Premier pas', 'Bilan T0', 'Chaîne 4 jours', 'Deux séances'] },
    challenge: { id: 'five-days', title: '5 jours en mouvement', description: "Atteins ton objectif de pas 5 jours sur 7, sans rechercher la perfection.", progress: 3, target: 5, reward: 120, metric: 'steps' },
    coach: { headline: 'La régularité construit déjà la transformation.', message: "Ta semaine est bien engagée. Aujourd'hui, sécurise une marche de 20 minutes et un dîner simple riche en légumes.", tone: 'encouragement' },
    settings: { agentEndpoint: '', showPrivacyBanner: false },
    agentDecisions: [
      { date: daysAgoIso(0, 7), type: 'encouragement', title: 'Charge maintenue', text: "Énergie stable et régularité en hausse : aucun changement nécessaire." },
      { date: daysAgoIso(2, 9), type: 'challenge', title: 'Challenge adapté', text: "Objectif de pas maintenu, avec 2 journées de récupération autorisées." },
      { date: daysAgoIso(5, 18), type: 'recovery', title: 'Récupération protégée', text: "Le sommeil était bas : séance raccourcie au lieu d'être supprimée." }
    ]
  };

  let state = loadState();
  let pendingPhotos = [];
  let charts = {};
  let recognition = null;
  let listening = false;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    bindRouting();
    bindTheme();
    bindActions();
    hydrateSettings();
    renderAll();
    routeTo((location.hash || '#today').slice(1), false);
    registerServiceWorker();
  }

  function bindRouting() {
    window.addEventListener('hashchange', () => routeTo((location.hash || '#today').slice(1), false));
    document.querySelectorAll('[data-route]').forEach(el => el.addEventListener('click', event => {
      const route = event.currentTarget.dataset.route;
      routeTo(route, true);
      const collapse = document.getElementById('navbar-menu');
      if (collapse?.classList.contains('show') && window.bootstrap?.Collapse) bootstrap.Collapse.getOrCreateInstance(collapse).hide();
    }));
  }

  function routeTo(route, updateHash = true) {
    const valid = ['today', 'progress', 'plan', 'journal', 'agent'];
    const selected = valid.includes(route) ? route : 'today';
    document.querySelectorAll('.app-view').forEach(view => view.classList.toggle('active', view.dataset.view === selected));
    document.querySelectorAll('[data-route]').forEach(link => link.classList.toggle('active', link.dataset.route === selected));
    if (updateHash && location.hash !== `#${selected}`) history.pushState(null, '', `#${selected}`);
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    if (selected === 'progress') setTimeout(renderCharts, 40);
    if (selected === 'journal') renderJournal();
  }

  function bindTheme() {
    const theme = localStorage.getItem(THEME_KEY) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(theme);
    document.getElementById('themeBtn').addEventListener('click', () => {
      const next = document.documentElement.dataset.bsTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
      renderCharts(true);
    });
  }

  function applyTheme(theme) {
    document.documentElement.dataset.bsTheme = theme;
    const icon = document.querySelector('#themeBtn i');
    if (icon) icon.className = theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
  }

  function bindActions() {
    document.querySelectorAll('[data-action="start-real"], #startRealBtn').forEach(btn => btn.addEventListener('click', openOnboarding));
    document.getElementById('saveBaselineBtn').addEventListener('click', saveBaseline);
    document.getElementById('keepDemoBtn').addEventListener('click', () => showToast('Démonstration conservée', 'Tu peux démarrer ton bilan T0 à tout moment.', 'info'));
    document.getElementById('submitCheckinBtn').addEventListener('click', submitCheckin);
    document.getElementById('checkinText').addEventListener('input', evaluateSafety);
    document.querySelectorAll('.checkin-prompt').forEach(btn => btn.addEventListener('click', () => insertPrompt(btn.dataset.prompt)));
    document.getElementById('voiceBtn').addEventListener('click', toggleVoice);
    document.getElementById('photoInput').addEventListener('change', handlePhotos);
    document.getElementById('newChallengeBtn').addEventListener('click', generateChallenge);
    document.getElementById('coachAdjustBtn').addEventListener('click', adaptToday);
    document.getElementById('lowEnergyBtn').addEventListener('click', activateLowEnergyMode);
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('testEndpointBtn').addEventListener('click', testEndpoint);
    document.getElementById('saveGoalBtn').addEventListener('click', saveGoal);
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importInput').addEventListener('change', importData);
    document.getElementById('journalSearch').addEventListener('input', renderJournal);
    document.querySelectorAll('input[name="journalType"]').forEach(input => input.addEventListener('change', renderJournal));
    document.getElementById('viewContractBtn').addEventListener('click', showContract);
    document.getElementById('copyContractBtn').addEventListener('click', copyContract);
    document.querySelectorAll('[data-chart-series]').forEach(btn => btn.addEventListener('click', () => switchMainSeries(btn.dataset.chartSeries)));
    document.querySelectorAll('[data-open-tab="photo"]').forEach(btn => btn.addEventListener('click', () => setTimeout(openPhotoTab, 200)));

    document.addEventListener('click', event => {
      const actionBtn = event.target.closest('[data-daily-action]');
      if (actionBtn) toggleDailyAction(actionBtn.dataset.dailyAction);
      const contractBtn = event.target.closest('[data-contract-id]');
      if (contractBtn) incrementContract(contractBtn.dataset.contractId);
      const removePhoto = event.target.closest('[data-remove-photo]');
      if (removePhoto) removePendingPhoto(Number(removePhoto.dataset.removePhoto));
    });

    document.getElementById('settingsModal').addEventListener('show.bs.modal', hydrateSettings);
    document.getElementById('goalModal').addEventListener('show.bs.modal', hydrateGoalForm);
    document.getElementById('checkinModal').addEventListener('hidden.bs.modal', resetCheckinForm);
  }

  function renderAll() {
    renderHeader();
    renderMetrics();
    renderDailyActions();
    renderWeek();
    renderChallenge();
    renderGoal();
    renderMilestones();
    renderWeeklyContract();
    renderJournal();
    renderPhotos();
    renderAgent();
    renderCharts(true);
  }

  function renderHeader() {
    const week = getProgramWeek();
    const phase = getPhase(week);
    text('phaseLabel', `Mission 36 semaines · ${phase.label}`);
    text('todayTitle', `Bonjour ${state.profile.name || 'Laurent'}`);
    text('todaySubtitle', formatLongDate(new Date()) + ' · ' + phase.focus);
    document.getElementById('demoBadge').classList.toggle('d-none', !state.demoMode);
    document.getElementById('demoCallout').classList.toggle('d-none', !state.demoMode);
    document.getElementById('privacyBanner').classList.toggle('d-none', !state.settings.showPrivacyBanner);
    text('coachHeadline', state.coach.headline);
    text('coachMessage', state.coach.message);
    const momentum = computeMomentum();
    text('momentumScore', momentum);
    const circle = document.getElementById('momentumCircle');
    if (circle) circle.style.strokeDashoffset = String(396 - (396 * momentum / 100));
    const external = Boolean(state.settings.agentEndpoint);
    text('agentStatusPill', external ? 'Agent connecté' : 'Mode local');
    document.getElementById('agentStatusPill').className = `badge ${external ? 'bg-green-lt text-green' : 'bg-white-lt'}`;
  }

  function renderMetrics() {
    const latest = latestMeasurement();
    const initial = state.measurements[0] || {};
    setMetric('weightValue', latest.weight, v => formatNumber(v, 1), '—');
    setMetric('waistValue', latest.waist, v => formatNumber(v, 1), '—');
    setMetric('stepsValue', latest.steps, v => Math.round(v).toLocaleString('fr-FR'), '—');
    setMetric('sleepValue', latest.sleep, formatSleep, '—');
    text('weightDelta', deltaLabel(initial.weight, latest.weight, 'kg'));
    text('waistDelta', deltaLabel(initial.waist, latest.waist, 'cm'));
    text('stepsDelta', latest.steps ? `Objectif : ${state.targets.steps.toLocaleString('fr-FR')}` : 'À renseigner');
    text('sleepDelta', initial.sleep && latest.sleep ? `${signed(latest.sleep - initial.sleep, 1)} h depuis T0` : 'À renseigner');
    document.getElementById('stepsProgress').style.width = `${Math.min(100, Math.round((latest.steps || 0) / Math.max(1, state.targets.steps) * 100))}%`;
    text('xpValue', state.gamification.xp);
    text('levelValue', state.gamification.level);
    text('badgeValue', state.gamification.badges.length);
    text('streakPill', `${state.gamification.streak} jours`);
  }

  function renderDailyActions() {
    const root = document.getElementById('dailyActions');
    root.innerHTML = '';
    state.dailyActions.forEach(action => {
      const row = document.createElement('div');
      row.className = `daily-action ${action.done ? 'done' : ''}`;
      row.innerHTML = `<button class="action-check" data-daily-action="${escapeAttr(action.id)}" type="button" aria-label="${action.done ? 'Marquer comme non fait' : 'Marquer comme fait'}"><i class="ti ${action.done ? 'ti-check' : 'ti-circle'}" aria-hidden="true"></i></button><div><div class="action-title">${escapeHtml(action.title)}</div><div class="action-note">${escapeHtml(action.note)}</div></div><span class="badge bg-green-lt text-green">+${action.xp} XP</span>`;
      root.appendChild(row);
    });
    const done = state.dailyActions.filter(a => a.done).length;
    text('dailyCompletionBadge', `${done} / ${state.dailyActions.length}`);
  }

  function renderWeek() {
    const root = document.getElementById('weekStrip');
    const labels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const today = (new Date().getDay() + 6) % 7;
    root.innerHTML = labels.map((label, index) => `<div class="week-day ${state.weekDays[index] ? 'done' : ''} ${index === today ? 'today' : ''}"><span>${label}</span><span class="week-dot">${state.weekDays[index] ? '<i class="ti ti-check" aria-hidden="true"></i>' : index + 1}</span></div>`).join('');
  }

  function renderChallenge() {
    const c = state.challenge;
    text('challengeTitle', c.title);
    text('challengeDescription', c.description);
    text('challengeProgressLabel', `${c.progress} sur ${c.target}`);
    text('challengeReward', `+${c.reward} XP`);
    document.getElementById('challengeProgressBar').style.width = `${Math.min(100, c.progress / c.target * 100)}%`;
  }

  function renderGoal() {
    text('globalGoalTitle', state.goal.title);
    text('globalGoalWhy', state.profile.why);
    const percent = Math.min(100, Math.round((getProgramWeek() / state.profile.goalWeeks) * 100));
    text('programPercent', `${percent}%`);
    document.querySelector('.goal-ring')?.style.setProperty('--goal-progress', `${percent}%`);
    const dimensions = [
      ['Tour de taille', state.goal.waistReduction ? `−${state.goal.waistReduction} cm visés` : 'À définir après T0'],
      ['Endurance', `${state.goal.activityMinutes} min / semaine`],
      ['Régularité', `${state.goal.adherence}% des engagements`],
      ['Énergie', `${state.goal.energy}/10 ressentie`]
    ];
    document.getElementById('goalDimensions').innerHTML = dimensions.map(([title, value]) => `<div class="col-6 col-lg-3"><div class="goal-dimension"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(title)}</span></div></div>`).join('');
  }

  function renderMilestones() {
    const currentWeek = getProgramWeek();
    const milestones = [
      { week: 2, title: 'Diagnostic fiable', meta: 'Bilan T0 complet', targets: ['7–10 check-ins', 'Mesures initiales', 'Photos standardisées'] },
      { week: 6, title: 'Fondations installées', meta: 'Routines simples', targets: ['≥ 80 % contrat', '2 séances / semaine', '+1 500 pas vs T0'] },
      { week: 12, title: 'Élan visible', meta: 'Capacité en hausse', targets: ['Tendance corporelle favorable', '150 min d’activité', 'Énergie stable'] },
      { week: 18, title: 'Autonomie en progression', meta: 'Plateaux gérés', targets: ['3 semaines cohérentes', '1 levier à la fois', 'Sommeil protégé'] },
      { week: 24, title: 'Transformation consolidée', meta: 'Objectifs finaux', targets: ['Résultats personnalisés', 'Force et mobilité', 'Plan d’autonomie'] },
      { week: 36, title: 'Stabilisation démontrée', meta: '12 semaines de maintien', targets: ['Zone stable', 'Reprise après écart', 'Pilotage mensuel'] }
    ];
    const nextWeek = milestones.find(m => m.week >= currentWeek)?.week;
    document.getElementById('milestoneTimeline').innerHTML = milestones.map(m => {
      const status = currentWeek > m.week ? 'done' : m.week === nextWeek ? 'current' : '';
      return `<div class="milestone ${status}"><div class="milestone-dot">${status === 'done' ? '<i class="ti ti-check" aria-hidden="true"></i>' : `S${m.week}`}</div><div class="milestone-head"><div><div class="milestone-title">${escapeHtml(m.title)}</div><div class="milestone-meta">Semaine ${m.week} · ${escapeHtml(m.meta)}</div></div>${status === 'current' ? '<span class="badge bg-blue-lt text-blue">Étape actuelle</span>' : ''}</div><div class="milestone-targets">${m.targets.map(t => `<span class="badge bg-secondary-lt">${escapeHtml(t)}</span>`).join('')}</div></div>`;
    }).join('');
  }

  function renderWeeklyContract() {
    document.getElementById('weeklyContract').innerHTML = state.weeklyContract.map(item => `<div class="contract-item ${item.done >= item.total ? 'done' : ''}"><button class="contract-toggle" type="button" data-contract-id="${escapeAttr(item.id)}" aria-label="Faire progresser ${escapeAttr(item.title)}"><i class="ti ${item.done >= item.total ? 'ti-check' : 'ti-plus'}" aria-hidden="true"></i></button><div><strong>${escapeHtml(item.title)}</strong><div class="small text-secondary">${escapeHtml(item.target)}</div></div><span class="badge ${item.done >= item.total ? 'bg-green-lt text-green' : 'bg-secondary-lt'}">${item.done}/${item.total}</span></div>`).join('');
  }

  function renderJournal() {
    const root = document.getElementById('journalTimeline');
    if (!root) return;
    const query = (document.getElementById('journalSearch')?.value || '').trim().toLowerCase();
    const type = document.querySelector('input[name="journalType"]:checked')?.value || 'all';
    const items = [...state.checkins].sort((a,b) => new Date(b.date) - new Date(a.date)).filter(item => {
      const matchesType = type === 'all' || item.type === type;
      const haystack = `${item.title || ''} ${item.text || ''}`.toLowerCase();
      return matchesType && (!query || haystack.includes(query));
    });
    root.innerHTML = items.map(item => {
      const config = eventConfig(item.type);
      const chips = [
        item.weight != null ? `${formatNumber(item.weight,1)} kg` : null,
        item.waist != null ? `${formatNumber(item.waist,1)} cm` : null,
        item.steps != null ? `${Math.round(item.steps).toLocaleString('fr-FR')} pas` : null,
        item.sleep != null ? formatSleep(item.sleep) : null,
        item.energy != null ? `Énergie ${item.energy}/10` : null,
        item.pain != null ? `Douleur ${item.pain}/10` : null,
        item.workout ? 'Séance réalisée' : null
      ].filter(Boolean);
      return `<article class="timeline-event"><span class="avatar ${config.avatar}"><i class="ti ${config.icon}" aria-hidden="true"></i></span><div class="timeline-card"><div class="d-flex justify-content-between gap-3"><div><strong>${escapeHtml(item.title || config.label)}</strong><div class="timeline-meta">${formatDateTime(item.date)} · ${config.label}</div></div>${item.xp ? `<span class="badge bg-green-lt text-green">+${item.xp} XP</span>` : ''}</div>${item.text ? `<p class="text-secondary mt-2 mb-2">${escapeHtml(item.text)}</p>` : ''}${chips.length ? `<div class="d-flex flex-wrap gap-1">${chips.map(c => `<span class="badge bg-secondary-lt">${escapeHtml(c)}</span>`).join('')}</div>` : ''}</div></article>`;
    }).join('');
    document.getElementById('journalEmpty')?.classList.toggle('d-none', items.length > 0);
  }

  function renderPhotos() {
    const root = document.getElementById('photoTimeline');
    if (!root) return;
    const cards = state.photos.map(photo => `<div class="photo-card"><img src="${escapeAttr(photo.dataUrl)}" alt="Photo de progression du ${escapeAttr(formatShortDate(photo.date))}"><div class="photo-card-meta">${escapeHtml(formatShortDate(photo.date))} · ${escapeHtml(photo.label || 'Progression')}</div></div>`);
    while (cards.length < 3) cards.push(`<button class="photo-card empty" type="button" data-bs-toggle="modal" data-bs-target="#checkinModal" data-open-tab="photo"><span><i class="ti ti-camera-plus display-5 d-block mb-2" aria-hidden="true"></i><strong>Repère visuel ${cards.length + 1}</strong><br><small>Ajouter une photo privée</small></span></button>`);
    root.innerHTML = cards.join('');
    root.querySelectorAll('[data-open-tab="photo"]').forEach(btn => btn.addEventListener('click', () => setTimeout(openPhotoTab, 200)));
  }

  function renderAgent() {
    const external = Boolean(state.settings.agentEndpoint);
    const badge = document.getElementById('agentConnectionBadge');
    text('agentConnectionBadge', external ? 'Agent externe connecté' : 'Agent externe non connecté');
    badge.className = `badge ${external ? 'bg-green-lt text-green' : 'bg-yellow-lt text-yellow'}`;
    document.getElementById('agentDecisionList').innerHTML = state.agentDecisions.slice(0,5).map(d => {
      const icon = d.type === 'challenge' ? 'ti-trophy' : d.type === 'recovery' ? 'ti-bed' : 'ti-sparkles';
      const color = d.type === 'challenge' ? 'bg-purple-lt text-purple' : d.type === 'recovery' ? 'bg-indigo-lt text-indigo' : 'bg-blue-lt text-blue';
      return `<div class="py-3 d-flex gap-3"><span class="avatar avatar-sm ${color}"><i class="ti ${icon}" aria-hidden="true"></i></span><div><strong>${escapeHtml(d.title)}</strong><div class="small text-secondary">${escapeHtml(d.text)}</div><div class="timeline-meta mt-1">${formatDateTime(d.date)}</div></div></div>`;
    }).join('');
  }

  function renderCharts(force = false) {
    if (typeof ApexCharts === 'undefined') return;
    const visible = document.querySelector('[data-view="progress"]')?.classList.contains('active');
    if (!visible && !force) return;
    Object.values(charts).forEach(chart => chart?.destroy?.());
    charts = {};
    const dark = document.documentElement.dataset.bsTheme === 'dark';
    const grid = dark ? '#334155' : '#e6e7e9';
    const label = dark ? '#94a3b8' : '#667382';
    const common = { chart: { toolbar: { show: false }, animations: { enabled: true, speed: 450 }, fontFamily: 'inherit', foreColor: label }, grid: { borderColor: grid, strokeDashArray: 4 }, dataLabels: { enabled: false }, tooltip: { theme: dark ? 'dark' : 'light', x: { format: 'dd MMM' } } };
    charts.main = new ApexCharts(document.getElementById('mainTrendChart'), { ...common, chart: { ...common.chart, type: 'area', height: 330 }, series: [{ name: 'Poids (kg)', data: state.measurements.map(m => [new Date(m.date).getTime(), m.weight]) }], stroke: { curve: 'smooth', width: 3 }, fill: { type: 'gradient', gradient: { opacityFrom: .32, opacityTo: .03 } }, xaxis: { type: 'datetime', labels: { datetimeUTC: false } }, yaxis: { labels: { formatter: v => `${formatNumber(v,1)} kg` } }, noData: { text: 'Ajoute une première mesure' } });
    charts.main.render();
    charts.habits = new ApexCharts(document.getElementById('habitChart'), { ...common, chart: { ...common.chart, type: 'bar', height: 265 }, series: [{ name: 'Pas / 100', data: state.measurements.map(m => Math.round((m.steps || 0)/100)) }, { name: 'Activité (min)', data: state.measurements.map(m => m.activityMinutes || 0) }], xaxis: { categories: state.measurements.map(m => formatTinyDate(m.date)) }, plotOptions: { bar: { borderRadius: 5, columnWidth: '48%' } }, legend: { position: 'top' } });
    charts.habits.render();
    charts.recovery = new ApexCharts(document.getElementById('recoveryChart'), { ...common, chart: { ...common.chart, type: 'line', height: 265 }, series: [{ name: 'Énergie /10', data: state.measurements.map(m => m.energy) }, { name: 'Sommeil (h)', data: state.measurements.map(m => m.sleep) }], xaxis: { categories: state.measurements.map(m => formatTinyDate(m.date)) }, stroke: { curve: 'smooth', width: 3 }, markers: { size: 4 }, yaxis: { min: 0, max: 10 }, legend: { position: 'top' } });
    charts.recovery.render();
    renderSparklines();
    renderProgressSummary();
  }

  function renderSparklines() {
    const defs = [
      ['weightSpark', state.measurements.map(m => m.weight), '#206bc4'],
      ['waistSpark', state.measurements.map(m => m.waist), '#0ea5e9'],
      ['sleepSpark', state.measurements.map(m => m.sleep), '#7c3aed']
    ];
    defs.forEach(([id, data, color]) => {
      const el = document.getElementById(id); if (!el) return;
      charts[id] = new ApexCharts(el, { chart: { type: 'area', height: 30, sparkline: { enabled: true }, animations: { enabled: false } }, series: [{ data: data.filter(v => v != null) }], stroke: { curve: 'smooth', width: 2, colors: [color] }, fill: { opacity: .12, colors: [color] }, tooltip: { enabled: false } });
      charts[id].render();
    });
  }

  function renderProgressSummary() {
    const initial = state.measurements[0] || {};
    const latest = latestMeasurement();
    const rows = [
      ['ti-scale', 'bg-blue-lt text-blue', 'Poids', latest.weight != null ? `${formatNumber(latest.weight,1)} kg` : '—', initial.weight && latest.weight ? `${signed(latest.weight-initial.weight,1)} kg` : 'À compléter'],
      ['ti-ruler-measure', 'bg-cyan-lt text-cyan', 'Tour de taille', latest.waist != null ? `${formatNumber(latest.waist,1)} cm` : '—', initial.waist && latest.waist ? `${signed(latest.waist-initial.waist,1)} cm` : 'À compléter'],
      ['ti-walk', 'bg-green-lt text-green', 'Pas quotidiens', latest.steps ? latest.steps.toLocaleString('fr-FR') : '—', initial.steps && latest.steps ? `${signed(latest.steps-initial.steps,0)} pas` : 'À compléter'],
      ['ti-moon-stars', 'bg-indigo-lt text-indigo', 'Sommeil', latest.sleep ? formatSleep(latest.sleep) : '—', initial.sleep && latest.sleep ? `${signed((latest.sleep-initial.sleep)*60,0)} min` : 'À compléter']
    ];
    document.getElementById('progressSummary').innerHTML = rows.map(([icon, cls, label, value, delta]) => `<div class="summary-metric"><span class="avatar avatar-sm ${cls}"><i class="ti ${icon}" aria-hidden="true"></i></span><div><div class="summary-label">${label}</div><div class="summary-value">${value}</div></div><span class="summary-delta badge bg-secondary-lt">${delta}</span></div>`).join('');
  }

  function switchMainSeries(series) {
    document.querySelectorAll('[data-chart-series]').forEach(btn => btn.classList.toggle('active', btn.dataset.chartSeries === series));
    const data = state.measurements.map(m => [new Date(m.date).getTime(), series === 'waist' ? m.waist : m.weight]);
    const name = series === 'waist' ? 'Tour de taille (cm)' : 'Poids (kg)';
    charts.main?.updateOptions({ series: [{ name, data }], yaxis: { labels: { formatter: v => `${formatNumber(v,1)} ${series === 'waist' ? 'cm' : 'kg'}` } } });
  }

  async function submitCheckin() {
    const btn = document.getElementById('submitCheckinBtn');
    setLoading(btn, true);
    const textInput = document.getElementById('checkinText');
    const transcript = document.getElementById('voiceTranscript').textContent.trim();
    const textValue = [textInput.value.trim(), transcript].filter(Boolean).join(' ');
    const manual = { energy: nullableNumber(document.getElementById('quickEnergy').value), mood: nullableNumber(document.getElementById('quickMood').value), pain: nullableNumber(document.getElementById('quickPain').value) };
    const type = document.getElementById('quickType').value;
    const extracted = { ...parseHealthText(textValue), ...Object.fromEntries(Object.entries(manual).filter(([,v]) => v != null)) };
    const safety = detectSafety(textValue, extracted);
    if (!textValue && pendingPhotos.length === 0 && Object.values(manual).every(v => v == null)) {
      setLoading(btn, false); showToast('Check-in vide', 'Ajoute un texte, une dictée, une photo ou un ressenti.', 'warning'); return;
    }
    if (safety.level === 'red') {
      setLoading(btn, false); showToast('Priorité à la sécurité', safety.message, 'danger'); return;
    }
    let agentResult = null;
    try { if (state.settings.agentEndpoint) agentResult = await callAgent({ text: textValue, type, photos: pendingPhotos }, extracted); }
    catch { showToast('Agent distant indisponible', 'Le coach local prend le relais pour ce check-in.', 'warning'); }
    if (!agentResult) agentResult = localAgent(extracted, textValue, type, safety);
    applyAgentResult(agentResult, { text: textValue, type, photos: pendingPhotos, extracted });
    saveState(); renderAll(); setLoading(btn, false);
    bootstrap.Modal.getInstance(document.getElementById('checkinModal'))?.hide();
    celebrate(agentResult.coach?.xp_awarded || 10);
    showToast(agentResult.coach?.headline || 'Check-in enregistré', agentResult.coach?.message || 'Le tableau de bord est à jour.', 'success');
  }

  function parseHealthText(raw) {
    const textValue = normalizeText(raw);
    const read = patterns => {
      for (const pattern of patterns) {
        const match = textValue.match(pattern);
        if (match) return parseFloat(match[1].replace(/\s/g, '').replace(',', '.'));
      }
      return null;
    };
    let sleep = read([/(?:sommeil|dormi|nuit)\s*(?:de|:|=)?\s*(\d{1,2}(?:[.,]\d+)?)(?:\s*h|\s*heures?)/i, /(\d{1,2})\s*h\s*(\d{1,2})/i]);
    const hm = textValue.match(/(\d{1,2})\s*h\s*(\d{1,2})/i);
    if (hm) sleep = Number(hm[1]) + Number(hm[2]) / 60;
    return {
      weight: read([/(?:poids|pese|pesée)\s*(?:de|:|=)?\s*(\d{2,3}(?:[.,]\d+)?)/i, /(\d{2,3}(?:[.,]\d+)?)\s*kg\b/i]),
      waist: read([/(?:tour\s*de\s*taille|taille)\s*(?:de|:|=)?\s*(\d{2,3}(?:[.,]\d+)?)/i]),
      steps: read([/(\d{1,2}(?:\s?\d{3})|\d{3,5})\s*(?:pas|steps)\b/i, /(?:pas|steps)\s*(?:de|:|=)?\s*(\d{1,2}(?:\s?\d{3})|\d{3,5})/i]),
      sleep,
      energy: read([/(?:energie|forme)\s*(?:de|:|=)?\s*(\d{1,2})(?:\s*\/\s*10)?/i]),
      mood: read([/(?:humeur|moral)\s*(?:de|:|=)?\s*(\d{1,2})(?:\s*\/\s*10)?/i]),
      pain: read([/(?:douleur|douleurs)\s*(?:de|:|=)?\s*(\d{1,2})(?:\s*\/\s*10)?/i]),
      workout: /(?:seance|renforcement|musculation|entrainement)\s*(?:faite|fait|realisee|terminee|complete)?/i.test(textValue)
    };
  }

  function detectSafety(raw, extracted = {}) {
    const textValue = normalizeText(raw);
    const redFlags = [
      /douleur\s+(?:dans\s+la\s+)?poitrine/, /oppression\s+(?:thoracique|poitrine)/, /malaise/, /perte\s+de\s+connaissance/,
      /essoufflement\s+(?:inhabituel|brutal|au\s+repos)/, /palpitations?.*(?:vertige|malaise)/, /vertiges?.*(?:effort|palpitations?)/
    ];
    if (redFlags.some(r => r.test(textValue))) return { level: 'red', message: "Arrête l'effort et demande rapidement un avis médical adapté. En cas de détresse ou d'urgence, appelle les secours." };
    if ((extracted.pain ?? 0) >= 7) return { level: 'orange', message: 'Douleur élevée détectée : privilégie la récupération et demande un avis si elle persiste ou s’aggrave.' };
    return { level: 'green', message: '' };
  }

  function evaluateSafety() {
    const extracted = parseHealthText(document.getElementById('checkinText').value);
    const result = detectSafety(document.getElementById('checkinText').value, extracted);
    const alert = document.getElementById('safetyAlert');
    alert.classList.toggle('d-none', result.level !== 'red');
    if (result.message) text('safetyAlertText', result.message);
  }

  async function callAgent(input, extracted) {
    const payload = {
      event: 'health_checkin.created', version: '1.0', occurred_at: new Date().toISOString(),
      input: { text: input.text, type: input.type, photos: input.photos.map(p => ({ id: p.id, mime_type: p.type, data_url: p.dataUrl })) },
      current_state: { profile: state.profile, targets: state.targets, latest_measurement: latestMeasurement(), gamification: state.gamification, extracted_client_side: extracted }
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(state.settings.agentEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`Agent HTTP ${response.status}`);
    return validateAgentResponse(await response.json());
  }

  function validateAgentResponse(value) {
    if (!value || typeof value !== 'object') throw new Error('Réponse agent invalide');
    const safe = value.safety || { level: 'green', message: '' };
    if (!['green','orange','red'].includes(safe.level)) safe.level = 'orange';
    return { extracted: value.extracted || {}, patch: value.patch || {}, coach: value.coach || {}, safety: safe };
  }

  function localAgent(extracted, textValue, type, safety) {
    const completeness = ['weight','waist','steps','sleep','energy','mood','pain'].filter(k => extracted[k] != null).length;
    const xp = 10 + Math.min(20, completeness * 3) + (extracted.workout ? 15 : 0);
    let headline = 'Check-in enregistré';
    let message = 'Une donnée de plus rend tes prochaines décisions plus fiables.';
    if ((extracted.energy ?? 6) <= 4 || (extracted.sleep ?? 7) < 6) {
      headline = 'Aujourd’hui, protéger vaut progresser';
      message = 'Réduis l’intensité, garde une courte marche ou mobilité et avance l’heure de coucher.';
    } else if (extracted.workout) {
      headline = 'Séance validée, chaîne renforcée';
      message = 'La performance du jour compte moins que la répétition sur plusieurs semaines.';
    } else if ((extracted.steps ?? 0) >= state.targets.steps) {
      headline = 'Objectif de mouvement atteint';
      message = 'Tu as sécurisé le comportement prioritaire. Inutile d’en faire davantage pour “compenser”.';
    }
    return { extracted, patch: {}, coach: { headline, message, tone: 'encouragement', xp_awarded: xp }, safety };
  }

  function applyAgentResult(result, context) {
    if (result.safety?.level === 'red') return;
    const extracted = { ...context.extracted, ...(result.extracted || {}) };
    const now = new Date().toISOString();
    const measurementKeys = ['weight','waist','steps','sleep','energy','mood','pain'];
    const hasMeasurement = measurementKeys.some(k => extracted[k] != null);
    if (hasMeasurement) {
      const latest = latestMeasurement();
      state.measurements.push({ date: now.slice(0,10), weight: extracted.weight ?? latest.weight ?? null, waist: extracted.waist ?? latest.waist ?? null, steps: extracted.steps ?? latest.steps ?? null, sleep: extracted.sleep ?? latest.sleep ?? null, energy: extracted.energy ?? latest.energy ?? null, mood: extracted.mood ?? latest.mood ?? null, pain: extracted.pain ?? latest.pain ?? null, activityMinutes: latest.activityMinutes ?? 0, strengthSessions: (latest.strengthSessions ?? 0) + (extracted.workout ? 1 : 0) });
    }
    const xp = Number(result.coach?.xp_awarded || 10);
    state.gamification.xp += xp;
    state.gamification.level = Math.max(1, Math.floor(state.gamification.xp / 200) + 1);
    state.gamification.streak = Math.min(365, state.gamification.streak + 1);
    if (context.photos.length) {
      context.photos.forEach(photo => state.photos.unshift({ id: photo.id, date: now, label: 'Check-in', dataUrl: photo.dataUrl }));
      state.photos = state.photos.slice(0, PHOTO_LIMIT);
      unlockBadge('Repère visuel');
    }
    state.checkins.unshift({ id: uid(), date: now, type: context.type === 'measurement' || hasMeasurement ? 'measurement' : 'checkin', title: context.type === 'workout' || extracted.workout ? 'Séance et ressenti' : hasMeasurement ? 'Mesure et check-in' : 'Check-in', text: context.text || (context.photos.length ? 'Photo de progression ajoutée.' : 'Ressenti rapide.'), ...extracted, xp });
    state.coach = { headline: result.coach?.headline || 'Tableau mis à jour', message: result.coach?.message || 'Continue avec une prochaine action simple.', tone: result.coach?.tone || 'encouragement' };
    if (result.patch?.challenge) state.challenge = { ...state.challenge, ...result.patch.challenge };
    if (result.patch?.targets) state.targets = { ...state.targets, ...result.patch.targets };
    state.agentDecisions.unshift({ date: now, type: result.safety?.level === 'orange' ? 'recovery' : 'encouragement', title: state.coach.headline, text: state.coach.message });
    state.weekDays[(new Date().getDay()+6)%7] = true;
    state.demoMode = false;
    unlockBadge('Premier check-in');
  }

  function toggleDailyAction(id) {
    const action = state.dailyActions.find(a => a.id === id); if (!action) return;
    action.done = !action.done;
    if (action.done) {
      state.gamification.xp += action.xp;
      state.gamification.level = Math.floor(state.gamification.xp / 200) + 1;
      celebrate(action.xp, 12);
      showToast('Action validée', `+${action.xp} XP · La chaîne continue.`, 'success');
    } else state.gamification.xp = Math.max(0, state.gamification.xp - action.xp);
    saveState(); renderDailyActions(); renderMetrics();
  }

  function incrementContract(id) {
    const item = state.weeklyContract.find(x => x.id === id); if (!item) return;
    item.done = item.done >= item.total ? 0 : item.done + 1;
    saveState(); renderWeeklyContract();
  }

  function generateChallenge() {
    const latest = latestMeasurement();
    const candidates = [
      { id:'steps-plus', title:'Le pas de plus', description:`Atteins ${state.targets.steps.toLocaleString('fr-FR')} pas 4 jours sur 7.`, progress:0, target:4, reward:100, metric:'steps' },
      { id:'sleep-anchor', title:'Ancrage sommeil', description:'Commence ta routine de coucher 30 minutes plus tôt pendant 4 soirs.', progress:0, target:4, reward:110, metric:'sleep' },
      { id:'strength-two', title:'Deux rendez-vous avec toi', description:`Réalise ${state.targets.strengthSessions} séances de renforcement adaptées cette semaine.`, progress:0, target:state.targets.strengthSessions, reward:140, metric:'strength' },
      { id:'checkin-five', title:'La donnée bat l’intuition', description:'Effectue un check-in de 60 secondes pendant 5 jours.', progress:0, target:5, reward:90, metric:'checkin' }
    ];
    const preferred = (latest.sleep ?? 7) < state.targets.sleep ? candidates[1] : (latest.steps ?? 0) < state.targets.steps ? candidates[0] : candidates[Math.floor(Math.random()*candidates.length)];
    state.challenge = preferred;
    state.agentDecisions.unshift({ date:new Date().toISOString(), type:'challenge', title:'Nouveau challenge', text:preferred.description });
    saveState(); renderChallenge(); renderAgent(); showToast('Challenge adapté', preferred.title, 'info');
  }

  function adaptToday() {
    const latest = latestMeasurement();
    const low = (latest.energy ?? 7) <= 4 || (latest.sleep ?? 7) < 6 || (latest.pain ?? 0) >= 4;
    if (low) activateLowEnergyMode();
    else {
      state.dailyActions = [
        { id:'walk', title:'25 min de marche active', note:'Allure où tu peux encore parler', done:false, xp:15 },
        { id:'strength', title:'Séance courte de renforcement', note:'25–35 min, technique avant intensité', done:false, xp:25 },
        { id:'meal', title:'Préparer le prochain repas', note:'Décider avant d’avoir faim', done:false, xp:10 }
      ];
      state.coach = { headline:'Journée ajustée à ton niveau actuel', message:'Tu as de l’énergie disponible : investis-la dans une séance courte et propre, sans chercher l’épuisement.', tone:'encouragement' };
      saveState(); renderHeader(); renderDailyActions(); showToast('Plan du jour ajusté', 'Trois actions adaptées à ton énergie.', 'success');
    }
  }

  function activateLowEnergyMode() {
    state.dailyActions = [
      { id:'walk-soft', title:'10 min de marche douce', note:'Ou mobilité si la marche est inconfortable', done:false, xp:10 },
      { id:'meal-simple', title:'Un repas simple et structuré', note:'Pas de compensation, pas de restriction punitive', done:false, xp:10 },
      { id:'sleep-early', title:'Coucher avancé de 30 min', note:'La récupération est la mission du jour', done:false, xp:15 }
    ];
    state.coach = { headline:'Mode énergie basse activé', message:'Aujourd’hui, le succès consiste à préserver la chaîne avec une version minimale et à récupérer.', tone:'recovery' };
    state.agentDecisions.unshift({ date:new Date().toISOString(), type:'recovery', title:'Charge réduite', text:'Le plan a été remplacé par une version minimale protectrice.' });
    saveState(); renderHeader(); renderDailyActions(); renderAgent(); showToast('Mode récupération', 'Le minimum utile remplace la performance.', 'info');
  }

  function openOnboarding() { bootstrap.Modal.getOrCreateInstance(document.getElementById('onboardingModal')).show(); }

  function saveBaseline() {
    const baseline = {
      date: new Date().toISOString().slice(0,10),
      weight: nullableNumber(document.getElementById('baselineWeight').value),
      waist: nullableNumber(document.getElementById('baselineWaist').value),
      steps: nullableNumber(document.getElementById('baselineSteps').value),
      sleep: nullableNumber(document.getElementById('baselineSleep').value),
      energy: nullableNumber(document.getElementById('baselineEnergy').value),
      mood: null,
      pain: nullableNumber(document.getElementById('baselinePain').value),
      activityMinutes: 0,
      strengthSessions: 0
    };
    const why = document.getElementById('baselineWhy').value.trim();
    state = structuredClone(DEFAULT_STATE);
    state.demoMode = false;
    state.profile.startDate = new Date().toISOString().slice(0,10);
    if (why) state.profile.why = why;
    state.measurements = Object.values(baseline).some((v,i) => i > 0 && v != null) ? [baseline] : [];
    state.checkins = [{ id:uid(), date:new Date().toISOString(), type:'reward', title:'Parcours démarré', text:'Le bilan T0 a été créé. Les données manquantes seront ajoutées progressivement.', xp:50 }];
    state.photos = [];
    state.dailyActions = [
      { id:'baseline-walk', title:'Observer mes pas sans me juger', note:'Créer une ligne de base sur 7 jours', done:false, xp:10 },
      { id:'baseline-meal', title:'Photographier ou noter un repas', note:'Comprendre avant de modifier', done:false, xp:10 },
      { id:'baseline-sleep', title:'Noter mon heure de coucher', note:'Mesurer la récupération réelle', done:false, xp:10 }
    ];
    state.weekDays = [false,false,false,false,false,false,false];
    state.gamification = { xp:50, level:1, streak:1, badges:['Bilan T0'] };
    state.challenge = { id:'baseline-7', title:'7 jours de vérité utile', description:'Réalise un check-in court pendant 5 des 7 prochains jours.', progress:0, target:5, reward:100, metric:'checkin' };
    state.coach = { headline:'Le point de départ est créé', message:'Pendant 14 jours, observe et mesure. La précision est plus importante que la perfection.', tone:'encouragement' };
    state.agentDecisions = [{ date:new Date().toISOString(), type:'encouragement', title:'Phase d’observation ouverte', text:'Aucun objectif agressif : construire d’abord un bilan fiable.' }];
    saveState(); renderAll();
    bootstrap.Modal.getInstance(document.getElementById('onboardingModal'))?.hide();
    showToast('Parcours démarré', 'Ton bilan T0 est prêt. Première étape : observer 14 jours.', 'success');
    celebrate(50, 28);
  }

  function hydrateSettings() {
    value('agentEndpoint', state.settings.agentEndpoint || '');
    value('weekStart', state.profile.startDate || '');
    value('stepTarget', state.targets.steps || '');
    value('sleepTarget', state.targets.sleep || '');
    value('sessionsTarget', state.targets.strengthSessions || '');
    document.getElementById('privacyBannerToggle').checked = Boolean(state.settings.showPrivacyBanner);
  }

  function saveSettings() {
    const endpoint = document.getElementById('agentEndpoint').value.trim();
    if (endpoint && !/^https:\/\//i.test(endpoint)) { showToast('URL refusée', 'Utilise une URL HTTPS.', 'danger'); return; }
    state.settings.agentEndpoint = endpoint;
    state.settings.showPrivacyBanner = document.getElementById('privacyBannerToggle').checked;
    state.profile.startDate = document.getElementById('weekStart').value || state.profile.startDate;
    state.targets.steps = nullableNumber(document.getElementById('stepTarget').value) || state.targets.steps;
    state.targets.sleep = nullableNumber(document.getElementById('sleepTarget').value) || state.targets.sleep;
    state.targets.strengthSessions = nullableNumber(document.getElementById('sessionsTarget').value) ?? state.targets.strengthSessions;
    saveState(); renderAll(); bootstrap.Modal.getInstance(document.getElementById('settingsModal'))?.hide(); showToast('Réglages enregistrés', endpoint ? 'L’agent externe est configuré.' : 'Le coach local reste actif.', 'success');
  }

  async function testEndpoint() {
    const endpoint = document.getElementById('agentEndpoint').value.trim();
    if (!endpoint) { showToast('Aucun endpoint', 'Le coach local est opérationnel sans configuration.', 'info'); return; }
    if (!/^https:\/\//i.test(endpoint)) { showToast('URL refusée', 'Utilise une URL HTTPS.', 'danger'); return; }
    const btn = document.getElementById('testEndpointBtn'); setLoading(btn, true);
    try {
      const response = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ event:'health_agent.ping', version:'1.0', occurred_at:new Date().toISOString() }) });
      if (!response.ok) throw new Error();
      showToast('Connexion réussie', 'L’endpoint a répondu.', 'success');
    } catch { showToast('Connexion impossible', 'Vérifie l’URL, CORS et le déploiement de la fonction.', 'danger'); }
    finally { setLoading(btn, false); }
  }

  function hydrateGoalForm() {
    value('goalTitleInput', state.goal.title);
    value('goalWhyInput', state.profile.why);
    value('goalWaistInput', state.goal.waistReduction ?? '');
    value('goalActivityInput', state.goal.activityMinutes);
    value('goalAdherenceInput', state.goal.adherence);
    value('goalEnergyInput', state.goal.energy);
  }

  function saveGoal() {
    state.goal.title = document.getElementById('goalTitleInput').value.trim() || state.goal.title;
    state.profile.why = document.getElementById('goalWhyInput').value.trim() || state.profile.why;
    state.goal.waistReduction = nullableNumber(document.getElementById('goalWaistInput').value);
    state.goal.activityMinutes = nullableNumber(document.getElementById('goalActivityInput').value) || state.goal.activityMinutes;
    state.goal.adherence = nullableNumber(document.getElementById('goalAdherenceInput').value) || state.goal.adherence;
    state.goal.energy = nullableNumber(document.getElementById('goalEnergyInput').value) || state.goal.energy;
    saveState(); renderGoal(); bootstrap.Modal.getInstance(document.getElementById('goalModal'))?.hide(); showToast('Objectif mis à jour', 'Les jalons restent modifiables avec ton futur bilan.', 'success');
  }

  function toggleVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { showToast('Dictée non disponible', 'Utilise le clavier ou la dictée native de ton téléphone.', 'warning'); return; }
    if (listening && recognition) { recognition.stop(); return; }
    recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR'; recognition.interimResults = true; recognition.continuous = false;
    recognition.onstart = () => { listening = true; document.getElementById('voiceBtn').classList.add('recording'); text('voiceStatus','Je t’écoute…'); };
    recognition.onresult = event => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join(' ');
      const box = document.getElementById('voiceTranscript'); box.textContent = transcript; box.classList.remove('d-none');
      if (event.results[event.results.length-1].isFinal) document.getElementById('checkinText').value = [document.getElementById('checkinText').value, transcript].filter(Boolean).join(' ');
    };
    recognition.onerror = () => showToast('Dictée interrompue', 'Tu peux réessayer ou saisir le texte.', 'warning');
    recognition.onend = () => { listening = false; document.getElementById('voiceBtn').classList.remove('recording'); text('voiceStatus','Dictée terminée'); evaluateSafety(); };
    recognition.start();
  }

  async function handlePhotos(event) {
    const files = Array.from(event.target.files || []).slice(0, PHOTO_LIMIT - pendingPhotos.length);
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      try { pendingPhotos.push(await compressImage(file)); }
      catch { showToast('Photo non lisible', file.name, 'warning'); }
    }
    renderPendingPhotos();
    event.target.value = '';
  }

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const max = 900; const ratio = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas'); canvas.width = Math.round(img.width*ratio); canvas.height = Math.round(img.height*ratio);
          canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
          resolve({ id:uid(), name:file.name, type:'image/jpeg', dataUrl:canvas.toDataURL('image/jpeg',.72) });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function renderPendingPhotos() {
    document.getElementById('photoPreviewGrid').innerHTML = pendingPhotos.map((p,i) => `<div class="photo-preview"><img src="${escapeAttr(p.dataUrl)}" alt="Aperçu ${i+1}"><button type="button" data-remove-photo="${i}" aria-label="Retirer la photo"><i class="ti ti-x" aria-hidden="true"></i></button></div>`).join('');
  }
  function removePendingPhoto(index) { pendingPhotos.splice(index,1); renderPendingPhotos(); }
  function openPhotoTab() { document.querySelector('[data-bs-target="#checkinPhotoPane"]')?.click(); }

  function insertPrompt(prompt) {
    const field = document.getElementById('checkinText');
    const joiner = field.value && !field.value.endsWith(' ') ? ' ' : '';
    field.value += joiner + prompt;
    field.focus(); field.setSelectionRange(field.value.length, field.value.length);
  }

  function resetCheckinForm() {
    document.getElementById('checkinText').value = '';
    document.getElementById('voiceTranscript').textContent = '';
    document.getElementById('voiceTranscript').classList.add('d-none');
    ['quickEnergy','quickMood','quickPain'].forEach(id => value(id,''));
    value('quickType','daily'); pendingPhotos = []; renderPendingPhotos();
    document.getElementById('safetyAlert').classList.add('d-none');
    if (listening && recognition) recognition.stop();
  }

  function showContract() {
    document.getElementById('contractCode').textContent = JSON.stringify(CONTRACT, null, 2);
    bootstrap.Modal.getOrCreateInstance(document.getElementById('contractModal')).show();
  }
  async function copyContract() {
    try { await navigator.clipboard.writeText(JSON.stringify(CONTRACT,null,2)); showToast('Contrat copié', 'Prêt à être transmis à ton agent.', 'success'); }
    catch { showToast('Copie impossible', 'Sélectionne manuellement le contenu.', 'warning'); }
  }

  function exportData() {
    const copy = structuredClone(state);
    copy.exportedAt = new Date().toISOString();
    const blob = new Blob([JSON.stringify(copy,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`laurent-360-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
    showToast('Sauvegarde créée', 'Conserve ce fichier dans un espace privé.', 'success');
  }

  function importData(event) {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { const imported = JSON.parse(reader.result); if (!imported.profile || !imported.version) throw new Error(); state = migrateState(imported); saveState(); renderAll(); showToast('Données importées', 'Le tableau a été restauré.', 'success'); }
      catch { showToast('Fichier invalide', 'Utilise un export Laurent 360.', 'danger'); }
    };
    reader.readAsText(file); event.target.value='';
  }

  function unlockBadge(name) { if (!state.gamification.badges.includes(name)) state.gamification.badges.push(name); }

  function computeMomentum() {
    const actions = state.dailyActions.length ? state.dailyActions.filter(a=>a.done).length/state.dailyActions.length : 0;
    const contract = state.weeklyContract.length ? state.weeklyContract.reduce((sum,x)=>sum+Math.min(1,x.done/x.total),0)/state.weeklyContract.length : 0;
    const latest = latestMeasurement();
    const recovery = Math.min(1, ((latest.sleep || state.targets.sleep) / state.targets.sleep + (latest.energy || 7)/7)/2);
    return Math.round(Math.max(5, Math.min(100, (actions*.4 + contract*.4 + recovery*.2)*100)));
  }

  function getProgramWeek() {
    const start = new Date(state.profile.startDate || new Date());
    const diff = Math.max(0, Date.now() - start.getTime());
    return Math.min(state.profile.goalWeeks, Math.max(1, Math.floor(diff / 604800000) + 1));
  }

  function getPhase(week) {
    if (week <= 2) return { label:'Phase 1 · Bilan T0', focus:'Observer et mesurer sans chercher la perfection.' };
    if (week <= 6) return { label:'Phase 2 · Fondations', focus:'Rendre les comportements faciles et répétables.' };
    if (week <= 12) return { label:'Phase 3 · Progression', focus:'Faire monter l’activité, la force et la récupération.' };
    if (week <= 20) return { label:'Phase 4 · Optimisation', focus:'Ajuster un levier à la fois selon les tendances.' };
    if (week <= 24) return { label:'Phase 5 · Consolidation', focus:'Prouver que le système fonctionne en autonomie.' };
    return { label:'Phase 6 · Stabilisation', focus:'Maintenir les résultats et savoir reprendre vite.' };
  }

  function latestMeasurement() { return state.measurements.length ? state.measurements[state.measurements.length-1] : {}; }
  function loadState() { try { const raw=localStorage.getItem(STORAGE_KEY); return raw ? migrateState(JSON.parse(raw)) : structuredClone(DEFAULT_STATE); } catch { return structuredClone(DEFAULT_STATE); } }
  function migrateState(input) { return { ...structuredClone(DEFAULT_STATE), ...input, profile:{...DEFAULT_STATE.profile,...input.profile}, goal:{...DEFAULT_STATE.goal,...input.goal}, targets:{...DEFAULT_STATE.targets,...input.targets}, gamification:{...DEFAULT_STATE.gamification,...input.gamification}, settings:{...DEFAULT_STATE.settings,...input.settings} }; }
  function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { showToast('Stockage presque plein', 'Exporte tes données et retire quelques photos.', 'warning'); } }

  function showToast(title, body, type='info') {
    const colors = { success:'green', warning:'yellow', danger:'red', info:'blue' };
    const icon = { success:'ti-check', warning:'ti-alert-triangle', danger:'ti-alert-circle', info:'ti-info-circle' }[type];
    const el = document.createElement('div');
    el.className='toast'; el.setAttribute('role','status');
    el.innerHTML=`<div class="toast-header"><span class="avatar avatar-xs bg-${colors[type]}-lt text-${colors[type]} me-2"><i class="ti ${icon}" aria-hidden="true"></i></span><strong class="me-auto">${escapeHtml(title)}</strong><button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Fermer"></button></div><div class="toast-body">${escapeHtml(body)}</div>`;
    document.getElementById('toastContainer').appendChild(el);
    const toast = bootstrap.Toast.getOrCreateInstance(el,{delay:4500}); toast.show(); el.addEventListener('hidden.bs.toast',()=>el.remove());
  }

  function celebrate(xp=10, amount=20) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layer=document.getElementById('celebrationLayer'); const colors=['#206bc4','#7c3aed','#2fb344','#f59f00','#e83e8c'];
    for(let i=0;i<amount;i++){
      const piece=document.createElement('span'); piece.className='confetti'; piece.style.left=`${Math.random()*100}%`; piece.style.background=colors[i%colors.length]; piece.style.animationDelay=`${Math.random()*.35}s`; piece.style.transform=`rotate(${Math.random()*180}deg)`; layer.appendChild(piece); setTimeout(()=>piece.remove(),2400);
    }
  }

  function setLoading(btn, loading) {
    btn.disabled=loading;
    btn.querySelector?.('.btn-text')?.classList.toggle('d-none',loading);
    btn.querySelector?.('.btn-loading')?.classList.toggle('d-none',!loading);
    if(!btn.querySelector?.('.btn-text')) btn.classList.toggle('disabled',loading);
  }
  function setMetric(id, val, formatter, fallback) { text(id, val == null ? fallback : formatter(val)); }
  function text(id, value) { const el=document.getElementById(id); if(el) el.textContent=String(value ?? ''); }
  function value(id, val) { const el=document.getElementById(id); if(el) el.value=val ?? ''; }
  function nullableNumber(v) { if(v===''||v==null) return null; const n=Number(String(v).replace(',','.')); return Number.isFinite(n)?n:null; }
  function formatNumber(v,d=0){ return Number(v).toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d}); }
  function signed(v,d=0){ const n=Number(v); return `${n>0?'+':''}${formatNumber(n,d)}`; }
  function deltaLabel(initial,current,unit){ if(initial==null||current==null)return 'À compléter'; const delta=current-initial; const sign=delta>0?'+':''; return `${sign}${formatNumber(delta,1)} ${unit} depuis T0`; }
  function formatSleep(hours){ if(hours==null)return '—'; const h=Math.floor(hours); const m=Math.round((hours-h)*60); return `${h} h ${String(m).padStart(2,'0')}`; }
  function formatLongDate(date){ return new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(date).replace(/^./,c=>c.toUpperCase()); }
  function formatDateTime(date){ return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(date)); }
  function formatShortDate(date){ return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',year:'numeric'}).format(new Date(date)); }
  function formatTinyDate(date){ return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short'}).format(new Date(date)); }
  function daysAgo(n){ const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); }
  function daysAgoIso(n,h=12){ const d=new Date(); d.setDate(d.getDate()-n); d.setHours(h,0,0,0); return d.toISOString(); }
  function uid(){ return (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`); }
  function normalizeText(v){ return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim(); }
  function escapeHtml(v){ const map={"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}; return String(v??'').replace(/[&<>"']/g,c=>map[c]); }
  function escapeAttr(v){ return escapeHtml(v); }
  function eventConfig(type){ return { checkin:{label:'Check-in',icon:'ti-message-circle',avatar:'bg-blue-lt text-blue'}, measurement:{label:'Mesure',icon:'ti-ruler-measure',avatar:'bg-cyan-lt text-cyan'}, reward:{label:'Récompense',icon:'ti-award',avatar:'bg-purple-lt text-purple'} }[type] || {label:'Événement',icon:'ti-point',avatar:'bg-secondary-lt'}; }
  function registerServiceWorker(){ if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(()=>{}); }
})();
