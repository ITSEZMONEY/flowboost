#!/bin/bash

# replace with your username or org name
OWNER="adityash8"

# list repos under your account (limit as needed)
gh repo list $OWNER --json name --limit 100 | jq -r '.[].name' | while read repo; do
  echo "🔧 Updating $OWNER/$repo ..."

  # 1) add the secret
  echo -n "$CURSOR_API_KEY" | gh secret set CURSOR_API_KEY -R $OWNER/$repo

  # 2) push workflow file directly to main branch
  TMPDIR=$(mktemp -d)
  cp cursor-review.yml $TMPDIR/
  cd $TMPDIR
  git init -q
  git remote add origin https://github.com/$OWNER/$repo.git

  # Try main first, then master as fallback
  DEFAULT_BRANCH=$(gh repo view $OWNER/$repo --json defaultBranchRef --jq '.defaultBranchRef.name')
  git fetch origin $DEFAULT_BRANCH --depth=1
  git checkout $DEFAULT_BRANCH

  mkdir -p .github/workflows
  cp cursor-review.yml .github/workflows/
  git add .github/workflows/cursor-review.yml
  git commit -m "Add Cursor auto-review workflow"
  git push origin $DEFAULT_BRANCH
  cd -
  rm -rf $TMPDIR
done