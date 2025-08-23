# Django Backend Architecture (Without DRF)

## Project Overview

This document outlines the architecture for a Django backend implementation for a blog application without using Django REST Framework (DRF). The backend will expose a REST API with JWT-based authentication.

## Project Structure

```
backend/
├── blog_project/          # Django project directory
│   ├── __init__.py
│   ├── settings.py        # Project settings
│   ├── urls.py            # Main URL configuration
│   ├── wsgi.py            # WSGI deployment entry point
│   └── asgi.py            # ASGI deployment entry point
├── blog_api/              # Main application
│   ├── __init__.py
│   ├── models.py          # Data models (User, Post)
│   ├── views.py           # API endpoints
│   ├── urls.py            # Application URL configuration
│   ├── serializers.py     # Data serialization (custom implementation)
│   ├── middleware.py      # Custom request logging middleware
│   ├── auth.py            # JWT authentication utilities
│   ├── decorators.py      # Custom decorators for authentication
│   ├── exceptions.py      # Custom exception classes
│   └── utils.py           # Utility functions
├── manage.py              # Django management script
├── requirements.txt       # Python dependencies
└── README.md              # Project documentation
```

## Data Models

### User Model
We extend Django's AbstractUser to leverage built-in authentication features while allowing for future extensions:

```python
class User(AbstractUser):
    # Using default fields from AbstractUser
    pass
```

### Post Model
The Post model contains all required fields:

```python
class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    created_at = models.DateTimeField(auto_now_add=True)
```

## JWT Authentication System

### Components

1. **Token Generation**: Create JWT with user ID and 1-hour expiry
2. **Token Verification**: Validate JWT and extract user ID
3. **Authentication Decorator**: Protect views requiring authentication

### Flow

1. User sends credentials to `/login/` endpoint
2. Server validates credentials
3. Server generates JWT token with 1-hour expiry
4. Token is returned to client
5. Client includes token in `Authorization: Bearer <token>` header for authenticated requests
6. Server validates token on each authenticated request

## API Endpoints

### Authentication Endpoints

| Method | Endpoint    | Description              | Auth Required |
|--------|-------------|--------------------------|---------------|
| POST   | /register/  | Register a new user      | No            |
| POST   | /login/     | Authenticate and get JWT | No            |

### Post Management Endpoints

| Method | Endpoint      | Description              | Auth Required |
|--------|---------------|--------------------------|---------------|
| GET    | /posts/       | Get all posts            | No            |
| GET    | /posts/<id>/  | Get specific post        | No            |
| POST   | /posts/       | Create new post          | Yes           |
| PUT    | /posts/<id>/  | Edit a post              | Yes (author)  |
| DELETE | /posts/<id>/  | Delete a post            | Yes (author)  |

## Custom Middleware

### Request Logging Middleware

Logs every request with:
- HTTP method
- Request path
- Time taken for processing (in milliseconds)
- Timestamp

## Error Handling

### Error Responses

1. **401 Unauthorized**
   - Missing, invalid, or expired JWT token

2. **403 Forbidden**
   - User trying to perform unauthorized action (e.g., editing others' posts)

3. **404 Not Found**
   - Requested resource doesn't exist

4. **400 Bad Request**
   - Missing required fields or invalid data

### Response Format

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

## Implementation Phases

### Phase 1: Project Setup
1. Create Django project structure
2. Install dependencies (Django, pyjwt, etc.)
3. Configure settings.py

### Phase 2: Data Models
1. Implement User and Post models
2. Run database migrations

### Phase 3: Authentication System
1. Implement JWT token generation/validation
2. Create authentication decorator
3. Implement /register/ and /login/ endpoints

### Phase 4: API Endpoints
1. Implement all post management endpoints
2. Create URL configurations

### Phase 5: Middleware and Error Handling
1. Implement request logging middleware
2. Implement comprehensive error handling

### Phase 6: Testing and Documentation
1. Test all endpoints
2. Create API documentation