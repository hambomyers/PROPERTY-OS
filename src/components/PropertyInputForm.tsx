import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePropertyStore } from '@/store/propertyStore';
import { RealPropertyDataService, PropertyDataInput } from '@/services/RealPropertyData';

export default function PropertyInputForm() {
  const navigate = useNavigate();
  const { addProperty, setActiveProperty } = usePropertyStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<PropertyDataInput>({
    address: '',
    purchasePrice: undefined,
    currentValue: undefined,
    monthlyRent: undefined,
    monthlyExpenses: undefined,
    yearBuilt: undefined,
    squareFootage: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    propertyType: '',
    tenantName: '',
    leaseStart: undefined,
    leaseEnd: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const realPropertyService = RealPropertyDataService.getInstance();
      const property = await realPropertyService.createPropertyFromInput(formData);
      
      addProperty(property);
      setActiveProperty(property);
      navigate(`/property/${property.id}`);
    } catch (error) {
      console.error('Error creating property:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof PropertyDataInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Your Property</h1>
        <p className="text-gray-600">Enter your real property data to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Address - Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Address *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="123 Main Street, Boston, MA 02101"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Financial Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Price
            </label>
            <input
              type="number"
              value={formData.purchasePrice || ''}
              onChange={(e) => handleInputChange('purchasePrice', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="400000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Value
            </label>
            <input
              type="number"
              value={formData.currentValue || ''}
              onChange={(e) => handleInputChange('currentValue', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="450000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Rent
            </label>
            <input
              type="number"
              value={formData.monthlyRent || ''}
              onChange={(e) => handleInputChange('monthlyRent', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="2400"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Expenses
            </label>
            <input
              type="number"
              value={formData.monthlyExpenses || ''}
              onChange={(e) => handleInputChange('monthlyExpenses', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="800"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Built
            </label>
            <input
              type="number"
              value={formData.yearBuilt || ''}
              onChange={(e) => handleInputChange('yearBuilt', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="1985"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Square Footage
            </label>
            <input
              type="number"
              value={formData.squareFootage || ''}
              onChange={(e) => handleInputChange('squareFootage', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="1200"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <select
              value={formData.propertyType}
              onChange={(e) => handleInputChange('propertyType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Type</option>
              <option value="single_family">Single Family</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="apartment">Apartment</option>
              <option value="multi_family">Multi Family</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms
            </label>
            <input
              type="number"
              value={formData.bedrooms || ''}
              onChange={(e) => handleInputChange('bedrooms', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bathrooms
            </label>
            <input
              type="number"
              step="0.5"
              value={formData.bathrooms || ''}
              onChange={(e) => handleInputChange('bathrooms', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tenant Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Tenant (Optional)</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tenant Name
            </label>
            <input
              type="text"
              value={formData.tenantName}
              onChange={(e) => handleInputChange('tenantName', e.target.value)}
              placeholder="John Smith"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lease Start Date
              </label>
              <input
                type="date"
                value={formData.leaseStart ? formData.leaseStart.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('leaseStart', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lease End Date
              </label>
              <input
                type="date"
                value={formData.leaseEnd ? formData.leaseEnd.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('leaseEnd', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <motion.button
            type="submit"
            disabled={isSubmitting || !formData.address.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating Property...' : 'Add Property'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
