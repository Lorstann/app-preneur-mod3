## 1. Project Overview & Core Value Proposition
**Corporate Nexus** is an enterprise-grade SaaS platform designed for multi-national organizations to manage high-volume documentation and team workflows with absolute data sovereignty.

The core value proposition lies in its **"Scope-Locked Visibility."** Unlike traditional flat-file storage, Nexus utilizes a hierarchical permission engine that ensures data is only accessible to those within the vertical "line of sight." Combined with **Agent-Support**, the system transforms static archives into an actionable knowledge base where AI agents assist in summarizing, tagging, and reporting based on the user's specific authorization level.

---

## 2. Detailed RBAC Logic & Permissions Matrix

### The "Top-Down" Scoping Architecture
The system uses a recursive relational model. Every data object (document, task, user) is tagged with a `ScopeID` (linked to `Region`, `Country`, `Department`, or `Team`). 



#### Logical Implementation:
* **Recursive Queries:** When a user logs in, their `UserContext` is established. A `Regional Director` assigned to "EMEA" will have a filter applied to all queries: `WHERE region_id = 'EMEA'`. 
* **Inheritance:** Visibility is inherited downwards. If you own the parent node, you own the children. If you own a child node, you cannot see the parent or siblings.

### Permissions Matrix

| Role | Scope Level | Visibility Range | Management Rights (CRUD) |
| :--- | :--- | :--- | :--- |
| **Regional Director** | Region | All Countries, Depts, & Teams within their Region. | Read all; Edit/Delete Regional reports; Manage Country Directors. |
| **Country Director** | Country | All Depts & Teams within their specific Country. | Read all in Country; Manage Dept. Directors. |
| **Department Director**| Department | All Teams and Files within their specific Dept. | Read all in Dept; Upload Dept policies; Manage Team Leads. |
| **Team Lead** | Team | Specific Team files, tasks, and member profiles. | Full CRUD on Team assets; Assign tasks to members. |
| **Team Member** | Personal/Team | Assigned team files and personal/assigned tasks. | Read Team files; CRUD on assigned tasks. |

---

## 3. Page Specifications

### 3.1 Dashboard (The Intelligence Hub)
The dashboard provides a "Lens" into the organization. The data visualized is strictly restricted by the user’s scope.
* **Visualizations:**
    * **File Distribution (Pie/TreeMap):** Regional Directors see breakdown by Country; Country Directors see breakdown by Department.
    * **Activity Heatmap:** Total uploads and task completions over the last 30 days.
    * **Storage Usage (Bar Chart):** Real-time monitoring of S3 bucket consumption per node.
* **Contextual KPI Cards:** Active tasks, "Hot" documents (frequently accessed), and Agent-flagged anomalies.

### 3.2 Upload Page (Secure Ingestion)
* **Functional Specs:**
    * Multi-file drag-and-drop.
    * **Metadata Tagging:** Mandatory fields for `Document Type`, `Sensitivity Level`, and `Retention Date`.
    * **Auto-Inference:** AI Agent pre-fills metadata by scanning the document header during the upload stream.

### 3.3 Documents Page (Scoped File Browser)
* **Version Control:** Every save creates a new immutable version in S3 with a pointer in PostgreSQL.
* **Global/Local Search:** Users can search text *within* files (OCR support). Results are strictly filtered; a Team Lead search will never return a Regional Director's private folder.
* **Breadcrumb Navigation:** `EMEA > Germany > Finance > Accounts Payable`.

### 3.4 Task Page (Operational Tracking)
* **Views:** Toggle between Kanban Board and List View.
* **Logic:** Tasks can be linked directly to Documents.
* **Automation:** When a document is marked "Final," the Agent can automatically move the associated task to "Completed."

### 3.5 User Management (Hierarchical Admin)
* **The "Shadow" Constraint:** Directors can only create or manage users *below* their own scope level. A Country Director cannot elevate a user to Regional Director.

---

## 4. AI Agent Integration (The "Nexus Agent")
The Agent is integrated via a RAG (Retrieval-Augmented Generation) pipeline.



* **Auto-Tagging:** Upon upload, the Agent uses an LLM to categorize the file (e.g., "This is a German Labor Contract") and assigns the appropriate `DepartmentID`.
* **Scoped Summarization:** A user can ask, *"What are the key risks in the Q3 reports for the Nordics?"* The Agent queries only the documents within the user's scope to generate the answer.
* **Task Generation:** The Agent can analyze a "Meeting Minutes" document and automatically populate the Task Page with extracted action items and assigned members.
* **Compliance Guardrail:** The Agent is "Scope-Aware." It will refuse to answer questions about data outside the user's RBAC scope, even if that data exists in the Vector Database.

---

## 5. Tech Stack Recommendations

| Component | Technology | Reasoning |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14 (App Router)** | Server-side rendering for SEO (internal) and fast dashboard performance. |
| **Backend API** | **FastAPI (Python)** | Superior integration with AI libraries (LangChain, LlamaIndex) and high performance. |
| **Primary Database** | **PostgreSQL** | Essential for complex relational RBAC queries and `foreign key` integrity. |
| **Vector Database** | **pgvector** | Allows storage of document embeddings directly within Postgres for unified querying. |
| **Object Storage** | **AWS S3** | Industry standard for scalable, versioned document storage. |
| **Authentication** | **Auth0 / Clerk** | Handles OIDC/SAML for Corporate SSO integration with custom RBAC claims. |
| **LLM Orchestration** | **LangChain** | To manage the RAG flow and Agentic task execution. |

---

## 6. Database Schema Design (Conceptual)
* **`organizations`**: `id, name`
* **`scopes`**: `id, type (Region/Country/Dept/Team), parent_id, org_id`
* **`users`**: `id, email, role, scope_id`
* **`documents`**: `id, s3_url, scope_id, created_by, metadata_json`
* **`tasks`**: `id, title, status, assigned_to (user_id), scope_id`

**Visibility Logic Example:**
`SELECT * FROM documents WHERE scope_id IN (SELECT id FROM get_descendant_scopes(user.scope_id));`