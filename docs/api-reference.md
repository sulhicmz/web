# API Reference

This document provides a comprehensive reference for all API endpoints in AstroPro Digital, including both implemented and planned endpoints.

**Legend:**
- ✅ Implemented: Endpoints that are currently available for use
- 📋 Planned: Endpoints that are planned for future implementation

## Authentication

Most API endpoints require authentication. The application uses Supabase Auth for user authentication.

### Authentication Headers
- Include `Authorization: Bearer <token>` header for authenticated requests
- Tokens are obtained through Supabase authentication flows
- Tokens have a default expiration time (typically 1 hour)

## Payment Endpoints ✅

These endpoints are currently implemented and available for use.

### Create Payment Session
**Endpoint**: `POST /api/payments/session`

**Description**: Creates a new payment session with the configured payment provider (Midtrans).

**Request Body**:
```json
{
  "amount": 100000,
  "currency": "IDR",
  "description": "Order description",
  "customer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+6281234567890"
  },
  "items": [
    {
      "id": "item-1",
      "price": 100000,
      "quantity": 1,
      "name": "Product Name"
    }
  ]
}
```

**Response**:
```json
{
  "data": {
    "redirect_url": "https://app.midtrans.com/snap/v3/redirection/...",
    "token": "c3f4e5a6-d7b8-4c9d-a1e2-f3g4h5i6j7k8",
    "transaction_id": "tran-12345"
  },
  "meta": {
    "timestamp": "2024-01-02T00:00:00Z",
    "version": "1.0"
  }
}
```

**Authentication**: Required (Client role or higher)

### Payment Webhook
**Endpoint**: `POST /api/payments/webhook`

**Description**: Handles payment webhook notifications from the payment provider. This endpoint validates signatures before processing.

**Request Body**: Payment provider specific (Midtrans format)

**Response**:
```json
{
  "data": {
    "status": "success",
    "message": "Webhook processed successfully"
  },
  "meta": {
    "timestamp": "2024-01-02T00:00:00Z",
    "version": "1.0"
  }
}
```

**Authentication**: None (validated via signature)

### Subscription Management
**Endpoint**: `POST /api/payments/subscription`

**Description**: Manages subscription-related operations.

**Request Body**: Subscription provider specific

**Response**:
```json
{
  "data": {
    "subscription": {
      "id": "sub-12345",
      "status": "active",
      "provider_data": {}
    }
  },
  "meta": {
    "timestamp": "2024-01-02T00:00:00Z",
    "version": "1.0"
  }
}
```

**Authentication**: Required (Owner or Staff role)

## Notification Endpoints ✅

These endpoints are currently implemented and available for use.

### WhatsApp Notifications
**Endpoint**: `POST /api/notifications/whatsapp`

**Description**: Sends WhatsApp notifications to clients.

**Request Body**:
```json
{
  "to": "+6281234567890",
  "message": "Your message here",
  "template": "notification_template"
}
```

**Response**:
```json
{
  "data": {
    "status": "sent",
    "message_id": "msg-12345"
  },
  "meta": {
    "timestamp": "2024-01-02T00:00:00Z",
    "version": "1.0"
  }
}
```

**Authentication**: Required (Staff or Owner role)

## Portal Endpoints 📋

These endpoints are planned for future implementation and are not yet available.

### Project Management
**Endpoint**: `GET /api/portal/projects`

> ⚠️ **Not Yet Implemented**: This endpoint is planned for future implementation and is not currently available.

**Description**: Retrieves projects for the authenticated user.

**Query Parameters**:
- `limit`: Number of projects to return (default: 10)
- `offset`: Number of projects to skip (default: 0)
- `status`: Filter by project status (optional)

**Response**:
```json
{
  "data": [
    {
      "id": "proj-123",
      "name": "Project Name",
      "status": "active",
      "client_id": "user-456",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-02T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "has_more": false
  },
  "meta": {
    "timestamp": "2024-01-02T00:00:00Z",
    "version": "1.0"
  }
}
```

**Authentication**: Required

### Update Project Status
**Endpoint**: `PUT /api/portal/projects/{projectId}`

> ⚠️ **Not Yet Implemented**: This endpoint is planned for future implementation and is not currently available.

**Description**: Updates the status of a specific project.

**Request Body**:
```json
{
  "status": "completed",
  "notes": "Project has been completed successfully"
}
```

**Response**:
```json
{
  "data": {
    "id": "proj-123",
    "status": "completed",
    "updated_at": "2024-01-02T00:00:00Z"
  },
  "meta": {
    "timestamp": "2024-01-02T00:00:00Z",
    "version": "1.0"
  }
}
```

**Authentication**: Required (Owner, Staff, or assigned Client role)

## User Management Endpoints 📋

These endpoints are planned for future implementation and are not yet available.

### Get User Profile
**Endpoint**: `GET /api/user/profile`

> ⚠️ **Not Yet Implemented**: This endpoint is planned for future implementation and is not currently available.

**Description**: Retrieves the profile information for the authenticated user.

**Response**:
```json
{
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "role": "client",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+6281234567890",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "meta": {
    "timestamp": "2024-01-02T00:00:00Z",
    "version": "1.0"
  }
}
```

**Authentication**: Required

### Update User Profile
**Endpoint**: `PUT /api/user/profile`

> ⚠️ **Not Yet Implemented**: This endpoint is planned for future implementation and is not currently available.

**Description**: Updates the profile information for the authenticated user.

**Request Body**:
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+6289876543210"
}
```

**Response**:
```json
{
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "role": "client",
    "first_name": "Jane",
    "last_name": "Smith",
    "phone": "+6289876543210",
    "updated_at": "2024-01-02T00:00:00Z"
  },
  "meta": {
    "timestamp": "2024-01-02T00:00:00Z",
    "version": "1.0"
  }
}
```

**Authentication**: Required

## Support Ticket Endpoints 📋

These endpoints are planned for future implementation and are not yet available.

### Create Support Ticket
**Endpoint**: `POST /api/support/tickets`

> ⚠️ **Not Yet Implemented**: This endpoint is planned for future implementation and is not currently available.

**Description**: Creates a new support ticket.

**Request Body**:
```json
{
  "subject": "Support Request",
  "description": "Detailed description of the issue",
  "priority": "medium",
  "category": "technical"
}
```

**Response**:
```json
{
  "data": {
    "id": "ticket-123",
    "subject": "Support Request",
    "status": "open",
    "created_at": "2024-01-02T00:00:00Z"
  },
  "meta": {
    "timestamp": "2024-01-02T00:00:00Z",
    "version": "1.0"
  }
}
```

**Authentication**: Required

### Get Support Tickets
**Endpoint**: `GET /api/support/tickets`

> ⚠️ **Not Yet Implemented**: This endpoint is planned for future implementation and is not currently available.

**Description**: Retrieves support tickets for the authenticated user.

**Query Parameters**:
- `limit`: Number of tickets to return (default: 10)
- `offset`: Number of tickets to skip (default: 0)
- `status`: Filter by ticket status (open, closed, in_progress)
- `priority`: Filter by priority (low, medium, high)

**Response**:
```json
{
  "data": [
    {
      "id": "ticket-123",
      "subject": "Support Request",
      "status": "open",
      "priority": "medium",
      "created_at": "2024-01-02T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "has_more": false
  },
  "meta": {
    "timestamp": "2024-01-02T00:00:00Z",
    "version": "1.0"
  }
}
```

**Authentication**: Required

## Billing Endpoints 📋

These endpoints are planned for future implementation and are not yet available.

### Get Billing Information
**Endpoint**: `GET /api/billing`

> ⚠️ **Not Yet Implemented**: This endpoint is planned for future implementation and is not currently available.

**Description**: Retrieves billing information for the authenticated user.

**Response**:
```json
{
  "data": {
    "invoices": [
      {
        "id": "inv-123",
        "amount": 1000000,
        "currency": "IDR",
        "status": "paid",
        "due_date": "2024-02-01",
        "issue_date": "2024-01-01"
      }
    ],
    "payment_methods": [
      {
        "id": "pm-456",
        "type": "credit_card",
        "last_four": "1234",
        "expiry_month": 12,
        "expiry_year": 2025
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-02T00:00:00Z",
    "version": "1.0"
  }
}
```

**Authentication**: Required

### Update Payment Method
**Endpoint**: `POST /api/billing/payment-method`

> ⚠️ **Not Yet Implemented**: This endpoint is planned for future implementation and is not currently available.

**Description**: Updates the user's payment method.

**Request Body**:
```json
{
  "type": "credit_card",
  "token": "payment_token_from_provider"
}
```

**Response**:
```json
{
  "data": {
    "id": "pm-456",
    "type": "credit_card",
    "last_four": "1234",
    "updated_at": "2024-01-02T00:00:00Z"
  },
  "meta": {
    "timestamp": "2024-01-02T00:00:00Z",
    "version": "1.0"
  }
}
```

**Authentication**: Required

## Error Responses

All API endpoints return standard error responses when appropriate:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details"
  }
}
```

### Common Error Codes

- `AUTHENTICATION_REQUIRED`: Authentication is required for this endpoint
- `INSUFFICIENT_PERMISSIONS`: User lacks necessary permissions
- `VALIDATION_ERROR`: Request body validation failed
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `INTERNAL_ERROR`: An unexpected server error occurred
- `PAYMENT_ERROR`: Payment processing failed
- `WEBHOOK_VALIDATION_FAILED`: Webhook signature validation failed

## Rate Limiting

All API endpoints are subject to rate limiting:

- Authenticated users: 100 requests per hour
- Unauthenticated requests: 10 requests per hour
- Payment endpoints: 10 requests per hour (to prevent abuse)

When rate-limited, the API returns a `429 Too Many Requests` status with:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later."
  }
}
```

## CORS Policy

The API follows a strict CORS policy:
- Requests from the same origin as the deployed application are allowed
- Payment webhook endpoints allow requests from configured payment providers
- All other cross-origin requests are blocked for security

## Response Format

All successful API responses follow this format:

```json
{
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2024-01-02T00:00:00Z",
    "version": "1.0"
  }
}
```

For list responses, additional pagination metadata is included:

```json
{
  "data": [ /* list items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "has_more": true
  },
  "meta": {
    "timestamp": "2024-01-02T00:00:00Z",
    "version": "1.0"
  }
}
```