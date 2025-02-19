# System Patterns

## Architecture Overview

### High-Level Architecture
```mermaid
flowchart TD
    PWA[PWA Client] <--> API[API Layer]
    API <--> DB[(PostgreSQL)]
    PWA <--> Cache[(IndexedDB)]
    API <--> Storage[File Storage]
```

## Core Patterns

### Offline-First Pattern
- IndexedDB for client-side storage
- Optimistic UI updates
- Background sync queue
- Conflict resolution strategies
- Progressive enhancement

### Data Synchronization
- Queue-based sync system
- Version control for records
- Timestamp-based conflict resolution
- Batch processing for efficiency
- Delta updates when possible

### Form Management
- Dynamic form rendering
- JSON schema validation
- Form state management
- Field dependency handling
- Custom validation rules

### Geospatial Features
- GeoJSON for feature storage
- Spatial indexing
- Vector tile support
- Floor plan registration
- Coordinate system management

## Component Architecture

### Frontend Components
```mermaid
flowchart TD
    App --> Auth[Auth Provider]
    App --> Router[Router]
    Router --> Forms[Forms Module]
    Router --> Maps[Maps Module]
    Router --> Reports[Reports Module]
    
    Forms --> FormBuilder[Form Builder]
    Forms --> FormRenderer[Form Renderer]
    
    Maps --> MapView[Map View]
    Maps --> FeatureEditor[Feature Editor]
    Maps --> FloorPlan[Floor Plan Manager]
```

### Backend Services
```mermaid
flowchart TD
    API[API Gateway] --> Auth[Auth Service]
    API --> Forms[Forms Service]
    API --> Geo[Geo Service]
    API --> Sync[Sync Service]
    API --> Report[Report Service]
```

## Data Patterns

### Feature-Inspection Relationship
```mermaid
flowchart TD
    Feature[Map Feature] --> Inspections[Inspection Records]
    Feature --> Metadata[Feature Metadata]
    Feature --> Geometry[Geometry Data]
```

### Form Data Structure
```json
{
  "formId": "string",
  "version": "number",
  "schema": "object",
  "uiSchema": "object",
  "validationRules": "array",
  "attachments": [{
    "type": "photo",
    "path": "string",
    "metadata": {
      "location": "object",
      "timestamp": "string",
      "optimized": "boolean"
    }
  }]
}
```

## Security Patterns
- JWT-based authentication
- Role-based access control
- Data encryption at rest
- Secure file handling
- API rate limiting

## Performance Patterns
- Lazy loading of components
- Progressive loading of map data
- Efficient form rendering
- Optimized database queries
- Caching strategies

## Error Handling
- Graceful degradation
- Retry mechanisms
- Error boundaries
- Logging and monitoring
- User feedback systems

## Code Preservation Patterns
```mermaid
flowchart TD
    Change[Change Request] --> Assess[Assess Impact]
    Assess --> Confirm{Need Confirmation?}
    Confirm -->|Yes| GetApproval[Get User Approval]
    Confirm -->|No| Proceed[Proceed with Change]
    GetApproval -->|Approved| Backup[Create Backup]
    Backup --> Implement[Implement Change]
    Implement --> Test[Test & Verify]
    Test --> Document[Document Changes]
```

### Key Principles
- Never overwrite components without explicit confirmation
- Preserve unrelated functionality
- Document component changes thoroughly
- Maintain component backups for critical changes
- Isolate feature-specific modifications
- Get approval for major modifications
- Save current work before significant changes

### Implementation Guidelines
- Create component backups before major rewrites
- Use version control effectively
- Document changes in commit messages
- Test preserved functionality
- Maintain component independence
- Follow the principle of least surprise
- Keep changes focused and minimal

### Storage Patterns
```mermaid
flowchart TD
    Upload[File Upload] --> Optimize[Image Optimization]
    Optimize --> Store[Storage Bucket]
    Store --> DB[Database Record]
    DB --> URL[Public URL]
```

- Client-side optimization
- Bucket-based storage
- File type validation
- Automatic cleanup
- URL-based access

### File Handling
- Image optimization pipeline
- Secure file uploads
- Polymorphic relationships
- Metadata tracking
- Location tagging

## Performance Patterns
- Lazy loading of components
- Progressive loading of map data
- Efficient form rendering
- Optimized database queries
- Caching strategies

## Error Handling
- Graceful degradation
- Retry mechanisms
- Error boundaries
- Logging and monitoring
- User feedback systems 