import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePropertyStore } from '@/store/propertyStore';
import { PublicDataScraper, PublicPropertyData } from '@/services/PublicDataScraper';
import { RealPropertyDataService } from '@/services/RealPropertyData';

interface PropertyDataPreviewProps {
  address: string;
  onClose: () => void;
}

export default function PropertyDataPreview({ address, onClose }: PropertyDataPreviewProps) {
  const navigate = useNavigate();
  const { addProperty, setActiveProperty } = usePropertyStore();
  const [publicData, setPublicData] = useState<PublicPropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPublicData();
  }, [address]);

  const loadPublicData = async () => {
    try {
      setLoading(true);
      const scraper = PublicDataScraper.getInstance();
      const data = await scraper.scrapePropertyData(address);
      setPublicData(data);
    } catch (error) {
      console.error('Error loading public data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProperty = async () => {
    if (!publicData) return;
    
    setCreating(true);
    try {
      const realPropertyService = RealPropertyDataService.getInstance();
      
      // Pre-populate form data from scraped public data
      const propertyInput = {
        address: publicData.address,
        currentValue: publicData.taxAssessment?.assessedValue,
        yearBuilt: publicData.taxAssessment?.yearBuilt,
        squareFootage: publicData.taxAssessment?.squareFootage,
        bedrooms: publicData.taxAssessment?.bedrooms,
        bathrooms: publicData.taxAssessment?.bathrooms,
        propertyType: publicData.taxAssessment?.propertyType?.toLowerCase().replace(' ', '_'),
        monthlyRent: publicData.marketData?.rentEstimate,
      };

      const property = await realPropertyService.createPropertyFromInput(propertyInput);
      
      // Add the scraped public data to the property
      property.publicData = publicData;
      
      addProperty(property);
      setActiveProperty(property);
      navigate(`/property/${property.id}`);
    } catch (error) {
      console.error('Error creating property:', error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Scraping Public Data</h3>
            <p className="text-gray-600">Finding all available information for {address}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!publicData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No Data Found</h3>
            <p className="text-gray-600 mb-4">Could not find public data for this address.</p>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dataPoints = [
    publicData.taxAssessment && { label: 'Tax Assessment', value: `$${publicData.taxAssessment.assessedValue.toLocaleString()}` },
    publicData.marketData && { label: 'Market Value', value: `$${publicData.marketData.estimatedValue.toLocaleString()}` },
    publicData.taxAssessment && { label: 'Year Built', value: publicData.taxAssessment.yearBuilt.toString() },
    publicData.taxAssessment && { label: 'Square Footage', value: `${publicData.taxAssessment.squareFootage.toLocaleString()} sq ft` },
    publicData.taxAssessment && { label: 'Bedrooms/Bathrooms', value: `${publicData.taxAssessment.bedrooms}/${publicData.taxAssessment.bathrooms}` },
    publicData.marketData && { label: 'Rent Estimate', value: `$${publicData.marketData.rentEstimate.toLocaleString()}/month` },
    publicData.permits && publicData.permits.length > 0 && { label: 'Permits', value: `${publicData.permits.length} found` },
    publicData.sales && publicData.sales.length > 0 && { label: 'Sales History', value: `${publicData.sales.length} sales` },
    publicData.walkScore && { label: 'Walk Score', value: publicData.walkScore.toString() },
    publicData.schools && publicData.schools.length > 0 && { label: 'Schools', value: `${publicData.schools.length} nearby` },
    publicData.floodZone && { label: 'Flood Zone', value: publicData.floodZone },
    publicData.zoning && { label: 'Zoning', value: publicData.zoning }
  ].filter((point): point is { label: string; value: string } => Boolean(point));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🎉 Found Public Data!</h2>
              <p className="text-gray-600 mt-1">{address}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Here's what we found automatically:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dataPoints.map((point, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">{point.label}</div>
                  <div className="text-lg font-semibold text-gray-900">{point.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Assessment Details */}
          {publicData.taxAssessment && (
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-3">📊 Tax Assessment Details</h4>
              <div className="bg-blue-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Land Value</div>
                  <div className="font-semibold">${publicData.taxAssessment.landValue.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-600">Improvement Value</div>
                  <div className="font-semibold">${publicData.taxAssessment.improvementValue.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-600">Annual Taxes</div>
                  <div className="font-semibold">${publicData.taxAssessment.taxAmount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-600">Lot Size</div>
                  <div className="font-semibold">{publicData.taxAssessment.lotSize.toLocaleString()} sq ft</div>
                </div>
              </div>
            </div>
          )}

          {/* Market Data */}
          {publicData.marketData && (
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-3">💰 Market Analysis</h4>
              <div className="bg-green-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Price/Sq Ft</div>
                  <div className="font-semibold">${publicData.marketData.pricePerSqft}</div>
                </div>
                <div>
                  <div className="text-gray-600">Rent/Sq Ft</div>
                  <div className="font-semibold">${publicData.marketData.rentPerSqft}</div>
                </div>
                <div>
                  <div className="text-gray-600">1-Year Appreciation</div>
                  <div className="font-semibold">{(publicData.marketData.appreciation1Year * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-gray-600">Days on Market</div>
                  <div className="font-semibold">{publicData.marketData.daysOnMarket} days</div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Permits */}
          {publicData.permits && publicData.permits.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-3">🔨 Recent Permits</h4>
              <div className="space-y-2">
                {publicData.permits.slice(0, 3).map((permit, index) => (
                  <div key={index} className="bg-yellow-50 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{permit.type} - ${permit.value.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">{permit.description}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {permit.issueDate.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schools */}
          {publicData.schools && publicData.schools.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-3">🏫 Nearby Schools</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {publicData.schools.map((school, index) => (
                  <div key={index} className="bg-purple-50 rounded-lg p-3">
                    <div className="font-medium">{school.name}</div>
                    <div className="text-sm text-gray-600 capitalize">{school.type} • Rating: {school.rating}/10</div>
                    <div className="text-sm text-gray-500">{school.distance.toFixed(1)} miles away</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                This data was automatically collected from public sources. You can add more details after creating the property.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <motion.button
                onClick={createProperty}
                disabled={creating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating Property...' : 'Create Property with This Data'}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
