// Leonida Ledger — picking which trophies to show. The list page asks
// this module one question: given everything on the page (the kind pill,
// the grade and status dropdowns, the search box and the earned set),
// which trophies survive? Each rule is a small yes/no test, applied in
// turn, so adding a new filter later means adding one test, not
// rewriting the list.

// The pills across the top of the list. "collectibles" is the label the
// page shows; internally those trophies carry group "collectible", and
// "activities" maps the same way onto group "activity".
export const GROUP_PILLS = [
  ['all', 'All'],
  ['story', 'Story'],
  ['missable', 'Missable'],
  ['collectibles', 'Collectibles'],
  ['activities', 'Activities'],
  ['crime', 'Crime'],
  ['side', 'Side & strange'],
  ['platinum', 'Platinum'],
];

// The group a pill stands for in the data. Pills without an entry here
// match a group of the same name; "missable" is special and matches the
// missable flag instead of a group.
const PILL_TO_GROUP = { collectibles: 'collectible', activities: 'activity' };

function groupMatches(trophy, pill) {
  if (pill === 'all') return true;
  if (pill === 'missable') return trophy.missable === true;
  return trophy.group === (PILL_TO_GROUP[pill] ?? pill);
}

function gradeMatches(trophy, grade) {
  return grade === 'all' || trophy.grade === grade;
}

function stateMatches(trophy, state, earned) {
  if (state === 'earned') return earned.has(trophy.id);
  if (state === 'unearned') return !earned.has(trophy.id);
  return true;
}

function textMatches(trophy, needle) {
  if (!needle) return true;
  const haystack = [
    trophy.name,
    trophy.official,
    trophy.guide,
    ...(trophy.steps ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}

// The single entry point the page uses. `criteria` carries the four
// controls; `earned` is the set of ticked-off ids.
export function selectTrophies(list, criteria, earned) {
  const needle = criteria.text.trim().toLowerCase();
  return list.filter(
    (trophy) =>
      groupMatches(trophy, criteria.group) &&
      gradeMatches(trophy, criteria.grade) &&
      stateMatches(trophy, criteria.state, earned) &&
      textMatches(trophy, needle),
  );
}

// Per-grade totals for the progress strip: how many of each grade exist
// and how many of them are already earned.
export function tallyByGrade(list, earned) {
  const tally = {};
  for (const trophy of list) {
    const slot = tally[trophy.grade] ?? { total: 0, earned: 0 };
    slot.total += 1;
    if (earned.has(trophy.id)) slot.earned += 1;
    tally[trophy.grade] = slot;
  }
  return tally;
}
