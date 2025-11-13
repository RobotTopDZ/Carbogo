# CarbonScore — Plan de Production Complet

## Aperçu du Projet

**Goal**: Medium-size production-grade platform for automated carbon footprinting of SMEs using ADEME Base Carbone v17 data, with Next.js frontend, Python microservices, ML models, and LLM-powered report generation. Everything containerized and deployable to Railway.

**Key Constraints**:
- Host everything on Railway (Railway PostgreSQL/MySQL)
- Containerize all services (Docker + docker-compose)
- Use ADEME Base Carbone v17 data (available in `/data/basecarbone-v17-fr.csv`)
- No AWS/GCP/Azure for primary services

## 📊 ADEME Data Analysis

Based on the `basecarbone-v17-fr.csv` file:
- **14,388 emission factors** covering all sectors
- **Categories**: Combustibles (Fossiles/Renouvelables), Transport, Électricité, Matériaux, etc.
- **Units**: kgCO2e/kWh, kgCO2e/kg, kgCO2e/tonne, kgCO2e/GJ, etc.
- **Scopes**: Combustion (Scope 1), Amont (Scope 3), with total emissions
- **Status**: Valide générique, Archivé (use only valid factors)

## 🏗️ High-Level Architecture

### Frontend Layer
- **Next.js App** (TypeScript, React, TailwindCSS)
- **Pages**: Landing, Questionnaire, Dashboard, Reports, Admin
- **Deployment**: Railway container or Vercel

### API Gateway & Auth
- **Next.js API Routes** or dedicated Node.js service
- **Features**: JWT auth, RBAC, rate limiting, API routing

### Backend Microservices (Python FastAPI)
1. **Calculation Service**: ADEME factor mapping, deterministic calculations
2. **ML Service**: Anomaly detection, imputation, benchmarking, action ranking
3. **PDF Service**: ReportLab + chart generation
4. **LLM Service**: RAG pipeline, report generation, conversational assistant
5. **Worker Service**: Background jobs, training, batch processing

### Data Layer
- **Railway PostgreSQL**: Primary database with pgvector extension
- **Persistent Volume**: `/data/artifacts` for PDFs, models, MLflow artifacts
- **Vector Store**: pgvector (preferred) or FAISS fallback

### ML & AI Infrastructure
- **MLflow**: Model versioning with Railway Postgres backend
- **Vector DB**: pgvector for RAG embeddings
- **LLM Integration**: Grok/GPT/Claude via API keys

## 📁 Project Structure

```
carbogo/
├── apps/
│   ├── web-nextjs/                 # Next.js frontend
│   │   ├── pages/
│   │   ├── components/
│   │   ├── lib/
│   │   └── Dockerfile
│   └── admin-panel/                # Admin interface (optional)
├── services/
│   ├── calc-service/               # Calculation microservice
│   │   ├── app/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── ml-service/                 # ML inference & training
│   │   ├── app/
│   │   ├── models/
│   │   ├── training/
│   │   └── Dockerfile
│   ├── pdf-service/                # Report generation
│   │   ├── app/
│   │   ├── templates/
│   │   └── Dockerfile
│   ├── llm-service/                # LLM orchestration
│   │   ├── app/
│   │   ├── prompts/
│   │   ├── rag/
│   │   └── Dockerfile
│   └── worker-service/             # Background tasks
│       ├── app/
│       ├── jobs/
│       └── Dockerfile
├── libs/
│   ├── shared-types/               # TypeScript/Python shared types
│   ├── database/                   # DB models & migrations
│   └── utils/                      # Common utilities
├── data/
│   ├── basecarbone-v17-fr.csv     # ADEME emission factors
│   ├── sectors/                    # Sector benchmarks
│   └── actions/                    # Action bank data
├── ml/
│   ├── experiments/                # Jupyter notebooks
│   ├── pipelines/                  # Training pipelines
│   ├── models/                     # Model artifacts
│   └── datasets/                   # Feature engineering
├── infra/
│   ├── docker-compose.yml          # Local development
│   ├── railway.json               # Railway configuration
│   └── migrations/                 # Database migrations
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
    ├── api/                        # OpenAPI specs
    ├── deployment/                 # Railway deployment guide
    └── user-guide/                 # User documentation
```

## 🎨 Frontend Features & Pages

### 1. Landing Page (`/`)
- **Hero Section**: Value proposition, demo video
- **Features**: Automated calculations, ML insights, PDF reports
- **Social Proof**: Customer testimonials, certifications
- **CTA**: Start free assessment

### 2. Authentication (`/auth`)
- **Login/Register**: Email + password, OAuth (Google/Microsoft)
- **Company Setup**: Sector selection, company size, basic info
- **Onboarding**: Quick tour, sample data

### 3. Questionnaire (`/questionnaire`)
- **Progressive Form**: 15 questions with conditional logic
- **Smart Assistant**: AI-powered help, auto-suggestions
- **Data Import**: CSV upload, ERP connectors
- **Validation**: Real-time checks, anomaly detection
- **Save & Resume**: Draft saving, progress tracking

### 4. Dashboard (`/dashboard`)
- **Overview**: Total emissions, scope breakdown, trends
- **Benchmarks**: Sector comparison, percentile ranking
- **Insights**: AI-generated observations, recommendations
- **Quick Actions**: Re-calculate, generate report, share

### 5. Reports (`/reports`)
- **Report Library**: Generated reports, download history
- **Custom Reports**: Template selection, branding options
- **Sharing**: Email, public links, embed codes
- **Analytics**: View tracking, engagement metrics

### 6. Action Center (`/actions`)
- **Recommended Actions**: ML-ranked by impact/ROI/feasibility
- **Action Bank**: Browse all available actions by category
- **Scenario Planning**: What-if simulations, 2030 projections
- **Implementation**: Vendor connections, progress tracking

### 7. Admin Panel (`/admin`)
- **User Management**: Companies, users, permissions
- **Data Management**: Factor updates, benchmark refresh
- **System Health**: Service status, performance metrics
- **Analytics**: Usage statistics, conversion funnels

### 8. AI Assistant (`/chat`)
- **Conversational Interface**: Natural language queries
- **Context Aware**: Company-specific insights, ADEME references
- **Multi-modal**: Text, charts, document references
- **Learning**: Feedback collection, continuous improvement

## 🔧 Backend Services Detail

### Calculation Service (`calc-service`)
**Endpoints**:
- `POST /api/v1/calculate` - Run carbon calculation
- `GET /api/v1/factors` - ADEME factor lookup
- `POST /api/v1/validate` - Input validation
- `GET /api/v1/trace/{id}` - Calculation audit trail

**Features**:
- ADEME factor loader with versioning
- Input normalization (units, currencies)
- Deterministic scope 1/2/3 calculations
- Calculation traceability
- Benchmark integration

### ML Service (`ml-service`)
**Endpoints**:
- `POST /api/v1/ml/anomaly` - Detect input anomalies
- `POST /api/v1/ml/impute` - Fill missing values
- `POST /api/v1/ml/benchmark` - Predict sector benchmarks
- `POST /api/v1/ml/actions` - Rank action recommendations
- `POST /api/v1/ml/train` - Trigger model training

**Models**:
- **Anomaly Detection**: IsolationForest + Autoencoder
- **Imputation**: LightGBM regressors per field
- **Benchmarking**: Sector-specific emission predictors
- **Action Ranking**: Learning-to-rank with ROI optimization

### PDF Service (`pdf-service`)
**Endpoints**:
- `POST /api/v1/pdf/generate` - Create PDF report
- `GET /api/v1/pdf/{id}` - Download PDF
- `POST /api/v1/charts` - Generate chart images

**Features**:
- ReportLab-based PDF generation
- Plotly chart integration
- Multi-language support (French primary)
- Custom branding/templates
- Watermarking for free tier

### LLM Service (`llm-service`)
**Endpoints**:
- `POST /api/v1/llm/report` - Generate narrative report
- `POST /api/v1/llm/chat` - Conversational assistant
- `POST /api/v1/llm/insights` - Generate insights
- `GET /api/v1/llm/templates` - Prompt templates

**Features**:
- RAG pipeline with pgvector
- Multi-provider LLM support (Grok, GPT, Claude)
- Prompt templating system
- Context-aware responses
- Safety & audit logging

## 🗄️ Database Schema

### Core Tables
```sql
-- Users & Companies
users (id, email, password_hash, role, company_id, settings, created_at)
companies (id, name, sector_code, size_bracket, country, created_at)

-- Questionnaires & Calculations
questionnaire_sessions (id, company_id, answers_json, status, created_at)
calculations (id, session_id, scope1, scope2, scope3, total, trace_json, created_at)
emission_factors (id, ademe_id, name, category, unit, value, scope, status, version)

-- ML & Recommendations
ml_models (id, name, type, version, mlflow_run_id, metrics_json, created_at)
action_bank (id, title, description, impact_formula, feasibility, cost, tags)
recommendations (id, calculation_id, actions_json, ml_model_id, created_at)

-- Reports & Audit
reports (id, calculation_id, content_md, pdf_path, llm_model, generated_at)
audit_logs (id, user_id, action, resource_type, resource_id, timestamp)

-- Vector Store (if using pgvector)
documents (id, type, content, embedding vector(1536), metadata_json)
```

## 🤖 ML Pipeline Detail

### Data Pipeline
1. **Ingestion**: Questionnaire responses → normalized features
2. **Feature Engineering**: Sector encoding, size normalization, ratios
3. **Training**: Scheduled jobs using historical data
4. **Evaluation**: Cross-validation, fairness checks, drift detection
5. **Deployment**: Model serving via FastAPI endpoints

### Training Schedule
- **Daily**: Anomaly detection model updates
- **Weekly**: Imputation model retraining
- **Monthly**: Benchmark model refresh
- **Quarterly**: Action ranking model optimization

### Model Governance
- MLflow tracking with Railway Postgres backend
- Model versioning and A/B testing
- Performance monitoring and alerting
- Explainability with SHAP values

## 🎯 LLM Integration Strategy

### RAG Knowledge Base
- **ADEME Documentation**: Factor explanations, methodologies
- **Sector Benchmarks**: Industry-specific insights
- **Action Database**: Implementation guides, case studies
- **Historical Reports**: Anonymized successful reports

### Prompt Templates
```
System: You are CarbonScore's AI Sustainability Analyst...
Context: {retrieved_documents}
Company: {company_profile}
Data: {calculation_results}
Task: Generate a professional 5-page report in French...
```

### Safety Measures
- Input sanitization and output filtering
- Calculation trace references for auditability
- Conservative phrasing for interpretative insights
- Human review flags for sensitive recommendations

## 🚀 Deployment Strategy

### Railway Configuration
```yaml
# railway.json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "services/calc-service/Dockerfile"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "replicas": 1
  }
}
```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/db
PGVECTOR_ENABLED=true

# ML & AI
MLFLOW_TRACKING_URI=postgresql://...
OPENAI_API_KEY=sk-...
GROK_API_KEY=gsk_...

# Storage
PERSISTENT_ARTIFACT_DIR=/data/artifacts
PDF_STORAGE_PATH=/data/artifacts/reports

# Services
CALC_SERVICE_URL=http://calc-service:8000
ML_SERVICE_URL=http://ml-service:8010
```

### Docker Compose (Local Development)
```yaml
version: '3.8'
services:
  db:
    image: pgvector/pgvector:pg15
    environment:
      POSTGRES_DB: carbogo
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  frontend:
    build: ./apps/web-nextjs
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - calc-service

  calc-service:
    build: ./services/calc-service
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/carbogo
    volumes:
      - artifacts:/data/artifacts
    depends_on:
      - db

  ml-service:
    build: ./services/ml-service
    ports:
      - "8010:8010"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/carbogo
      - MLFLOW_TRACKING_URI=postgresql://postgres:postgres@db:5432/carbogo
    volumes:
      - artifacts:/data/artifacts
    depends_on:
      - db

  pdf-service:
    build: ./services/pdf-service
    ports:
      - "8020:8020"
    volumes:
      - artifacts:/data/artifacts
    depends_on:
      - db

  llm-service:
    build: ./services/llm-service
    ports:
      - "8030:8030"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/carbogo
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - artifacts:/data/artifacts
    depends_on:
      - db

volumes:
  db_data:
  artifacts:
```

## 📋 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] Setup monorepo structure
- [ ] ADEME data loader and factor service
- [ ] Basic Next.js frontend with questionnaire
- [ ] Calculation service with deterministic engine
- [ ] Railway deployment pipeline

### Phase 2: Core Features (Weeks 5-8)
- [ ] User authentication and company management
- [ ] Dashboard with visualizations
- [ ] PDF report generation (basic template)
- [ ] Database schema and migrations
- [ ] Input validation and error handling

### Phase 3: ML Integration (Weeks 9-12)
- [ ] MLflow setup with Railway Postgres
- [ ] Anomaly detection model
- [ ] Data imputation service
- [ ] Benchmark prediction model
- [ ] Model serving infrastructure

### Phase 4: AI Enhancement (Weeks 13-16)
- [ ] LLM service with RAG pipeline
- [ ] pgvector setup and document indexing
- [ ] AI-powered report generation
- [ ] Conversational assistant
- [ ] Smart questionnaire features

### Phase 5: Advanced Features (Weeks 17-20)
- [ ] Action recommendation engine
- [ ] Scenario planning and projections
- [ ] Advanced analytics and insights
- [ ] Multi-tenant and white-labeling
- [ ] API documentation and SDK

### Phase 6: Production Ready (Weeks 21-24)
- [ ] Comprehensive testing suite
- [ ] Performance optimization
- [ ] Security hardening and GDPR compliance
- [ ] Monitoring and alerting
- [ ] User documentation and training

## 🔐 Security & Compliance

### Data Protection
- **Encryption**: TLS in transit, AES-256 at rest
- **Authentication**: JWT with refresh tokens, MFA support
- **Authorization**: RBAC with fine-grained permissions
- **Audit**: Complete action logging and traceability

### GDPR Compliance
- **Consent Management**: Explicit consent for data processing
- **Data Minimization**: Collect only necessary information
- **Right to Delete**: Complete data removal on request
- **Data Portability**: Export functionality for user data

### Security Measures
- **Input Validation**: Comprehensive sanitization and validation
- **Rate Limiting**: API throttling and DDoS protection
- **Secrets Management**: Railway environment variables
- **Vulnerability Scanning**: Automated security checks in CI/CD

## 📊 Monitoring & Analytics

### System Metrics
- **Performance**: API latency, throughput, error rates
- **Resources**: CPU, memory, disk usage per service
- **Database**: Query performance, connection pools
- **ML Models**: Prediction accuracy, drift detection

### Business Metrics
- **User Engagement**: DAU/MAU, session duration, feature usage
- **Conversion**: Signup → completion → report generation
- **Quality**: Report accuracy, user satisfaction scores
- **Growth**: New companies, calculation volume, retention

### Alerting
- **Critical**: Service downtime, database failures
- **Warning**: High error rates, performance degradation
- **Info**: Deployment notifications, model retraining

## 💰 Monetization Strategy

### Freemium Model
- **Free Tier**: Basic calculation, watermarked PDF, limited features
- **Pro Tier**: Full features, custom branding, priority support
- **Enterprise**: Multi-tenant, API access, custom integrations

### Value-Added Services
- **Consulting**: Expert carbon footprint analysis
- **Training**: Sustainability workshops and certification
- **Marketplace**: Carbon credits, green technology vendors
- **API**: Third-party integrations and white-label solutions

## 🎯 Success Metrics

### Technical KPIs
- **Uptime**: 99.9% service availability
- **Performance**: <2s page load times, <500ms API responses
- **Accuracy**: >95% calculation accuracy vs manual audits
- **Scalability**: Handle 10k+ concurrent users

### Business KPIs
- **User Growth**: 1000+ companies in first year
- **Engagement**: 80%+ questionnaire completion rate
- **Retention**: 70%+ monthly active users
- **Revenue**: €500k ARR by end of year 1

This comprehensive plan provides a complete roadmap for building CarbonScore as a production-grade carbon footprinting platform using Railway infrastructure, ADEME data, and modern ML/AI technologies.
