import { motion } from 'framer-motion';
import { usePropertyStore } from '@/store/propertyStore';

export default function Home() {
  const { getPropertiesList } = usePropertyStore();
  const properties = getPropertiesList();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      {/* Header */}
      <div className="px-4 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PropertyOS</h1>
          <p className="text-gray-600">Unified property management platform</p>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-primary-600">{properties.length}</div>
            <div className="text-sm text-gray-600">Properties</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-success-600">$0</div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div className="px-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Properties</h2>
        
        {properties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg p-8 text-center shadow-sm"
          >
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
            <p className="text-gray-600 mb-4">Type an address in the command bar below to get started</p>
            <div className="text-sm text-gray-500">
              Try: "123 Main Street" or "456 Oak Avenue"
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{property.address.formatted}</h3>
                    <p className="text-sm text-gray-600">Health Score: {property.overview.healthScore}/100</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    property.overview.status === 'green' ? 'bg-success-500' :
                    property.overview.status === 'yellow' ? 'bg-warning-500' :
                    'bg-danger-500'
                  }`} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
