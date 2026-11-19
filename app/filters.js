// Leonida Ledger — filtering. One job: given the trophy list, the
// current controls and the earned set, return the trophies to show.
// Kinds: story, missable, collectible, activity, crime, side, platinum.

export const KIND_LABELS = {
  all: 'All',
  story: 'Story',
  missable: 'Missable',
  collectible: 'Collectibles',
  activity: 'Activities',
  crime: 'Crime',
  side: 'Side & strange',
  platinum: 'Platinum',
};

export function applyFilters(trophies, { kind, grade, status, query, earned }) {
  const needle = query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (kind !== 'all') {
      if (kind === 'missable' && !t.missable) return false;
      if (kind !== 'missable' && t.kind !== kind) return false;
    }
    if (grade !== 'all' && t.grade !== grade) return false;
    if (status === 'earned' && !earned.has(t.id)) return false;
    if (status === 'unearned' && earned.has(t.id)) return false;
    if (needle) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

export function gradeCounts(trophies, earned) {
  const counts = {};
  for (const t of trophies) {
    counts[t.grade] = counts[t.grade] || { total: 0, earned: 0 };
    counts[t.grade].total += 1;
    if (earned.has(t.id)) counts[t.grade].earned += 1;
  }
  return counts;
}
