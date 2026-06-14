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
│       ├── api/routes/    # session, clarify, architecture, refine, review, auth, share, models
│       ├── agents/        # LLM agents: clarification, suggester, refiner, reviewer
│       ├── db/            # SQLAlchemy async engine, ORM models, declarative base
│       ├── knowledge/     # Reference architectures + problem definitions
│       ├── models/        # Pydantic request/response models
│       ├── services/      # llm.py (LiteLLM), session_store.py, user_store.py, auth.py, email.py
│       └── core/          # Config (Pydantic Settings), logging
└── frontend/              # Next.js 16 App Router + TypeScript
    └── src/
        ├── app/           # Pages: / · dashboard · login · signup · forgot-password · reset-password
        │                  #         session/[id]/clarify · session/[id]/design · share/[token]
        │                  #         settings · auth/callback
        ├── components/    # UI primitives + domain: ArchitectureCanvas, MermaidEditorModal,
        │                  #   ReviewPanel, ShareModal, RefinementChat, ModelSelect, UserMenu, …
        ├── lib/api.ts     # Typed fetch client (NEXT_PUBLIC_API_URL)
        ├── store/         # Zustand stores (sessionStore.ts, authStore.ts)
        └── types/         # Shared TypeScript interfaces
```

### API Routes

**Sessions** (`/api/sessions`):
```
GET  /                           → List all sessions (dashboard)
POST /                           → Create session; Claude generates clarifying questions
POST /:id/clarify               → Submit answers; session saved to DB
POST /:id/architecture/suggest  → Claude suggests Mermaid diagram
POST /:id/architecture/submit   → Lock diagram, advance to review stage
POST /:id/refine                → Iterative diagram updates via chat
POST /:id/review                → Scored review (5 dimensions, 1–10); saved on session
POST /:id/share                 → Generate a shareable public link (share_token)
```

**Auth** (`/api/auth`):
```
POST /register          → Email + password registration → JWT
POST /login             → Email + password → JWT
POST /forgot-password   → Send reset email (SMTP)
POST /reset-password    → Consume reset token → new JWT
GET  /github            → Redirect to GitHub OAuth
GET  /github/callback   → Exchange GitHub code → JWT
GET  /google            → Redirect to Google OAuth
GET  /google/callback   → Exchange Google code → JWT
GET  /me                → Current user (requires JWT)
GET  /config            → Which OAuth providers are enabled
```

**Other**:
```
GET /api/share/:token        → Public read-only view of a shared session
GET /api/models/ollama       → List locally running Ollama models
GET /api/health              → Health check
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

- All AI calls go through `app/services/llm.py` — `complete()` for single-turn, `stream_complete()` for streaming, `extract_json()` for structured output. Backed by LiteLLM so any provider key in `.env` is automatically available.
- Sessions are persisted to PostgreSQL via `app/services/session_store.py` (SQLAlchemy async + asyncpg). The store interface (`get_session`, `save_session`, `delete_session`, `list_sessions`) is the only way routes touch session rows — never import `AsyncSessionLocal` directly in routes.
- Users are persisted via `app/services/user_store.py`. Auth logic (JWT, password hashing, reset tokens) lives in `app/services/auth.py`. Email dispatch (reset-password links) is in `app/services/email.py`.
- Schema changes go through Alembic migrations in `alembic/versions/`. Run `alembic upgrade head` to apply. The `create_all` in `main.py` is a dev convenience only.
- Agents live in `app/agents/` and are single-responsibility (one LLM interaction per agent).
- Use Pydantic models for all request/response shapes. Don't bypass them with raw dicts.
- Ruff enforces linting; mypy enforces types. Run `ruff check` and `mypy` before declaring backend work done.
- Environment config is centralized in `app/core/config.py` (Pydantic `Settings`). Don't hardcode values.
- `DATABASE_URL` uses `postgresql+asyncpg://` scheme. Docker Compose maps host port 5433 → container 5432; set `DATABASE_URL` in `.env` accordingly for local dev.

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
