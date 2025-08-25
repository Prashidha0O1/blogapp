# Sample API Request Bodies

This document provides examples of request bodies for various API endpoints.

---

## User Authentication

### 1. Register User (`POST /api/register/`)

Registers a new user account.

```json
{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "securepassword123",
    "first_name": "New",
    "last_name": "User"
}
```

### 2. Login User (`POST /api/login/`)

Authenticates a user and returns access and refresh tokens.

```json
{
    "username": "newuser",
    "password": "securepassword123"
}
```
*Alternatively, you can use email for login:*
```json
{
    "username": "newuser@example.com",
    "password": "securepassword123"
}
```

### 3. Refresh Token (`POST /api/auth/refresh-token/`)

Exchanges a valid refresh token for a new access token and refresh token.

```json
{
    "refresh_token": "your_refresh_token_here"
}
```

---

## Blog Posts

### 1. Create Post (`POST /api/posts/`)

Creates a new blog post. Requires authentication.

```json
{
    "title": "My First Blog Post",
    "content": "This is the amazing content of my very first blog post. I hope you enjoy reading it!"
}
```

### 2. Update Post (`PUT /api/posts/{post_id}/`)

Updates an existing blog post. Requires authentication and ownership of the post.

```json
{
    "title": "An Updated Blog Post Title",
    "content": "The content has been revised and is now even better!"
}
```
