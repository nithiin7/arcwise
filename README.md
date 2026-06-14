<div align="center">
  <img src="frontend/public/logo.svg" alt="Arcwise" width="96" height="96" />

  <h1>Arcwise</h1>

  <p><strong>Your AI-powered system design coach.</strong><br/>
  Practice real-world architecture challenges, get expert feedback, and level up your design skills — one session at a time.</p>

  <p>
    <img src="https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/LiteLLM-multi--model-6366f1?style=flat-square&logo=anthropic&logoColor=white" alt="LiteLLM" />
    <img src="https://img.shields.io/badge/Python-3.12-3776ab?style=flat-square&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/license-MIT-22c55e?style=flat-square" alt="License" />
  </p>

  <p>
    <a href="#-features"><img src="https://img.shields.io/badge/✦_Features-6366f1?style=flat-square" /></a>
    <a href="#-how-it-works"><img src="https://img.shields.io/badge/✦_How_It_Works-8b5cf6?style=flat-square" /></a>
    <a href="#-quick-start"><img src="https://img.shields.io/badge/✦_Quick_Start-a78bfa?style=flat-square" /></a>
    <a href="#-tech-stack"><img src="https://img.shields.io/badge/✦_Tech_Stack-6366f1?style=flat-square" /></a>
  </p>
</div>

---

## ✦ Features

<table>
<tr>
<td width="50%">

### 🎯 Problem-First Learning
Drop any system design problem — or pick from curated examples like WhatsApp, Twitter, Netflix, Uber, and YouTube. Arcwise meets you where you are.

</td>
<td width="50%">

### 🤖 AI-Guided Clarification
The AI asks the right questions first: traffic scale, consistency model, latency targets, and scope. Just like a real interview.

</td>
</tr>
<tr>
<td width="50%">

### 🗺️ Live Architecture Diagrams
Your design renders as an interactive Mermaid diagram in real time. Refine it through natural conversation — no drag-and-drop required.

</td>
<td width="50%">

### 📊 Scored Feedback
Get a structured review across five dimensions — functional coverage, NFR handling, component justification, tradeoff awareness, and an overall score.

</td>
</tr>
<tr>
<td width="50%">

### 🔌 Bring Your Own Model
Switch between Claude, GPT-4o, Gemini, Groq, and local Ollama models from the Settings page — no code changes required. Powered by LiteLLM.

</td>
<td width="50%">

### 🔗 Session Sharing
Generate a public read-only link for any session. Share your architecture with teammates, mentors, or on social — no account required to view.

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Auth Built In
Email/password registration with secure JWT sessions. Optional GitHub and Google OAuth. Password reset via email. Toggle auth on/off for local dev.

</td>
<td width="50%">

### 📜 Design History
The dashboard shows all past sessions with their problem statements and scores. Pick up where you left off or revisit old designs.

</td>
</tr>
</table>

---

## ✦ How It Works

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│  1. Describe ──▶ 2. Clarify ──▶ 3. Design ──▶ 4. Refine ──▶ 5. Review          │
│                                                                                  │
│  Enter your     Claude asks    AI suggests   Iterate via    Scored               │
│  problem        5 questions    a Mermaid     natural chat   feedback             │
│                 about scale,   architecture                 (1–10)               │
│                 constraints                                                      │
│                 & tradeoffs                                                      │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Scoring Rubric

| Dimension | What it measures |
|---|---|
| `functional_coverage` | Are all core requirements addressed? |
| `nfr_handling` | Non-functional requirements (scale, latency, availability) |
| `component_justification` | Are technology choices explained and appropriate? |
| `tradeoff_awareness` | Does the design acknowledge and reason about tradeoffs? |
| `overall` | Holistic design quality and communication clarity |

---

## ✦ Quick Start

### Prerequisites

![Python](https://img.shields.io/badge/Python-3.12+-3776ab?style=flat-square&logo=python&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-optional-2496ed?style=flat-square&logo=docker&logoColor=white)

### Option A — Docker (recommended)

```bash
git clone https://github.com/nithiin7/arcwise.git
cd arcwise

# Add your Anthropic API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > backend/.env

# Spin up the full stack
docker compose up
```

Open **http://localhost:3000** — you're ready.

> Want Redis session persistence? `docker compose --profile redis up`

---

### Option B — Local dev

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # add ANTHROPIC_API_KEY (or any supported provider key)
pre-commit install --hook-type pre-commit --hook-type commit-msg
alembic upgrade head
python -m uvicorn app.main:app --reload  # → http://localhost:8000
```

**Frontend**

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev                    # → http://localhost:3000
```

---

## ✦ Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| **AI** | LiteLLM — Claude, GPT-4o, Gemini, Groq, xAI, Ollama (swap via `.env`) |
| **Backend** | FastAPI · Pydantic v2 · SSE streaming · PostgreSQL (SQLAlchemy async) |
| **Auth** | JWT · bcrypt · GitHub OAuth · Google OAuth · SMTP password reset |
| **Frontend** | Next.js 16 App Router · React 19 · TypeScript · Zustand |
| **Diagrams** | [Mermaid.js](https://mermaid.js.org/) (live DSL rendering) |
| **Styling** | Tailwind CSS 4 · Framer Motion · Custom dark theme + light mode |
| **Infra** | Docker Compose · PostgreSQL · Optional Redis session store |
| **Quality** | Ruff · mypy · ESLint · Prettier · Conventional Commits |

</div>

---

## ✦ Project Structure

```
arcwise/
├── backend/
│   └── app/
│       ├── api/routes/     # session · clarify · architecture · refine · review · auth · share · models
│       ├── agents/         # clarification · suggester · refiner · reviewer
│       ├── knowledge/      # reference architectures + problem library
│       ├── models/         # Pydantic schemas
│       ├── services/       # llm.py · session_store.py · user_store.py · auth.py · email.py
│       └── core/           # config · logging
│
└── frontend/
    └── src/
        ├── app/            # / · dashboard · login · signup · forgot-password · reset-password
        │                   # session/[id]/clarify · session/[id]/design
        │                   # share/[token] · settings · auth/callback
        ├── components/     # ArchitectureCanvas · MermaidEditorModal · ReviewPanel
        │                   # ShareModal · RefinementChat · ModelSelect · UserMenu · …
        ├── lib/api.ts      # typed fetch client
        ├── store/          # Zustand stores (session + auth)
        └── types/          # shared TypeScript interfaces
```

---

## ✦ Commit Convention

Both packages follow [Conventional Commits](https://www.conventionalcommits.org/). Git hooks enforce the format automatically.

```
feat: add retry logic to design evaluation agent
fix: correct token count overflow on long sessions
chore: update anthropic sdk to 0.29
```

Allowed types: `feat` `fix` `docs` `style` `refactor` `perf` `test` `chore` `ci` `revert`

**Generate changelogs:**

```bash
# Backend (commitizen)
cd backend && cz changelog

# Frontend
cd frontend && npm run changelog
```

---

<div align="center">
  <sub>Built with Claude · Powered by curiosity</sub>
</div>
