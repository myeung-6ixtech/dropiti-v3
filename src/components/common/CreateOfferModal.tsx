'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { 
  CurrencyDollarIcon, 
  CalendarIcon, 
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: string;
  currentPrice?: number;
  onOfferSubmit?: (offerData: OfferData) => void;
}

interface OfferData {
  rentalPrice: number;
  leaseDuration: number;
  paymentFrequency: 'full' | 'monthly';
  paymentInterval?: number;
  moveInDate: string;
}

export default function CreateOfferModal({ 
  isOpen, 
  onClose, 
  propertyId, 
  currentPrice = 0,
  onOfferSubmit 
}: CreateOfferModalProps) {
  const [offerData, setOfferData] = useState<OfferData>({
    rentalPrice: currentPrice,
    leaseDuration: 12,
    paymentFrequency: 'monthly',
    paymentInterval: 1,
    moveInDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Partial<OfferData>>({});

  const handleInputChange = (field: keyof OfferData, value: any) => {
    setOfferData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<OfferData> = {};

    if (!offerData.rentalPrice || offerData.rentalPrice <= 0) {
      newErrors.rentalPrice = 'Please enter a valid rental price';
    }

    if (!offerData.leaseDuration || offerData.leaseDuration <= 0) {
      newErrors.leaseDuration = 'Please enter a valid lease duration';
    }

    if (!offerData.moveInDate) {
      newErrors.moveInDate = 'Please select a move-in date';
    }

    if (offerData.paymentFrequency === 'monthly' && (!offerData.paymentInterval || offerData.paymentInterval <= 0)) {
      newErrors.paymentInterval = 'Please enter a valid payment interval';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (onOfferSubmit) {
        onOfferSubmit(offerData);
      }
      onClose();
      // Reset form
      setOfferData({
        rentalPrice: currentPrice,
        leaseDuration: 12,
        paymentFrequency: 'monthly',
        paymentInterval: 1,
        moveInDate: new Date().toISOString().split('T')[0],
      });
      setErrors({});
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-full mx-4">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Create Offer</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rental Price */}
          <div>
            <label className="form-label flex items-center">
              <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-500" />
              Rental Price
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="100"
                value={offerData.rentalPrice || ''}
                onChange={(e) => handleInputChange('rentalPrice', parseFloat(e.target.value) || 0)}
                placeholder="Enter your offer amount"
                className={`form-input pl-10 ${errors.rentalPrice ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {errors.rentalPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.rentalPrice}</p>
            )}
            {currentPrice > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                Current asking price: {formatCurrency(currentPrice)}
              </p>
            )}
          </div>

          {/* Lease Duration */}
          <div>
            <label className="form-label flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
              Lease Duration (in months)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={offerData.leaseDuration || ''}
              onChange={(e) => handleInputChange('leaseDuration', parseInt(e.target.value) || 0)}
              placeholder="e.g., 12"
              className={`form-input ${errors.leaseDuration ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.leaseDuration && (
              <p className="mt-1 text-sm text-red-600">{errors.leaseDuration}</p>
            )}
          </div>

          {/* Payment Frequency */}
          <div>
            <label className="form-label">Payment Frequency</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('paymentFrequency', 'full')}
                className={`p-3 border-2 rounded-lg text-left transition-all duration-200 ${
                  offerData.paymentFrequency === 'full'
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-opacity-20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="font-medium text-gray-900">Full Payment</div>
                <div className="text-sm text-gray-500">Pay entire lease upfront</div>
              </button>
              
              <button
                type="button"
                onClick={() => handleInputChange('paymentFrequency', 'monthly')}
                className={`p-3 border-2 rounded-lg text-left transition-all duration-200 ${
                  offerData.paymentFrequency === 'monthly'
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-opacity-20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="font-medium text-gray-900">Monthly Payments</div>
                <div className="text-sm text-gray-500">Pay in installments</div>
              </button>
            </div>
          </div>

          {/* Payment Interval (only for monthly payments) */}
          {offerData.paymentFrequency === 'monthly' && (
            <div>
              <label className="form-label flex items-center">
                <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
                Payment Interval
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={offerData.paymentInterval || ''}
                  onChange={(e) => handleInputChange('paymentInterval', parseInt(e.target.value) || 1)}
                  placeholder="1"
                  className={`form-input flex-1 ${errors.paymentInterval ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                <span className="text-gray-600">months</span>
              </div>
              {errors.paymentInterval && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentInterval}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Pay every {offerData.paymentInterval || 1} month{offerData.paymentInterval !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Move-in Date */}
          <div>
            <label className="form-label flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
              Move-in Date
            </label>
            <input
              type="date"
              value={offerData.moveInDate}
              onChange={(e) => handleInputChange('moveInDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`form-input ${errors.moveInDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.moveInDate && (
              <p className="mt-1 text-sm text-red-600">{errors.moveInDate}</p>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Offer Summary</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Rental Price:</span>
                <span className="font-medium">{formatCurrency(offerData.rentalPrice || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Lease Duration:</span>
                <span className="font-medium">{offerData.leaseDuration} months</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Frequency:</span>
                <span className="font-medium capitalize">
                  {offerData.paymentFrequency === 'full' ? 'Full Payment' : 
                   `Monthly (every ${offerData.paymentInterval} month${offerData.paymentInterval !== 1 ? 's' : ''})`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Move-in Date:</span>
                <span className="font-medium">
                  {offerData.moveInDate ? new Date(offerData.moveInDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Not set'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="form-button-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="form-button flex-1 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            >
              Submit Offer
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
