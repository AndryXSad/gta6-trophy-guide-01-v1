// Leonida Ledger — the Platinum roadmap. One job: turn the five
// roadmap stages into readable HTML, plus the missable warning box.
// Stage numbers come from each trophy's roadmap_stage in the data.

const STAGES = [
  {
    stage: 1,
    title: 'Play the story — Chapters 1–4 and the finale',
    text: 'The campaign unlocks almost everything else: the map, both protagonists, activities and side content. Play the missions in order and the 12 chapter and mission trophies plus the gold for the final mission land on their own.',
    items: [
      ['12 story trophies', 'Gone Fishing through Operation Savage Glory, one per chapter and one per named mission.'],
      ['You Gotta Know When to Get Off (gold)', 'Finish the final mission. Save manually before it — there is no mission replay.'],
      ['Meet the strangers', 'Say hello to every question-mark character you pass; their strands are stage 2.'],
    ],
  },
  {
    stage: 2,
    title: 'Side content — strangers, crime and odd jobs',
    text: 'With the story done (or well underway), clear the stranger strands and the criminal side trophies. These are the most forgettable trophies in the list, so do them deliberately rather than hoping they happen.',
    items: [
      ['Strangers & Freaks (silver)', 'Finish 8 stranger strands, including Andy, Kenton, Billy, Randy and Tyrone.'],
      ['Maximum Withdrawal (silver)', 'Rob 5 bank vaults and escape after each one.'],
      ['Pest Control', 'Rob one illegal operation for each of the 9 gangs.'],
      ['Partner trophies', 'Hot Together and Retail Therapy both need your partner beside you.'],
    ],
  },
  {
    stage: 3,
    title: 'Activities — the long grinds you can start early',
    text: 'Activities are the bulk of the playtime. Start them during the story so the counters build up on their own, then finish the stubborn ones afterwards.',
    items: [
      ['The Shootist (silver)', 'Gold medals in all 42 Shooting Range challenges — the hardest skill trophy.'],
      ['Cunning Stunts (silver)', '250 stunts; drive aggressively and the count climbs.'],
      ['Top Fun, races, fishing, bowling', '14 drone-race wins, 20 race wins, beat Cal at fishing, one arcade game, one bowling game.'],
      ['Positive Mental Attitude', 'Meditate at all 18 spots — see the missable warning below. Do the Chapter 1 spot early.'],
    ],
  },
  {
    stage: 4,
    title: 'Collectibles and money — the completionist sweep',
    text: 'One long road trip across Leonida covers three trophies at once: explore every area, WAiNK It at the scenic spots, and pick up cards as you go.',
    items: [
      ['The Goodtime State', 'Visit all 52 areas of Leonida.'],
      ['You WAiNKer! (silver)', 'WAiNK It at 100 locations.'],
      ["Don't Touch My Deck (silver)", 'Complete 3 collectible card sets.'],
      ['Whip It Good, Little Boxes, On the Spot', 'Discover 100 vehicles, buy all 8 garages, register 10 vehicles in the Scooter Bros app.'],
      ['Money trophies', 'Launder $250,000 of Marked Bills and spend $100,000 across all shops.'],
    ],
  },
  {
    stage: 5,
    title: 'Cleanup — 100% and the Platinum',
    text: 'Open the completion checklist (Progress, then Stats, then 100% Completion) and clear whatever is left. Nothing on it is missable, and progress from earlier in the game already counts.',
    items: [
      ['A Long Road (gold)', 'Reach 100% Completion — the last big gate.'],
      ['Vice Got a Price! (platinum)', 'Pops automatically with the 54th other trophy. About 200 hours in total.'],
    ],
  },
];

export function renderRoadmap(trophies, earned, mount) {
  const sections = STAGES.map((s) => {
    const done = trophies.filter((t) => t.roadmap_stage === s.stage && earned.has(t.id)).length;
    const total = trophies.filter((t) => t.roadmap_stage === s.stage).length;
    const list = s.items.map(([b, rest]) => `<li><b>${b}</b> — ${rest}</li>`).join('');
    return `<section class="stage"><h3><span class="step-no">${s.stage}</span>${s.title}</h3><p>${s.text}</p><ul>${list}</ul><p class="result-count">Stage progress: ${done} / ${total} trophies</p></section>`;
  }).join('');

  const missable = trophies.filter((t) => t.missable);
  const warn = missable.length
    ? `<section class="missable-box"><h3>Missable warning — read this first</h3>${missable.map((t) => `<p><b>${t.name}.</b> ${t.miss_note}</p>`).join('')}<p>Reported guides note GTA VI has no mission replay, so keep a manual save at the start of every chapter and one before the final mission. Every other trophy in the official list can be earned in free roam after the story.</p></section>`
    : '';

  mount.innerHTML = warn + sections;
}
