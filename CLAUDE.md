# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merged with project-specific instructions for **Arcwise** — an AI-powered system design platform built with FastAPI (Python 3.12) + Next.js 16 (TypeScript).

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

---

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

---

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

---

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## Project: Arcwise

### Architecture

```
arcwise/
├── backend/               # Python 3.12 / FastAPI
│   ├── alembic/           # DB migrations (alembic upgrade head to apply)
│   └── app/
│       ├── api/routes/    # Session, clarify, architecture, refine, review
│       ├── agents/        # Claude-powered agents (clarification, suggester, refiner, reviewer)
│       ├── db/            # SQLAlchemy async engine, ORM models, declarative base
│       ├── knowledge/     # Reference architectures + problem definitions
│       ├── models/        # Pydantic request/response models
│       ├── services/      # llm.py (LiteLLM), session_store.py (PostgreSQL via SQLAlchemy)
│       └── core/          # Config (Pydantic Settings), logging
└── frontend/              # Next.js 16 App Router + TypeScript
    └── src/
        ├── app/           # Pages: / → /session/[id]/clarify → design → review
        ├── components/    # MermaidDiagram, RefinementChat
        ├── lib/api.ts     # Typed fetch client (NEXT_PUBLIC_API_URL)
        ├── store/         # Zustand store (sessionStore.ts)
        └── types/         # Shared TypeScript interfaces
```

### Session Flow

```
GET  /sessions             → List all sessions (for home page history)
POST /sessions             → Claude generates 5 clarifying questions
POST /sessions/:id/clarify → User answers; session saved to DB
POST /sessions/:id/architecture/suggest → Claude suggests Mermaid diagram
POST /sessions/:id/architecture/submit  → Lock diagram, move to review
POST /sessions/:id/refine  → Iterative diagram updates
POST /sessions/:id/review  → Scored evaluation (5 dimensions, 1–10); review saved on session
```

### Running Locally

**Postgres** (required — local port 5433 to avoid conflict with system Postgres on 5432):
```bash
docker compose up -d postgres
```

**Backend** (from `backend/`):
```bash
source .venv/bin/activate
python -m uvicorn app.main:app --reload   # http://localhost:8000
# Note: use `python -m uvicorn`, not bare `uvicorn` — the reloader subprocess needs the venv Python
```

**Run migrations** (first time, or after `git pull` with new migrations):
```bash
source .venv/bin/activate
alembic upgrade head
```

**Frontend** (from `frontend/`):
```bash
npm run dev   # http://localhost:3000
```

**Docker** (full stack):
```bash
docker compose up
# With Redis: docker compose --profile redis up
```

### Backend Guidelines

- All AI calls go through `app/services/llm.py` — `complete()` for single-turn, `stream_complete()` for streaming, `extract_json()` for structured output.
- Sessions are persisted to PostgreSQL via `app/services/session_store.py` (SQLAlchemy async + asyncpg). The store interface (`get_session`, `save_session`, `delete_session`, `list_sessions`) is the only way routes touch the DB — never import `AsyncSessionLocal` directly in routes.
- Schema changes go through Alembic migrations in `alembic/versions/`. Run `alembic upgrade head` to apply. The `create_all` in `main.py` is a dev convenience only.
- Agents live in `app/agents/` and are single-responsibility (one LLM interaction per agent).
- Use Pydantic models for all request/response shapes. Don't bypass them with raw dicts.
- Ruff enforces linting; mypy enforces types. Run `ruff check` and `mypy` before declaring backend work done.
- Environment config is centralized in `app/core/config.py` (Pydantic `Settings`). Don't hardcode values.
- `DATABASE_URL` uses `postgresql+asyncpg://` scheme. Local dev connects to Docker Postgres on port 5433 (5432 is taken by the system Postgres).

### Frontend Guidelines

- Use the Zustand store (`sessionStore.ts`) for all shared session state — don't use local `useState` for data that crosses pages.
- All API calls go through `src/lib/api.ts` — don't call `fetch` directly in components.
- Mermaid diagrams are DSL strings rendered client-side; edits mutate the `mermaid` field on the architecture object.
- Tailwind CSS 4 for styling. Match the existing dark theme (CSS variables: `--color-primary`, `--color-surface`, etc.).
- Next.js 16 App Router — pages are in `src/app/`. Use server components by default; add `"use client"` only when needed.
- Run `npm run lint` and `npm run build` to verify frontend changes.

### Commit Convention

Both packages follow [Conventional Commits](https://www.conventionalcommits.org/).

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `revert`

```
feat: add retry logic to design evaluation agent
fix: correct token count overflow on long sessions
chore: update anthropic sdk to 0.29
```

Git hooks enforce the format on commit (Husky + commitlint on frontend; commitizen on backend).
