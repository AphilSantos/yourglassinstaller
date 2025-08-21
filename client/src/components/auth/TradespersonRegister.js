import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TradespersonRegister = () => {
  const { register, loadUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // User details
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',

    // Tradesperson details
    businessName: '',
    yearsExperience: '',
    qualifications: '',
    certifications: '',
    serviceCities: '',
    servicePostcodes: '',
    hourlyRate: '',
    calloutFee: '',
    specializations: '',
    workmanshipGuaranteeMonths: '12',
    productWarrantyMonths: '24'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // First register as a user
      const userResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postcode: formData.postcode
        })
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.msg || 'Registration failed');
      }

      const { token } = await userResponse.json();
      localStorage.setItem('token', token);

      // Then register as tradesperson
      const tradespersonData = {
        businessName: formData.businessName,
        yearsExperience: parseInt(formData.yearsExperience),
        qualifications: formData.qualifications.split(',').map(q => q.trim()).filter(q => q),
        certifications: formData.certifications.split(',').map(c => c.trim()).filter(c => c),
        serviceCities: formData.serviceCities.split(',').map(c => c.trim()).filter(c => c),
        servicePostcodes: formData.servicePostcodes.split(',').map(p => p.trim()).filter(p => p),
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        calloutFee: formData.calloutFee ? parseFloat(formData.calloutFee) : null,
        specializations: formData.specializations.split(',').map(s => s.trim()).filter(s => s),
        workmanshipGuaranteeMonths: parseInt(formData.workmanshipGuaranteeMonths),
        productWarrantyMonths: parseInt(formData.productWarrantyMonths)
      };

      const tradespersonResponse = await fetch('/api/tradespeople/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(tradespersonData)
      });

      if (!tradespersonResponse.ok) {
        const errorData = await tradespersonResponse.json();
        throw new Error(errorData.msg || 'Tradesperson registration failed');
      }

      // Set the auth token for future requests
      axios.defaults.headers.common['x-auth-token'] = token;
      
      // Refresh user data to get tradesperson_id
      await loadUser();
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign up as a Glass Installer
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join our network of professional glass installers
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="postcode" className="block text-sm font-medium text-gray-700">
                    Postcode *
                  </label>
                  <input
                    id="postcode"
                    name="postcode"
                    type="text"
                    required
                    value={formData.postcode}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
              
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                  Business Name *
                </label>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700">
                  Years of Experience *
                </label>
                <input
                  id="yearsExperience"
                  name="yearsExperience"
                  type="number"
                  min="0"
                  required
                  value={formData.yearsExperience}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700">
                  Qualifications (comma-separated)
                </label>
                <input
                  id="qualifications"
                  name="qualifications"
                  type="text"
                  placeholder="NVQ Level 2, City & Guilds"
                  value={formData.qualifications}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="certifications" className="block text-sm font-medium text-gray-700">
                  Certifications (comma-separated)
                </label>
                <input
                  id="certifications"
                  name="certifications"
                  type="text"
                  placeholder="Health & Safety, First Aid"
                  value={formData.certifications}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="serviceCities" className="block text-sm font-medium text-gray-700">
                  Service Cities (comma-separated)
                </label>
                <input
                  id="serviceCities"
                  name="serviceCities"
                  type="text"
                  placeholder="London, Birmingham, Manchester"
                  value={formData.serviceCities}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="servicePostcodes" className="block text-sm font-medium text-gray-700">
                  Service Postcodes (comma-separated)
                </label>
                <input
                  id="servicePostcodes"
                  name="servicePostcodes"
                  type="text"
                  placeholder="SW1, W1, NW1"
                  value={formData.servicePostcodes}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
                    Hourly Rate (£)
                  </label>
                  <input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="calloutFee" className="block text-sm font-medium text-gray-700">
                    Callout Fee (£)
                  </label>
                  <input
                    id="calloutFee"
                    name="calloutFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.calloutFee}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="specializations" className="block text-sm font-medium text-gray-700">
                  Specializations (comma-separated)
                </label>
                <input
                  id="specializations"
                  name="specializations"
                  type="text"
                  placeholder="Kitchen Splashbacks, Shower Screens, Mirrors"
                  value={formData.specializations}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="workmanshipGuaranteeMonths" className="block text-sm font-medium text-gray-700">
                    Workmanship Guarantee (months)
                  </label>
                  <input
                    id="workmanshipGuaranteeMonths"
                    name="workmanshipGuaranteeMonths"
                    type="number"
                    min="0"
                    value={formData.workmanshipGuaranteeMonths}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="productWarrantyMonths" className="block text-sm font-medium text-gray-700">
                    Product Warranty (months)
                  </label>
                  <input
                    id="productWarrantyMonths"
                    name="productWarrantyMonths"
                    type="number"
                    min="0"
                    value={formData.productWarrantyMonths}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Register as a customer instead
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="group relative w-48 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up as Glass Installer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradespersonRegister;
