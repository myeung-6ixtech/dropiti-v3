'use client';

import AddPropertyView from '@/components/dashboard/AddPropertyView';

export default function AddPropertyPage() {
  return (
    <div className="h-full">
      <AddPropertyView userType="landlord" />
    </div>
  );
}
