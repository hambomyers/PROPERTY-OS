// Core Property Types
export interface Property {
  id: string;
  address: Address;
  geo: [number, number];
  overview: OverviewData;
  operations: OperationsData;
  intelligence: IntelligenceData;
  created: number;
  updated: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  formatted: string;
}

// Overview Tab Types
export interface OverviewData {
  healthScore: number;
  status: 'green' | 'yellow' | 'red';
  alerts: Alert[];
  vitals: PropertyVitals;
  recentActivity: Activity[];
}

export interface PropertyVitals {
  currentValue: { amount: number; trend: number };
  monthlyRevenue: { amount: number; status: 'collected' | 'pending' | 'late' };
  occupancy: { status: boolean; daysVacant?: number };
  nextAction: { type: string; date: Date; description: string };
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  action?: () => void;
}

export interface Activity {
  id: string;
  timestamp: Date;
  type: 'payment' | 'maintenance' | 'inspection' | 'document';
  description: string;
  metadata?: Record<string, any>;
}

// Operations Tab Types
export interface OperationsData {
  maintenance: MaintenanceData;
  tenants: TenantData[];
  workOrders: WorkOrder[];
  inspections: InspectionData;
}

export interface MaintenanceData {
  scheduled: MaintenanceTask[];
  predicted: PredictedFailure[];
  history: MaintenanceRecord[];
  vendors: VendorContact[];
}

export interface MaintenanceTask {
  id: string;
  component: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  estimatedCost: number;
}

export interface PredictedFailure {
  component: string;
  probability: number;
  timeframe: string;
  preventiveCost: number;
  failureCost: number;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  completedAt?: Date;
  assignedTo?: string;
  estimatedCost: number;
}

// Intelligence Tab Types
export interface IntelligenceData {
  financial: FinancialData;
  market: MarketData;
  insights: AIInsight[];
  documents: DocumentRefs;
}

export interface FinancialData {
  monthlyRevenue: number;
  monthlyExpenses: number;
  noi: number;
  cashFlow: number;
  capRate: number;
  expenses: CategorizedExpenses;
}

export interface CategorizedExpenses {
  maintenance: number;
  insurance: number;
  taxes: number;
  utilities: number;
  management: number;
  other: number;
}

export interface MarketData {
  comps: ComparableProperty[];
  trends: MarketTrends;
  rentOptimization: RentOptimization;
}

export interface ComparableProperty {
  address: string;
  price: number;
  rent: number;
  capRate: number;
  distance: number;
  bedrooms: number;
  bathrooms: number;
}

export interface AIInsight {
  id: string;
  type: 'revenue' | 'expense' | 'maintenance' | 'refinance';
  title: string;
  description: string;
  impact: number;
  effort: 'low' | 'medium' | 'high';
  action: () => void;
  confidence: number;
}

// Command Bar Types
export interface UniversalCommand {
  input: string | Blob | File;
  context: CommandContext;
}

export interface CommandContext {
  propertyId?: string;
  activeTab: 'overview' | 'operations' | 'intelligence';
  location?: [number, number];
  timestamp: number;
  commandType?: CommandType;
}

export interface CommandAction {
  label: string;
  action: () => void;
  primary?: boolean;
}

export interface CommandResponse {
  type: 'success' | 'error' | 'info';
  message: string;
  data?: any;
  actions?: CommandAction[];
}

// Missing type definitions
export interface TenantData {
  id: string;
  name: string;
  unit: string;
  leaseStart: Date;
  leaseEnd: Date;
  rentAmount: number;
  paymentStatus: 'current' | 'late' | 'pending';
  contact: {
    phone: string;
    email: string;
  };
}

export interface InspectionData {
  lastInspection: Date;
  nextDue: Date;
  type: 'annual' | 'moveIn' | 'moveOut' | 'routine';
  report?: string;
}

export interface MaintenanceRecord {
  id: string;
  date: Date;
  type: string;
  description: string;
  cost: number;
  vendor?: string;
  warranty?: boolean;
}

export interface VendorContact {
  id: string;
  name: string;
  service: string;
  phone: string;
  email?: string;
  rating?: number;
  insured: boolean;
}

export interface DocumentRefs {
  insurance?: string[];
  leases?: string[];
  taxes?: string[];
  warranties?: string[];
  permits?: string[];
}

export interface MarketTrends {
  appreciation: number;
  rentGrowth: number;
  daysOnMarket: number;
  inventory: number;
}

export interface RentOptimization {
  currentRent: number;
  marketRent: number;
  recommendedRent: number;
  increaseStrategy: string;
}

// Additional utility types
export type TabType = 'overview' | 'operations' | 'intelligence';

export interface User {
  id: string;
  name: string;
  email: string;
  portfolio: string[];
  settings: UserSettings;
}

export interface UserSettings {
  defaultTab: TabType;
  notifications: boolean;
  theme: 'light' | 'dark';
}
