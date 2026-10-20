# Git Workflow — YASH GROUP ERP MINI

One shared repository. `dev` is the integration branch. Everyone works on their
own feature branch and merges into `dev` through a pull request. `main` is
protected — never commit to it directly.

## Current repo state (inspected)

- Local branches: `dev`, `develop`, `main`, `feature/project-setup`,
  `feature/project_setup` (currently checked out).
- Remote branches include `origin/dev`, `origin/main`, and a teammate's
  `origin/feature/m5-project-installation-service` (Module 5 work).
- The Module 6 backend + docs are currently **uncommitted** working changes on
  `feature/project_setup`. Nothing has been committed or pushed by this setup.

> Pick ONE integration branch with the team (`dev` is used in these docs) and
> delete the duplicate `develop` / `feature/project-setup` vs `feature/project_setup`
> confusion once everyone agrees — do not delete branches others are using.

## Golden rules

1. Never commit directly to `main`.
2. Never force-push a shared branch (`dev`, `main`).
3. Never commit `.env`, passwords, API keys, or the Neon connection string.
   (`server/.env` is git-ignored — verify with `git status` before committing.)
4. All `prisma/schema.prisma` changes go through the DB owner (team lead).
5. Keep commits small and descriptive.

## Daily flow for a member

```powershell
# 1. Start from an up-to-date dev
git checkout dev
git pull origin dev

# 2. Create (or switch to) YOUR feature branch
git checkout -b feature/finance-billing      # Member 1
# git checkout -b feature/finance-payables    # Member 2
# git checkout -b feature/finance-costing     # Member 3
# git checkout -b feature/finance-integration # Member 4

# 3. Work, then stage only your files
git add server/modules/finance/routes/invoice.routes.js
git add server/modules/finance/services/invoice.service.js
git status                                   # double-check no .env, no stray files

# 4. Commit
git commit -m "feat(finance): add invoice list + receivables ageing endpoints"

# 5. Push your branch
git push -u origin feature/finance-billing
```

Then open a Pull Request: `feature/finance-billing` → `dev`. Ask one teammate to
review. After approval, merge with a merge commit (no force, no rebase of shared
history).

## Keeping your branch in sync with dev

```powershell
git checkout dev
git pull origin dev
git checkout feature/finance-billing
git merge dev                 # resolve conflicts locally, review the diff
```

## Resolving merge conflicts safely

1. `git status` shows the conflicted files.
2. Open each file, fix the `<<<<<<<`, `=======`, `>>>>>>>` markers by hand.
3. Re-run the tests (`scripts\test-rbac.ps1`) before committing the resolution.
4. `git add <file>` then `git commit`. Review the final `git diff` — never blind-accept.

## Schema / migration coordination (DB owner)

Only the team lead changes `prisma/schema.prisma`. When a change is needed:

```powershell
cd server
npx prisma validate            # must pass
npx prisma generate            # regenerate the client
npx prisma db push             # sync the shared Neon DB (dev)
git add prisma/schema.prisma
git commit -m "chore(db): <describe the model/field change>"
```

Announce it in the team channel BEFORE pushing, because everyone shares the same
Neon database. Never run `prisma migrate reset` or `db push --force-reset`
against the shared DB — that wipes everyone's data.

## Commit message convention

`<type>(<scope>): <short description>` — types: `feat`, `fix`, `chore`, `docs`,
`refactor`, `test`. Scope is usually the module (`finance`, `auth`, `db`).

## Before you open a PR — checklist

- [ ] Branch is up to date with `dev` and conflicts resolved.
- [ ] `git status` shows no `.env`, no secrets, no `node_modules`.
- [ ] `npm start` boots without errors.
- [ ] `scripts\test-rbac.ps1` prints `RESULT: all tests PASSED`.
- [ ] Only files you own (or coordinated shared files) are in the diff.
- [ ] Commit messages are clear.
