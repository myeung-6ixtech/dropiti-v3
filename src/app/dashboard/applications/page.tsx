'use client';

import { useState } from 'react';
import { ClockIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function ApplicationsPage() {
  const [applications] = useState([
    {
      id: 1,
      propertyName: 'Modern 2BR Apartment in Central',
      applicantName: 'John Smith',
      status: 'Pending',
      submittedDate: '2024-01-15',
      amount: '$25,000/month'
    },
    {
      id: 2,
      propertyName: 'Luxury Condo in Causeway Bay',
      applicantName: 'Sarah Johnson',
      status: 'Approved',
      submittedDate: '2024-01-12',
      amount: '$35,000/month'
    },
    {
      id: 3,
      propertyName: 'Studio Apartment in Wan Chai',
      applicantName: 'Mike Chen',
      status: 'Rejected',
      submittedDate: '2024-01-10',
      amount: '$18,000/month'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'Approved':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'Rejected':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-1">Manage rental applications</p>
        </div>
      </div>

      {/* Applications List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {applications.map((application) => (
              <div key={application.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{application.propertyName}</h3>
                        <p className="text-sm text-gray-600">Applicant: {application.applicantName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{application.amount}</p>
                      <p className="text-xs text-gray-500">Submitted {application.submittedDate}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {application.status}
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
