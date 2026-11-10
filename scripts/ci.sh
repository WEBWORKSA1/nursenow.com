#!/usr/bin/env bash
# NurseNow daily pipeline. Called by .github/workflows/daily.yml.
# All build logic lives here so it can change without editing the workflow file.
set -euo pipefail

echo "::group::Remove legacy app files (one-time)"
bash scripts/cleanup-legacy.sh
echo "::endgroup::"

echo "::group::Brand images"
if python -m pip install --quiet pillow && python scripts/make-images.py; then echo "images ok"; else echo "::warning::image step failed — continuing"; fi
echo "::endgroup::"

echo "::group::Fetch fresh news, jobs and videos"
node scripts/update.mjs || echo "::warning::feed update failed — keeping previous data"
echo "::endgroup::"

if [ -n "${ANTHROPIC_API_KEY:-}" ]; then
  echo "::group::Weekly AI draft (never auto-published)"
  node scripts/ai-draft.mjs || echo "::warning::AI draft failed — continuing"
  echo "::endgroup::"
fi

echo "::group::Build static site → docs/"
node scripts/build.mjs
echo "::endgroup::"

echo "::group::Commit refreshed site"
git config user.name "nursenow-bot"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add -A
if git diff --cached --quiet; then
  echo "No changes to commit"
else
  git commit -q -m "Daily refresh: $(date -u +'%Y-%m-%d %H:%M UTC')"
  git pull -q --rebase origin main
  git push -q origin HEAD:main
fi
echo "::endgroup::"
