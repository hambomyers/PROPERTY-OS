import { motion } from 'framer-motion';
import type { Property } from '@/types';

interface IntelligenceTabProps {
  property: Property;
}

export default function IntelligenceTab({ property }: IntelligenceTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-4 space-y-4"
    >
      {/* Financial Summary */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Financial Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600">Monthly Revenue</p>
            <p className="text-lg font-bold text-success-600">
              ${property.intelligence.financial.monthlyRevenue.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Monthly Expenses</p>
            <p className="text-lg font-bold text-danger-600">
              ${property.intelligence.financial.monthlyExpenses.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Net Operating Income</p>
            <p className="text-lg font-bold text-primary-600">
              ${property.intelligence.financial.noi.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Cash Flow</p>
            <p className={`text-lg font-bold ${
              property.intelligence.financial.cashFlow >= 0 ? 'text-success-600' : 'text-danger-600'
            }`}>
              ${property.intelligence.financial.cashFlow.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Market Analysis */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Market Comparables</h3>
        {property.intelligence.market.comps.length > 0 ? (
          <div className="space-y-2">
            {property.intelligence.market.comps.slice(0, 3).map((comp, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{comp.address}</p>
                  <p className="text-xs text-gray-600">{comp.distance} miles away</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${comp.rent}/mo</p>
                  <p className="text-xs text-gray-600">{comp.capRate}% cap rate</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No comparable properties found</p>
        )}
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">AI Insights</h3>
        {property.intelligence.insights.length > 0 ? (
          <div className="space-y-3">
            {property.intelligence.insights.map((insight) => (
              <div key={insight.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        insight.type === 'revenue' ? 'bg-success-100 text-success-800' :
                        insight.type === 'expense' ? 'bg-danger-100 text-danger-800' :
                        insight.type === 'maintenance' ? 'bg-warning-100 text-warning-800' :
                        'bg-primary-100 text-primary-800'
                      }`}>
                        {insight.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        Impact: ${insight.impact.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={insight.action}
                    className="ml-3 px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700"
                  >
                    Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🧠</div>
            <p className="text-sm">No insights available</p>
            <p className="text-xs">AI insights will appear as data is analyzed</p>
          </div>
        )}
      </div>

      {/* Expense Breakdown */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Expense Breakdown</h3>
        <div className="space-y-2">
          {Object.entries(property.intelligence.financial.expenses).map(([category, amount]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 capitalize">{category}</span>
              <span className="text-sm font-medium text-gray-900">${amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Document Vault Preview */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Documents</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📁</div>
          <p className="text-sm">Document vault</p>
          <p className="text-xs">Upload documents via the command bar</p>
        </div>
      </div>
    </motion.div>
  );
}
