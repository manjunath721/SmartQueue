-- ==============================================================================
-- SMART QUEUE: DIGITAL CUSTOMER QUEUE & SERVICE PLATFORM
-- PostgreSQL Database Schema Definition
-- ==============================================================================

-- Drop tables if existing (for fresh recreation)
DROP TABLE IF EXISTS staff_service_assignments CASCADE;
DROP TABLE IF EXISTS queue_tokens CASCADE;
DROP TABLE IF EXISTS queue_counters CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1. ROLES TABLE
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(150)
);

-- 2. USERS TABLE
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(25),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. USER_ROLES JOIN TABLE
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 4. SERVICES TABLE
CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(15) NOT NULL UNIQUE,
    prefix VARCHAR(5) NOT NULL,
    description TEXT,
    avg_duration_minutes INTEGER NOT NULL DEFAULT 15,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. CUSTOMERS TABLE
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(name);

-- 6. QUEUE COUNTERS TABLE (For concurrency-safe sequential token numbers)
CREATE TABLE queue_counters (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    counter_date DATE NOT NULL,
    last_token_number INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT uq_service_counter_date UNIQUE (service_id, counter_date)
);

-- 7. QUEUE TOKENS TABLE
CREATE TABLE queue_tokens (
    id BIGSERIAL PRIMARY KEY,
    token_number VARCHAR(20) NOT NULL,
    sequence_number INTEGER NOT NULL,
    tracking_id VARCHAR(64) NOT NULL UNIQUE,
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    served_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    counter_name VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING',
    cancellation_reason VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    called_at TIMESTAMP WITHOUT TIME ZONE,
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    cancelled_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX idx_token_tracking_id ON queue_tokens(tracking_id);
CREATE INDEX idx_token_service_status ON queue_tokens(service_id, status, sequence_number);
CREATE INDEX idx_token_created_at ON queue_tokens(created_at);
CREATE INDEX idx_token_status ON queue_tokens(status);

-- 8. STAFF SERVICE ASSIGNMENTS TABLE
CREATE TABLE staff_service_assignments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    counter_name VARCHAR(50),
    assigned_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_service_assignment UNIQUE (user_id, service_id)
);
