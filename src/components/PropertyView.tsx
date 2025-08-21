import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { usePropertyStore } from '@/store/propertyStore';
import TabButton from './TabButton';
import OverviewTab from './tabs/OverviewTab';
import OperationsTab from './tabs/OperationsTab';
import IntelligenceTab from './tabs/IntelligenceTab';

export default function PropertyView() {
  const { id } = useParams<{ id: string }>();
  const { getCurrentProperty, setActiveTab, activeTab } = usePropertyStore();
  
  const property = getCurrentProperty();

  // Swipe between tabs on mobile
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const tabs = ['overview', 'operations', 'intelligence'] as const;
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      const tabs = ['overview', 'operations', 'intelligence'] as const;
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1]);
      }
    },
    trackMouse: true,
  });

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Property not found</h2>
          <p className="text-gray-600">The property you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white" {...handlers}>
      {/* Property Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 safe-area-pt">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {property.address.formatted}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${
                property.overview.status === 'green' ? 'bg-success-500' :
                property.overview.status === 'yellow' ? 'bg-warning-500' :
                'bg-danger-500'
              }`} />
              <span className="text-sm text-gray-600">
                Health Score: {property.overview.healthScore}/100
              </span>
            </div>
          </div>
          
          {/* Health Score Circle */}
          <div className={`health-score-circle ${
            property.overview.healthScore >= 80 ? 'bg-success-100 text-success-700' :
            property.overview.healthScore >= 60 ? 'bg-warning-100 text-warning-700' :
            'bg-danger-100 text-danger-700'
          }`}>
            {property.overview.healthScore}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-white border-b border-gray-200 sticky top-0 z-10">
        <TabButton
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          icon="📊"
          label="Overview"
          badge={property.overview.alerts?.length}
        />
        <TabButton
          active={activeTab === 'operations'}
          onClick={() => setActiveTab('operations')}
          icon="🔧"
          label="Operations"
          badge={property.operations.workOrders?.filter(wo => wo.status === 'open').length}
        />
        <TabButton
          active={activeTab === 'intelligence'}
          onClick={() => setActiveTab('intelligence')}
          icon="🧠"
          label="Intelligence"
          badge={property.intelligence.insights?.length}
        />
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <OverviewTab key="overview" property={property} />
          )}
          {activeTab === 'operations' && (
            <OperationsTab key="operations" property={property} />
          )}
          {activeTab === 'intelligence' && (
            <IntelligenceTab key="intelligence" property={property} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
