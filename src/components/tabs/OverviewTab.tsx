import { motion } from 'framer-motion';
import type { Property } from '@/types';

interface OverviewTabProps {
  property: Property;
}

export default function OverviewTab({ property }: OverviewTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-4 space-y-4"
    >
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Monthly Revenue</span>
            <span className="text-xs text-success-600">↗ 5%</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            ${property.intelligence.financial.monthlyRevenue.toLocaleString()}
          </div>
          <div className={`text-xs mt-1 ${
            property.overview.vitals.monthlyRevenue.status === 'collected' ? 'text-success-600' :
            property.overview.vitals.monthlyRevenue.status === 'pending' ? 'text-warning-600' :
            'text-danger-600'
          }`}>
            {property.overview.vitals.monthlyRevenue.status}
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Occupancy</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {property.overview.vitals.occupancy.status ? 'Occupied' : 'Vacant'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {property.overview.vitals.occupancy.daysVacant ? 
              `${property.overview.vitals.occupancy.daysVacant} days vacant` : 
              'Current tenant'
            }
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Next Action</span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {property.overview.vitals.nextAction.type}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {new Date(property.overview.vitals.nextAction.date).toLocaleDateString()}
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Cap Rate</span>
            <span className="text-xs text-success-600">↗ 0.2%</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {property.intelligence.financial.capRate}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Annual return</div>
        </div>
      </div>

      {/* Active Alerts */}
      {property.overview.alerts && property.overview.alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Active Alerts</h3>
          {property.overview.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border-l-4 ${
                alert.severity === 'critical' ? 'bg-red-50 border-red-400' :
                alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    alert.severity === 'critical' ? 'text-red-800' :
                    alert.severity === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.timestamp).toLocaleDateString()}
                  </p>
                </div>
                {alert.action && (
                  <button
                    onClick={alert.action}
                    className="text-xs bg-white px-2 py-1 rounded border hover:bg-gray-50"
                  >
                    Action
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Activity Timeline */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
        <div className="space-y-3">
          {property.overview.recentActivity.length > 0 ? (
            property.overview.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  activity.type === 'payment' ? 'bg-success-100 text-success-600' :
                  activity.type === 'maintenance' ? 'bg-warning-100 text-warning-600' :
                  activity.type === 'inspection' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {activity.type === 'payment' ? '💰' :
                   activity.type === 'maintenance' ? '🔧' :
                   activity.type === 'inspection' ? '📋' : '📄'}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-sm">No recent activity</p>
              <p className="text-xs">Activity will appear here as you use PropertyOS</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
