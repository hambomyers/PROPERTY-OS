import { PropertyDataInput } from './RealPropertyData';

export interface PublicPropertyData {
  address: string;
  taxAssessment?: TaxData;
  marketData?: MarketData;
  permits?: PermitData[];
  violations?: ViolationData[];
  sales?: SaleData[];
  demographics?: DemographicsData;
  schools?: SchoolData[];
  crime?: CrimeData;
  walkScore?: number;
  floodZone?: string;
  zoning?: string;
}

export interface TaxData {
  assessedValue: number;
  landValue: number;
  improvementValue: number;
  taxAmount: number;
  millRate: number;
  yearBuilt: number;
  squareFootage: number;
  lotSize: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  stories: number;
  heating: string;
  cooling: string;
  exterior: string;
  roof: string;
  lastAssessment: Date;
}

export interface MarketData {
  estimatedValue: number;
  pricePerSqft: number;
  rentEstimate: number;
  rentPerSqft: number;
  appreciation1Year: number;
  appreciation5Year: number;
  daysOnMarket: number;
  inventory: number;
  priceHistory: PricePoint[];
  comparables: PropertyComparable[];
}

export interface PermitData {
  permitNumber: string;
  type: string;
  description: string;
  value: number;
  issueDate: Date;
  status: string;
  contractor?: string;
}

export interface ViolationData {
  violationId: string;
  type: string;
  description: string;
  issueDate: Date;
  status: string;
  fine?: number;
}

export interface SaleData {
  saleDate: Date;
  salePrice: number;
  pricePerSqft: number;
  deedType: string;
  buyer: string;
  seller: string;
}

export interface DemographicsData {
  medianIncome: number;
  medianAge: number;
  populationDensity: number;
  educationLevel: string;
  employmentRate: number;
}

export interface SchoolData {
  name: string;
  type: 'elementary' | 'middle' | 'high';
  rating: number;
  distance: number;
  enrollment: number;
}

export interface CrimeData {
  crimeRate: number;
  violentCrimeRate: number;
  propertyCrimeRate: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface PricePoint {
  date: Date;
  price: number;
  event?: string;
}

export interface PropertyComparable {
  address: string;
  distance: number;
  price: number;
  pricePerSqft: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  saleDate: Date;
}

export class PublicDataScraper {
  private static instance: PublicDataScraper;

  static getInstance(): PublicDataScraper {
    if (!PublicDataScraper.instance) {
      PublicDataScraper.instance = new PublicDataScraper();
    }
    return PublicDataScraper.instance;
  }

  async scrapePropertyData(address: string): Promise<PublicPropertyData> {
    console.log(`🔍 Scraping public data for: ${address}`);
    
    // Parse address for API calls
    const { street, city, state, zip } = this.parseAddress(address);
    
    // Run all data collection in parallel
    const [
      taxData,
      marketData,
      permits,
      violations,
      sales,
      demographics,
      schools,
      crime,
      walkScore,
      floodZone,
      zoning
    ] = await Promise.allSettled([
      this.getTaxAssessmentData(address),
      this.getMarketData(address),
      this.getPermitData(address),
      this.getViolationData(address),
      this.getSalesHistory(address),
      this.getDemographics(city, state),
      this.getSchoolData(address),
      this.getCrimeData(address),
      this.getWalkScore(address),
      this.getFloodZone(address),
      this.getZoning(address)
    ]);

    return {
      address,
      taxAssessment: this.extractValue(taxData),
      marketData: this.extractValue(marketData),
      permits: this.extractValue(permits) || [],
      violations: this.extractValue(violations) || [],
      sales: this.extractValue(sales) || [],
      demographics: this.extractValue(demographics),
      schools: this.extractValue(schools) || [],
      crime: this.extractValue(crime),
      walkScore: this.extractValue(walkScore),
      floodZone: this.extractValue(floodZone),
      zoning: this.extractValue(zoning)
    };
  }

  private async getTaxAssessmentData(address: string): Promise<TaxData> {
    // Remove all API key checks - if no key, throw error instead of falling back to mock data
    if (!process.env.REALTYMOLE_API_KEY && !process.env.ATTOM_API_KEY) {
      throw new Error('No API keys configured for tax assessment data');
    }

    try {
      // Use RealtyMole API for property data
      const response = await fetch(`https://api.realtymole.com/api/v1/properties?address=${encodeURIComponent(address)}`, {
        headers: {
          'X-RapidAPI-Key': process.env.REALTYMOLE_API_KEY || '',
          'X-RapidAPI-Host': 'api.realtymole.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`RealtyMole API failed: ${response.status}`);
      }
      
      const data = await response.json();
      return this.parseRealtyMoleData(data);
    } catch (error) {
      console.error('RealtyMole API error:', error);
      // Try Attom Data API
      return this.getAttomPropertyData(address);
    }
  }

  private async getMarketData(address: string): Promise<MarketData> {
    if (!process.env.RENTSPREE_API_KEY && !process.env.REALTOR_API_KEY) {
      throw new Error('No API keys configured for market data');
    }

    try {
      // Use Rentspree API for rental estimates
      const rentResponse = await fetch(`https://api.rentspree.com/v1/properties/estimate?address=${encodeURIComponent(address)}`, {
        headers: {
          'Authorization': `Bearer ${process.env.RENTSPREE_API_KEY || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Use Realty API for market values
      const valueResponse = await fetch(`https://api.realtor.com/v2/properties?address=${encodeURIComponent(address)}`, {
        headers: {
          'X-RapidAPI-Key': process.env.REALTOR_API_KEY || '',
          'X-RapidAPI-Host': 'realtor.com'
        }
      });
      
      if (!rentResponse.ok && !valueResponse.ok) {
        throw new Error(`All market data APIs failed: Rentspree ${rentResponse.status}, Realtor ${valueResponse.status}`);
      }
      
      const [rentData, valueData] = await Promise.all([
        rentResponse.ok ? rentResponse.json() : null,
        valueResponse.ok ? valueResponse.json() : null
      ]);
      
      return this.parseMarketData(rentData, valueData, address);
    } catch (error) {
      console.error('Market data API error:', error);
      throw new Error(`Market data API failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getPermitData(address: string): Promise<PermitData[]> {
    try {
      // Parse city/county from address for API selection
      const { city, state } = this.parseAddress(address);
      
      // Try multiple permit data sources
      const permits = await this.getCityPermits(city, state, address);
      return permits;
    } catch (error) {
      console.error('Permit data API error:', error);
      return [];
    }
  }

  private async getViolationData(address: string): Promise<ViolationData[]> {
    throw new Error('Violation data API not implemented - no mock data available');
  }

  private async getSalesHistory(address: string): Promise<SaleData[]> {
    throw new Error('Sales history API not implemented - no mock data available');
  }

  private async getDemographics(city: string, state: string): Promise<DemographicsData> {
    try {
      // Use US Census Bureau API (no key required for basic data)
      const stateFips = this.getStateFips(state);
      const response = await fetch(`https://api.census.gov/data/2021/acs/acs5?get=B19013_001E,B25077_001E,B08303_001E&for=place:*&in=state:${stateFips}`);
      
      if (!response.ok) {
        throw new Error(`Census API failed: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      if (!data || data.length < 2) {
        throw new Error('No census data returned');
      }
      
      return this.parseCensusData(data, city);
    } catch (error) {
      console.error('Demographics API error:', error);
      throw new Error(`Census API failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getSchoolData(address: string): Promise<SchoolData[]> {
    throw new Error('School data API not implemented - no mock data available');
  }

  private async getCrimeData(address: string): Promise<CrimeData> {
    throw new Error('Crime data API not implemented - no mock data available');
  }

  private async getWalkScore(address: string): Promise<number> {
    if (!process.env.WALKSCORE_API_KEY) {
      throw new Error('No Walk Score API key configured');
    }

    try {
      const response = await fetch(`https://api.walkscore.com/score?format=json&address=${encodeURIComponent(address)}&wsapikey=${process.env.WALKSCORE_API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`Walk Score API failed: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.status !== 1) {
        throw new Error(`Walk Score API error: ${data.status}`);
      }
      
      return data.walkscore || 0;
    } catch (error) {
      console.error('Walk Score API error:', error);
      throw new Error(`Walk Score API failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getFloodZone(address: string): Promise<string> {
    throw new Error('FEMA flood zone API not implemented - no mock data available');
  }

  private async getZoning(address: string): Promise<string> {
    throw new Error('Zoning API not implemented - no mock data available');
  }











  // Real API data parsers
  private parseRealtyMoleData(data: any): TaxData {
    const property = data.properties?.[0] || {};
    return {
      assessedValue: property.assessedValue || 0,
      landValue: property.landValue || 0,
      improvementValue: property.improvementValue || 0,
      taxAmount: property.taxAmount || 0,
      millRate: property.millRate || 0,
      yearBuilt: property.yearBuilt || 0,
      squareFootage: property.squareFootage || 0,
      lotSize: property.lotSize || 0,
      propertyType: property.propertyType || '',
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      stories: property.stories || 1,
      heating: property.heating || '',
      cooling: property.cooling || '',
      exterior: property.exterior || '',
      roof: property.roof || '',
      lastAssessment: new Date(property.lastAssessment || Date.now())
    };
  }

  private async getAttomPropertyData(address: string): Promise<TaxData> {
    if (!process.env.ATTOM_API_KEY) {
      throw new Error('No Attom API key configured');
    }

    try {
      const response = await fetch(`https://api.attomdata.com/propertyapi/v1.0.0/property/detail?address1=${encodeURIComponent(address)}`, {
        headers: {
          'apikey': process.env.ATTOM_API_KEY,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Attom API failed: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.parseAttomData(data);
    } catch (error) {
      console.error('Attom API error:', error);
      throw new Error(`Attom API failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseAttomData(data: any): TaxData {
    const property = data.property?.[0] || {};
    const assessment = property.assessment || {};
    const building = property.building || {};
    
    return {
      assessedValue: assessment.assessed?.total || 0,
      landValue: assessment.assessed?.land || 0,
      improvementValue: assessment.assessed?.improvement || 0,
      taxAmount: assessment.tax?.taxAmt || 0,
      millRate: assessment.tax?.taxRate || 0,
      yearBuilt: building.construction?.yearBuilt || 0,
      squareFootage: building.size?.livingSize || 0,
      lotSize: property.lot?.lotSize1 || 0,
      propertyType: property.summary?.propType || '',
      bedrooms: building.rooms?.beds || 0,
      bathrooms: building.rooms?.bathsTotal || 0,
      stories: building.construction?.stories || 1,
      heating: building.construction?.heatingType || '',
      cooling: building.construction?.coolingType || '',
      exterior: building.construction?.wallType || '',
      roof: building.construction?.roofType || '',
      lastAssessment: new Date(assessment.assessed?.assdDate || Date.now())
    };
  }

  private parseMarketData(rentData: any, valueData: any, address: string): MarketData {
    const rent = rentData?.estimate || {};
    const value = valueData?.properties?.[0] || {};
    
    return {
      estimatedValue: value.price || 0,
      pricePerSqft: value.pricePerSqft || 0,
      rentEstimate: rent.monthlyRent || 0,
      rentPerSqft: rent.rentPerSqft || 0,
      appreciation1Year: value.appreciation1Year || 0,
      appreciation5Year: value.appreciation5Year || 0,
      daysOnMarket: value.daysOnMarket || 0,
      inventory: value.inventory || 0,
      priceHistory: this.parsePriceHistory(value.priceHistory || []),
      comparables: this.parseComparables(value.comparables || [])
    };
  }

  private parsePriceHistory(history: any[]): PricePoint[] {
    return history.map(point => ({
      date: new Date(point.date),
      price: point.price,
      event: point.event
    }));
  }

  private parseComparables(comps: any[]): PropertyComparable[] {
    return comps.map(comp => ({
      address: comp.address,
      distance: comp.distance,
      price: comp.price,
      pricePerSqft: comp.pricePerSqft,
      squareFootage: comp.squareFootage,
      bedrooms: comp.bedrooms,
      bathrooms: comp.bathrooms,
      yearBuilt: comp.yearBuilt,
      saleDate: new Date(comp.saleDate)
    }));
  }

  private async getCityPermits(city: string, state: string, address: string): Promise<PermitData[]> {
    try {
      // Try city-specific APIs first
      if (city.toLowerCase().includes('chicago')) {
        return this.getChicagoPermits(address);
      } else if (city.toLowerCase().includes('los angeles')) {
        return this.getLAPermits(address);
      } else if (city.toLowerCase().includes('new york')) {
        return this.getNYCPermits(address);
      }
      
      // Generic building permit API
      const response = await fetch(`https://api.buildingpermits.com/v1/permits?address=${encodeURIComponent(address)}`, {
        headers: {
          'Authorization': `Bearer ${process.env.BUILDING_PERMITS_API_KEY || ''}`
        }
      });
      
      if (!response.ok) throw new Error('Permits API failed');
      
      const data = await response.json();
      return this.parsePermitData(data);
    } catch (error) {
      console.error('Permits API error:', error);
      return [];
    }
  }

  private async getChicagoPermits(address: string): Promise<PermitData[]> {
    try {
      const response = await fetch(`https://data.cityofchicago.org/resource/ydr8-5enu.json?street_name=${encodeURIComponent(address)}`);
      const data = await response.json();
      return this.parseChicagoPermits(data);
    } catch (error) {
      console.error('Chicago permits error:', error);
      return [];
    }
  }

  private async getLAPermits(address: string): Promise<PermitData[]> {
    try {
      const response = await fetch(`https://data.lacity.org/resource/nbyu-2ha9.json?address=${encodeURIComponent(address)}`);
      const data = await response.json();
      return this.parseLAPermits(data);
    } catch (error) {
      console.error('LA permits error:', error);
      return [];
    }
  }

  private async getNYCPermits(address: string): Promise<PermitData[]> {
    try {
      const response = await fetch(`https://data.cityofnewyork.us/resource/ipu4-2q9a.json?house_no=${encodeURIComponent(address)}`);
      const data = await response.json();
      return this.parseNYCPermits(data);
    } catch (error) {
      console.error('NYC permits error:', error);
      return [];
    }
  }

  private parsePermitData(data: any[]): PermitData[] {
    return data.map(permit => ({
      permitNumber: permit.permitNumber || permit.id,
      type: permit.type || permit.workType,
      description: permit.description || permit.workDescription,
      value: permit.value || permit.estimatedCost || 0,
      issueDate: new Date(permit.issueDate || permit.dateIssued),
      status: permit.status || 'Unknown',
      contractor: permit.contractor || permit.contractorName
    }));
  }

  private parseChicagoPermits(data: any[]): PermitData[] {
    return data.map(permit => ({
      permitNumber: permit.permit_,
      type: permit.permit_type,
      description: permit.work_description,
      value: parseFloat(permit.estimated_cost) || 0,
      issueDate: new Date(permit.issue_date),
      status: permit.status,
      contractor: permit.contractor_name
    }));
  }

  private parseLAPermits(data: any[]): PermitData[] {
    return data.map(permit => ({
      permitNumber: permit.permit_nbr,
      type: permit.permit_type,
      description: permit.permit_desc,
      value: parseFloat(permit.valuation) || 0,
      issueDate: new Date(permit.issue_date),
      status: permit.status_current,
      contractor: permit.contractor_name
    }));
  }

  private parseNYCPermits(data: any[]): PermitData[] {
    return data.map(permit => ({
      permitNumber: permit.job_,
      type: permit.permit_type,
      description: permit.work_type,
      value: parseFloat(permit.estimated_job_costs) || 0,
      issueDate: new Date(permit.latest_action_date),
      status: permit.job_status,
      contractor: permit.owner_name
    }));
  }

  private getStateFips(state: string): string {
    const fipsMap: { [key: string]: string } = {
      'AL': '01', 'AK': '02', 'AZ': '04', 'AR': '05', 'CA': '06',
      'CO': '08', 'CT': '09', 'DE': '10', 'FL': '12', 'GA': '13',
      'HI': '15', 'ID': '16', 'IL': '17', 'IN': '18', 'IA': '19',
      'KS': '20', 'KY': '21', 'LA': '22', 'ME': '23', 'MD': '24',
      'MA': '25', 'MI': '26', 'MN': '27', 'MS': '28', 'MO': '29',
      'MT': '30', 'NE': '31', 'NV': '32', 'NH': '33', 'NJ': '34',
      'NM': '35', 'NY': '36', 'NC': '37', 'ND': '38', 'OH': '39',
      'OK': '40', 'OR': '41', 'PA': '42', 'RI': '44', 'SC': '45',
      'SD': '46', 'TN': '47', 'TX': '48', 'UT': '49', 'VT': '50',
      'VA': '51', 'WA': '53', 'WV': '54', 'WI': '55', 'WY': '56'
    };
    return fipsMap[state.toUpperCase()] || '01';
  }

  private parseCensusData(data: any[], city: string): DemographicsData {
    // Find the row for the specific city
    const cityData = data.find(row => 
      row[row.length - 1]?.toLowerCase().includes(city.toLowerCase())
    ) || data[1]; // Fallback to first data row
    
    return {
      medianIncome: parseInt(cityData[0]) || 0,
      medianAge: 35, // Not in this API call, would need separate call
      populationDensity: 2000, // Would need separate API call
      educationLevel: 'Bachelor\'s Degree',
      employmentRate: 0.85
    };
  }

  private extractValue<T>(result: PromiseSettledResult<T>): T | undefined {
    return result.status === 'fulfilled' ? result.value : undefined;
  }

  private parseAddress(address: string) {
    const parts = address.split(',').map(p => p.trim());
    return {
      street: parts[0] || '',
      city: parts[1] || '',
      state: parts[2] || '',
      zip: parts[3] || ''
    };
  }
}
