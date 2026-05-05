# Corporate Nexus

Corporate Nexus is an enterprise-style, scope-aware document and workflow platform.
Its core design principle is **Scope-Locked Visibility**: users can access only data inside their organizational node and descendants, never sibling or unauthorized branches.

This repository is a full-stack monorepo with:
- a Next.js frontend for dashboard and operational UI,
- a FastAPI backend implementing RBAC and scoped data access,
- Docker-based local infrastructure for PostgreSQL and Redis.

---

## Table of Contents

- [1. Product Vision (MVP + PRD)](#1-product-vision-mvp--prd)
- [2. Current Repository Structure](#2-current-repository-structure)
- [3. Architecture Overview](#3-architecture-overview)
- [4. Feature Mapping: Planned vs Implemented](#4-feature-mapping-planned-vs-implemented)
- [5. Prerequisites](#5-prerequisites)
- [6. Environment Variables](#6-environment-variables)
- [7. Running the Project](#7-running-the-project)
- [8. API Endpoints](#8-api-endpoints)
- [9. RBAC and Scope Enforcement](#9-rbac-and-scope-enforcement)
- [10. AI Agent / RAG Path](#10-ai-agent--rag-path)
- [11. Data Model Snapshot](#11-data-model-snapshot)
- [12. Development Workflow](#12-development-workflow)
- [13. Security Notes](#13-security-notes)
- [14. Known Gaps and Next Milestones](#14-known-gaps-and-next-milestones)
- [15. Troubleshooting](#15-troubleshooting)

---

## 1. Product Vision (MVP + PRD)

Based on `mvp.md` and `prd.md`, Corporate Nexus targets:

- hierarchical enterprise document governance (Region > Country > Department > Team),
- strict visibility and management boundaries through RBAC + scope lineage,
- analytics and operations dashboard filtered by authorized scope,
- AI-assisted retrieval and task generation with permission-aware context.

### Core Personas

- Regional Director
- Country Director
- Department Director
- Team Lead
- Team Member

### Core Product Outcomes

- Zero cross-scope data leakage.
- Faster information retrieval through natural-language agent interaction.
- Reduced manual operational overhead (task extraction and assignment support).

---

## 2. Current Repository Structure

```text
financial-assistant/
├─ backend/
│  ├─ app/
│  │  ├─ api/v1/routes/
│  │  │  ├─ auth.py
│  │  │  ├─ documents.py
│  │  │  ├─ tasks.py
│  │  │  ├─ users.py
│  │  │  ├─ analytics.py
│  │  │  ├─ scopes.py
│  │  │  └─ agent.py
│  │  ├─ core/
│  │  │  ├─ db.py
│  │  │  ├─ security.py
│  │  │  ├─ rbac.py
│  │  │  ├─ scope_middleware.py
│  │  │  ├─ settings.py
│  │  │  └─ logging_config.py
│  │  ├─ models/
│  │  ├─ schemas/
│  │  ├─ services/
│  │  └─ main.py
│  └─ pyproject.toml
├─ frontend/
│  ├─ src/app/
│  │  ├─ page.tsx
│  │  ├─ dashboard/page.tsx
│  │  ├─ documents/page.tsx
│  │  ├─ tasks/page.tsx
│  │  ├─ users/page.tsx
│  │  ├─ upload/page.tsx
│  │  ├─ agent/page.tsx
│  │  ├─ sign-in/[[...sign-in]]/page.tsx
│  │  └─ api/
│  ├─ src/components/
│  │  ├─ dashboard/
│  │  ├─ landing/
│  │  ├─ shared/
│  │  ├─ ui/
│  │  └─ users/
│  └─ package.json
├─ infra/
│  └─ postgres/init.sql
├─ docker-compose.yml
├─ .env.example
├─ mvp.md
└─ prd.md
```

---

## 3. Architecture Overview

### Frontend

- Next.js App Router with TypeScript and React 19.
- Dashboard/task/document/user/upload/agent screens already scaffolded.
- Clerk-based sign-in route present.
- `agent-chat-widget` currently demonstrates UI behavior with mocked reply text.

### Backend

- FastAPI app mounted at `app.main:app`.
- Versioned routes under `/api/v1`.
- Async SQLAlchemy sessions.
- Scope context injection using `set_config('app.current_user_scope_id', ...)`.
- Role-permission checks via dedicated RBAC map.

### Infrastructure

- `docker-compose.yml` provisions:
  - PostgreSQL via `pgvector/pgvector:pg16`
  - Redis 7
  - Backend on Python 3.12 image (`pip install -e .` + `uvicorn`)
  - Frontend on Node 20 (`npm install` + `npm run dev`)

---

## 4. Feature Mapping: Planned vs Implemented

| Domain | PRD / MVP Intent | Current Status in Codebase |
| :--- | :--- | :--- |
| Hierarchical RBAC | Vertical inheritance + sibling isolation | **Partially implemented** (scope context + role checks + descendant-scope retrieval) |
| Dashboard analytics | Scope-filtered KPIs | **Implemented baseline** (`/api/v1/analytics/summary`) |
| Document pipeline | Upload + metadata + versioning | **Implemented baseline** (presigned upload URL + content-type validation) |
| User management | Role-bounded creation | **Implemented baseline** (`users:create` permission + `can_manage_role`) |
| Scope tree visibility | User-visible scope hierarchy | **Implemented baseline** (`/api/v1/scopes/tree`) |
| AI agent query | Permission-aware retrieval | **Stubbed integration** (`/api/v1/agent/query` returns placeholder retrieval response) |
| Task extraction from docs | AI extracts task JSON fields | **Planned** |
| Full RAG with pgvector | Embedding + filtered retrieval | **Planned / scaffolded** |

---

## 5. Prerequisites

- Node.js 20+
- npm 10+
- Python 3.12+
- Docker Desktop with Compose

Recommended on Windows:
- PowerShell 7+
- WSL2-enabled Docker Desktop for better container performance

---

## 6. Environment Variables

Copy `.env.example` to `.env` at repository root:

```bash
cp .env.example .env
```

### Required Variables by Area

#### Database / Cache
- `DATABASE_URL`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `REDIS_URL`

#### Frontend <-> Backend
- `NEXT_PUBLIC_API_BASE_URL`

#### Authentication / Identity
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `INTERNAL_API_KEY`
- `INTERNAL_SYNC_SIGNING_SECRET`

#### Storage / AI
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `OPENAI_API_KEY`

### Important Behavior

- Docker services read root `.env`.
- Backend settings are loaded from `.env` via `pydantic-settings`.
- Missing critical keys (e.g., `AWS_S3_BUCKET`, `OPENAI_API_KEY`) will block backend startup or endpoint behavior.

---

## 7. Running the Project

### Option A: Docker Compose (recommended)

From repository root:

```bash
docker compose up --build
```

Access points:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Health: `http://localhost:8000/health`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

Stop:

```bash
docker compose down
```

Reset including volumes:

```bash
docker compose down -v
```

### Option B: Local processes

#### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -e .
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 8. API Endpoints

All backend routes are namespaced under `/api/v1`.

### Health
- `GET /health` -> backend liveness

### Auth
- `POST /api/v1/auth/sync` -> returns current user context
- `POST /api/v1/auth/clerk-sync` -> internal provisioning/sync endpoint with API key + signed headers + nonce replay protection

### Documents
- `GET /api/v1/documents` -> list scoped documents
- `POST /api/v1/documents/upload-url` -> generate S3 presigned URL (PDF/DOCX/DOC only)

### Tasks
- `GET /api/v1/tasks` -> list scoped tasks

### Users
- `GET /api/v1/users` -> list users (permission-guarded)
- `POST /api/v1/users` -> create user with role hierarchy constraints

### Analytics
- `GET /api/v1/analytics/summary` -> document/task KPI summary

### Scopes
- `GET /api/v1/scopes/tree` -> visible organizational scope tree

### Agent
- `POST /api/v1/agent/query` -> permission-aware retrieval entrypoint (currently scaffold response)

---

## 9. RBAC and Scope Enforcement

Current backend enforcement layers:

1. **Authentication context**  
   Requests resolve `current_user` from auth flow.

2. **Scope session context**  
   Middleware sets PostgreSQL session variable:
   - `app.current_user_scope_id`

3. **Descendant scope resolution**  
   Service `get_authorized_scope_ids()` calls DB function:
   - `get_all_child_scopes(scope_id)`

4. **Role permissions**  
   `PERMISSION_ROLES` map controls permission to role access (e.g., `users:create`, `tasks:assign`).

5. **Role elevation guard**  
   `can_manage_role()` prevents creating/updating users above the requester role.

This structure aligns with PRD goals for vertical inheritance and management constraints.

---

## 10. AI Agent / RAG Path

PRD/MVP goals require scope-filtered retrieval and task extraction.

Current state:
- `POST /api/v1/agent/query` already computes authorized scope IDs.
- Retrieval layer (`permission_aware_retrieve`) is scaffolded and returns a placeholder payload.
- Frontend chat widget currently demonstrates UX with static demo responses.

Target next steps:
- Integrate embedding + vector store retrieval with metadata filters by `scope_id`.
- Add source document citation in responses.
- Implement document-to-task extraction flow for action-item automation.

---

## 11. Data Model Snapshot

Conceptual entities (from product docs) and mirrored implementation intent:

- `Scope`: hierarchical node with parent-child linkage
- `User`: belongs to a scope and carries a role
- `Document`: scoped document metadata and version reference
- `Task`: scoped operational item with status and assignment semantics

Design assumptions:
- every major business entity carries `scope_id`,
- scope lineage determines visibility,
- API results are always filtered to authorized scope graph.

---

## 12. Development Workflow

### Frontend commands

```bash
cd frontend
npm run dev
npm run build
npm run start
npm run lint
```

### Backend commands

```bash
cd backend
uvicorn app.main:app --reload
```

### Suggested local loop

1. Start infra with Docker.
2. Run backend/frontend locally for faster hot reload (optional hybrid setup).
3. Validate:
   - `/health`
   - dashboard page load
   - scoped endpoints under `/api/v1`

---

## 13. Security Notes

- Clerk internal sync endpoint enforces:
  - internal API key,
  - signed request validation,
  - timestamp skew checks,
  - nonce replay prevention with DB-persisted nonce table.
- Security audit events are emitted via `security.audit` logger.
- S3 upload URLs enforce SSE-S3 (`AES256`) and allowlisted file types.

---

## 14. Known Gaps and Next Milestones

To fully reach PRD target state:

- Complete real RAG implementation (LangChain + pgvector retrieval).
- Connect frontend agent chat to backend `/api/v1/agent/query`.
- Add task extraction from uploaded documents.
- Expand analytics endpoints to support richer dashboard widgets.
- Add comprehensive test coverage for RBAC/scope boundary scenarios.
- Harden observability and performance profiling against NFR targets.

---

## 15. Troubleshooting

- **Backend fails on boot**  
  Check `DATABASE_URL`, `AWS_S3_BUCKET`, `OPENAI_API_KEY`, and Clerk/internal sync keys.

- **`/auth/clerk-sync` returns unauthorized**  
  Verify `INTERNAL_API_KEY`, timestamp/nonce/signature headers, and signing secret consistency.

- **Documents upload URL generation fails**  
  Ensure AWS credentials are valid and content type is one of: PDF, DOCX, DOC.

- **Frontend cannot call backend**  
  Validate `NEXT_PUBLIC_API_BASE_URL` and that backend is reachable on configured port.

- **Scope data appears empty**  
  Check DB seed/init scripts and scope hierarchy presence in PostgreSQL.

