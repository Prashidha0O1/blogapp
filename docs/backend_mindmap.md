# Django Backend Mind Map

## Core Components
- **Django Project** (blog_project)
  - Settings
  - URL Configuration
  - WSGI/ASGI

- **Main App** (blog_api)
  - Models
  - Views
  - URLs
  - Middleware
  - Authentication
  - Utilities

## Data Layer
- **Models**
  - User (extends AbstractUser)
  - Post (title, content, author, created_at)

## Authentication System
- **pyjwt Library**
- **Custom Implementation**
  - Token Generation (1-hour expiry)
  - Token Verification
  - Authentication Decorator (@token_required)
- **Endpoints**
  - POST /register/
  - POST /login/

## API Endpoints
- **Public**
  - GET /posts/
  - GET /posts/<id>/

- **Authenticated**
  - POST /posts/
  - PUT /posts/<id>/
  - DELETE /posts/<id>/

## Middleware
- **Request Logging**
  - Method
  - Path
  - Processing Time (ms)
  - Timestamp

## Error Handling
- **401 Unauthorized**
  - Invalid/missing token

- **403 Forbidden**
  - Unauthorized actions

- **404 Not Found**
  - Missing resources

- **400 Bad Request**
  - Validation errors

## Implementation Flow
1. Project Setup
2. Models Implementation
3. Authentication System
4. API Endpoints
5. Middleware
6. Error Handling
7. Testing
8. Documentation