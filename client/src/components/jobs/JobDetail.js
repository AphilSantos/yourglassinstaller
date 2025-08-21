import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, DollarSign, Clock, User, Calendar, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(`/api/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      setError('Job not found or you do not have permission to view it');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Kitchen Splashbacks': '🏠',
      'Shower Screens': '🚿',
      'Balustrades': '🏗️',
      'Mirrors': '🪞',
      'Glass Doors': '🚪',
      'Glass Tables': '🪑',
      'Other': '✨'
    };
    return iconMap[categoryName] || '✨';
  };

  const formatBudget = (min, max) => {
    if (min && max) {
      return `£${min} - £${max}`;
    } else if (min) {
      return `From £${min}`;
    } else if (max) {
      return `Up to £${max}`;
    }
    return 'Price on request';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'open': { color: 'bg-green-100 text-green-800', text: 'Open for Quotes' },
      'in_progress': { color: 'bg-blue-100 text-blue-800', text: 'In Progress' },
      'completed': { color: 'bg-gray-100 text-gray-800', text: 'Completed' },
      'cancelled': { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig['open'];

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/discovery"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Discovery
          </Link>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/discovery"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Discovery
          </Link>
        </div>

        {/* Job Header */}
        <div className="glass-effect rounded-xl p-8 shadow-xl border border-white/20 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{getCategoryIcon(job.category_name)}</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h1>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(job.status)}
                  <span className="text-sm text-gray-500">
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="text-gray-900">{job.location}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Budget</p>
                <p className="text-gray-900">{formatBudget(job.budget_min, job.budget_max)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Timeline</p>
                <p className="text-gray-900">{job.timeline}</p>
              </div>
            </div>
          </div>

          {/* Posted By */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {job.first_name?.charAt(0)}{job.last_name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Posted by</p>
              <p className="text-gray-900">{job.first_name} {job.last_name}</p>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="glass-effect rounded-xl p-8 shadow-xl border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Description</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>
        </div>

        {/* Project Images */}
        {job.images && job.images.length > 0 && (
          <div className="glass-effect rounded-xl p-8 shadow-xl border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Photos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {job.images.map((image, index) => (
                <div key={index} className="aspect-w-16 aspect-h-9">
                  <img
                    src={image}
                    alt={`Project ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="glass-effect rounded-xl p-8 shadow-xl border border-white/20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Interested in this project?</h2>
            <p className="text-gray-600 mb-6">
              {job.status === 'open' 
                ? 'This project is currently open for quotes. Contact the homeowner to discuss your proposal.'
                : 'This project is currently not accepting new quotes.'
              }
            </p>
            
            {job.status === 'open' && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Contact Homeowner
                </button>
                <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200">
                  Send Quote
                </button>
              </div>
            )}

            {job.status !== 'open' && (
              <div className="text-center py-4">
                <p className="text-gray-500">This project is no longer accepting quotes.</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team or browse more projects in our{' '}
            <Link to="/discovery" className="text-blue-600 hover:text-blue-700">
              Discovery section
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
