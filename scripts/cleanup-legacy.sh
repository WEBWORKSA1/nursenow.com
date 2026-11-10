#!/usr/bin/env bash
# One-time removal of the previous Next.js / Firebase app from main.
# The original code is preserved on the `legacy-ai-studio` branch.
set -e
for p in app components hooks lib firebase.ts firebase-applet-config.json firebase-blueprint.json firestore.rules metadata.json next-env.d.ts next.config.ts postcss.config.mjs tsconfig.json eslint.config.mjs .eslintrc.json .env.example package-lock.json; do
  if [ -e "$p" ]; then git rm -r -q --ignore-unmatch "$p" && echo "removed legacy: $p"; fi
done
