import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  MessageSquare, 
  FileText, 
  Star, 
  Eye, 
  Send,
  Briefcase,
  TrendingUp,
  Award,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  Quote,
  FolderOpen
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import MessageModal from '../messaging/MessageModal';
import QuoteModal from '../quotes/QuoteModal';

const TradespersonDashboard = () => {
  const { user } = useAuth();
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myQuotes, setMyQuotes] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [stats, setStats] = useState({
    totalQuotes: 0,
    activeQuotes: 0,
    completedJobs: 0,
    totalEarnings: 0
  });
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    category: '',
    budget: '',
    urgency: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch available jobs
      const jobsResponse = await axios.get('/api/jobs');
      setAvailableJobs(jobsResponse.data);

      // Fetch tradesperson's quotes
      const quotesResponse = await axios.get(`/api/tradespeople/${user.tradesperson_id}/quotes`);
      setMyQuotes(quotesResponse.data);

      // Fetch tradesperson's applications
      const applicationsResponse = await axios.get(`/api/tradespeople/${user.tradesperson_id}/applications`);
      setMyApplications(applicationsResponse.data);

      // Calculate stats
      const totalQuotes = quotesResponse.data.length;
      const activeQuotes = quotesResponse.data.filter(q => q.status === 'pending' || q.status === 'accepted').length;
      const completedJobs = applicationsResponse.data.filter(a => a.status === 'completed').length;
      const totalEarnings = quotesResponse.data
        .filter(q => q.status === 'accepted')
        .reduce((sum, q) => sum + parseFloat(q.quote_amount || 0), 0);

      setStats({ totalQuotes, activeQuotes, completedJobs, totalEarnings });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const openMessageModal = (job) => {
    setSelectedJob(job);
    setMessageModalOpen(true);
  };

  const closeMessageModal = () => {
    setMessageModalOpen(false);
    setSelectedJob(null);
  };

  const openQuoteModal = (job) => {
    setSelectedJob(job);
    setQuoteModalOpen(true);
  };

  const closeQuoteModal = () => {
    setQuoteModalOpen(false);
    setSelectedJob(null);
  };

  const applyForJob = async (jobId, message) => {
    try {
      await axios.post(`/api/tradespeople/${user.tradesperson_id}/apply`, {
        jobId,
        message: message || 'I am interested in this job and would like to provide a quote.'
      });
      toast.success('Application submitted successfully!');
      fetchDashboardData();
    } catch (error) {
      toast.error('Error submitting application');
    }
  };

  const sendQuote = async (jobId, quoteData) => {
    try {
      await axios.post(`/api/tradespeople/${user.tradesperson_id}/quote`, {
        jobId,
        ...quoteData
      });
      toast.success('Quote sent successfully!');
      fetchDashboardData();
    } catch (error) {
      toast.error('Error sending quote');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'open': { color: 'bg-green-100 text-green-800', text: 'Open' },
      'in_progress': { color: 'bg-blue-100 text-blue-800', text: 'In Progress' },
      'completed': { color: 'bg-gray-100 text-gray-800', text: 'Completed' },
      'urgent': { color: 'bg-red-100 text-red-800', text: 'Urgent' }
    };

    const config = statusConfig[status] || statusConfig['open'];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-lg text-gray-600">
                Browse available jobs, manage your quotes, and grow your business
              </p>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <Link
                to="/portfolio"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                <FolderOpen className="h-5 w-5 mr-2" />
                Portfolio
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Briefcase className="h-5 w-5 mr-2" />
                Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-effect rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Quotes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuotes}</p>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Quotes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeQuotes}</p>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedJobs}</p>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">£{stats.totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass-effect rounded-xl p-6 shadow-lg border border-white/20 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Find Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Location"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchFilters.location}
              onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
            />
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchFilters.category}
              onChange={(e) => setSearchFilters({...searchFilters, category: e.target.value})}
            >
              <option value="">All Categories</option>
              <option value="Kitchen Splashbacks">Kitchen Splashbacks</option>
              <option value="Shower Screens">Shower Screens</option>
              <option value="Balustrades">Balustrades</option>
              <option value="Mirrors">Mirrors</option>
              <option value="Glass Doors">Glass Doors</option>
              <option value="Glass Tables">Glass Tables</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchFilters.budget}
              onChange={(e) => setSearchFilters({...searchFilters, budget: e.target.value})}
            >
              <option value="">All Budgets</option>
              <option value="0-500">Under £500</option>
              <option value="500-1000">£500 - £1,000</option>
              <option value="1000-5000">£1,000 - £5,000</option>
              <option value="5000+">Over £5,000</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              <Search className="h-5 w-5 inline mr-2" />
              Search
            </button>
          </div>
        </div>

        {/* Available Jobs */}
        <div className="glass-effect rounded-xl p-6 shadow-xl border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Jobs</h2>
            <span className="text-gray-600">
              {availableJobs.length} job{availableJobs.length !== 1 ? 's' : ''} available
            </span>
          </div>

          {availableJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs available</h3>
              <p className="text-gray-600">
                Check back later for new glass installation projects.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {availableJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-lg shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getCategoryIcon(job.category_name)}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {job.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(job.status)}
                              {job.urgency === 'urgent' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Urgent
                                </span>
                              )}
                              <span className="text-sm text-gray-500">
                                Posted {new Date(job.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-2" />
                          {job.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign className="h-4 w-4 mr-2" />
                          {formatBudget(job.budget_min, job.budget_max)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-2" />
                          {job.timeline}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          {job.postcode}
                        </div>
                      </div>

                      {/* Homeowner Info */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Homeowner Details</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="font-medium">Name:</span>
                            <span className="ml-1">{job.user_first_name} {job.user_last_name}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            <span>{job.user_phone}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            <span>{job.user_email}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 mt-4 lg:mt-0">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                      <button
                        onClick={() => openMessageModal(job)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </button>
                      <button
                        onClick={() => applyForJob(job.id)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Apply
                      </button>
                      <button
                        onClick={() => openQuoteModal(job)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                      >
                        <Quote className="h-4 w-4 mr-2" />
                        Send Quote
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Quotes and Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Quotes */}
          <div className="glass-effect rounded-xl p-6 shadow-lg border border-white/20">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Quotes</h2>
            {myQuotes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No quotes sent yet</p>
            ) : (
              <div className="space-y-3">
                {myQuotes.slice(0, 5).map((quote) => (
                  <div key={quote.id} className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{quote.job_title}</h4>
                        <p className="text-sm text-gray-600">£{quote.quote_amount}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {quote.status}
                        </span>
                      </div>
                      <Link
                        to={`/quotes/${quote.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Applications */}
          <div className="glass-effect rounded-xl p-6 shadow-lg border border-white/20">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Applications</h2>
            {myApplications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No applications yet</p>
            ) : (
              <div className="space-y-3">
                {myApplications.slice(0, 5).map((application) => (
                  <div key={application.id} className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{application.job_title}</h4>
                        <p className="text-sm text-gray-600">Applied {new Date(application.created_at).toLocaleDateString()}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {application.status}
                        </span>
                      </div>
                      <Link
                        to={`/applications/${application.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {selectedJob && (
        <MessageModal
          isOpen={messageModalOpen}
          onClose={closeMessageModal}
          jobId={selectedJob.id}
          tradespersonId={user.tradesperson_id}
          homeownerId={selectedJob.user_id}
          currentUserId={user.id}
          userType="tradesperson"
        />
      )}

      {/* Quote Modal */}
      {selectedJob && (
        <QuoteModal
          isOpen={quoteModalOpen}
          onClose={closeQuoteModal}
          jobId={selectedJob.id}
          tradespersonId={user.tradesperson_id}
          jobDetails={selectedJob}
        />
      )}
    </div>
  );
};

export default TradespersonDashboard;
