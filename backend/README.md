# Blog API

This is a Django-based REST API for a blog application with user authentication and post management.

## Features

- User registration and authentication with JWT tokens
- Create, read, update, and delete blog posts
- Authorization checks to ensure users can only edit/delete their own posts
- Request logging middleware
- Error handling for common scenarios

## Requirements

- Python 3.8+
- Django 4.2+
- pyjwt 2.8+

## Installation

1. Clone the repository
2. Navigate to the `backend` directory
3. Create a virtual environment:
   ```
   python -m venv venv
   ```
4. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`
5. Install the dependencies:
   ```
   pip install -r requirements.txt
   ```
6. Run migrations:
   ```
   python manage.py migrate
   ```
7. Start the development server:
   ```
   python manage.py runserver
   ```

## API Endpoints

### Authentication

- `POST /api/register/` - Register a new user
  - Request body: `{"username": "user123", "password": "password123"}`
  - Response: `{"message": "User created successfully"}`

- `POST /api/login/` - Login and get JWT token
  - Request body: `{"username": "user123", "password": "password123"}`
  - Response: `{"token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."}`

### Posts

- `GET /api/posts/` - Get all posts (public)
  - Response: Array of post objects

- `POST /api/posts/` - Create a new post (authenticated)
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{"title": "Post Title", "content": "Post content"}`
  - Response: Created post object

- `GET /api/posts/<id>/` - Get a specific post (public)
  - Response: Post object

- `PUT /api/posts/<id>/` - Update a post (authenticated, author only)
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{"title": "Updated Title", "content": "Updated content"}`
  - Response: Updated post object

- `DELETE /api/posts/<id>/` - Delete a post (authenticated, author only)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{"message": "Post deleted successfully"}`

## Authentication

- All authenticated endpoints require a valid JWT token in the Authorization header
- Token format: `Authorization: Bearer <token>`
- Tokens expire after 1 hour

## Error Handling

- `401 Unauthorized` - Invalid or expired token
- `403 Forbidden` - Unauthorized action (e.g., editing another user's post)
- `404 Not Found` - Resource not found
- `400 Bad Request` - Invalid request data

## Custom Middleware

The API includes a custom middleware that logs every request method, path, and time taken in milliseconds.