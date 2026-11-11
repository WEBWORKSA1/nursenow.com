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

# ---------------------------------------------------------------------------
# Publish for whichever GitHub Pages mode the repo is set to:
#   workflow     → the deploy job publishes docs/ (nothing to do here)
#   legacy /docs → GitHub serves docs/ from the branch (nothing to do here)
#   legacy /     → GitHub serves the repo root, so mirror docs/ into the root
# Mirrored paths are listed in .root-mirror and removed again on every run.
# ---------------------------------------------------------------------------
echo "::group::Match GitHub Pages publishing mode"
MODE="${PAGES_MODE:-}"
if [ -z "$MODE" ]; then
  AUTH="$(git config --get http.https://github.com/.extraheader 2>/dev/null || true)"
  TOKEN="$(printf '%s' "${AUTH##* }" | base64 -d 2>/dev/null | cut -d: -f2- || true)"
  if [ -n "$TOKEN" ] && [ -n "${GITHUB_REPOSITORY:-}" ]; then
    MODE="$(curl -fsS -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/$GITHUB_REPOSITORY/pages" 2>/dev/null \
      | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);console.log(j.build_type+" "+((j.source||{}).path||"/"))}catch{console.log("unknown")}})' || echo unknown)"
  fi
fi
MODE="${MODE:-unknown}"
echo "Pages mode: $MODE"

MANIFEST=.root-mirror
PROTECTED=" .git .github .gitignore CNAME README.md RESEARCH.md content data docs node_modules package.json scripts site.config.json src $MANIFEST "
if [ -f "$MANIFEST" ]; then
  while IFS= read -r n; do
    [ -n "$n" ] || continue
    case "$PROTECTED" in *" $n "*) continue;; esac
    rm -rf -- "./$n"
  done < "$MANIFEST"
  rm -f "$MANIFEST"
fi

case "$MODE" in
  workflow*|"legacy /docs")
    echo "Root mirror not needed." ;;
  *)
    echo "::warning title=Pages publishes the repo root::Mirroring docs/ into the root so nursenow.com shows the site. Cleaner: Settings → Pages → Source → GitHub Actions (the mirror is then removed automatically)."
    : > "$MANIFEST"
    for p in docs/* docs/.nojekyll; do
      n="$(basename "$p")"
      case "$PROTECTED" in *" $n "*) continue;; esac
      cp -R "$p" "./$n"
      echo "$n" >> "$MANIFEST"
    done
    # Keep crawlers off the duplicate /docs/ copy when the root is published.
    if [ -f robots.txt ]; then sed -i '0,/^Disallow: \/404.html$/s//Disallow: \/404.html\nDisallow: \/docs\//' robots.txt; fi
    ;;
esac
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
