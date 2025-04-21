# Login API

## Endpoint

```
POST /api/auth/login
```

## Description

Authenticates a user with their email and password, and returns an authentication token.

## Request Headers

| Header | Value | Description |
|--------|-------|-------------|
| Content-Type | application/json | The content type of the request body |

## Request Body

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

## Response

### Success Response

**Code**: 200 OK

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

### Error Responses

**Code**: 401 Unauthorized

```json
{
  "message": "Invalid credentials",
  "code": "AUTH_INVALID_CREDENTIALS"
}
```

**Code**: 400 Bad Request

```json
{
  "message": "Missing required fields",
  "code": "AUTH_MISSING_FIELDS"
}
```

## Code Example

```javascript
import { authApi } from '../services/api';

const login = async (email, password) => {
  try {
    const response = await authApi.login(email, password);
    // Store token in localStorage or secure cookie
    localStorage.setItem('token', response.token);
    // Store user data
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
``` 