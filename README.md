# CarbonScore - AI-Powered Carbon Footprint Platform

🌱 **Production-grade carbon footprinting platform for SMEs using ADEME Base Carbone v17 data, with Next.js frontend, Python microservices, ML models, and LLM-powered insights.**

![CarbonScore Platform](https://img.shields.io/badge/Version-1.0.0-green) ![License](https://img.shields.io/badge/License-MIT-blue) ![Python](https://img.shields.io/badge/Python-3.10+-blue) ![Next.js](https://img.shields.io/badge/Next.js-14+-black)

## 🎯 Overview

CarbonScore is a comprehensive carbon footprinting platform that helps SMEs calculate, analyze, and reduce their carbon emissions. Built with modern technologies and deployed on Railway, it combines deterministic ADEME calculations with AI-powered insights and recommendations.

### Key Features

- 🔢 **Deterministic Calculations**: ADEME Base Carbone v17 emission factors
- 🤖 **ML-Powered Insights**: Anomaly detection, imputation, benchmarking
- 📊 **AI Report Generation**: LLM-powered narrative reports in French
- 💬 **Conversational Assistant**: RAG-based sustainability copilot
- 📈 **Interactive Dashboard**: Real-time visualizations and benchmarks
- 🎯 **Action Recommendations**: ML-ranked reduction strategies
- 📄 **Professional Reports**: Branded PDF exports with charts
- 🔐 **Enterprise Ready**: GDPR compliant, multi-tenant, secure

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   FastAPI       │    │   PostgreSQL    │
│   Frontend      │◄──►│   Services      │◄──►│   + pgvector    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   ML & LLM      │              │
         └──────────────►│   Pipeline      │◄─────────────┘
                        │                 │
                        └─────────────────┘
```

### Services

- **Frontend**: Next.js with TypeScript, TailwindCSS, React Query
- **Calc Service**: ADEME factor mapping and deterministic calculations
- **ML Service**: Anomaly detection, imputation, benchmarking models
- **PDF Service**: ReportLab-based report generation with charts
- **LLM Service**: RAG pipeline for AI insights and conversational assistant
- **Worker Service**: Background jobs, training, and batch processing

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.10+ (for local development)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/carbogo.git
cd carbogo
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# At minimum, set your LLM API keys:
# OPENAI_API_KEY=sk-your-key-here
# GROK_API_KEY=gsk-your-key-here
```

### 3. Start Development Environment

```bash
# Start all services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Initialize Database

```bash
# Run migrations
docker-compose exec calc-service python -m alembic upgrade head

# Load ADEME data
docker-compose exec calc-service python scripts/load_ademe_data.py

# Create sample data (optional)
docker-compose exec calc-service python scripts/create_sample_data.py
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **MLflow UI**: http://localhost:5000
- **Admin Panel**: http://localhost:3000/admin

## 📁 Project Structure

```
carbogo/
├── apps/
│   └── web-nextjs/              # Next.js frontend application
├── services/
│   ├── calc-service/            # Calculation microservice
│   ├── ml-service/              # ML inference & training
│   ├── pdf-service/             # Report generation
│   ├── llm-service/             # LLM orchestration
│   └── worker-service/          # Background tasks
├── libs/
│   ├── shared-types/            # Shared TypeScript/Python types
│   ├── database/                # Database models & migrations
│   └── utils/                   # Common utilities
├── data/
│   └── basecarbone-v17-fr.csv   # ADEME emission factors
├── ml/
│   ├── experiments/             # Jupyter notebooks
│   ├── pipelines/               # Training pipelines
│   └── models/                  # Model artifacts
├── infra/
│   ├── docker-compose.yml       # Local development
│   └── railway.json             # Railway configuration
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

## 🔧 Development

### Local Development Setup

```bash
# Install frontend dependencies
cd apps/web-nextjs
npm install
npm run dev

# Install Python service dependencies
cd services/calc-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Running Tests

```bash
# Frontend tests
cd apps/web-nextjs
npm test

# Backend tests
cd services/calc-service
pytest

# Integration tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

### Database Migrations

```bash
# Create new migration
docker-compose exec calc-service alembic revision --autogenerate -m "description"

# Apply migrations
docker-compose exec calc-service alembic upgrade head

# Rollback migration
docker-compose exec calc-service alembic downgrade -1
```

## 🤖 ML Pipeline

### Model Training

```bash
# Train anomaly detection model
docker-compose exec ml-service python -m app.training.anomaly_detection

# Train imputation models
docker-compose exec ml-service python -m app.training.imputation

# Train benchmark model
docker-compose exec ml-service python -m app.training.benchmarking
```

### Model Deployment

Models are automatically versioned using MLflow and deployed via the ML service API endpoints.

## 🚀 Deployment

### Railway Deployment

1. **Connect Repository**: Link your GitHub repository to Railway
2. **Set Environment Variables**: Configure all required environment variables in Railway dashboard
3. **Deploy Services**: Railway will automatically deploy each service based on `railway.json` configuration

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Deploy specific service
railway up --service calc-service

# Check deployment status
railway status
```

### Environment Variables for Production

Key environment variables to set in Railway:

```env
DATABASE_URL=postgresql://...  # Railway Postgres URL
OPENAI_API_KEY=sk-...
GROK_API_KEY=gsk-...
NEXTAUTH_SECRET=...
JWT_SECRET=...
SENTRY_DSN=...
```

## 📊 Monitoring

### Health Checks

- **Frontend**: http://localhost:3000/api/health
- **Calc Service**: http://localhost:8000/health
- **ML Service**: http://localhost:8010/health
- **PDF Service**: http://localhost:8020/health
- **LLM Service**: http://localhost:8030/health

### Metrics & Logging

- **Application Logs**: Structured JSON logging to stdout
- **Metrics**: Prometheus-compatible metrics at `/metrics` endpoints
- **Error Tracking**: Sentry integration for error monitoring
- **Performance**: Built-in performance monitoring and alerting

## 🔐 Security

### Authentication & Authorization

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Multi-factor authentication support
- OAuth integration (Google, Microsoft)

### Data Protection

- Encryption in transit (TLS) and at rest (AES-256)
- GDPR compliance with data retention policies
- Audit logging for all user actions
- Input validation and sanitization

## 📖 API Documentation

### Core Endpoints

- **POST** `/api/v1/calculate` - Run carbon calculation
- **GET** `/api/v1/factors` - ADEME factor lookup
- **POST** `/api/v1/ml/anomaly` - Detect input anomalies
- **POST** `/api/v1/llm/report` - Generate AI report
- **POST** `/api/v1/pdf/generate` - Create PDF report

Full API documentation available at `/docs` when running the services.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript/Python coding standards
- Write tests for new features
- Update documentation for API changes
- Ensure Docker builds pass
- Test Railway deployment before merging

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.carbonscore.com](https://docs.carbonscore.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/carbogo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/carbogo/discussions)
- **Email**: support@carbonscore.com

## 🙏 Acknowledgments

- **ADEME** for providing the Base Carbone emission factors
- **Railway** for the deployment platform
- **OpenAI/Anthropic** for LLM capabilities
- **Open Source Community** for the amazing tools and libraries

---

**Built with for a sustainable future**
