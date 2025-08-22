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
    // TODO: Integrate with code enforcement databases
    // - Housing violations
    // - Safety violations
    // - Zoning violations
    
    return this.generateMockViolations(address);
  }

  private async getSalesHistory(address: string): Promise<SaleData[]> {
    // TODO: Integrate with MLS and public records
    // - County recorder office
    // - MLS data (if accessible)
    // - Deed records
    
    return this.generateMockSales(address);
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
    // TODO: Integrate with school district APIs
    // - GreatSchools API
    // - State education department APIs
    // - School district boundaries
    
    return this.generateMockSchools(address);
  }

  private async getCrimeData(address: string): Promise<CrimeData> {
    // TODO: Integrate with crime databases
    // - Local police department APIs
    // - FBI Crime Data
    // - SpotCrime API
    
    return this.generateMockCrime(address);
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
    // TODO: Integrate with FEMA flood maps
    const zones = ['X', 'AE', 'A', 'VE', 'D'];
    return zones[Math.floor(Math.random() * zones.length)];
  }

  private async getZoning(address: string): Promise<string> {
    // TODO: Integrate with city zoning APIs
    const zones = ['R-1', 'R-2', 'R-3', 'C-1', 'M-1'];
    return zones[Math.floor(Math.random() * zones.length)];
  }

  // Mock data generators (replace with real API calls)
  private generateMockTaxData(address: string): TaxData {
    const baseValue = 300000 + Math.random() * 400000;
    return {
      assessedValue: Math.round(baseValue),
      landValue: Math.round(baseValue * 0.3),
      improvementValue: Math.round(baseValue * 0.7),
      taxAmount: Math.round(baseValue * 0.012),
      millRate: 12.5,
      yearBuilt: Math.floor(1950 + Math.random() * 74),
      squareFootage: Math.floor(800 + Math.random() * 2200),
      lotSize: Math.floor(3000 + Math.random() * 7000),
      propertyType: 'Single Family',
      bedrooms: Math.floor(2 + Math.random() * 4),
      bathrooms: Math.floor(1 + Math.random() * 3),
      stories: Math.floor(1 + Math.random() * 2),
      heating: 'Forced Air',
      cooling: 'Central Air',
      exterior: 'Vinyl Siding',
      roof: 'Asphalt Shingle',
      lastAssessment: new Date(2024, 0, 1)
    };
  }

  private generateMockMarketData(address: string): MarketData {
    const baseValue = 400000 + Math.random() * 300000;
    const sqft = 1000 + Math.random() * 2000;
    
    return {
      estimatedValue: Math.round(baseValue),
      pricePerSqft: Math.round(baseValue / sqft),
      rentEstimate: Math.round(baseValue * 0.008),
      rentPerSqft: Math.round((baseValue * 0.008) / sqft),
      appreciation1Year: (Math.random() - 0.3) * 0.2,
      appreciation5Year: Math.random() * 0.5,
      daysOnMarket: Math.floor(15 + Math.random() * 45),
      inventory: Math.floor(20 + Math.random() * 80),
      priceHistory: this.generatePriceHistory(baseValue),
      comparables: this.generateComparables(address, baseValue, sqft)
    };
  }

  private generateMockPermits(address: string): PermitData[] {
    const permits = [];
    const permitTypes = [
      'Electrical', 'Plumbing', 'HVAC', 'Roofing', 'Addition', 'Renovation'
    ];
    
    const numPermits = Math.floor(Math.random() * 5);
    for (let i = 0; i < numPermits; i++) {
      permits.push({
        permitNumber: `P${Date.now()}-${i}`,
        type: permitTypes[Math.floor(Math.random() * permitTypes.length)],
        description: 'Permit description here',
        value: Math.floor(1000 + Math.random() * 20000),
        issueDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 5),
        status: Math.random() > 0.2 ? 'Completed' : 'Active',
        contractor: 'ABC Construction'
      });
    }
    
    return permits;
  }

  private generateMockViolations(address: string): ViolationData[] {
    // Most properties have no violations
    if (Math.random() > 0.3) return [];
    
    return [{
      violationId: `V${Date.now()}`,
      type: 'Housing Code',
      description: 'Minor maintenance issue',
      issueDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      status: 'Resolved',
      fine: 150
    }];
  }

  private generateMockSales(address: string): SaleData[] {
    const sales = [];
    const numSales = Math.floor(1 + Math.random() * 3);
    let currentPrice = 300000 + Math.random() * 200000;
    
    for (let i = 0; i < numSales; i++) {
      const yearsAgo = (i + 1) * (2 + Math.random() * 3);
      const saleDate = new Date(Date.now() - yearsAgo * 365 * 24 * 60 * 60 * 1000);
      
      sales.push({
        saleDate,
        salePrice: Math.round(currentPrice),
        pricePerSqft: Math.round(currentPrice / (1000 + Math.random() * 1000)),
        deedType: 'Warranty Deed',
        buyer: 'Private Party',
        seller: 'Private Party'
      });
      
      currentPrice *= 0.85; // Earlier sales were cheaper
    }
    
    return sales.reverse(); // Oldest first
  }

  private generateMockDemographics(city: string): DemographicsData {
    return {
      medianIncome: Math.floor(40000 + Math.random() * 60000),
      medianAge: Math.floor(25 + Math.random() * 30),
      populationDensity: Math.floor(1000 + Math.random() * 5000),
      educationLevel: 'Bachelor\'s Degree',
      employmentRate: 0.85 + Math.random() * 0.1
    };
  }

  private generateMockSchools(address: string): SchoolData[] {
    return [
      {
        name: 'Lincoln Elementary',
        type: 'elementary',
        rating: Math.floor(6 + Math.random() * 4),
        distance: Math.random() * 2,
        enrollment: Math.floor(300 + Math.random() * 400)
      },
      {
        name: 'Washington Middle School',
        type: 'middle',
        rating: Math.floor(5 + Math.random() * 5),
        distance: Math.random() * 3,
        enrollment: Math.floor(500 + Math.random() * 600)
      }
    ];
  }

  private generateMockCrime(address: string): CrimeData {
    return {
      crimeRate: Math.floor(10 + Math.random() * 40),
      violentCrimeRate: Math.floor(1 + Math.random() * 10),
      propertyCrimeRate: Math.floor(5 + Math.random() * 30),
      trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any
    };
  }

  private generatePriceHistory(baseValue: number): PricePoint[] {
    const history = [];
    let currentValue = baseValue * 0.7; // Start lower
    
    for (let i = 60; i >= 0; i -= 6) {
      const date = new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000);
      history.push({
        date,
        price: Math.round(currentValue),
        event: i === 0 ? 'Current Estimate' : undefined
      });
      currentValue *= 1.02; // 2% growth every 6 months
    }
    
    return history;
  }

  private generateComparables(address: string, baseValue: number, sqft: number): PropertyComparable[] {
    const comps = [];
    
    for (let i = 0; i < 5; i++) {
      const compValue = baseValue * (0.8 + Math.random() * 0.4);
      const compSqft = sqft * (0.8 + Math.random() * 0.4);
      
      comps.push({
        address: `${100 + i * 10} Nearby Street`,
        distance: Math.random() * 0.5,
        price: Math.round(compValue),
        pricePerSqft: Math.round(compValue / compSqft),
        squareFootage: Math.round(compSqft),
        bedrooms: Math.floor(2 + Math.random() * 3),
        bathrooms: Math.floor(1 + Math.random() * 3),
        yearBuilt: Math.floor(1950 + Math.random() * 74),
        saleDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
      });
    }
    
    return comps;
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
