// Leonida Ledger — saved progress. One job: keep the earned set in
// localStorage, and move it in and out as a JSON file. Nothing leaves
// the browser except through the user's own export download.

const STORAGE_KEY = 'leonida-ledger-progress-v1';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    // Private mode or a full quota: progress just does not persist.
  }
}

export function exportProgress(earned, total) {
  const payload = {
    app: 'Leonida Ledger',
    game: 'Grand Theft Auto VI',
    exported_at: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    earned_count: earned.size,
    total,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-ledger-progress.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 5000);
}

export async function importProgress(file, knownIds) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('not a progress file');
  const known = new Set(knownIds);
  return new Set(ids.filter((id) => Number.isInteger(id) && known.has(id)));
}
