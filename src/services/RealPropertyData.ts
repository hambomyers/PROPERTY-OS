import { Property } from '@/types';

export interface PropertyDataInput {
  address: string;
  purchasePrice?: number;
  currentValue?: number;
  monthlyRent?: number;
  monthlyExpenses?: number;
  yearBuilt?: number;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  tenantName?: string;
  leaseStart?: Date;
  leaseEnd?: Date;
}

export interface RealPropertyAPI {
  // Tax assessor data
  getTaxAssessment(address: string): Promise<TaxAssessmentData>;
  // Market data
  getMarketValue(address: string): Promise<MarketValueData>;
  // Rental comps
  getRentalComps(address: string): Promise<RentalCompData>;
}

export interface TaxAssessmentData {
  assessedValue: number;
  taxAmount: number;
  yearBuilt: number;
  squareFootage: number;
  lotSize: number;
  propertyType: string;
  lastSalePrice?: number;
  lastSaleDate?: Date;
}

export interface MarketValueData {
  estimatedValue: number;
  pricePerSqft: number;
  comparables: PropertyComparable[];
  marketTrends: {
    appreciation: number;
    daysOnMarket: number;
  };
}

export interface RentalCompData {
  averageRent: number;
  rentPerSqft: number;
  occupancyRate: number;
  comparables: RentalComparable[];
}

export interface PropertyComparable {
  address: string;
  price: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  distance: number;
}

export interface RentalComparable {
  address: string;
  rent: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
}

export class RealPropertyDataService {
  private static instance: RealPropertyDataService;

  static getInstance(): RealPropertyDataService {
    if (!RealPropertyDataService.instance) {
      RealPropertyDataService.instance = new RealPropertyDataService();
    }
    return RealPropertyDataService.instance;
  }

  // Create property from manual input
  async createPropertyFromInput(input: PropertyDataInput): Promise<Property> {
    const id = this.generatePropertyId();
    
    // Parse address
    const addressParts = this.parseAddress(input.address);
    
    // Calculate health score from real data
    const healthScore = this.calculateRealHealthScore(input);
    
    return {
      id,
      address: {
        street: addressParts.street,
        city: addressParts.city,
        state: addressParts.state,
        zip: addressParts.zip,
        formatted: input.address
      },
      overview: {
        healthScore,
        status: this.getStatusFromScore(healthScore),
        alerts: this.generateRealAlerts(input),
        vitals: {
          currentValue: { 
            amount: input.currentValue || input.purchasePrice || 0, 
            trend: 0 
          },
          monthlyRevenue: { 
            amount: input.monthlyRent || 0, 
            status: 'collected' as const 
          },
          occupancy: { status: !!input.tenantName },
          nextAction: { 
            type: 'inspection', 
            date: new Date(), 
            description: 'Property review needed' 
          }
        },
        recentActivity: []
      },
      operations: {
        workOrders: [],
        maintenance: {
          scheduled: [],
          predicted: [],
          history: [],
          vendors: []
        },
        tenants: input.tenantName ? [{
          id: 'tenant_1',
          name: input.tenantName,
          unit: '1',
          email: '',
          phone: '',
          leaseStart: input.leaseStart || new Date(),
          leaseEnd: input.leaseEnd || new Date(),
          rent: input.monthlyRent || 0,
          deposit: 0,
          status: 'active' as const
        }] : [],
        inspections: {
          lastInspection: new Date(),
          nextDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          type: 'annual' as const
        }
      },
      intelligence: {
        financial: {
          monthlyRevenue: input.monthlyRent || 0,
          monthlyExpenses: input.monthlyExpenses || 0,
          noi: (input.monthlyRent || 0) - (input.monthlyExpenses || 0),
          cashFlow: (input.monthlyRent || 0) - (input.monthlyExpenses || 0),
          capRate: input.currentValue ? 
            (((input.monthlyRent || 0) - (input.monthlyExpenses || 0)) * 12) / input.currentValue : 0,
          expenses: {
            maintenance: input.monthlyExpenses ? input.monthlyExpenses * 0.3 : 0,
            insurance: input.monthlyExpenses ? input.monthlyExpenses * 0.2 : 0,
            taxes: input.monthlyExpenses ? input.monthlyExpenses * 0.4 : 0,
            utilities: input.monthlyExpenses ? input.monthlyExpenses * 0.1 : 0,
            management: 0,
            other: 0
          }
        },
        market: {
          comps: [],
          trends: {
            appreciation: 0.05,
            rentGrowth: 0.03,
            daysOnMarket: 30,
            inventory: 45
          },
          rentOptimization: {
            currentRent: input.monthlyRent || 0,
            marketRent: input.monthlyRent || 0,
            recommendedRent: input.monthlyRent || 0,
            increaseStrategy: 'maintain'
          }
        },
        insights: [],
        documents: {
          leases: [],
          insurance: [],
          taxes: []
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Fetch real data from APIs (placeholder for now)
  async fetchRealPropertyData(address: string): Promise<Partial<PropertyDataInput>> {
    // TODO: Implement real API calls
    console.log('Fetching real data for:', address);
    
    // This would call real APIs like:
    // - County tax assessor
    // - Zillow API
    // - Rentometer
    // - Google Geocoding
    
    return {
      address,
      // Real data would be populated here
    };
  }

  private calculateRealHealthScore(input: PropertyDataInput): number {
    let score = 70; // Base score
    
    // Age factor
    if (input.yearBuilt) {
      const age = new Date().getFullYear() - input.yearBuilt;
      if (age < 10) score += 15;
      else if (age < 30) score += 10;
      else if (age > 50) score -= 10;
    }
    
    // Cash flow factor
    if (input.monthlyRent && input.monthlyExpenses) {
      const cashFlow = input.monthlyRent - input.monthlyExpenses;
      if (cashFlow > 500) score += 10;
      else if (cashFlow < 0) score -= 20;
    }
    
    // Occupancy factor
    if (input.tenantName) score += 5;
    else score -= 15;
    
    return Math.max(0, Math.min(100, score));
  }

  private getStatusFromScore(score: number): 'green' | 'yellow' | 'red' {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  }

  private generateRealAlerts(input: PropertyDataInput): any[] {
    const alerts = [];
    
    // Cash flow alert
    if (input.monthlyRent && input.monthlyExpenses) {
      const cashFlow = input.monthlyRent - input.monthlyExpenses;
      if (cashFlow < 0) {
        alerts.push({
          type: 'financial',
          severity: 'critical',
          message: 'Negative cash flow detected'
        });
      }
    }
    
    // Lease expiration alert
    if (input.leaseEnd) {
      const daysUntilExpiry = Math.ceil((input.leaseEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 60) {
        alerts.push({
          type: 'tenant',
          severity: 'warning',
          message: `Lease expires in ${daysUntilExpiry} days`
        });
      }
    }
    
    // Vacancy alert
    if (!input.tenantName) {
      alerts.push({
        type: 'tenant',
        severity: 'warning',
        message: 'Property is currently vacant'
      });
    }
    
    return alerts;
  }

  private parseAddress(address: string) {
    // Simple address parsing - would use real geocoding API
    const parts = address.split(',').map(p => p.trim());
    return {
      street: parts[0] || address,
      city: parts[1] || '',
      state: parts[2] || '',
      zip: parts[3] || ''
    };
  }

  private generatePropertyId(): string {
    return `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
