// Leonida Ledger — keeping earned trophies. This module owns the only
// piece of state that outlives a page load: the set of trophy ids the
// player has ticked off. It lives in localStorage, and the only way it
// ever leaves the browser is when the player downloads the export file
// themselves. Nothing here talks to a server.

const SLOT = 'leonida-ledger-earned-v2';

// Read the saved ids back. Anything odd in storage — a bad parse, a
// value that is not a list, ids that are not whole numbers — is treated
// as "nothing saved yet" rather than crashing the page.
export function readEarnedIds() {
  try {
    const raw = localStorage.getItem(SLOT);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

// Store the current set, smallest id first so the stored text is stable
// and easy to eyeball. A full quota or a private window just means the
// save is skipped silently; the in-memory set still works.
export function persistEarnedIds(earned) {
  try {
    const ordered = [...earned].sort((a, b) => a - b);
    localStorage.setItem(SLOT, JSON.stringify(ordered));
  } catch {
    // Nothing to do: progress keeps working for this visit.
  }
}

// Build the export file the player downloads: who made it, when, which
// ids are earned and how many that is out of the total. The anchor is
// removed again a few seconds after the click so it does not linger.
export function downloadLedger(earned, total) {
  const payload = {
    ledger: 'Leonida Ledger',
    game: 'Grand Theft Auto VI',
    exported_at: new Date().toISOString(),
    total,
    earned_count: earned.size,
    earned: [...earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = 'leonida-ledger-progress.json';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 5000);
}

// Read a progress file the player picked. Both shapes are accepted: a
// bare list of ids, or the export object above with an "earned" list.
// Ids that are not whole numbers, or not in the game's 55, are dropped.
export async function readLedgerFile(file, validIds) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('not a progress file');
  const valid = new Set(validIds);
  return new Set(
    ids.filter((n) => Number.isInteger(n) && valid.has(n)),
  );
}
