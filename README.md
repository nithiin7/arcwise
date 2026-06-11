# Arcwise

**AI-powered system design coach**

Arcwise helps software engineers practice and improve their system design skills through interactive, AI-guided sessions. It presents real-world design problems, evaluates your architecture decisions, and provides structured feedback — acting as an expert coach that adapts to your level.

---

## Folder structure

```
arcwise/
├── backend/               # Python / FastAPI service
│   ├── app/
│   │   ├── api/routes/    # HTTP route handlers
│   │   ├── agents/        # AI agent logic (Anthropic SDK)
│   │   ├── knowledge/
│   │   │   └── problems/  # System design problem definitions
│   │   ├── models/        # Pydantic request / response models
│   │   ├── services/      # Business logic layer
│   │   └── core/          # Config, logging, shared utilities
│   ├── requirements.txt
│   ├── pyproject.toml     # Ruff, mypy, commitizen config
│   ├── .pre-commit-config.yaml
│   ├── .env.example
│   └── CHANGELOG.md
│
└── frontend/              # Next.js 15 (App Router) + TypeScript
    ├── src/
    ├── .husky/            # Git hooks (commitlint, lint-staged)
    ├── .env.local.example
    ├── .prettierrc
    ├── .commitlintrc.json
    ├── lint-staged.config.js
    └── CHANGELOG.md
```

---

## Setup

### Prerequisites

- Python 3.12+
- Node.js 20+
- (Optional) Redis — set `USE_REDIS=true` in backend `.env`

### Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and edit environment variables
cp .env.example .env

# Install pre-commit hooks
pre-commit install --hook-type pre-commit --hook-type commit-msg
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy and edit environment variables
cp .env.local.example .env.local
```

---

## Running locally

**Backend** (from `backend/`):

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

**Frontend** (from `frontend/`):

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Commit convention

Both packages follow [Conventional Commits](https://www.conventionalcommits.org/).

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `revert`

Examples:

```
feat: add retry logic to design evaluation agent
fix: correct token count overflow on long sessions
chore: update anthropic sdk to 0.29
```

Git hooks enforce the format automatically on commit.

---

## Generating changelogs

**Backend** (uses commitizen):

```bash
cd backend
cz changelog        # append since last tag
cz bump             # bump version + update CHANGELOG.md
```

**Frontend** (uses conventional-changelog):

```bash
cd frontend
npm run changelog
```
