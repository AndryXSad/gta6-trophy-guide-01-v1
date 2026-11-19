// Leonida Ledger — the hand-in program for gta6-trophy-guide-01.
//
// What it does, in three moves: copy the finished guide (app/) and its
// screenshots into the output folder, then write dossier.json there
// with the kit's vendored builder, so the judge can read the guide's
// outline and its screenshots. The app itself is plain static files
// under app/ — no build step, no network at run time, trophy data in
// app/data/trophies.json.
//
// vendor/makefun-frontend.ts is the kit's copy and must stay untouched:
// the scorer rebuilds the dossier with its own copy, and the two have
// to come out byte for byte the same, or the entry fails the dossier
// check before any judge ever sees it.
//
// Try it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// And serve the app with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Where this file lives, and where the hand-in goes. The platform
// hands the program /output; locally MAKEFUN_OUTPUT_DIR stands in.
const root = fileURLToPath(new URL('.', import.meta.url));
const destination = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyFolder(from, to) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

function writeDossierFile() {
  // The caps below mirror the scorer's own (reference/gate.json).
  // Only text_max_bytes shapes the bytes; the rest refuse an entry the
  // scorer would refuse anyway — more than 4 screenshots, one over
  // 256 KiB, or app/ past 993 files and directories or 48 MiB (app/
  // counts beside /output's own 1000-entry cap, its screenshots/ and
  // dossier.json).
  const dossier = buildDossier(destination, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(destination, 'dossier.json'), dossier);
}

mkdirSync(destination, { recursive: true });
copyFolder(join(root, 'app'), join(destination, 'app'));
if (existsSync(join(root, 'screenshots'))) {
  copyFolder(join(root, 'screenshots'), join(destination, 'screenshots'));
}
writeDossierFile();
