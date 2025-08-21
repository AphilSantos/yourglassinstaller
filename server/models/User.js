const { Pool } = require('pg');

class User {
  constructor(db) {
    this.db = db;
  }

  // Create a new user
  async create(userData) {
    const {
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      address,
      city,
      postcode
    } = userData;

    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, phone, address, city, postcode)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, first_name, last_name, phone, city, postcode, created_at
    `;

    const values = [email, passwordHash, firstName, lastName, phone, address, city, postcode];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  // Find user by email
  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.db.query(query, [email]);
    return result.rows[0];
  }

  // Find user by ID
  async findById(id) {
    const query = `
      SELECT id, email, first_name, last_name, phone, address, city, postcode, 
             profile_image, is_verified, created_at, updated_at
      FROM users WHERE id = $1
    `;
    const result = await this.db.query(query, [id]);
    return result.rows[0];
  }

  // Update user profile
  async updateProfile(id, updateData) {
    const {
      firstName,
      lastName,
      phone,
      address,
      city,
      postcode,
      profileImage
    } = updateData;

    const query = `
      UPDATE users 
      SET first_name = $2, last_name = $3, phone = $4, address = $5, 
          city = $6, postcode = $7, profile_image = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, first_name, last_name, phone, city, postcode, profile_image, updated_at
    `;

    const values = [id, firstName, lastName, phone, address, city, postcode, profileImage];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  // Verify user
  async verifyUser(id) {
    const query = `
      UPDATE users 
      SET is_verified = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, is_verified
    `;
    const result = await this.db.query(query, [id]);
    return result.rows[0];
  }

  // Delete user
  async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await this.db.query(query, [id]);
    return result.rows[0];
  }

  // Get user with tradesperson profile if exists
  async findWithTradespersonProfile(id) {
    const query = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.phone, u.address, 
        u.city, u.postcode, u.profile_image, u.is_verified, u.created_at,
        t.id as tradesperson_id, t.business_name, t.trade_category, 
        t.years_experience, t.overall_rating, t.total_reviews, t.is_active,
        t.overall_verified, t.profile_complete
      FROM users u
      LEFT JOIN tradespeople t ON u.id = t.user_id
      WHERE u.id = $1
    `;
    const result = await this.db.query(query, [id]);
    return result.rows[0];
  }

  // Search users by location
  async searchByLocation(city, postcode) {
    let query = `
      SELECT id, first_name, last_name, city, postcode, profile_image, created_at
      FROM users 
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (city) {
      paramCount++;
      query += ` AND city ILIKE $${paramCount}`;
      values.push(`%${city}%`);
    }

    if (postcode) {
      paramCount++;
      query += ` AND postcode ILIKE $${paramCount}`;
      values.push(`%${postcode}%`);
    }

    query += ' ORDER BY created_at DESC';
    
    const result = await this.db.query(query, values);
    return result.rows;
  }
}

class Tradesperson {
  constructor(db) {
    this.db = db;
  }

  // Create tradesperson profile
  async create(tradespersonData) {
    const {
      userId,
      businessName,
      yearsExperience,
      qualifications = [],
      certifications = [],
      tradeAssociations = [],
      companyRegistration,
      vatNumber,
      vatRegistered = false,
      publicLiabilityInsurance = false,
      employerLiabilityInsurance = false,
      insuranceExpiry,
      servicePostcodes = [],
      serviceCities = [],
      serviceCounties = [],
      maxTravelDistance,
      hourlyRate,
      calloutFee,
      specializations = [],
      workmanshipGuaranteeMonths,
      productWarrantyMonths
    } = tradespersonData;

    const query = `
      INSERT INTO tradespeople (
        user_id, business_name, years_experience, qualifications, certifications,
        trade_associations, company_registration, vat_number, vat_registered,
        public_liability_insurance, employer_liability_insurance, insurance_expiry,
        service_postcodes, service_cities, service_counties, max_travel_distance,
        hourly_rate, callout_fee, specializations, workmanship_guarantee_months,
        product_warranty_months
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `;

    const values = [
      userId, businessName, yearsExperience, qualifications, certifications,
      tradeAssociations, companyRegistration, vatNumber, vatRegistered,
      publicLiabilityInsurance, employerLiabilityInsurance, insuranceExpiry,
      servicePostcodes, serviceCities, serviceCounties, maxTravelDistance,
      hourlyRate, calloutFee, specializations, workmanshipGuaranteeMonths,
      productWarrantyMonths
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  // Find tradesperson by user ID
  async findByUserId(userId) {
    const query = `
      SELECT t.*, u.first_name, u.last_name, u.email, u.phone, u.profile_image
      FROM tradespeople t
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = $1
    `;
    const result = await this.db.query(query, [userId]);
    return result.rows[0];
  }

  // Find tradesperson by ID
  async findById(id) {
    const query = `
      SELECT t.*, u.first_name, u.last_name, u.email, u.phone, u.profile_image
      FROM tradespeople t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = $1
    `;
    const result = await this.db.query(query, [id]);
    return result.rows[0];
  }

  // Search tradespeople by location and criteria
  async search(criteria) {
    const {
      city,
      postcode,
      maxDistance,
      minRating,
      verified,
      emergencyServices,
      maxHourlyRate,
      specialization
    } = criteria;

    let query = `
      SELECT t.*, u.first_name, u.last_name, u.profile_image,
             AVG(tr.rating) as avg_rating, COUNT(tr.id) as review_count
      FROM tradespeople t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN tradesperson_reviews tr ON t.id = tr.tradesperson_id
      WHERE t.is_active = true
    `;

    const values = [];
    let paramCount = 0;

    if (city) {
      paramCount++;
      query += ` AND ($${paramCount} = ANY(t.service_cities) OR u.city ILIKE $${paramCount + 1})`;
      values.push(city, `%${city}%`);
      paramCount++;
    }

    if (postcode) {
      paramCount++;
      query += ` AND $${paramCount} = ANY(t.service_postcodes)`;
      values.push(postcode);
    }

    if (minRating) {
      paramCount++;
      query += ` AND t.overall_rating >= $${paramCount}`;
      values.push(minRating);
    }

    if (verified) {
      query += ` AND t.overall_verified = true`;
    }

    if (emergencyServices) {
      query += ` AND t.emergency_services = true`;
    }

    if (maxHourlyRate) {
      paramCount++;
      query += ` AND t.hourly_rate <= $${paramCount}`;
      values.push(maxHourlyRate);
    }

    if (specialization) {
      paramCount++;
      query += ` AND $${paramCount} = ANY(t.specializations)`;
      values.push(specialization);
    }

    query += `
      GROUP BY t.id, u.first_name, u.last_name, u.profile_image
      ORDER BY t.overall_rating DESC, t.total_reviews DESC
    `;

    const result = await this.db.query(query, values);
    return result.rows;
  }

  // Update tradesperson profile
  async updateProfile(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Add id as first parameter
    values.push(id);

    // Build dynamic query based on provided fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Add updated_at
    paramCount++;
    fields.push(`updated_at = $${paramCount}`);
    values.push(new Date());

    const query = `
      UPDATE tradespeople 
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  // Mock verification methods
  async mockVerifyIdentity(id) {
    return this.updateProfile(id, { identity_verified: true });
  }

  async mockVerifyQualifications(id) {
    return this.updateProfile(id, { qualifications_verified: true });
  }

  async mockVerifyInsurance(id) {
    return this.updateProfile(id, { insurance_verified: true });
  }

  async mockVerifyDBS(id) {
    return this.updateProfile(id, { dbs_verified: true });
  }

  async mockVerifyFinancial(id) {
    return this.updateProfile(id, { financial_verified: true });
  }

  async updateOverallVerification(id) {
    const tradesperson = await this.findById(id);
    const overallVerified = 
      tradesperson.identity_verified &&
      tradesperson.qualifications_verified &&
      tradesperson.insurance_verified &&
      tradesperson.dbs_verified &&
      tradesperson.financial_verified;

    return this.updateProfile(id, { overall_verified: overallVerified });
  }

  // Get featured tradespeople
  async getFeatured(limit = 6) {
    const query = `
      SELECT t.*, u.first_name, u.last_name, u.profile_image
      FROM tradespeople t
      JOIN users u ON t.user_id = u.id
      WHERE t.is_active = true AND t.featured = true
      ORDER BY t.overall_rating DESC, t.total_reviews DESC
      LIMIT $1
    `;
    const result = await this.db.query(query, [limit]);
    return result.rows;
  }

  // Get portfolio for tradesperson
  async getPortfolio(tradespersonId) {
    const query = `
      SELECT * FROM tradesperson_portfolio
      WHERE tradesperson_id = $1
      ORDER BY completion_date DESC
    `;
    const result = await this.db.query(query, [tradespersonId]);
    return result.rows;
  }

  // Get reviews for tradesperson
  async getReviews(tradespersonId, limit = 10, offset = 0) {
    const query = `
      SELECT tr.*, u.first_name, u.last_name
      FROM tradesperson_reviews tr
      JOIN users u ON tr.customer_id = u.id
      WHERE tr.tradesperson_id = $1
      ORDER BY tr.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await this.db.query(query, [tradespersonId, limit, offset]);
    return result.rows;
  }

  // Update rating after new review
  async updateRating(tradespersonId) {
    const query = `
      UPDATE tradespeople 
      SET 
        overall_rating = (
          SELECT ROUND(AVG(rating)::numeric, 2)
          FROM tradesperson_reviews 
          WHERE tradesperson_id = $1
        ),
        total_reviews = (
          SELECT COUNT(*)
          FROM tradesperson_reviews 
          WHERE tradesperson_id = $1
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING overall_rating, total_reviews
    `;
    const result = await this.db.query(query, [tradespersonId]);
    return result.rows[0];
  }
}

module.exports = { User, Tradesperson };