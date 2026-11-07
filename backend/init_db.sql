-- CivicPulse AI - PostgreSQL & PostGIS Database Schema
-- Provides all 13 normalized tables with spatial indexes and constraints

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'citizen',
    address TEXT,
    city VARCHAR(100) DEFAULT 'Bengaluru',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. departments
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    head_name VARCHAR(120) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. department_officers
CREATE TABLE IF NOT EXISTS department_officers (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id VARCHAR(64) NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    designation VARCHAR(100) NOT NULL,
    zone VARCHAR(100),
    active_tasks INT DEFAULT 0
);

-- 4. locations (Spatial)
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(64) PRIMARY KEY,
    address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Bengaluru',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    landmark VARCHAR(200),
    postal_code VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_locations_geom ON locations USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_locations_lat_lon ON locations(latitude, longitude);

-- 2. complaints
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(64) PRIMARY KEY,
    complaint_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    priority VARCHAR(32) DEFAULT 'Medium',
    priority_score INT DEFAULT 50,
    priority_reasoning TEXT,
    status VARCHAR(32) DEFAULT 'REPORTED',
    citizen_id VARCHAR(64) NOT NULL REFERENCES users(id),
    location_id VARCHAR(64) NOT NULL REFERENCES locations(id),
    department_id VARCHAR(64) REFERENCES departments(id),
    assigned_officer_id VARCHAR(64) REFERENCES users(id),
    support_count INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);

-- 3. complaint_images
CREATE TABLE IF NOT EXISTS complaint_images (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64) NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    file_size_bytes INT,
    mime_type VARCHAR(50) DEFAULT 'image/jpeg',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ai_analysis
CREATE TABLE IF NOT EXISTS ai_analysis (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64) UNIQUE NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    detected_issue VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    suggested_severity VARCHAR(50) NOT NULL,
    explanation TEXT NOT NULL,
    safety_risk VARCHAR(20) DEFAULT 'Medium',
    bounding_boxes_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. assignments
CREATE TABLE IF NOT EXISTS assignments (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64) NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    department_id VARCHAR(64) NOT NULL REFERENCES departments(id),
    assigned_by_user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    assigned_to_officer_id VARCHAR(64) REFERENCES users(id),
    notes TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. complaint_history
CREATE TABLE IF NOT EXISTS complaint_history (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64) NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    previous_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_by_user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    comments TEXT,
    supporting_photo_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. duplicate_reports
CREATE TABLE IF NOT EXISTS duplicate_reports (
    id VARCHAR(64) PRIMARY KEY,
    original_complaint_id VARCHAR(64) NOT NULL REFERENCES complaints(id),
    potential_duplicate_id VARCHAR(64) NOT NULL REFERENCES complaints(id),
    similarity_score DOUBLE PRECISION NOT NULL,
    distance_meters DOUBLE PRECISION NOT NULL,
    action_taken VARCHAR(50) DEFAULT 'PROCEEDED_SEPARATE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    complaint_id VARCHAR(64) REFERENCES complaints(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'status_change',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. complaint_support
CREATE TABLE IF NOT EXISTS complaint_support (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64) NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    supported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_complaint_support UNIQUE (complaint_id, user_id)
);

-- 13. resolution_verification
CREATE TABLE IF NOT EXISTS resolution_verification (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64) UNIQUE NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    before_image_url TEXT NOT NULL,
    after_image_url TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL,
    verification_notes TEXT,
    verified_by_user_id VARCHAR(64) REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
