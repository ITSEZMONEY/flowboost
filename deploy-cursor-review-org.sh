#!/bin/bash

# Organization name
ORG="ITSEZMONEY"

# list repos under the organization (limit as needed)
gh repo list $ORG --json name --limit 100 | jq -r '.[].name' | while read repo; do
  echo "🔧 Updating $ORG/$repo ..."

  # 1) add the secret
  echo -n "$CURSOR_API_KEY" | gh secret set CURSOR_API_KEY -R $ORG/$repo

  # 2) push workflow file directly to main branch
  TMPDIR=$(mktemp -d)
  cp cursor-review.yml $TMPDIR/
  cd $TMPDIR
  git init -q
  git remote add origin https://github.com/$ORG/$repo.git

  # Try main first, then master as fallback
  DEFAULT_BRANCH=$(gh repo view $ORG/$repo --json defaultBranchRef --jq '.defaultBranchRef.name')
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