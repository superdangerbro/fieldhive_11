# Technical Context

## Technology Stack

### Frontend
- **Framework**: React 18+
- **State Management**: Redux Toolkit
- **PWA Framework**: Workbox
- **UI Components**: Material-UI (MUI)
- **Form Management**: React Hook Form + Yup
- **Maps**: Mapbox GL JS
- **Offline Storage**: IndexedDB (Dexie.js)
- **API Client**: Axios + React Query

### Backend
- **API Framework**: Node.js + Express
- **Database**: PostgreSQL 15+ with PostGIS
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **File Storage**: MinIO (S3 compatible)
- **Caching**: Redis
- **API Documentation**: OpenAPI/Swagger

### Development Tools
- **Package Manager**: pnpm
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright
- **Code Quality**: ESLint + Prettier
- **API Testing**: Postman/Insomnia
- **Database Tools**: pgAdmin, Redis Commander

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ with PostGIS extensions
- Redis
- MinIO
- pnpm

### Environment Variables
```env
# API
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fieldhive
REDIS_URL=redis://localhost:6379

# Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key

# Auth
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Maps
MAPBOX_TOKEN=your-mapbox-token
```

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies with pnpm
3. Set up environment variables
4. Start development servers
5. Run database migrations

### Database Management
- Use Prisma migrations
- PostGIS for spatial features
- Regular backups
- Version control for schemas

### Testing Strategy
- Unit tests for components
- Integration tests for API
- E2E tests for critical paths
- Performance testing
- Accessibility testing

### Deployment
- Docker containers
- CI/CD pipeline
- Environment-specific configs
- Database migration process
- Backup procedures

## Performance Requirements
- Initial load < 3s
- Time to interactive < 4s
- Offline sync < 30s
- Map render < 2s
- Form submission < 1s
- Photo upload/optimization < 2s
- Average photo size < 300KB

## Security Requirements
- HTTPS everywhere
- Secure cookie handling
- XSS prevention
- CSRF protection
- Rate limiting
- Input validation
- Audit logging

## Monitoring
- Application metrics
- Error tracking
- Performance monitoring
- User analytics
- Server health checks

## Documentation
- API documentation
- Component documentation
- Database schema
- Deployment guides
- User guides

### Storage
- **Service**: Supabase Storage
- **Buckets**:
  - `icons`: Map feature type icons (PNG, SVG, WebP)
  - `floor_plans`: Building floor plans (PNG, JPG, WebP, PDF)
  - `form_photos`: Inspection photos with optimization
- **Image Optimization**:
  - Max dimensions: 1080x1080px
  - WebP format
  - 50% quality compression
  - Automatic aspect ratio preservation
  - Client-side optimization using Canvas API 