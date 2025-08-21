import { Property, PropertyType, PropertyStatus } from '@/types';
import { AddressMatch } from '@/utils/addressDetection';

export interface PropertyCreationResult {
  success: boolean;
  property?: Property;
  message: string;
}

export class PropertyGenesis {
  private static instance: PropertyGenesis;

  static getInstance(): PropertyGenesis {
    if (!PropertyGenesis.instance) {
      PropertyGenesis.instance = new PropertyGenesis();
    }
    return PropertyGenesis.instance;
  }

  async createPropertyFromAddress(addressMatch: AddressMatch): Promise<PropertyCreationResult> {
    try {
      // Simulate API delay for realistic feel
      await this.delay(800);

      const property = this.generatePropertyData(addressMatch);
      
      return {
        success: true,
        property,
        message: `Property created for ${addressMatch.formatted}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create property: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private generatePropertyData(addressMatch: AddressMatch): Property {
    const id = this.generatePropertyId();
    const address = addressMatch.formatted;
    
    // Generate realistic mock data based on address
    const propertyType = this.inferPropertyType(address);
    const baseValue = this.generateBaseValue(propertyType);
    
    return {
      id,
      address: {
        street: address,
        city: this.extractCityFromAddress(address),
        state: 'MA',
        zip: '02101',
        formatted: address
      },
      geo: [42.3601, -71.0589] as [number, number],
      overview: {
        healthScore: this.generateHealthScore(),
        status: this.generatePropertyStatus(),
        alerts: this.generateAlerts(),
        vitals: {
          currentValue: { amount: baseValue, trend: this.generateTrend() },
          monthlyRevenue: { amount: Math.round(baseValue * 0.008), status: this.generateRevenueStatus() },
          occupancy: { status: Math.random() > 0.1 },
          nextAction: this.generateNextAction()
        },
        recentActivity: this.generateRecentActivity()
      },
      operations: {
        workOrders: [],
        maintenance: {
          scheduled: [],
          predicted: [],
          history: [],
          vendors: []
        },
        tenants: [],
        inspections: {
          lastInspection: new Date(),
          nextDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          type: 'annual' as const
        }
      },
      intelligence: {
        financial: {
          monthlyRevenue: Math.round(baseValue * 0.008),
          monthlyExpenses: Math.round(baseValue * 0.003),
          noi: Math.round(baseValue * 0.005),
          cashFlow: Math.round(baseValue * 0.005),
          capRate: 0.06,
          expenses: {
            maintenance: Math.round(baseValue * 0.001),
            insurance: Math.round(baseValue * 0.0005),
            taxes: Math.round(baseValue * 0.001),
            utilities: Math.round(baseValue * 0.0003),
            management: Math.round(baseValue * 0.0002),
            other: Math.round(baseValue * 0.0001)
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
            currentRent: Math.round(baseValue * 0.008),
            marketRent: Math.round(baseValue * 0.0085),
            recommendedRent: Math.round(baseValue * 0.0082),
            increaseStrategy: 'gradual'
          }
        },
        insights: [],
        documents: {
          leases: [],
          insurance: [],
          taxes: []
        }
      },
      created: Date.now(),
      updated: Date.now()
    };
  }

  private generatePropertyId(): string {
    return `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private inferPropertyType(address: string): PropertyType {
    const lower = address.toLowerCase();
    
    if (lower.includes('apt') || lower.includes('unit') || lower.includes('#')) {
      return 'apartment';
    }
    if (lower.includes('condo') || lower.includes('condominium')) {
      return 'condo';
    }
    if (lower.includes('townhouse') || lower.includes('town')) {
      return 'townhouse';
    }
    
    // Default to single family
    return 'single_family';
  }

  private generateBaseValue(propertyType: PropertyType): number {
    const baseValues = {
      single_family: 450000,
      condo: 320000,
      townhouse: 380000,
      apartment: 280000,
      multi_family: 650000,
      commercial: 850000
    };
    
    const base = baseValues[propertyType] || 400000;
    return Math.round(base * (0.8 + Math.random() * 0.6)); // ±30% variation
  }

  private generateBedrooms(propertyType: PropertyType): number {
    if (propertyType === 'apartment') return Math.floor(Math.random() * 3) + 1; // 1-3
    if (propertyType === 'condo') return Math.floor(Math.random() * 3) + 1; // 1-3
    return Math.floor(Math.random() * 4) + 2; // 2-5
  }

  private generateBathrooms(propertyType: PropertyType): number {
    if (propertyType === 'apartment') return Math.floor(Math.random() * 2) + 1; // 1-2
    return Math.floor(Math.random() * 3) + 1; // 1-3
  }

  private generateSquareFootage(propertyType: PropertyType): number {
    const ranges = {
      apartment: [600, 1200],
      condo: [800, 1500],
      townhouse: [1200, 2000],
      single_family: [1500, 3000],
      multi_family: [2000, 4000],
      commercial: [2000, 10000]
    };
    
    const [min, max] = ranges[propertyType] || [1000, 2000];
    return Math.round(min + Math.random() * (max - min));
  }

  private generateYearBuilt(): number {
    return Math.floor(1950 + Math.random() * 74); // 1950-2024
  }

  private generateLotSize(propertyType: PropertyType): number {
    if (propertyType === 'apartment' || propertyType === 'condo') return 0;
    return Math.round(3000 + Math.random() * 7000); // 3000-10000 sq ft
  }

  private generateHealthScore(): number {
    return Math.floor(Math.random() * 30) + 70; // 70-100 range
  }

  private generatePropertyStatus(): 'green' | 'yellow' | 'red' {
    const score = this.generateHealthScore();
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  }

  private generateAlerts(): any[] {
    const alerts = [];
    const alertTypes = [
      { type: 'maintenance', severity: 'warning', message: 'HVAC filter replacement due' },
      { type: 'financial', severity: 'info', message: 'Rent increase opportunity available' },
      { type: 'compliance', severity: 'critical', message: 'Fire inspection required' },
      { type: 'tenant', severity: 'warning', message: 'Lease renewal due in 30 days' }
    ];
    
    // Randomly add 0-2 alerts
    const numAlerts = Math.floor(Math.random() * 3);
    for (let i = 0; i < numAlerts; i++) {
      alerts.push(alertTypes[Math.floor(Math.random() * alertTypes.length)]);
    }
    return alerts;
  }

  private generateTrend(): number {
    return (Math.random() - 0.5) * 0.2; // -10% to +10%
  }

  private generateRevenueStatus(): 'collected' | 'pending' | 'late' {
    const statuses = ['collected', 'pending', 'late'];
    const weights = [0.8, 0.15, 0.05]; // 80% collected, 15% pending, 5% late
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return statuses[i] as 'collected' | 'pending' | 'late';
      }
    }
    return 'collected';
  }

  private generateNextAction(): any {
    const actions = [
      { type: 'inspection', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), description: 'Annual safety inspection' },
      { type: 'maintenance', date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), description: 'HVAC service appointment' },
      { type: 'lease', date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), description: 'Lease renewal discussion' },
      { type: 'financial', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), description: 'Rent collection follow-up' }
    ];
    return actions[Math.floor(Math.random() * actions.length)];
  }

  private generateRecentActivity(): any[] {
    const activities = [
      { type: 'payment', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), description: 'Rent payment received - $2,400', icon: '💰' },
      { type: 'maintenance', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), description: 'Plumbing repair completed', icon: '🔧' },
      { type: 'inspection', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), description: 'Monthly property inspection', icon: '📋' },
      { type: 'tenant', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), description: 'New tenant application approved', icon: '👥' }
    ];
    
    // Return 2-4 recent activities
    const numActivities = Math.floor(Math.random() * 3) + 2;
    return activities.slice(0, numActivities);
  }

  private generateNeighborhood(address: string): string {
    const neighborhoods = [
      'Back Bay', 'North End', 'Beacon Hill', 'South End', 'Cambridge',
      'Somerville', 'Jamaica Plain', 'Charlestown', 'Dorchester', 'Roxbury'
    ];
    return neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
  }

  private extractCityFromAddress(address: string): string {
    // Simple extraction - in real app would use geocoding
    return 'Boston';
  }

  private generateZipCode(): string {
    const bostonZips = ['02101', '02102', '02108', '02109', '02110', '02111', '02113', '02114', '02115'];
    return bostonZips[Math.floor(Math.random() * bostonZips.length)];
  }

  private generateCoordinates(): { lat: number; lng: number } {
    // Mock Boston area coordinates
    return {
      lat: 42.3601 + (Math.random() - 0.5) * 0.1,
      lng: -71.0589 + (Math.random() - 0.5) * 0.1
    };
  }

  private generateDescription(propertyType: PropertyType, address: string): string {
    const descriptions = {
      single_family: `Beautiful single-family home located at ${address}. Features modern amenities and excellent neighborhood access.`,
      condo: `Stylish condominium unit at ${address} with contemporary finishes and building amenities.`,
      townhouse: `Spacious townhouse at ${address} offering the perfect blend of privacy and community living.`,
      apartment: `Well-maintained apartment unit at ${address} in a desirable location with easy transportation access.`,
      multi_family: `Investment property at ${address} with multiple units and strong rental potential.`,
      commercial: `Commercial property at ${address} with excellent visibility and foot traffic.`
    };
    
    return descriptions[propertyType] || `Property located at ${address}.`;
  }

  private generateAmenities(propertyType: PropertyType): string[] {
    const commonAmenities = ['Parking', 'Laundry', 'Storage'];
    const typeSpecific = {
      single_family: ['Yard', 'Garage', 'Basement', 'Deck'],
      condo: ['Gym', 'Concierge', 'Roof Deck', 'Pool'],
      townhouse: ['Patio', 'Garage', 'Basement'],
      apartment: ['Elevator', 'Doorman', 'Gym'],
      multi_family: ['Multiple Units', 'Separate Entrances'],
      commercial: ['Loading Dock', 'Conference Rooms', 'Reception']
    };
    
    const specific = typeSpecific[propertyType] || [];
    const selected = [...commonAmenities];
    
    // Add 2-3 type-specific amenities
    for (let i = 0; i < Math.min(3, specific.length); i++) {
      if (Math.random() > 0.3) {
        selected.push(specific[i]);
      }
    }
    
    return selected;
  }

  private generateTenantData(): any[] {
    // Mock tenant data - simplified for now
    return [
      {
        id: 'tenant_1',
        name: 'John & Sarah Smith',
        unit: 'Main',
        leaseStart: '2024-01-01',
        leaseEnd: '2024-12-31',
        monthlyRent: 2400,
        status: 'active'
      }
    ];
  }

  private generateMaintenanceRecords(): any[] {
    return [
      {
        id: 'maint_1',
        type: 'HVAC Service',
        date: '2024-01-15',
        cost: 150,
        status: 'completed'
      }
    ];
  }

  private generateDocuments(): any[] {
    return [
      {
        id: 'doc_1',
        name: 'Property Deed',
        type: 'legal',
        uploadDate: '2024-01-01'
      }
    ];
  }

  private generateMarketTrends(): any {
    return {
      averageRent: 2800,
      rentGrowth: 0.05,
      occupancyRate: 0.94,
      daysOnMarket: 15
    };
  }

  private generateInspectionData(): any {
    return {
      date: '2024-01-01',
      score: 85,
      issues: ['Minor plumbing leak', 'Paint touch-up needed']
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
