# 🔧 Notion Services Advisor

A fullstack TypeScript application that generates personalized Notion workspace recommendations with ROI calculations and export capabilities. Built to be embedded in Notion pages.

## 🏗️ Architecture

**Frontend**: React + Vite + TypeScript  
**Backend**: Express + TypeScript  
**Validation**: Zod schemas  
**AI**: OpenAI GPT-4 (with fallback to mock data)  
**Package Manager**: npm  

## 📁 Project Structure

```
notion-services-advisor/
├── package.json              # Root package with concurrent dev scripts
├── .env.example              # Environment template
├── vite.config.ts           # Vite configuration with server proxy
├── tsconfig.json            # TypeScript config for client
├── /server/                 # Express backend
│   ├── index.ts            # Server bootstrap with CORS and security headers
│   ├── tsconfig.json       # Server TypeScript config
│   ├── /lib/
│   │   ├── openai.ts       # OpenAI client with fallback
│   │   └── notion.ts       # Notion SDK client
│   ├── /routes/
│   │   ├── advisor.ts      # POST /api/advisor/plan
│   │   ├── validation.ts   # POST /api/validation/plan
│   │   ├── exports.ts      # POST /api/exports/all
│   │   ├── roi.ts          # POST /api/roi/recompute
│   │   └── notion.ts       # POST /api/notion/create-databases (stub)
│   ├── /services/
│   │   ├── advisorService.ts    # LLM orchestration + deterministic augmentation
│   │   ├── validationService.ts # Zod validation + LLM repair
│   │   ├── fitScoreService.ts   # 5-dimension scoring algorithm
│   │   ├── roiService.ts        # Time savings + stack consolidation calculator
│   │   ├── dbGenService.ts      # Industry-specific database generation
│   │   ├── exportService.ts     # SOW, scorecard, template generation
│   │   └── mockService.ts       # Demo data for when OpenAI is unavailable
│   └── /types/
│       └── plan.ts         # Re-exports from shared schemas
├── /shared/
│   ├── schemas.ts          # Zod Plan v2.0 schema (source of truth)
│   └── /examples/
│       └── ecommerce-plan.json  # Sample plan for reference
└── /src/                   # React frontend
    ├── main.tsx            # App entry point
    ├── App.tsx             # Main app component with state management
    ├── api.ts              # Fetch utilities for backend calls
    ├── styles.css          # Global styles with responsive design
    └── /components/
        ├── IntentForm.tsx       # User input form (industry, team, tools, KPIs)
        ├── Results.tsx          # Plan overview and database list
        ├── ROIWidget.tsx        # Interactive ROI calculator with stack toggles
        └── ExportButtons.tsx    # Download SOW, scorecard, template files
```

## 🚀 Quick Start Runbook

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your keys:
- `OPENAI_API_KEY`: Your OpenAI API key (optional - will use mock data if not provided)
- `NOTION_TOKEN`: Your Notion integration token (optional - for database creation)
- `PORT`: Server port (default: 8080)
- `ALLOWED_ORIGINS`: CORS origins for Notion embedding

### 3. Start Development Servers
```bash
npm run dev
```

This runs both servers concurrently:
- **Backend**: http://localhost:8080
- **Frontend**: http://localhost:5173

### 4. Test the Application

1. Open http://localhost:5173
2. Fill out the intent form with:
   - Industry (dropdown)
   - Team size (number)
   - Current tools (comma-separated)
   - KPIs (comma-separated)
   - Constraints (optional)
3. Click "Generate My Notion Plan"
4. Explore the results:
   - View fit score breakdown
   - Toggle ROI calculator stack items
   - Download SOW, scorecard, and template files

### 5. For Notion Embedding

1. **Deploy Backend**: Deploy to Render, Railway, or similar
2. **Deploy Frontend**: Deploy to Vercel, Netlify, or similar
3. **Update CORS**: Add your frontend URL to `ALLOWED_ORIGINS`
4. **Embed in Notion**: Use `/embed` block with your frontend URL

## ⚙️ Core Features

### 🎯 Plan Generation
- **Industry-Specific Templates**: Tailored database schemas for 6 industries
- **AI-Powered Recommendations**: GPT-4 generates custom workflows and governance
- **Fallback System**: Mock data when OpenAI unavailable for demos
- **Schema Validation**: Zod ensures type safety and data integrity

### 📊 ROI Calculator
- **Stack Consolidation**: Toggle 12 common SaaS tools with pricing
- **Time Savings**: Configurable hourly rate and hours saved
- **Dynamic Updates**: Real-time recalculation via API
- **Payback Analysis**: Monthly payback period calculation

### 📈 Fit Scoring (Notion's Method)
5-dimension weighted scoring:
- **Data Readiness** (25%): Existing data infrastructure quality
- **Governance Complexity** (20%): Team structure and compliance needs  
- **Workflow Repeatability** (30%): Process standardization level
- **Connector Availability** (15%): Integration ecosystem strength
- **Change Appetite** (10%): Team willingness to adopt new tools
- **Industry Factor**: 0.5-1.5x multiplier based on industry fit

### 📄 Export System
- **SOW Document**: Statement of work with timeline and pricing
- **Pilot Scorecard**: Success metrics and evaluation criteria
- **Template JSON**: Notion workspace configuration

## 🛠️ API Endpoints

### POST `/api/advisor/plan`
Generate a complete Notion implementation plan
```typescript
Request: {
  industry: "saas" | "ecommerce" | "legal" | "consulting" | "marketing" | "technology",
  team_size: number,
  tools: string[],
  kpis: string[],
  constraints?: string[]
}
Response: Plan (see shared/schemas.ts)
```

### POST `/api/roi/recompute`
Recalculate ROI with different parameters
```typescript
Request: {
  team_size: number,
  enabledKeys?: string[],
  avg_hourly_rate?: number,
  hours_saved_per_week?: number,
  implementation_cost?: number
}
Response: ROI
```

### POST `/api/exports/all`
Generate all export documents
```typescript
Request: Plan
Response: {
  sow_markdown: string,
  pilot_scorecard_markdown: string,
  notion_template_json: object
}
```

### POST `/api/validation/plan`
Validate plan against schema
```typescript
Request: Plan
Response: { valid: boolean, plan?: Plan, error?: string }
```

### POST `/api/notion/create-databases`
Create Notion databases (stub implementation)
```typescript
Request: {
  parentPageId: string,
  plan: Plan
}
Response: { dry_run: true, databases: DatabaseInfo[] }
```

## 🎨 Design System

### Colors
- **Primary**: #3b82f6 (Blue 500)
- **Success**: #10b981 (Emerald 500)  
- **Background**: #f8fafc (Slate 50)
- **Text**: #334155 (Slate 700)
- **Muted**: #64748b (Slate 500)

### Components
- **Cards**: White background, subtle shadows, rounded corners
- **Buttons**: Primary/secondary variants with hover states
- **Forms**: Clean inputs with focus states and help text
- **Grid**: Responsive grid layouts for stats and content

## 🔒 Security & Production

### Headers for Notion Embedding
```javascript
X-Frame-Options: ALLOW-FROM https://www.notion.so
Content-Security-Policy: frame-ancestors 'self' https://www.notion.so
```

### Environment Variables
- Never log `OPENAI_API_KEY` or `NOTION_TOKEN`
- Use placeholder keys for development
- Validate CORS origins in production

### Error Handling
- Graceful fallbacks for API failures
- User-friendly error messages
- Comprehensive server-side validation

## 🧪 Testing the Demo

The app works fully without real API keys:

1. **Mock Data**: Returns realistic SaaS company plan
2. **ROI Calculator**: Fully functional with real calculations
3. **Export System**: Generates actual markdown and JSON files
4. **Responsive Design**: Works on mobile, tablet, and desktop

## 🚢 Production Deployment

### Backend (Render/Railway)
```bash
npm run build:server
# Deploy server/ directory
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ directory
```

### Environment Variables
Set production values for:
- `OPENAI_API_KEY`
- `NOTION_TOKEN` 
- `ALLOWED_ORIGINS` (include your frontend domain)

---

**Built with ❤️ for seamless Notion workspace planning**
