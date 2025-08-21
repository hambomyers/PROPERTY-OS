# PropertyOS Master Technical Specification

## Project Overview

PropertyOS is a unified property management platform that combines instant property data aggregation, AI-powered document processing, and mobile-first interface for property managers. The system enables users to create complete property profiles in 30 seconds by simply typing an address.

## Core Architecture

### Technology Stack
- **Frontend**: React 18.3 + TypeScript + Tailwind CSS
- **State Management**: Zustand + React Query
- **Animation**: Framer Motion
- **Build Tool**: Vite with SWC
- **Backend**: Cloudflare Workers + KV Storage
- **AI Integration**: OpenAI GPT-4V
- **Deployment**: Cloudflare Pages

### Design Principles
1. **Mobile-First**: Optimized for property managers in the field
2. **Instant Feedback**: 30-second property creation from address input
3. **Context-Aware**: Universal command bar adapts to current tab
4. **Progressive Enhancement**: Works offline with cached data
5. **AI-Powered**: Intelligent document processing and insights

## User Interface Specification

### Universal Command Bar
**Location**: Fixed bottom of screen
**Functionality**:
- Text input with address detection
- Voice input via Web Speech API
- Camera input for document capture
- Contextual suggestions based on active tab
- Command processing and routing

**Input Types**:
- **Addresses**: "123 Main Street" → Create property
- **Commands**: "show revenue" → Navigate to financial data
- **Queries**: "maintenance due" → Filter and display results
- **Natural Language**: "How much rent can I charge?" → AI analysis

### Three-Tab Interface

#### Overview Tab 📊
**Purpose**: Property health and key metrics at a glance
**Components**:
- Health Score Circle (0-100) with color coding
- 2x2 Metrics Grid: Monthly Revenue, Occupancy, Next Action, Cap Rate
- Alert Cards with severity levels (info/warning/critical)
- Recent Activity Timeline with icons and timestamps
- Quick Stats with trend indicators

#### Operations Tab 🔧
**Purpose**: Day-to-day property management tasks
**Sub-sections**:
- **Maintenance**: Scheduled tasks, predicted failures, history
- **Tenants**: Current tenants, payment status, lease terms
- **Work Orders**: Open/in-progress/completed with status badges
- **Inspections**: Scheduling and compliance tracking

#### Intelligence Tab 🧠
**Purpose**: Financial analytics and market insights
**Components**:
- Financial Dashboard with P&L charts (Recharts)
- Market Comparables table with nearby properties
- AI Insights cards with actionable recommendations
- Document Vault with file type recognition
- Rent Optimization calculator
- Tax Deduction tracker

## Data Structure Specification

### Property Schema
```typescript
interface Property {
  id: string;
  address: Address;
  geo: [number, number];
  overview: OverviewData;
  operations: OperationsData;
  intelligence: IntelligenceData;
  created: number;
  updated: number;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  formatted: string;
}

interface OverviewData {
  healthScore: number;
  status: 'green' | 'yellow' | 'red';
  alerts: Alert[];
  vitals: PropertyVitals;
  recentActivity: Activity[];
}

interface OperationsData {
  workOrders: WorkOrder[];
  maintenance: MaintenanceData;
  tenants: TenantData[];
  inspections: InspectionData;
}

interface IntelligenceData {
  financial: FinancialData;
  market: MarketData;
  insights: AIInsight[];
  documents: DocumentRefs;
}
```

## Command Processing System

### CommandProcessor Class
**Purpose**: Parse and classify user input
**Methods**:
- `processInput(input: string, context: CommandContext): ProcessedCommand`
- `executeCommand(command: ProcessedCommand): CommandResult`
- `detectContextualCommands(input: string, tab: TabType): Command[]`

### Address Detection
**Regex Patterns**:
- Standard: `(\d+)\s+([A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd))`
- With City/State: `(\d+)\s+([A-Za-z\s]+),?\s+([A-Za-z\s]+),?\s+([A-Z]{2})`
- With ZIP: Include `(\d{5}(?:-\d{4})?)`
- Apartment: Include `(?:Apt|Unit|#)\s*([A-Za-z0-9]+)`

### PropertyGenesis Service
**Purpose**: Generate realistic property data from addresses
**Process**:
1. Parse address components
2. Infer property type from address patterns
3. Generate base value using location algorithms
4. Create comprehensive property profile
5. Calculate health score from multiple factors
6. Store in Zustand and navigate to property view

## API Specification

### Cloudflare Worker Endpoints

#### POST /api/property
**Purpose**: Create new property from address
**Request**:
```json
{
  "address": "123 Main Street, Boston MA 02101",
  "source": "command_bar"
}
```
**Response**:
```json
{
  "success": true,
  "property": { /* Property object */ },
  "processingTime": 1200
}
```

#### GET /api/property/:id
**Purpose**: Retrieve property by ID
**Response**: Full Property object with all tabs data

#### POST /api/command
**Purpose**: Process natural language commands
**Request**:
```json
{
  "input": "show me properties with maintenance due",
  "context": {
    "propertyId": "prop_123",
    "activeTab": "operations"
  }
}
```

### Data Integration APIs

#### Tax Assessment Data
- County assessor APIs
- Zillow Property API
- Redfin market data
- Public records aggregation

#### Market Data Sources
- Rentometer API for rental comps
- Walk Score for neighborhood data
- Crime data APIs
- School district APIs

## AI Integration Specification

### Document Processing
**GPT-4V Integration**:
- Process uploaded images (leases, receipts, insurance docs)
- Extract key information and categorize
- Generate summaries and action items
- Detect document types automatically

### Predictive Analytics
**Maintenance Predictions**:
- Property age and condition analysis
- Historical maintenance patterns
- Weather and seasonal factors
- Cost optimization recommendations

### Natural Language Processing
**Query Understanding**:
- "How much can I raise rent?" → Market analysis
- "What maintenance is due?" → Filter operations
- "Show me my best performing properties" → Financial ranking

## Performance Requirements

### Loading Times
- Initial app load: < 2 seconds
- Property creation: < 30 seconds (including data fetching)
- Tab switching: < 200ms
- Command processing: < 500ms

### Mobile Optimization
- Touch targets: Minimum 44px
- Swipe gestures for tab navigation
- Pull-to-refresh on data views
- Offline functionality with service worker

### Data Caching
- Property data: 24 hours
- Market data: 1 hour
- User preferences: Persistent
- Images: Aggressive caching with compression

## Security Specification

### Authentication
- Cloudflare Access integration
- JWT tokens for API access
- Role-based permissions (Owner, Manager, Viewer)
- Multi-tenant data isolation

### Data Protection
- Encryption at rest (KV storage)
- HTTPS everywhere
- Input sanitization and validation
- Rate limiting on API endpoints

## Deployment Architecture

### Cloudflare Pages
- Automatic deployments from GitHub
- Preview deployments for pull requests
- Custom domain with SSL
- Global CDN distribution

### Cloudflare Workers
- Edge computing for API endpoints
- KV storage for property data
- Durable Objects for real-time features
- Analytics and monitoring

## Testing Strategy

### Unit Tests
- Command processing logic
- Address detection accuracy
- Data transformation functions
- Component rendering

### Integration Tests
- API endpoint functionality
- Database operations
- Authentication flows
- Third-party API integrations

### E2E Tests
- Complete user workflows
- Mobile device testing
- Performance benchmarking
- Accessibility compliance

## Success Metrics

### User Experience
- Property creation time: < 30 seconds
- Command success rate: > 95%
- Mobile usability score: > 90
- User retention: > 80% monthly

### Technical Performance
- Core Web Vitals: All green
- API response time: < 500ms
- Uptime: > 99.9%
- Error rate: < 0.1%

## Future Enhancements

### Phase 11+: Advanced Features
- Multi-property portfolio management
- Automated rent collection integration
- Tenant screening and background checks
- Maintenance vendor marketplace
- IoT device integration (smart locks, sensors)
- Blockchain property records
- AR property visualization
- Advanced ML for market predictions
