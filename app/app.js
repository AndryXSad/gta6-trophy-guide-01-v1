// Leonida Ledger — bootstrap and rendering. Loads the trophy data,
// wires the filters, the spoiler toggle, the detail modal and the
// deep links (?filter=, ?trophy=, ?spoiler=, ?demo=), then renders.

import { loadEarned, saveEarned, exportProgress, importProgress } from './tracker.js';
import { KIND_LABELS, applyFilters, gradeCounts } from './filters.js';
import { renderRoadmap } from './roadmap.js';

const params = new URLSearchParams(location.search);
const data = await (await fetch('./data/trophies.json')).json();
const trophies = data.trophies;

let earned = loadEarned();
const demo = params.get('demo') === '1';
if (demo) {
  // Sample progress for screenshots only: 12 earned, kept in memory.
  earned = new Set([2, 3, 8, 15, 16, 21, 28, 35, 42, 44, 46, 53]);
}

const listEl = document.getElementById('trophy-list');
const countEl = document.getElementById('result-count');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade-filter');
const statusEl = document.getElementById('status-filter');
const spoilerEl = document.getElementById('spoiler-toggle');
const pillsEl = document.getElementById('kind-pills');
const backdrop = document.getElementById('modal-backdrop');
const modal = document.getElementById('modal');

let kind = 'all';
const kindParam = params.get('filter');
if (kindParam && (KIND_LABELS[kindParam] || kindParam === 'collectibles')) {
  kind = kindParam === 'collectibles' ? 'collectible' : kindParam;
}
if (params.get('spoiler') === 'off') spoilerEl.checked = false;
if (params.get('spoiler') === 'on') spoilerEl.checked = true;
const gradeParam = params.get('grade');
if (gradeParam && ['platinum', 'gold', 'silver', 'bronze'].includes(gradeParam)) gradeEl.value = gradeParam;

const KIND_ORDER = ['all', 'story', 'missable', 'collectible', 'activity', 'crime', 'side'];
for (const k of KIND_ORDER) {
  const pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'pill';
  pill.textContent = KIND_LABELS[k];
  pill.setAttribute('aria-pressed', String(k === kind));
  pill.addEventListener('click', () => {
    kind = k;
    pillsEl.querySelectorAll('.pill').forEach((p) => p.setAttribute('aria-pressed', 'false'));
    pill.setAttribute('aria-pressed', 'true');
    render();
  });
  pillsEl.append(pill);
}

function spoilerHidden(t) {
  return spoilerEl.checked && t.kind === 'story' && !earned.has(t.id);
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function renderProgress() {
  const total = trophies.length;
  const pct = Math.round((earned.size / total) * 100);
  document.getElementById('progress-text').textContent = `${earned.size} / ${total} earned`;
  document.getElementById('progress-pct').textContent = `${pct}% to Platinum`;
  const fill = document.getElementById('progress-fill');
  fill.style.width = `${pct}%`;
  document.querySelector('.bar').setAttribute('aria-valuenow', String(earned.size));

  const counts = gradeCounts(trophies, earned);
  const order = ['platinum', 'gold', 'silver', 'bronze'];
  document.getElementById('grade-chips').innerHTML = order
    .map((g) => `<span class="chip ${g}"><b>${counts[g].earned}/${counts[g].total}</b> ${gradeLabel(g)}</span>`)
    .join('');
}

function trophyCard(t) {
  const li = document.createElement('li');
  li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '');
  const hidden = spoilerHidden(t);

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${hidden ? 'story trophy' : t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    if (!demo) saveEarned(earned);
    render();
  });
  box.addEventListener('click', (e) => e.stopPropagation());

  const body = document.createElement('div');
  const name = document.createElement('div');
  name.className = 'trophy-name';
  const dot = document.createElement('span');
  dot.className = `grade-dot ${t.grade}`;
  name.append(dot);
  const nameText = document.createElement('span');
  nameText.textContent = hidden ? 'Hidden story trophy — earn it to reveal' : t.name;
  if (hidden) nameText.classList.add('blurred');
  name.append(nameText);

  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  if (hidden) {
    desc.innerHTML = '<span class="spoiler-note">Hidden until earned (spoiler setting is on).</span>';
  } else {
    desc.textContent = t.description;
  }

  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  const tags = [];
  if (t.missable) tags.push(['missable', 'Potentially missable']);
  if (t.hidden) tags.push(['hidden-tag', 'Hidden trophy']);
  if (t.kind === 'story') tags.push(['story-tag', 'Story']);
  tags.push(['', KIND_LABELS[t.kind] || t.kind]);
  if (t.count) tags.push(['', `Target: ${t.count.toLocaleString('en-US')}`]);
  for (const [cls, label] of tags) {
    const s = document.createElement('span');
    s.className = `tag ${cls}`.trim();
    s.textContent = label;
    meta.append(s);
  }

  body.append(name, desc, meta);

  const grade = document.createElement('div');
  grade.className = 'trophy-grade';
  grade.innerHTML = `<b class="${t.grade}">${gradeLabel(t.grade)}</b>#${t.id} of 55`;

  li.append(box, body, grade);
  li.addEventListener('click', () => openModal(t));
  return li;
}

function render() {
  renderProgress();
  const shown = applyFilters(trophies, {
    kind,
    grade: gradeEl.value,
    status: statusEl.value,
    query: searchEl.value,
    earned,
  });
  countEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies${earned.size ? ` · ${earned.size} earned` : ''}.`;
  listEl.replaceChildren();
  if (!shown.length) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'No trophies match those filters. Try clearing the search or picking All.';
    listEl.append(empty);
  } else {
    for (const t of shown) listEl.append(trophyCard(t));
  }
  renderRoadmap(trophies, earned, document.getElementById('roadmap'));
}

function openModal(t) {
  const hidden = spoilerHidden(t);
  modal.innerHTML = '';
  const title = document.createElement('h2');
  title.id = 'modal-title';
  title.textContent = hidden ? 'Hidden story trophy' : t.name;
  const desc = document.createElement('p');
  desc.className = 'modal-desc';
  desc.textContent = hidden ? 'This story trophy stays hidden until you earn it (spoiler setting is on).' : t.description;

  const guideHead = document.createElement('h4');
  guideHead.textContent = 'How to unlock it';
  const guide = document.createElement('p');
  guide.textContent = t.guide;

  const missHead = document.createElement('h4');
  missHead.textContent = 'Can it be missed?';
  const miss = document.createElement('p');
  miss.textContent = t.miss_note;

  const srcHead = document.createElement('h4');
  srcHead.textContent = 'Sources';
  const src = document.createElement('p');
  src.className = 'sources';
  src.textContent = t.sources.join(' · ') + '. Guides are written in our own words from the official descriptions; where a step is not in the official description, the guide says so.';

  const row = document.createElement('div');
  row.className = 'close-row';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'btn primary';
  toggle.textContent = earned.has(t.id) ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id);
    else earned.add(t.id);
    if (!demo) saveEarned(earned);
    closeModal();
    render();
  });
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'btn';
  close.textContent = 'Close';
  close.addEventListener('click', closeModal);
  row.append(toggle, close);

  modal.append(title, desc, guideHead, guide, missHead, miss, srcHead, src, row);
  backdrop.classList.add('open');
  title.setAttribute('tabindex', '-1');
  title.focus();
}

function closeModal() {
  backdrop.classList.remove('open');
}

backdrop.addEventListener('click', (e) => {
  if (e.target === backdrop) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

searchEl.addEventListener('input', render);
gradeEl.addEventListener('change', render);
statusEl.addEventListener('change', render);
spoilerEl.addEventListener('change', render);

document.getElementById('export-btn').addEventListener('click', () => exportProgress(earned, trophies.length));
document.getElementById('import-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    earned = await importProgress(file, trophies.map((t) => t.id));
    if (!demo) saveEarned(earned);
    render();
  } catch {
    countEl.textContent = 'That file is not a Leonida Ledger progress export. Nothing was changed.';
  }
  e.target.value = '';
});
document.getElementById('reset-btn').addEventListener('click', () => {
  if (!earned.size) return;
  if (confirm('Clear all earned trophies? This cannot be undone (export first if you want a backup).')) {
    earned = new Set();
    if (!demo) saveEarned(earned);
    render();
  }
});

render();

// Deep link: open one trophy's detail panel on load.
const trophyParam = Number(params.get('trophy'));
if (Number.isInteger(trophyParam)) {
  const target = trophies.find((t) => t.id === trophyParam);
  if (target) openModal(target);
}
