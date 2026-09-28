# Onboarding Guide

## Welcome to the Team

This guide will help you get started with the E-commerce Platform for Personalized Products project.

## Project Overview

This is a monolithic modular e-commerce platform built with:
- **Backend**: Node.js + TypeScript + Express + Prisma
- **Frontend**: React + TypeScript + Vite + Zustand
- **Database**: PostgreSQL
- **Infrastructure**: Render (free tier) + GitHub Actions

## Prerequisites

### Required Tools

- **Node.js** 18+ (LTS)
- **PostgreSQL** 14+ (or use Docker/Podman)
- **Git**
- **VS Code** (recommended) or your preferred IDE

### Optional Tools

- **Docker** or **Podman** for local development
- **Redis** for caching (optional for MVP)
- **Postman** or similar for API testing

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd trab-final
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce?schema=public"
JWT_SECRET=your-secret-key-here
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
```

### 4. Start Database

**Option A: Using Docker/Podman (Recommended)**
```bash
podman-compose up -d
```

**Option B: Using Local PostgreSQL**
- Install PostgreSQL 14+
- Create database: `createdb ecommerce`
- Configure DATABASE_URL in `.env`

### 5. Initialize Database

```bash
npm run prisma:generate
npx prisma db push
npm run prisma:seed
```

### 6. Start Development Server

```bash
npm run dev
```

The server will be available at `http://localhost:3000`

## Project Structure

```
trab-final/
├── src/
│   ├── domains/              # Business domains
│   │   ├── auth/            # Authentication
│   │   ├── catalog/         # Product catalog
│   │   ├── inventory/       # Inventory management
│   │   ├── orders/          # Orders and saga
│   │   ├── customizations/  # Image uploads
│   │   ├── approvals/       # Approval workflow
│   │   ├── production/      # Production queue
│   │   ├── qrcode/          # QR code generation
│   │   └── integrations/    # External APIs
│   ├── shared/              # Shared code
│   │   ├── config/          # Configuration
│   │   ├── middlewares/     # Global middlewares
│   │   ├── services/        # Shared services
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utilities
│   ├── app.ts               # Express app configuration
│   └── index.ts             # Entry point
├── frontend/                # React frontend
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed data
├── uploads/                 # Uploaded files
├── docs/                    # Documentation
├── .github/                 # GitHub Actions workflows
├── .env.example             # Environment template
├── docker-compose.yml       # Docker configuration
├── Dockerfile               # Docker image
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

## Development Workflow

### Branch Strategy

- `main`: Production branch
- `develop`: Integration branch
- `feature/*`: Feature branches
- `fix/*`: Bug fix branches

### Commit Convention

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

Example:
```bash
git commit -m "feat(auth): add refresh token implementation"
```

### Pull Request Process

1. Create feature branch
2. Implement changes
3. Write tests
4. Update documentation
5. Create pull request
6. Request review
7. Address feedback
8. Merge to develop/main

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database

# Testing
npm test                 # Run backend tests
npm run test:frontend    # Run frontend tests
npm run test:integration # Run integration tests
npm run test:coverage    # Run tests with coverage

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
```

## Architecture

### Monolithic Modular

The application follows a monolithic modular architecture with separation by business domain:
- Each domain has its own controllers, services, repositories, and DTOs
- Shared code lives in the `shared` folder
- Domains communicate through well-defined interfaces

### Key Patterns

- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic isolation
- **DTO Pattern**: Data transfer with validation
- **Saga Pattern**: Distributed transaction coordination
- **Circuit Breaker**: Resilience for external APIs

## API Documentation

Swagger documentation is available at:
```
http://localhost:3000/api-docs
```

## Testing

### Backend Tests

```bash
npm test
```

### Frontend Tests

```bash
npm run test:frontend
```

### Integration Tests

```bash
npm run test:integration
```

## Deployment

### CI/CD Pipeline

The project uses GitHub Actions for CI/CD:
- Tests run on every push
- Build and deploy on push to main
- Automatic database migrations
- Health check verification

### Production

The application is deployed on Render (free tier):
- URL: https://your-app.onrender.com
- Database: PostgreSQL (free tier)
- Storage: 100MB disk
- Monitoring: Sentry + UptimeRobot

## Monitoring

### Application Monitoring

- **Sentry**: Error tracking (https://sentry.io)
- **UptimeRobot**: Uptime monitoring (https://uptimerobot.com)
- **Render Dashboard**: Infrastructure metrics

### Logs

Logs are structured with Pino and available in:
- Render Dashboard (production)
- Console (development)
- Log files (if configured)

## Troubleshooting

### Common Issues

**Database connection failed**:
```bash
# Check if PostgreSQL is running
podman-compose ps

# Restart database
podman-compose restart postgres
```

**Port already in use**:
```bash
# Kill process on port 3000 (Windows)
taskkill /F /IM node.exe

# Kill process on port 3000 (Linux/Mac)
lsof -ti:3000 | xargs kill
```

**Build errors**:
```bash
# Clear cache
rm -rf node_modules
npm install
```

## Documentation

- **README.md**: Project overview and setup
- **plan.md**: Architectural decisions
- **spec.md**: Business requirements
- **tasks.md**: Development tasks
- **devops.md**: Infrastructure and operations
- **qa.md**: Testing strategy
- **docs/runbooks/**: Operational procedures

## Getting Help

### Internal Resources

- **Tech Lead**: [contact]
- **Team Chat**: [channel]
- **Documentation**: docs/ folder

### External Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Express Docs**: https://expressjs.com
- **React Docs**: https://react.dev
- **Render Docs**: https://render.com/docs

## Code of Conduct

- Be respectful and inclusive
- Write clear, documented code
- Test your changes
- Review PRs thoroughly
- Ask for help when needed

## Next Steps

1. Complete the setup steps above
2. Read the architecture documentation
3. Explore the codebase
4. Pick a small task to get started
5. Ask questions if anything is unclear

Welcome aboard! 🚀
