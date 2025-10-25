'use client';

import { useState } from 'react';
import { TenantProfileData, BudgetCurrency } from '@/types/tenant';

interface Step2PreferencesProps {
  data: TenantProfileData;
  onUpdate: (data: Partial<TenantProfileData>) => void;
}

export default function Step2Preferences({ data, onUpdate }: Step2PreferencesProps) {
  const [budgetMin, setBudgetMin] = useState(data.budget_min || '');
  const [budgetMax, setBudgetMax] = useState(data.budget_max || '');
  const [budgetCurrency, setBudgetCurrency] = useState<BudgetCurrency>(data.budget_currency || 'HKD');
  const [locations, setLocations] = useState((data.preferred_locations || []).join(', '));
  const [moveInDate, setMoveInDate] = useState(data.preferred_move_in_date || '');
  const [leaseDuration, setLeaseDuration] = useState(data.preferred_lease_duration || '');

  const handleBudgetMinChange = (value: string) => {
    const numValue = value ? Number(value) : undefined;
    setBudgetMin(value);
    onUpdate({ budget_min: numValue });
  };

  const handleBudgetMaxChange = (value: string) => {
    const numValue = value ? Number(value) : undefined;
    setBudgetMax(value);
    onUpdate({ budget_max: numValue });
  };

  const handleCurrencyChange = (value: string) => {
    const currency = value as BudgetCurrency;
    setBudgetCurrency(currency);
    onUpdate({ budget_currency: currency });
  };

  const handleLocationsChange = (value: string) => {
    setLocations(value);
    const locationArray = value.split(',').map(v => v.trim()).filter(Boolean);
    onUpdate({ preferred_locations: locationArray });
  };

  const handleMoveInDateChange = (value: string) => {
    setMoveInDate(value);
    onUpdate({ preferred_move_in_date: value });
  };

  const handleLeaseDurationChange = (value: string) => {
    const numValue = value ? Number(value) : undefined;
    setLeaseDuration(value);
    onUpdate({ preferred_lease_duration: numValue });
  };

  return (
    <div className="space-y-6">
      {/* Budget Section */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Budget Range *</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Budget
            </label>
            <input
              type="number"
              value={budgetMin}
              onChange={(e) => handleBudgetMinChange(e.target.value)}
              placeholder="15000"
              className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Budget
            </label>
            <input
              type="number"
              value={budgetMax}
              onChange={(e) => handleBudgetMaxChange(e.target.value)}
              placeholder="25000"
              className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={budgetCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="HKD">HKD</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="SGD">SGD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Preferred Locations *</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Areas you're interested in
          </label>
          <input
            type="text"
            value={locations}
            onChange={(e) => handleLocationsChange(e.target.value)}
            placeholder="Central, Tsim Sha Tsui, Causeway Bay"
            className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate multiple locations with commas
          </p>
        </div>
      </div>

      {/* Timeline Section */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Move-in Timeline</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Move-in Date
            </label>
            <input
              type="date"
              value={moveInDate}
              onChange={(e) => handleMoveInDateChange(e.target.value)}
              className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Lease Duration (months)
            </label>
            <input
              type="number"
              value={leaseDuration}
              onChange={(e) => handleLeaseDurationChange(e.target.value)}
              placeholder="12"
              className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
