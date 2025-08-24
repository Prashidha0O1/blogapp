# Full Stack Blog Application

A full-stack blog application with a Next.js frontend and Django backend, dockerized for easy deployment.

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Clone the repository
2. Navigate to the project root directory
3. Run the following command to start the application:

```bash
docker-compose up --build
```

This will start three services:
- Frontend (Next.js) on http://localhost:3000
- Backend (Django) on http://localhost:8000
- PostgreSQL database on port 5432

## Services

### Frontend
- Built with Next.js
- Accessible at 
- Connects to the backend API at 

### Backend
- Built with Django
- API accessible at 
- Admin interface at 
- Connected to PostgreSQL database

### Database
- PostgreSQL database
- Database name: blog_db
- User: postgres
- Password: postgres

## Development

### Backend Development
To run backend development commands, use:

```bash
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### Frontend Development
The frontend development server with hot reloading is available at 

## Features

- User authentication (registration and login)
- Create, read, update, and delete blog posts
- Responsive design
- Error handling for unauthorized access (403) and not found (404) pages
- Dockerized for easy deployment

## API Endpoints

### Authentication
- POST /api/auth/register/ - Register a new user
- POST /api/auth/login/ - Login user

### Posts
- GET /api/posts/ - List all posts
- POST /api/posts/ - Create a new post (requires authentication)
- GET /api/posts/{id}/ - Get a specific post
- PUT /api/posts/{id}/ - Update a post (requires authentication and ownership)
- DELETE /api/posts/{id}/ - Delete a post (requires authentication and ownership)

## Environment Variables

### Frontend
- NEXT_PUBLIC_API_URL - Backend API URL (defaults to http://localhost:8000/api)

### Backend
- DEBUG - Django debug mode (1 for True, 0 for False)