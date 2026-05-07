'use client';

import { useState } from 'react';
import { useResponsiveModal } from '@/hooks/useResponsiveModal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { 
  XMarkIcon
} from '@heroicons/react/24/outline';

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: string;
  currentPrice?: number;
  recipientUserId?: string;
  onOfferSubmit?: (offerData: OfferData) => void;
  // New props for counter offer mode
  mode?: 'create' | 'counter';
  offerId?: string; // For counter offers
  existingOffer?: {
    rentalPrice: number;
    leaseDuration: number;
    paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
    moveInDate: string;
  };
}

interface OfferData {
  rentalPrice: number;
  leaseDuration: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
  moveInDate: string;
  currency?: string;
  message?: string;
}

export default function CreateOfferModal({ 
  isOpen,
  onClose, 
  currentPrice = 0,
  onOfferSubmit,
  mode = 'create',
  existingOffer
}: CreateOfferModalProps) {
  const { user: authUser } = useAuth();
  const { showToast } = useToast();
  
  const { ModalComponent } = useResponsiveModal({
    mobileTitle: mode === 'counter' ? 'Counter Offer' : 'Create Offer',
    mobileHeight: 'large',
    isOpen,
    onClose,
    showCloseButton: false,
  });

  const [offerData, setOfferData] = useState<OfferData>({
    rentalPrice: existingOffer?.rentalPrice || currentPrice,
    leaseDuration: existingOffer?.leaseDuration || 12,
    paymentFrequency: existingOffer?.paymentFrequency || 'monthly',
    moveInDate: existingOffer?.moveInDate || new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof OfferData, value: string | number) => {
    setOfferData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!offerData.rentalPrice || offerData.rentalPrice <= 0) {
      newErrors.rentalPrice = 'Please enter a valid rental price';
    }

    if (!offerData.leaseDuration || offerData.leaseDuration <= 0) {
      newErrors.leaseDuration = 'Please enter a valid lease duration';
    }

    if (!offerData.moveInDate) {
      newErrors.moveInDate = 'Please select a move-in date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication
    if (!authUser) {
      showToast('error', 'Please sign in to create an offer');
      return;
    }
    
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
    <ModalComponent>
      <div className="bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-0">
            {mode === 'counter' ? 'Counter Offer' : 'Create Offer'}
          </h2>
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
                  Rental Price
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={offerData.rentalPrice || ''}
                    onChange={(e) => handleInputChange('rentalPrice', parseFloat(e.target.value) || 0)}
                    placeholder="Enter your offer amount"
                    className={`form-input pl-8 text-sm ${errors.rentalPrice ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                </div>
                {errors.rentalPrice && (
                  <p className="mt-1 text-xs text-red-600">{errors.rentalPrice}</p>
                )}
                {currentPrice > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Current asking price: {formatCurrency(currentPrice)}
                  </p>
                )}
              </div>

              {/* Lease Duration */}
              <div>
                <label className="form-label flex items-center text-sm font-medium text-gray-700">
                  Lease Duration (months)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={offerData.leaseDuration || ''}
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
                  Move-in Date
                </label>
                <input
                  type="date"
                  value={offerData.moveInDate}
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
                      offerData.paymentFrequency === 'monthly'
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
                      offerData.paymentFrequency === 'quarterly'
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
                      offerData.paymentFrequency === 'yearly'
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
                    <span className="font-medium">{formatCurrency(offerData.rentalPrice || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lease Duration:</span>
                    <span className="font-medium">{offerData.leaseDuration} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span className="font-medium capitalize">
                      {offerData.paymentFrequency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Move-in:</span>
                    <span className="font-medium">
                      {offerData.moveInDate ? new Date(offerData.moveInDate).toLocaleDateString('en-US', {
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
              className="form-button flex-1 btn-primary text-sm py-2"
            >
              {mode === 'counter' ? 'Submit Counter Offer' : 'Submit Offer'}
            </button>
          </div>
        </form>
      </div>
    </ModalComponent>
  );
}
