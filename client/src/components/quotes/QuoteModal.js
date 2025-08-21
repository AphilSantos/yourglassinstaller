import React, { useState } from 'react';
import { X, Send, DollarSign, Clock, FileText, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const QuoteModal = ({ isOpen, onClose, jobId, tradespersonId, jobDetails }) => {
  const [quoteData, setQuoteData] = useState({
    quoteAmount: '',
    estimatedDurationHours: '',
    includesMaterials: false,
    startDateEstimate: '',
    termsConditions: '',
    breakdown: '',
    validUntil: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quoteData.quoteAmount || !quoteData.estimatedDurationHours) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSending(true);
      await axios.post(`/api/tradespeople/${tradespersonId}/quote`, {
        jobId,
        quoteAmount: parseFloat(quoteData.quoteAmount),
        estimatedDurationHours: parseInt(quoteData.estimatedDurationHours),
        includesMaterials: quoteData.includesMaterials,
        startDateEstimate: quoteData.startDateEstimate || null,
        termsConditions: quoteData.termsConditions || null,
        breakdown: quoteData.breakdown || null,
        validUntil: quoteData.validUntil || null
      });
      
      toast.success('Quote sent successfully!');
      onClose();
      // Reset form
      setQuoteData({
        quoteAmount: '',
        estimatedDurationHours: '',
        includesMaterials: false,
        startDateEstimate: '',
        termsConditions: '',
        breakdown: '',
        validUntil: ''
      });
    } catch (error) {
      console.error('Error sending quote:', error);
      toast.error('Error sending quote');
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuoteData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Send Quote</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Job Details */}
        {jobDetails && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Job Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Title:</span> {jobDetails.title}
              </div>
              <div>
                <span className="font-medium">Location:</span> {jobDetails.location}
              </div>
              <div>
                <span className="font-medium">Budget:</span> £{jobDetails.budget_min} - £{jobDetails.budget_max}
              </div>
              <div>
                <span className="font-medium">Timeline:</span> {jobDetails.timeline}
              </div>
            </div>
          </div>
        )}

        {/* Quote Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quote Amount */}
            <div>
              <label htmlFor="quoteAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Quote Amount (£) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="quoteAmount"
                  name="quoteAmount"
                  value={quoteData.quoteAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Estimated Duration */}
            <div>
              <label htmlFor="estimatedDurationHours" className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (hours) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="estimatedDurationHours"
                  name="estimatedDurationHours"
                  value={quoteData.estimatedDurationHours}
                  onChange={handleChange}
                  min="1"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="8"
                />
              </div>
            </div>
          </div>

          {/* Start Date Estimate */}
          <div>
            <label htmlFor="startDateEstimate" className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Start Date
            </label>
            <input
              type="date"
              id="startDateEstimate"
              name="startDateEstimate"
              value={quoteData.startDateEstimate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Valid Until */}
          <div>
            <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 mb-2">
              Quote Valid Until
            </label>
            <input
              type="date"
              id="validUntil"
              name="validUntil"
              value={quoteData.validUntil}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Includes Materials */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includesMaterials"
              name="includesMaterials"
              checked={quoteData.includesMaterials}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includesMaterials" className="ml-2 block text-sm text-gray-900">
              Price includes materials
            </label>
          </div>

          {/* Breakdown */}
          <div>
            <label htmlFor="breakdown" className="block text-sm font-medium text-gray-700 mb-2">
              Cost Breakdown
            </label>
            <textarea
              id="breakdown"
              name="breakdown"
              value={quoteData.breakdown}
              onChange={handleChange}
              rows="3"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Labour: £X, Materials: £Y, Additional costs: £Z"
            />
          </div>

          {/* Terms & Conditions */}
          <div>
            <label htmlFor="termsConditions" className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions
            </label>
            <textarea
              id="termsConditions"
              name="termsConditions"
              value={quoteData.termsConditions}
              onChange={handleChange}
              rows="3"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Payment terms, warranty details, etc."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={sending}
            className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Quote
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuoteModal;
