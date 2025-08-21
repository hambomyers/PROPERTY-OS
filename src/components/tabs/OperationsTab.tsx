import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Property } from '@/types';

interface OperationsTabProps {
  property: Property;
}

export default function OperationsTab({ property }: OperationsTabProps) {
  const [subView, setSubView] = useState<'maintenance' | 'tenants' | 'work-orders'>('maintenance');

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full"
    >
      {/* Sub-navigation */}
      <div className="flex p-2 bg-gray-50 gap-2">
        <button
          onClick={() => setSubView('maintenance')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            subView === 'maintenance'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Maintenance
        </button>
        <button
          onClick={() => setSubView('tenants')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            subView === 'tenants'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Tenants
        </button>
        <button
          onClick={() => setSubView('work-orders')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            subView === 'work-orders'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Work Orders
        </button>
      </div>

      {/* Sub-view Content */}
      <div className="flex-1 p-4">
        {subView === 'maintenance' && <MaintenanceView property={property} />}
        {subView === 'tenants' && <TenantsView property={property} />}
        {subView === 'work-orders' && <WorkOrdersView property={property} />}
      </div>
    </motion.div>
  );
}

function MaintenanceView({ property }: { property: Property }) {
  return (
    <div className="space-y-4">
      {/* Predicted Failures */}
      {property.operations.maintenance.predicted.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Predicted Issues</h3>
          <div className="space-y-2">
            {property.operations.maintenance.predicted.map((prediction, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">{prediction.component}</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      {prediction.probability}% chance in {prediction.timeframe}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Preventive: ${prediction.preventiveCost}</p>
                    <p className="text-xs text-red-600">Failure: ${prediction.failureCost}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Tasks */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Scheduled Maintenance</h3>
        {property.operations.maintenance.scheduled.length > 0 ? (
          <div className="space-y-2">
            {property.operations.maintenance.scheduled.map((task) => (
              <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.description}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                    <p className="text-xs text-gray-600 mt-1">${task.estimatedCost}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔧</div>
            <p className="text-sm">No scheduled maintenance</p>
            <p className="text-xs">Tasks will appear here when scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TenantsView({ property }: { property: Property }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Current Tenants</h3>
      {property.operations.tenants.length > 0 ? (
        <div className="space-y-3">
          {property.operations.tenants.map((tenant, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{tenant.name}</p>
                  <p className="text-xs text-gray-600">Unit: {tenant.unit}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">👥</div>
          <p className="text-sm">No current tenants</p>
          <p className="text-xs">Tenant information will appear here</p>
        </div>
      )}
    </div>
  );
}

function WorkOrdersView({ property }: { property: Property }) {
  const openOrders = property.operations.workOrders.filter(wo => wo.status === 'open');
  const inProgressOrders = property.operations.workOrders.filter(wo => wo.status === 'in-progress');
  const completedOrders = property.operations.workOrders.filter(wo => wo.status === 'completed');

  return (
    <div className="space-y-4">
      {/* Open Work Orders */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Open ({openOrders.length})</h3>
        {openOrders.length > 0 ? (
          <div className="space-y-2">
            {openOrders.map((order) => (
              <WorkOrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No open work orders</p>
        )}
      </div>

      {/* In Progress */}
      {inProgressOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">In Progress ({inProgressOrders.length})</h3>
          <div className="space-y-2">
            {inProgressOrders.map((order) => (
              <WorkOrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Completed */}
      {completedOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Recently Completed</h3>
          <div className="space-y-2">
            {completedOrders.slice(0, 3).map((order) => (
              <WorkOrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}

      {openOrders.length === 0 && inProgressOrders.length === 0 && completedOrders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-sm">No work orders</p>
          <p className="text-xs">Work orders will appear here when created</p>
        </div>
      )}
    </div>
  );
}

function WorkOrderCard({ order }: { order: import('@/types').WorkOrder }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">{order.title}</p>
          <p className="text-xs text-gray-600 mt-1">{order.description}</p>
          <p className="text-xs text-gray-500 mt-1">
            Created: {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
            order.status === 'open' ? 'bg-red-100 text-red-800' :
            order.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {order.status}
          </span>
          <p className="text-xs text-gray-600 mt-1">${order.estimatedCost}</p>
        </div>
      </div>
    </div>
  );
}
