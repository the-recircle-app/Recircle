# ReCircle API Documentation

## 📋 Overview

The ReCircle API provides endpoints for managing users, receipts, rewards, and achievements in the sustainable transportation rewards platform. All endpoints use RESTful conventions and return JSON responses.

## 🔐 Authentication

### Session-Based Authentication
```http
POST /api/auth/connect-wallet
Content-Type: application/json

{
  "walletAddress": "0x...",
  "signature": "0x...",
  "message": "Authentication message"
}
```

### Response
```json
{
  "success": true,
  "user": {
    "id": 1,
    "walletAddress": "0x...",
    "dailyStreak": 3,
    "totalEarnings": 150.5
  }
}
```

## 👤 User Management

### Get User Profile
```http
GET /api/users/{userId}
```

**Response:**
```json
{
  "id": 1,
  "walletAddress": "0x123...",
  "dailyStreak": 5,
  "totalEarnings": 250.75,
  "createdAt": "2025-01-01T00:00:00Z",
  "lastActiveDate": "2025-01-15T12:30:00Z"
}
```

### Update User Wallet
```http
PUT /api/users/{userId}/wallet
Content-Type: application/json

{
  "walletAddress": "0x456...",
  "signature": "0x..."
}
```

### Get User by Wallet Address
```http
GET /api/users/by-wallet/{walletAddress}
```

## 🧾 Receipt Management

### Submit Receipt
```http
POST /api/receipts
Content-Type: multipart/form-data

{
  "userId": 1,
  "image": [file],
  "metadata": {
    "submissionMethod": "camera|upload",
    "location": "optional"
  }
}
```

**Response:**
```json
{
  "success": true,
  "receipt": {
    "id": 123,
    "status": "pending|approved|rejected",
    "confidence": 0.95,
    "estimatedReward": 15.0,
    "validationResult": {
      "store": "Uber",
      "amount": 24.50,
      "date": "2025-01-15",
      "transportation_type": "rideshare"
    }
  }
}
```

### Get Receipt Status
```http
GET /api/receipts/{receiptId}
```

**Response:**
```json
{
  "id": 123,
  "userId": 1,
  "status": "approved",
  "confidence": 0.95,
  "validationResult": {
    "store": "Uber",
    "amount": 24.50,
    "date": "2025-01-15",
    "transportation_type": "rideshare",
    "auto_approved": true
  },
  "createdAt": "2025-01-15T10:30:00Z",
  "processedAt": "2025-01-15T10:31:00Z"
}
```

### List User Receipts
```http
GET /api/users/{userId}/receipts?limit=20&offset=0&status=all|pending|approved|rejected
```

## 💰 Transactions & Rewards

### Get User Transactions
```http
GET /api/users/{userId}/transactions?limit=50&offset=0
```

**Response:**
```json
{
  "transactions": [
    {
      "id": 456,
      "type": "receipt_verification",
      "amount": 15.0,
      "description": "Transportation receipt reward - Uber",
      "blockchainTxId": "0xabc123...",
      "createdAt": "2025-01-15T10:32:00Z",
      "status": "completed"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0
  }
}
```

### Get Token Balance
```http
GET /api/users/{userId}/balance
```

**Response:**
```json
{
  "balance": 245.75,
  "pendingBalance": 15.0,
  "totalEarned": 260.75,
  "lastUpdated": "2025-01-15T10:32:00Z"
}
```

### Distribute Reward
```http
POST /api/rewards/distribute
Content-Type: application/json

{
  "userId": 1,
  "amount": 15.0,
  "receiptId": 123,
  "metadata": {
    "store": "Uber",
    "transportationType": "rideshare"
  }
}
```

## 🏆 Achievements

### Get User Achievements
```http
GET /api/achievements/{userId}
```

**Response:**
```json
{
  "achievements": [
    {
      "id": 1,
      "type": "first_receipt",
      "title": "First Steps",
      "description": "Submit your first transportation receipt",
      "reward": 10.0,
      "unlockedAt": "2025-01-01T12:00:00Z",
      "metadata": {
        "icon": "🚀",
        "category": "milestone"
      }
    },
    {
      "id": 2,
      "type": "streak_7",
      "title": "Week Warrior",
      "description": "Maintain a 7-day submission streak",
      "reward": 25.0,
      "unlockedAt": "2025-01-08T12:00:00Z",
      "metadata": {
        "icon": "🔥",
        "category": "streak"
      }
    }
  ],
  "stats": {
    "totalUnlocked": 12,
    "totalAvailable": 20,
    "totalRewardEarned": 150.0
  }
}
```

### Check Achievement Eligibility
```http
POST /api/achievements/check
Content-Type: application/json

{
  "userId": 1,
  "eventType": "receipt_approved",
  "metadata": {
    "receiptId": 123,
    "transportationType": "rideshare"
  }
}
```

## 🏪 Store Management

### List Approved Stores
```http
GET /api/stores?category=all|rideshare|rental|transit&limit=50&offset=0
```

**Response:**
```json
{
  "stores": [
    {
      "id": 1,
      "name": "Uber",
      "category": "rideshare",
      "autoApproved": true,
      "location": null,
      "metadata": {
        "logo": "uber-logo.png",
        "website": "https://uber.com"
      }
    }
  ]
}
```

### Submit New Store
```http
POST /api/stores/submit
Content-Type: application/json

{
  "name": "Metro Transit",
  "category": "public_transit",
  "location": {
    "address": "123 Transit Ave",
    "city": "San Francisco",
    "state": "CA"
  },
  "submittedBy": 1
}
```

### Approve Store (Admin)
```http
POST /api/admin/stores/{storeId}/approve
Content-Type: application/json

{
  "autoApprove": true,
  "category": "public_transit",
  "adminNotes": "Approved for public transit receipts"
}
```

## 🔧 Admin Endpoints

### Get Pending Receipts
```http
GET /api/admin/receipts/pending?limit=20&offset=0
Authorization: Admin session required
```

### Manual Receipt Approval
```http
POST /api/admin/receipts/{receiptId}/approve
Content-Type: application/json

{
  "approved": true,
  "rewardAmount": 15.0,
  "adminNotes": "Valid Uber receipt, standard reward",
  "transportationType": "rideshare"
}
```

### Get System Stats
```http
GET /api/admin/stats
Authorization: Admin session required
```

**Response:**
```json
{
  "users": {
    "total": 1250,
    "activeToday": 45,
    "newThisWeek": 23
  },
  "receipts": {
    "total": 5678,
    "pendingReview": 12,
    "approvedToday": 89
  },
  "rewards": {
    "totalDistributed": 125000.50,
    "distributedToday": 450.25,
    "averageReward": 22.50
  }
}
```

## 🔗 Integration Endpoints

### Google Forms Webhook
```http
POST /api/google-form-submission
Content-Type: application/json

{
  "userId": 1,
  "formType": "store_submission",
  "metadata": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### Receipt Approval Webhook
```http
POST /api/receipt-approved
Content-Type: application/json

{
  "receiptId": "123",
  "approved": "true",
  "rewardAmount": "15.0",
  "transportationType": "rideshare",
  "adminNotes": "Valid receipt"
}
```

### Store Approval Webhook
```http
POST /api/store-approved
Content-Type: application/json

{
  "storeId": "456",
  "approved": "true",
  "category": "public_transit",
  "autoApprove": "false"
}
```

## 🔍 Utility Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "uptime": 86400,
  "environment": "production",
  "services": {
    "database": "healthy",
    "openai": "healthy",
    "vechain": "healthy"
  }
}
```

### API Version
```http
GET /api/version
```

**Response:**
```json
{
  "version": "2.1.0",
  "buildDate": "2025-01-15",
  "features": [
    "receipt_validation",
    "blockchain_rewards",
    "achievements",
    "google_forms_integration"
  ]
}
```

## 📊 Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid receipt image format",
    "details": {
      "field": "image",
      "allowedFormats": ["jpg", "jpeg", "png"]
    }
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTHENTICATION_REQUIRED` | User must be authenticated | 401 |
| `INSUFFICIENT_PERMISSIONS` | Admin access required | 403 |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist | 404 |
| `VALIDATION_ERROR` | Invalid request data | 400 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `DAILY_LIMIT_REACHED` | User exceeded daily actions | 429 |
| `EXTERNAL_SERVICE_ERROR` | OpenAI or VeChain service error | 502 |
| `DATABASE_ERROR` | Database operation failed | 500 |

## 🔒 Rate Limiting

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642276800
X-RateLimit-Window: 60000
```

### Rate Limit Tiers

| Endpoint Category | Window | Limit | Description |
|------------------|--------|-------|-------------|
| Receipt Submission | 1 minute | 5 requests | Prevents spam submissions |
| General API | 1 minute | 100 requests | Standard API usage |
| Authentication | 15 minutes | 5 requests | Login attempt protection |
| Admin Operations | 1 minute | 20 requests | Administrative actions |

## 📝 Request/Response Examples

### Complete Receipt Submission Flow

**1. Submit Receipt:**
```bash
curl -X POST https://your-app.replit.app/api/receipts \
  -H "Content-Type: multipart/form-data" \
  -F "userId=1" \
  -F "image=@receipt.jpg" \
  -F "metadata={\"submissionMethod\":\"upload\"}"
```

**2. Check Status:**
```bash
curl -X GET https://your-app.replit.app/api/receipts/123
```

**3. View Updated Balance:**
```bash
curl -X GET https://your-app.replit.app/api/users/1/balance
```

This API documentation provides comprehensive coverage of all ReCircle endpoints for building integrations and understanding the platform's capabilities.