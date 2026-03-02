-- ==============================================================================
-- DATABASE SCHEMA: EduAI MVP (Enterprise Grade)
-- ARCHITECTURE: Domain-Driven, Scalable, AI-Ready, n8n-Compatible
-- DATABASE: PostgreSQL 14+
-- ==============================================================================

-- 1. EXTENSIONS & SCHEMAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS auth;    -- Identity and Access Management
CREATE SCHEMA IF NOT EXISTS app;     -- Application Core Data
CREATE SCHEMA IF NOT EXISTS ai;      -- AI Personas, Conversations, and Memory
CREATE SCHEMA IF NOT EXISTS system;  -- Workflows, Logs, and Infrastructure

-- 2. DOMAIN: AUTH (Users & Security)
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE auth.users IS 'Core user identity table. Managed by auth service.';

-- 3. DOMAIN: APP (User Profiles & Preferences)
CREATE TABLE app.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    preferences JSONB DEFAULT '{}'::jsonb,
    learning_level VARCHAR(50) DEFAULT 'beginner',
    goals JSONB DEFAULT '[]'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON app.profiles(user_id);
CREATE INDEX idx_profiles_preferences ON app.profiles USING GIN (preferences);

-- 4. DOMAIN: AI (Personas, Conversations, Context)
CREATE TABLE ai.personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    personality TEXT NOT NULL,
    teaching_style VARCHAR(100),
    communication_tone VARCHAR(100),
    complexity_level VARCHAR(50) DEFAULT 'adaptive',
    behavior_rules JSONB DEFAULT '{}'::jsonb,
    base_prompt TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    persona_id UUID NOT NULL REFERENCES ai.personas(id) ON DELETE RESTRICT,
    topic VARCHAR(255),
    active_context JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_conversations_user_id ON ai.conversations(user_id);
CREATE INDEX idx_conversations_persona_id ON ai.conversations(persona_id);
CREATE INDEX idx_conversations_status ON ai.conversations(status);

CREATE TABLE ai.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai.conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'ia', 'system')),
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image', 'file')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON ai.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON ai.messages(created_at);

CREATE TABLE ai.contexts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL UNIQUE REFERENCES ai.conversations(id) ON DELETE CASCADE,
    state JSONB DEFAULT '{}'::jsonb,
    short_memory JSONB DEFAULT '[]'::jsonb,
    long_memory JSONB DEFAULT '{}'::jsonb,
    active_goals JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ai.contexts IS 'Persistent memory and state for AI conversations. Crucial for long-term context retention.';

-- 5. DOMAIN: SYSTEM (Workflows & Observability)
CREATE TABLE system.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- e.g., 'n8n_webhook', 'internal_automation'
    description TEXT,
    version VARCHAR(20) DEFAULT '1.0.0',
    active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE system.logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL, -- 'info', 'error', 'debug', 'audit'
    source VARCHAR(100) NOT NULL, -- 'api', 'worker', 'n8n', 'ia_service'
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logs_type ON system.logs(type);
CREATE INDEX idx_logs_source ON system.logs(source);
CREATE INDEX idx_logs_created_at ON system.logs(created_at);

-- 6. TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION system.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION system.update_timestamp();
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON app.profiles FOR EACH ROW EXECUTE FUNCTION system.update_timestamp();
CREATE TRIGGER trg_personas_updated_at BEFORE UPDATE ON ai.personas FOR EACH ROW EXECUTE FUNCTION system.update_timestamp();
CREATE TRIGGER trg_contexts_updated_at BEFORE UPDATE ON ai.contexts FOR EACH ROW EXECUTE FUNCTION system.update_timestamp();
CREATE TRIGGER trg_workflows_updated_at BEFORE UPDATE ON system.workflows FOR EACH ROW EXECUTE FUNCTION system.update_timestamp();

-- 7. VIEWS FOR n8n & ANALYTICS
CREATE VIEW system.vw_conversation_stats AS
SELECT 
    c.id as conversation_id,
    u.email as user_email,
    p.name as persona_name,
    COUNT(m.id) as total_messages,
    MAX(m.created_at) as last_message_at
FROM ai.conversations c
JOIN auth.users u ON c.user_id = u.id
JOIN ai.personas p ON c.persona_id = p.id
LEFT JOIN ai.messages m ON m.conversation_id = c.id
GROUP BY c.id, u.email, p.name;
