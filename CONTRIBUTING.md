# Contributing to Arcwise

Thanks for your interest in contributing. This doc covers everything you need to open a PR.

## Development setup

**Requirements:** Python 3.12+, Node.js 20+, Docker (for Postgres)

```bash
git clone https://github.com/nithiin7/arcwise.git
cd arcwise
```

**Backend**
```bash
cd backend
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # add your ANTHROPIC_API_KEY
pre-commit install --hook-type pre-commit --hook-type commit-msg
```

**Frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local
```

**Postgres** (required — runs on port 5433 to avoid conflicts)
```bash
docker compose up -d postgres
```

**Apply migrations** (first time, or after pulling new migrations)
```bash
cd backend && alembic upgrade head
```

**Run the stack**
```bash
# Backend: http://localhost:8000
cd backend && python -m uvicorn app.main:app --reload

# Frontend: http://localhost:3000
cd frontend && npm run dev
```

## Making changes

1. Fork the repo and create a branch off `dev`: `git checkout -b feat/your-feature`
2. Make your changes — see the guidelines below.
3. Verify quality checks pass locally before pushing.
4. Open a PR against `dev`.

## Quality checks

**Backend** (run from `backend/`)
```bash
ruff check .   # linting
mypy .         # type checking
```

**Frontend** (run from `frontend/`)
```bash
npm run lint
npm run build
```

Both are enforced by CI on every PR.

## Commit convention

Both packages follow [Conventional Commits](https://www.conventionalcommits.org/). Git hooks enforce the format automatically after `pre-commit install`.

```
feat: add retry logic to design evaluation agent
fix: correct token count overflow on long sessions
chore: update anthropic sdk to 0.29
```

Allowed types: `feat` `fix` `docs` `style` `refactor` `perf` `test` `chore` `ci` `revert`

## Code guidelines

- **Backend:** All AI calls go through `app/services/llm.py`. Session state is managed via `app/services/session_store.py` — never import `AsyncSessionLocal` directly in routes. Schema changes require an Alembic migration.
- **Frontend:** Shared state goes in the Zustand store (`store/sessionStore.ts`). API calls go through `lib/api.ts`. Use Tailwind CSS 4 and match the existing dark theme.
- Keep changes surgical — only touch what the task requires. See [CLAUDE.md](CLAUDE.md) for the full guidelines.

## Reporting bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) and include steps to reproduce.
