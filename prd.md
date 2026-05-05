# Product Requirements Document (PRD): Corporate Nexus

**Version:** 1.0  
**Status:** Draft / Development-Ready  
**Role:** Senior Technical Product Manager & System Architect  

---

## 1. Executive Summary
Corporate Nexus is an enterprise SaaS platform providing hierarchical document management and AI-driven task automation. The system is built on a **"Scope-Locked Visibility"** model, ensuring that data access is strictly governed by an organizational tree. It integrates a **Permission-Aware RAG (Retrieval-Augmented Generation)** pipeline, allowing AI Agents to assist users without violating data sovereignty or compliance protocols.

---

## 2. User Personas & User Stories

### 2.1 Personas
| Persona | Title | Scope | Primary Objective |
| :--- | :--- | :--- | :--- |
| **Elena** | Regional Director | Region (e.g., EMEA) | Monitor cross-country performance and high-level compliance. |
| **Marc** | Country Director | Country (e.g., Germany) | Manage national operations and departmental budgets. |
| **Sarah** | Dept. Director | Department (e.g., HR) | Oversee departmental policies and inter-team workflows. |
| **David** | Team Lead | Team (e.g., Talent Acq.) | Manage specific project files and daily task assignments. |
| **Alex** | Team Member | Personal / Team | Execute tasks and contribute to team documentation. |

### 2.2 User Stories
*   **As a Regional Director**, I want to view an aggregated dashboard of all countries in my region so that I can identify operational bottlenecks without manually checking each country.
*   **As a Country Director**, I want to upload national policy documents that are visible to all departments in my country but invisible to other countries in the region.
*   **As a Team Lead**, I want to assign tasks to my team members based on action items extracted by the AI Agent from our meeting minutes.
*   **As a Team Member**, I want to search for documents within my team's scope using natural language so that I can find information without knowing specific file names.

---

## 3. Functional Requirements & Acceptance Criteria

### 3.1 Hierarchical RBAC & Visibility
| Feature | Requirement | Acceptance Criteria |
| :--- | :--- | :--- |
| **Vertical Access** | Users see all data in their node and all descendant nodes. | A Dept. Director can see all files in "Team A" and "Team B" under their Dept. |
| **Sibling Isolation** | Users must not see data from sibling nodes at the same level. | The "Germany" Director cannot see "France" data, even if both report to "EMEA." |
| **Horizontal Constraint** | Users cannot see parent-level data unless explicitly shared. | A Team Member cannot see Department-level strategy docs unless authorized. |

### 3.2 Dashboard & Analytics
*   **Requirement:** Dynamic UI components that filter data based on the `UserContext.ScopeID`.
*   **Acceptance Criteria:**
    *   Dashboard charts must execute scoped queries (e.g., `COUNT tasks WHERE scope_id IN (descendants)`).
    *   The "Storage Usage" metric must only reflect the user's authorized scope.

### 3.3 AI Agent Integration
*   **Requirement:** A natural language interface for document querying and task creation.
*   **Acceptance Criteria:**
    *   **Scope-Awareness:** Agent must prefix every vector search with a metadata filter: `filter={"scope_id": {"$in": user_authorized_scopes}}`.
    *   **Task Extraction:** Agent must be able to parse a `.docx` or `.pdf` and return a JSON object containing `Task_Title`, `Due_Date`, and `Suggested_Assignee`.

---

## 4. Technical Constraints & Security

### 4.1 Data Isolation (Row-Level Security)
The system shall utilize **PostgreSQL Row-Level Security (RLS)** as the primary defense layer. 
*   **Implementation:** Every table (Files, Tasks, Users) includes a `scope_id`.
*   **Session Context:** Upon authentication, the app sets a session variable: `SET app.current_user_scope = 'XYZ'`.
*   **Policy:** `CREATE POLICY scope_isolation ON documents USING (scope_id IN (SELECT get_all_child_scopes(current_setting('app.current_user_scope'))));`

### 4.2 Agent Architecture & RAG Pipeline
*   **Embedding Model:** `text-embedding-3-small` (or equivalent) for converting documents into vectors.
*   **Context Window Management:** Use **Map-Reduce** or **Refine** chains for long documents to prevent exceeding LLM token limits (e.g., 128k context).
*   **Encryption:** All files stored in S3 must be encrypted using **AES-256 (SSE-S3)**. Data in transit must use **TLS 1.3**.

---

## 5. Data Models & API Architecture

### 5.1 Core Entities
| Entity | Key Attributes | Relationships |
| :--- | :--- | :--- |
| **Scope** | `id`, `name`, `type`, `parent_id` | Self-referencing (Adjacency List). |
| **User** | `id`, `email`, `role_id`, `scope_id` | Belongs to one Scope. |
| **Document**| `id`, `s3_key`, `vector_id`, `scope_id` | Tied to a specific Scope level. |
| **Task** | `id`, `title`, `status`, `assigned_id` | Linked to User and Scope. |

### 5.2 Critical API Endpoints
*   `GET /api/v1/analytics/summary`: Returns scoped KPI metrics for the dashboard.
*   `POST /api/v1/agent/query`: Accepts natural language; returns permission-filtered RAG response.
*   `GET /api/v1/scopes/tree`: Returns the organizational hierarchy visible to the current user.

---

## 6. User Flow & UI/UX Requirements

1.  **Authentication:** User logs in via SSO. The system retrieves the `scope_id` and `role`.
2.  **Dynamic Filtering:** The Sidebar and Dashboard components adjust. If `role == 'Team Member'`, the "Region Switcher" is hidden.
3.  **Discovery:** User types in Global Search. The API triggers a combined PostgreSQL (metadata) and Vector (content) search, joined by the `scope_id` constraint.
4.  **Action:** User clicks "Generate Tasks" on a document. The AI Agent processes the file and opens a draft Kanban modal.

---

## 7. Non-Functional Requirements (NFRs)

*   **Scalability:** Support up to 100,000 documents per country node without query degradation.
*   **Latency:** AI Agent initial response (TTFT) must be under **2.0 seconds**. Dashboard widgets must load in under **500ms**.
*   **Accessibility:** WCAG 2.1 Level AA compliance for all UI components.
*   **Data Residency:** Ability to point `Country` scopes to specific regional S3 buckets (e.g., German data stays in `eu-central-1`).

---

## 8. Success Metrics (KPIs)

*   **Agent Accuracy:** >90% success rate in correctly identifying task assignees from meeting notes.
*   **Retrieval Speed:** Average time to find a specific document via natural language vs. manual folder browsing (Target: 60% reduction).
*   **System Adoption:** % of users utilizing the AI Agent for more than 3 queries per week.
*   **Security:** Zero "Cross-Scope" data leakage incidents in quarterly penetration tests.