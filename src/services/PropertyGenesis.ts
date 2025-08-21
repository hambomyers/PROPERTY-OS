import { PropertyData, PropertyType, PropertyStatus } from '@/types';
import { AddressMatch } from '@/utils/addressDetection';

export interface PropertyCreationResult {
  success: boolean;
  property?: PropertyData;
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

  private generatePropertyData(addressMatch: AddressMatch): PropertyData {
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
        status: 'green' as const,
        alerts: [],
        vitals: {
          currentValue: { amount: baseValue, trend: 0.05 },
          monthlyRevenue: { amount: Math.round(baseValue * 0.008), status: 'collected' as const },
          occupancy: { status: true },
          nextAction: { type: 'inspection', date: new Date(), description: 'Annual inspection due' }
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
        tenants: [],
        inspections: []
      },
      intelligence: {
        insights: [],
        marketTrends: {
          valueGrowth: 0.05,
          rentGrowth: 0.03,
          marketHealth: 'strong' as const
        },
        recommendations: []
      },
      
      // Financial data
      purchasePrice: baseValue,
      currentValue: Math.round(baseValue * (0.95 + Math.random() * 0.2)), // ±10% variation
      monthlyRent: Math.round(baseValue * 0.008 + Math.random() * 200), // ~0.8% of value
      monthlyExpenses: Math.round(baseValue * 0.003 + Math.random() * 150),
      
      // Calculated metrics
      healthScore: this.generateHealthScore(),
      occupancyRate: 0.95 + Math.random() * 0.05, // 95-100%
      
      // Location data
      neighborhood: this.generateNeighborhood(address),
      city: addressMatch.components.city || this.extractCityFromAddress(address),
      state: addressMatch.components.state || 'MA',
      zipCode: addressMatch.components.zip || this.generateZipCode(),
      
      // Coordinates (mock Boston area)
      coordinates: this.generateCoordinates(),
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Additional data
      description: this.generateDescription(propertyType, address),
      amenities: this.generateAmenities(propertyType),
      
      // Mock tenant data
      tenants: this.generateTenantData(),
      
      // Mock maintenance data
      maintenanceRecords: this.generateMaintenanceRecords(),
      
      // Mock documents
      documents: this.generateDocuments(),
      
      // Market data
      marketTrends: this.generateMarketTrends(),
      
      // Inspection data
      lastInspection: this.generateInspectionData()
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
    return Math.round(70 + Math.random() * 30); // 70-100
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
