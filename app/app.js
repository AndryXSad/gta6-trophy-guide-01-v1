// Leonida Ledger — the page itself. This file fetches the trophy data,
// reads the deep links (?filter=, ?trophy=, ?spoiler=, ?demo=), builds
// the checklist from the filters, and opens the detail card for one
// trophy at a time. The earned set lives in tracker.js, the filtering
// in filters.js, the roadmap in roadmap.js — this file only joins them.

import { readEarnedIds, persistEarnedIds, downloadLedger, readLedgerFile } from './tracker.js';
import { GROUP_PILLS, selectTrophies, tallyByGrade } from './filters.js';
import { paintRoadmap } from './roadmap.js';

const query = new URLSearchParams(location.search);
const { trophies } = await (await fetch('./data/trophies.json')).json();

// The earned set. With ?demo=1 the page shows a fixed sample — twelve
// earned, kept only in memory — so screenshots are deterministic and
// nothing is written over the player's real progress.
let earned = readEarnedIds();
const demoMode = query.get('demo') === '1';
if (demoMode) {
  earned = new Set([2, 3, 8, 15, 16, 21, 28, 35, 42, 44, 46, 53]);
}

const $ = (id) => document.getElementById(id);
const listNode = $('ledger-list');
const countNode = $('match-count');
const queryNode = $('query');
const gradeNode = $('grade-pick');
const stateNode = $('state-pick');
const spoilerNode = $('spoiler-box');
const pillsNode = $('kind-row');
const layerNode = $('detail-layer');
const cardNode = $('detail-card');

function remember() {
  if (!demoMode) persistEarnedIds(earned);
}

// Which pill starts active: the ?filter= link wins, anything unknown
// falls back to showing everything.
let group = 'all';
const wanted = query.get('filter');
if (wanted && GROUP_PILLS.some(([value]) => value === wanted)) group = wanted;
if (query.get('spoiler') === 'off') spoilerNode.checked = false;
if (query.get('spoiler') === 'on') spoilerNode.checked = true;
const gradeLink = query.get('grade');
if (gradeLink && ['platinum', 'gold', 'silver', 'bronze'].includes(gradeLink)) {
  gradeNode.value = gradeLink;
}

for (const [value, label] of GROUP_PILLS) {
  const pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'chip-btn';
  pill.textContent = label;
  pill.setAttribute('aria-pressed', String(value === group));
  pill.addEventListener('click', () => {
    group = value;
    pillsNode
      .querySelectorAll('.chip-btn')
      .forEach((other) => other.setAttribute('aria-pressed', 'false'));
    pill.setAttribute('aria-pressed', 'true');
    paint();
  });
  pillsNode.append(pill);
}

const concealed = (trophy) =>
  spoilerNode.checked && trophy.group === 'story' && !earned.has(trophy.id);

const gradeWord = (grade) => grade.charAt(0).toUpperCase() + grade.slice(1);

function paintHeader() {
  const total = trophies.length;
  const pct = Math.round((earned.size / total) * 100);
  $('progress-label').textContent = `${earned.size} / ${total} earned`;
  $('progress-pct').textContent = `${pct}% to Platinum`;
  $('progress-meter').style.width = `${pct}%`;
  document.querySelector('.meter').setAttribute('aria-valuenow', String(earned.size));

  const tally = tallyByGrade(trophies, earned);
  $('grade-summary').innerHTML = ['platinum', 'gold', 'silver', 'bronze']
    .map(
      (grade) =>
        `<span class="grade-chip ${grade}"><b>${tally[grade].earned}/${tally[grade].total}</b> ${gradeWord(grade)}</span>`,
    )
    .join('');
}

function makeRow(trophy) {
  const row = document.createElement('li');
  row.className = 'entry' + (earned.has(trophy.id) ? ' done' : '');
  const isHidden = concealed(trophy);

  const tick = document.createElement('input');
  tick.type = 'checkbox';
  tick.checked = earned.has(trophy.id);
  tick.setAttribute('aria-label', `Mark ${isHidden ? 'story trophy' : trophy.name} as earned`);
  tick.addEventListener('change', () => {
    if (tick.checked) earned.add(trophy.id);
    else earned.delete(trophy.id);
    remember();
    paint();
  });
  tick.addEventListener('click', (event) => event.stopPropagation());

  const middle = document.createElement('div');
  const heading = document.createElement('div');
  heading.className = 'entry-title';
  const dot = document.createElement('span');
  dot.className = `grade-dot ${trophy.grade}`;
  heading.append(dot);
  const titleText = document.createElement('span');
  titleText.textContent = isHidden
    ? 'Hidden story trophy — earn it to reveal'
    : trophy.name;
  if (isHidden) titleText.classList.add('blurred');
  heading.append(titleText);

  const blurb = document.createElement('div');
  blurb.className = 'entry-blurb';
  if (isHidden) {
    blurb.innerHTML =
      '<span class="spoiler-note">Hidden until earned (spoiler setting is on).</span>';
  } else {
    blurb.textContent = trophy.official;
  }

  const tags = document.createElement('div');
  tags.className = 'entry-tags';
  const chips = [];
  if (trophy.missable) chips.push(['missable', 'Potentially missable']);
  if (trophy.hidden) chips.push(['hidden-chip', 'Hidden trophy']);
  if (trophy.group === 'story') chips.push(['story-chip', 'Story']);
  const groupLabel =
    GROUP_PILLS.find(([value]) => value === trophy.group)?.[1] ??
    GROUP_PILLS.find(([value]) => value === 'collectibles' && trophy.group === 'collectible')?.[1] ??
    trophy.group;
  chips.push(['', groupLabel]);
  if (trophy.target) chips.push(['', `Target: ${trophy.target.toLocaleString('en-US')}`]);
  for (const [kind, label] of chips) {
    const chip = document.createElement('span');
    chip.className = `mini-tag ${kind}`.trim();
    chip.textContent = label;
    tags.append(chip);
  }

  middle.append(heading, blurb, tags);

  const side = document.createElement('div');
  side.className = 'entry-grade';
  side.innerHTML = `<b class="${trophy.grade}">${gradeWord(trophy.grade)}</b>#${trophy.id} of 55`;

  row.append(tick, middle, side);
  row.addEventListener('click', () => showDetail(trophy));
  return row;
}

function paint() {
  paintHeader();
  const shown = selectTrophies(
    trophies,
    {
      group,
      grade: gradeNode.value,
      state: stateNode.value,
      text: queryNode.value,
    },
    earned,
  );
  countNode.textContent = `Showing ${shown.length} of ${trophies.length} trophies${earned.size ? ` · ${earned.size} earned` : ''}.`;
  listNode.replaceChildren();
  if (!shown.length) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent =
      'No trophies match those filters. Try clearing the search or picking All.';
    listNode.append(empty);
  } else {
    for (const trophy of shown) listNode.append(makeRow(trophy));
  }
  paintRoadmap(trophies, earned, $('roadmap'));
}

function section(title, body) {
  const head = document.createElement('h4');
  head.textContent = title;
  const para = document.createElement('p');
  para.textContent = body;
  return [head, para];
}

function showDetail(trophy) {
  const isHidden = concealed(trophy);
  cardNode.innerHTML = '';
  const title = document.createElement('h2');
  title.id = 'detail-title';
  title.textContent = isHidden ? 'Hidden story trophy' : trophy.name;
  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = isHidden
    ? 'This story trophy stays hidden until you earn it (spoiler setting is on).'
    : trophy.official;

  const pieces = [title, desc];
  if (!isHidden) {
    const [guideHead, guideBody] = section('How to unlock it', trophy.guide);
    pieces.push(guideHead, guideBody);
    if (trophy.steps?.length) {
      const stepsHead = document.createElement('h4');
      stepsHead.textContent = 'Steps';
      const stepsList = document.createElement('ol');
      stepsList.className = 'detail-steps';
      for (const step of trophy.steps) {
        const item = document.createElement('li');
        item.textContent = step;
        stepsList.append(item);
      }
      pieces.push(stepsHead, stepsList);
    }
    const [hintHead, hintBody] = section('Worth knowing', trophy.hint);
    pieces.push(hintHead, hintBody);
    const [missHead, missBody] = section('Can it be missed?', trophy.miss_risk);
    pieces.push(missHead, missBody);
    const [srcHead, srcBody] = section(
      'Sources',
      `${trophy.sources.join(' · ')}. Guides are written in our own words from the official descriptions; where a step is not in the official description, the guide says so.`,
    );
    srcBody.className = 'sources';
    pieces.push(srcHead, srcBody);
  }

  const row = document.createElement('div');
  row.className = 'close-row';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'action-btn main-action';
  toggle.textContent = earned.has(trophy.id) ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => {
    if (earned.has(trophy.id)) earned.delete(trophy.id);
    else earned.add(trophy.id);
    remember();
    hideDetail();
    paint();
  });
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'action-btn';
  close.textContent = 'Close';
  close.addEventListener('click', hideDetail);
  row.append(toggle, close);
  pieces.push(row);

  cardNode.append(...pieces);
  layerNode.classList.add('open');
  title.setAttribute('tabindex', '-1');
  title.focus();
}

function hideDetail() {
  layerNode.classList.remove('open');
}

layerNode.addEventListener('click', (event) => {
  if (event.target === layerNode) hideDetail();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') hideDetail();
});

queryNode.addEventListener('input', paint);
gradeNode.addEventListener('change', paint);
stateNode.addEventListener('change', paint);
spoilerNode.addEventListener('change', paint);

$('export-action').addEventListener('click', () =>
  downloadLedger(earned, trophies.length),
);
$('import-pick').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    earned = await readLedgerFile(
      file,
      trophies.map((trophy) => trophy.id),
    );
    remember();
    paint();
  } catch {
    countNode.textContent =
      'That file is not a Leonida Ledger progress export. Nothing was changed.';
  }
  event.target.value = '';
});
$('reset-action').addEventListener('click', () => {
  if (!earned.size) return;
  if (
    confirm(
      'Clear all earned trophies? This cannot be undone (export first if you want a backup).',
    )
  ) {
    earned = new Set();
    remember();
    paint();
  }
});

paint();

// A deep link can open one trophy's detail card on load.
const linked = Number(query.get('trophy'));
if (Number.isInteger(linked)) {
  const target = trophies.find((trophy) => trophy.id === linked);
  if (target) showDetail(target);
}
