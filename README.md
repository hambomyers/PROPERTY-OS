# PropertyOS

A unified property management platform that combines instant property data aggregation, AI-powered document processing, and mobile-first interface for property managers.

## 🏠 Features

- **Instant Property Creation**: Type any address → Get complete property profile in 30 seconds
- **Universal Command Bar**: Text/voice/photo input with context-aware responses
- **Three-Tab Interface**: Overview, Operations, Intelligence
- **Mobile-First Design**: Optimized for property managers in the field
- **AI-Powered**: Document analysis, predictive maintenance, smart insights

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📱 Interface

### Overview Tab
- Property health score (0-100)
- Quick metrics: Revenue, Occupancy, Next Action, Cap Rate
- Active alerts and recent activity

### Operations Tab
- Maintenance tracking and predictions
- Tenant management
- Work order system
- Inspection scheduling

### Intelligence Tab
- Financial analytics and P&L
- Market comparables
- AI insights and recommendations
- Document vault

## 🛠 Tech Stack

- **Frontend**: React 18.3 + TypeScript + Tailwind CSS
- **State**: Zustand + React Query
- **Animation**: Framer Motion
- **Build**: Vite with SWC
- **Backend**: Cloudflare Workers + KV (planned)
- **AI**: OpenAI GPT-4V (planned)

## 📋 Development Plan

This project follows a 10-phase development plan:

1. ✅ **Foundation**: Basic three-tab layout and command bar UI
2. 🔄 **Command Intelligence**: Text parsing and contextual processing
3. 📊 **Property Genesis**: Instant property creation from addresses
4. 📈 **Overview Tab**: Health metrics and activity timeline
5. 🔧 **Operations Tab**: Maintenance, tenants, work orders
6. 🧠 **Intelligence Tab**: Financial analytics and insights
7. ☁️ **Backend**: Cloudflare Worker with KV storage
8. 🌐 **Real Data**: API integrations for tax/market data
9. 🤖 **AI Features**: Document processing and voice commands
10. 🚀 **Production**: PWA, offline support, deployment

See [docs/DEVPLAN.md](docs/DEVPLAN.md) for detailed implementation plan.

## 📖 Documentation

- [Master Specification](docs/MASTER_SPEC.md) - Complete technical specification
- [Development Plan](docs/DEVPLAN.md) - 10-phase implementation roadmap

## 🎯 Current Status

**Phase 1 Complete**: Foundation built with three-tab layout, universal command bar, and responsive design.

**Next**: Phase 2 - Command bar intelligence and address detection.

## 🤝 Contributing

This is an active development project. Each phase builds upon the previous one with working functionality at every step.

## 📄 License

MIT License - see LICENSE file for details.
