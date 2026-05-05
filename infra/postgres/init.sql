CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Region', 'Country', 'Department', 'Team')),
  parent_id UUID REFERENCES scopes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Director', 'Lead', 'Member')),
  scope_id UUID NOT NULL REFERENCES scopes(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_id UUID NOT NULL REFERENCES scopes(id),
  created_by UUID NOT NULL REFERENCES users(id),
  current_version INT NOT NULL DEFAULT 1 CHECK (current_version > 0),
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'doc')),
  title TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  vector_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_num INT NOT NULL CHECK (version_num > 0),
  s3_key TEXT NOT NULL,
  size_bytes BIGINT CHECK (size_bytes >= 0),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_id, version_num)
);

CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  scope_id UUID NOT NULL REFERENCES scopes(id),
  chunk_text TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_id UUID NOT NULL REFERENCES scopes(id),
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION get_all_child_scopes(root_id UUID)
RETURNS TABLE (id UUID)
LANGUAGE SQL
STABLE
AS $$
  WITH RECURSIVE scope_tree AS (
    SELECT s.id
    FROM scopes s
    WHERE s.id = root_id
    UNION ALL
    SELECT c.id
    FROM scopes c
    INNER JOIN scope_tree st ON c.parent_id = st.id
  )
  SELECT id FROM scope_tree;
$$;

CREATE OR REPLACE FUNCTION current_scope_id()
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT current_setting('app.current_user_scope_id', true)::UUID;
$$;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_scope_isolation ON users
  USING (scope_id IN (SELECT id FROM get_all_child_scopes(current_scope_id())));

CREATE POLICY documents_scope_isolation ON documents
  USING (scope_id IN (SELECT id FROM get_all_child_scopes(current_scope_id())));

CREATE POLICY document_versions_scope_isolation ON document_versions
  USING (
    document_id IN (
      SELECT d.id
      FROM documents d
      WHERE d.scope_id IN (SELECT id FROM get_all_child_scopes(current_scope_id()))
    )
  );

CREATE POLICY document_chunks_scope_isolation ON document_chunks
  USING (scope_id IN (SELECT id FROM get_all_child_scopes(current_scope_id())));

CREATE POLICY tasks_scope_isolation ON tasks
  USING (scope_id IN (SELECT id FROM get_all_child_scopes(current_scope_id())));

CREATE INDEX idx_scopes_parent_id ON scopes(parent_id);
CREATE INDEX idx_scopes_org_id ON scopes(org_id);
CREATE INDEX idx_documents_scope_id ON documents(scope_id);
CREATE INDEX idx_tasks_scope_status ON tasks(scope_id, status);
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_chunks_scope_id ON document_chunks(scope_id);
