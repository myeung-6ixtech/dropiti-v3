'use client';

import { Modal } from '@/components/ui/modal';
import { XMarkIcon, CurrencyDollarIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface Offer {
  id: string;
  proposingRentPrice: number;
  proposingRentPriceCurrency: string;
  numLeasingMonths: number;
  paymentFrequency: string;
  moveInDate: string;
}

interface FinalCounterOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: Offer | null;
  onSubmit: (counterData: {
    rentalPrice: number;
    leaseDuration: number;
    paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
    moveInDate: string;
    message?: string;
  }) => Promise<void>;
  loading?: boolean;
}

export default function FinalCounterOfferModal({
  isOpen,
  onClose,
  offer,
  onSubmit,
  loading = false
}: FinalCounterOfferModalProps) {
  const [formData, setFormData] = useState({
    rentalPrice: offer?.proposingRentPrice || 0,
    leaseDuration: offer?.numLeasingMonths || 12,
    paymentFrequency: (offer?.paymentFrequency as 'monthly' | 'quarterly' | 'yearly') || 'monthly',
    moveInDate: offer?.moveInDate || new Date().toISOString().split('T')[0],
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.rentalPrice || formData.rentalPrice <= 0) {
      newErrors.rentalPrice = 'Please enter a valid rental price';
    }

    if (!formData.leaseDuration || formData.leaseDuration < 1) {
      newErrors.leaseDuration = 'Please enter a valid lease duration';
    }

    if (!formData.moveInDate) {
      newErrors.moveInDate = 'Please select a move-in date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please check the form for errors.');
      return;
    }

    try {
      await onSubmit(formData);
      alert('Final counter offer submitted successfully!');
      onClose(); // Close modal on successful submission
    } catch (error) {
      console.error('Error submitting final counter offer:', error);
      alert('Failed to submit final counter offer. Please try again.');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'HKD') => {
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!offer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl w-full mx-4">
      <div className="bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Final Counter Offer</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Rental Price */}
              <div>
                <label className="form-label flex items-center text-sm font-medium text-gray-700">
                  <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-500" />
                  Rental Price
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.rentalPrice || ''}
                    onChange={(e) => handleInputChange('rentalPrice', parseFloat(e.target.value) || 0)}
                    placeholder="Enter your offer amount"
                    className={`form-input pl-8 text-sm ${errors.rentalPrice ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                  <CurrencyDollarIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.rentalPrice && (
                  <p className="mt-1 text-xs text-red-600">{errors.rentalPrice}</p>
                )}
              </div>

              {/* Lease Duration */}
              <div>
                <label className="form-label flex items-center text-sm font-medium text-gray-700">
                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                  Lease Duration (months)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.leaseDuration || ''}
                  onChange={(e) => handleInputChange('leaseDuration', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 12"
                  className={`form-input mt-1 text-sm ${errors.leaseDuration ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.leaseDuration && (
                  <p className="mt-1 text-xs text-red-600">{errors.leaseDuration}</p>
                )}
              </div>

              {/* Move-in Date */}
              <div>
                <label className="form-label flex items-center text-sm font-medium text-gray-700">
                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                  Move-in Date
                </label>
                <input
                  type="date"
                  value={formData.moveInDate}
                  onChange={(e) => handleInputChange('moveInDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`form-input mt-1 text-sm ${errors.moveInDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.moveInDate && (
                  <p className="mt-1 text-xs text-red-600">{errors.moveInDate}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Payment Frequency */}
              <div>
                <label className="form-label text-sm font-medium text-gray-700">Payment Frequency</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handleInputChange('paymentFrequency', 'monthly')}
                    className={`p-2 border-2 rounded-md text-left transition-all duration-200 text-xs ${
                      formData.paymentFrequency === 'monthly'
                        ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">Monthly</div>
                    <div className="text-xs text-gray-500">Installments</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleInputChange('paymentFrequency', 'quarterly')}
                    className={`p-2 border-2 rounded-md text-left transition-all duration-200 text-xs ${
                      formData.paymentFrequency === 'quarterly'
                        ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">Quarterly</div>
                    <div className="text-xs text-gray-500">Installments</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange('paymentFrequency', 'yearly')}
                    className={`p-2 border-2 rounded-md text-left transition-all duration-200 text-xs ${
                      formData.paymentFrequency === 'yearly'
                        ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">Yearly</div>
                    <div className="text-xs text-gray-500">Installments</div>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-md p-3">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Offer Summary</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Rental Price:</span>
                    <span className="font-medium">{formatCurrency(formData.rentalPrice || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lease Duration:</span>
                    <span className="font-medium">{formData.leaseDuration} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span className="font-medium capitalize">
                      {formData.paymentFrequency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Move-in:</span>
                    <span className="font-medium">
                      {formData.moveInDate ? new Date(formData.moveInDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="form-button-secondary flex-1 text-sm py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="form-button flex-1 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Final Counter Offer'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
