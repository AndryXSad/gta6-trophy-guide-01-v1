// Leonida Ledger — the road to the Platinum. This module paints the
// five phases of the run in order, with the missable warning first so
// nobody walks past it. Phase numbers come from each trophy's `phase`
// in the data file, and the per-phase counts are computed from the
// earned set, so the roadmap always agrees with the checklist above it.

const PHASES = [
  {
    phase: 1,
    heading: 'Run the campaign — Chapters 1 to 4, then the finale',
    blurb:
      'The story unlocks nearly everything else: the map, both leads, the activities and the side content. Play the missions in order and a dozen chapter and mission trophies, plus the gold for the final mission, land on their own.',
    points: [
      ['Twelve story trophies', 'Gone Fishing through Operation Savage Glory — one per chapter and one per named mission.'],
      ['You Gotta Know When to Get Off, gold', 'Finish the final mission. Save by hand before it — there is no mission replay.'],
      ['Say hello to the strangers', 'Greet every question-mark character you pass; their strands are phase 2.'],
    ],
  },
  {
    phase: 2,
    heading: 'Side work — strangers, crime and odd jobs',
    blurb:
      'With the story done, or well underway, clear the stranger strands and the criminal side trophies. These are the easiest trophies in the list to forget, so chase them deliberately instead of hoping they happen by accident.',
    points: [
      ['Strangers & Freaks, silver', 'Finish eight stranger strands, including Andy, Kenton, Billy, Randy and Tyrone.'],
      ['Maximum Withdrawal, silver', 'Rob five bank vaults and escape after each one.'],
      ['Pest Control', 'Rob one illegal operation for each of the nine gangs.'],
      ['Partner jobs', 'Hot Together and Retail Therapy both need your partner beside you.'],
    ],
  },
  {
    phase: 3,
    heading: 'Activities — the long grinds, started early',
    blurb:
      'The activities are the bulk of the playtime. Start them during the story so their counters build up on their own, then finish the stubborn ones afterwards.',
    points: [
      ['The Shootist, silver', 'Gold medals in all 42 Shooting Range challenges — the hardest skill trophy.'],
      ['Cunning Stunts, silver', '250 stunts; drive hard and the count climbs.'],
      ['Top Fun, races, fishing, bowling', 'Fourteen drone-race wins, twenty race wins, beat Cal at fishing, one arcade game, one bowling game.'],
      ['Positive Mental Attitude', 'Meditate at all 18 spots — read the warning above. Do the Chapter 1 spot early.'],
    ],
  },
  {
    phase: 4,
    heading: 'Collectibles and money — the completionist sweep',
    blurb:
      'One long road trip across Leonida covers three trophies at once: visit every area, WAiNK It at the scenic spots, and pick up cards as you go.',
    points: [
      ['The Goodtime State', 'Visit all 52 areas of Leonida.'],
      ['You WAiNKer!, silver', 'WAiNK It at 100 locations.'],
      ['Don’t Touch My Deck, silver', 'Complete three collectible card sets.'],
      ['Whip It Good, Little Boxes, On the Spot', 'Discover 100 vehicles, buy all eight garages, register ten vehicles in the Scooter Bros app.'],
      ['Money trophies', 'Launder $250,000 of Marked Bills and spend $100,000 across all shops.'],
    ],
  },
  {
    phase: 5,
    heading: 'Cleanup — 100% and the Platinum',
    blurb:
      'Open the completion checklist (Progress, then Stats, then 100% Completion) and clear whatever is left. Nothing on it is missable, and progress from earlier in the game already counts.',
    points: [
      ['A Long Road, gold', 'Reach 100% Completion — the last big gate.'],
      ['Vice Got a Price!, platinum', 'Pops on its own with the 54th other trophy. About 200 hours in total.'],
    ],
  },
];

// Paint the warning and the five phases into `mount`. The warning lists
// every trophy flagged missable in the data; right now that is one.
export function paintRoadmap(list, earned, mount) {
  const atRisk = list.filter((trophy) => trophy.missable);
  const warning = atRisk.length
    ? `<section class="warning-box"><h3>Missable warning — read this first</h3>${atRisk
        .map((trophy) => `<p><b>${trophy.name}.</b> ${trophy.miss_risk}</p>`)
        .join('')}<p>Reported guides say GTA VI has no mission replay, so keep a manual save at the start of every chapter and one before the final mission. Every other trophy in the official list can be earned in free roam after the story.</p></section>`
    : '';

  const phases = PHASES.map((step) => {
    const inPhase = list.filter((trophy) => trophy.phase === step.phase);
    const done = inPhase.filter((trophy) => earned.has(trophy.id)).length;
    const rows = step.points
      .map(([bold, rest]) => `<li><b>${bold}</b> — ${rest}</li>`)
      .join('');
    return `<section class="phase"><h3><span class="phase-num">${step.phase}</span>${step.heading}</h3><p>${step.blurb}</p><ul>${rows}</ul><p class="match-line">Phase progress: ${done} / ${inPhase.length} trophies</p></section>`;
  }).join('');

  mount.innerHTML = warning + phases;
}
