'use client';

import { useState, useEffect } from 'react';
import TenantView from '@/components/dashboard/TenantView';
import LandlordView from '@/components/dashboard/LandlordView';

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<'tenant' | 'landlord'>('tenant');

  // In a real app, you'd get this from your auth context or API
  useEffect(() => {
    // This would come from your auth system
    const userRole = localStorage.getItem('userRole') as 'tenant' | 'landlord' || 'tenant';
    setActiveView(userRole);
  }, []);

  return (
    <div className="h-full">
      {activeView === 'tenant' ? <TenantView /> : <LandlordView />}
    </div>
  );
}
