-- Enhanced Database schema for Your Glass Installer with Tradesperson Features

-- Users table (homeowners)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postcode VARCHAR(10),
    profile_image VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tradespeople table (glass installers)
CREATE TABLE tradespeople (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255),
    trade_category VARCHAR(100) DEFAULT 'Glass Installer',
    
    -- Professional Information
    years_experience INTEGER,
    qualifications TEXT[], -- Array of qualifications
    certifications TEXT[], -- Array of certifications
    trade_associations TEXT[], -- Array of trade associations
    
    -- Business Details
    company_registration VARCHAR(100),
    vat_number VARCHAR(100),
    vat_registered BOOLEAN DEFAULT FALSE,
    public_liability_insurance BOOLEAN DEFAULT FALSE,
    employer_liability_insurance BOOLEAN DEFAULT FALSE,
    insurance_expiry DATE,
    
    -- Verification Status (Mock for now)
    identity_verified BOOLEAN DEFAULT FALSE,
    qualifications_verified BOOLEAN DEFAULT FALSE,
    insurance_verified BOOLEAN DEFAULT FALSE,
    dbs_verified BOOLEAN DEFAULT FALSE,
    financial_verified BOOLEAN DEFAULT FALSE,
    overall_verified BOOLEAN DEFAULT FALSE,
    
    -- Service Areas
    service_postcodes TEXT[], -- Array of postcodes
    service_cities TEXT[], -- Array of cities
    service_counties TEXT[], -- Array of counties
    max_travel_distance INTEGER, -- in miles
    
    -- Availability
    available_hours JSONB, -- Flexible hours structure
    emergency_services BOOLEAN DEFAULT FALSE,
    response_time_hours INTEGER, -- Typical response time
    
    -- Pricing
    hourly_rate DECIMAL(8,2),
    callout_fee DECIMAL(8,2),
    free_quotes BOOLEAN DEFAULT TRUE,
    
    -- Specializations
    specializations TEXT[], -- Array of glass types/skills
    equipment_available TEXT[], -- Array of tools/equipment
    materials_experience TEXT[], -- Array of material brands
    
    -- Quality & Guarantees
    workmanship_guarantee_months INTEGER,
    product_warranty_months INTEGER,
    money_back_guarantee BOOLEAN DEFAULT FALSE,
    
    -- Performance Metrics
    completion_rate DECIMAL(5,2), -- Percentage
    on_time_rate DECIMAL(5,2), -- Percentage
    budget_accuracy_rate DECIMAL(5,2), -- Percentage
    overall_rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    
    -- Communication
    languages TEXT[] DEFAULT ARRAY['English'],
    communication_style VARCHAR(100),
    
    -- Safety & Compliance
    health_safety_certified BOOLEAN DEFAULT FALSE,
    environmental_practices TEXT[],
    regulatory_compliance TEXT[],
    
    -- Business Operations
    team_size INTEGER DEFAULT 1,
    subcontractor_network BOOLEAN DEFAULT FALSE,
    quality_control_processes TEXT[],
    
    -- Profile Status
    profile_complete BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tradesperson Portfolio
CREATE TABLE tradesperson_portfolio (
    id SERIAL PRIMARY KEY,
    tradesperson_id INTEGER REFERENCES tradespeople(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    before_image VARCHAR(255),
    after_image VARCHAR(255),
    additional_images TEXT[], -- Array of image URLs
    project_type VARCHAR(100),
    project_value DECIMAL(10,2),
    completion_date DATE,
    customer_testimonial TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tradesperson Reviews
CREATE TABLE tradesperson_reviews (
    id SERIAL PRIMARY KEY,
    tradesperson_id INTEGER REFERENCES tradespeople(id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    comment TEXT,
    response_from_tradesperson TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tradesperson Availability Calendar
CREATE TABLE tradesperson_availability (
    id SERIAL PRIMARY KEY,
    tradesperson_id INTEGER REFERENCES tradespeople(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT TRUE,
    max_jobs INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tradesperson Quotes
CREATE TABLE tradesperson_quotes (
    id SERIAL PRIMARY KEY,
    tradesperson_id INTEGER REFERENCES tradespeople(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    quote_amount DECIMAL(10,2) NOT NULL,
    breakdown JSONB, -- Detailed cost breakdown
    valid_until DATE,
    terms_conditions TEXT,
    includes_materials BOOLEAN DEFAULT FALSE,
    estimated_duration_hours INTEGER,
    start_date_estimate DATE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined, expired
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table (types of glass installation)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job posts table (enhanced)
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    postcode VARCHAR(10),
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    timeline VARCHAR(100),
    urgency VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, completed, cancelled
    images TEXT[], -- Array of image URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job Applications (tradespeople applying for jobs)
CREATE TABLE job_applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    tradesperson_id INTEGER REFERENCES tradespeople(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'applied', -- applied, shortlisted, hired, declined
    message TEXT,
    proposed_start_date DATE,
    proposed_duration_hours INTEGER,
    proposed_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table (legacy - for future tradespeople integration)
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    installer_id INTEGER, -- Will reference tradespeople table later
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name, description, icon) VALUES
('Kitchen Splashbacks', 'Glass splashbacks for kitchen walls and countertops', 'kitchen'),
('Shower Screens', 'Glass shower doors and screens', 'shower'),
('Balustrades', 'Glass railings and balustrades', 'railing'),
('Mirrors', 'Custom mirrors and glass installations', 'mirror'),
('Glass Doors', 'Internal and external glass doors', 'door'),
('Glass Tables', 'Custom glass table tops', 'table'),
('Other', 'Other glass installation services', 'other');

-- Create indexes for better performance
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_category_id ON jobs(category_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_location ON jobs USING GIN(to_tsvector('english', location));
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_city ON users(city);

-- Tradespeople indexes
CREATE INDEX idx_tradespeople_user_id ON tradespeople(user_id);
CREATE INDEX idx_tradespeople_service_postcodes ON tradespeople USING GIN(service_postcodes);
CREATE INDEX idx_tradespeople_service_cities ON tradespeople USING GIN(service_cities);
CREATE INDEX idx_tradespeople_overall_rating ON tradespeople(overall_rating);
CREATE INDEX idx_tradespeople_is_active ON tradespeople(is_active);
CREATE INDEX idx_tradespeople_featured ON tradespeople(featured);

-- Portfolio and reviews indexes
CREATE INDEX idx_portfolio_tradesperson_id ON tradesperson_portfolio(tradesperson_id);
CREATE INDEX idx_reviews_tradesperson_id ON tradesperson_reviews(tradesperson_id);
CREATE INDEX idx_quotes_tradesperson_id ON tradesperson_quotes(tradesperson_id);
CREATE INDEX idx_quotes_job_id ON tradesperson_quotes(job_id);
CREATE INDEX idx_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_applications_tradesperson_id ON job_applications(tradesperson_id);