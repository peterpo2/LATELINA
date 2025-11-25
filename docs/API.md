# 📚 AIPharm+ API Documentation

## 🔗 Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## 🔐 Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```http
Authorization: Bearer <your-jwt-token>
```

### Get Token
```http
POST /api/auth/login
Content-Type: application/json

{ 
  "email": "aipharmproject@gmail.com",
  "password": "Admin123!",
  "rememberMe": true
}
```

## 📦 Products API

### Get Products
```http
GET /api/products?categoryId=1&searchTerm=paracetamol&pageNumber=1&pageSize=20
```

**Query Parameters:**
- `categoryId` (optional): Filter by category
- `searchTerm` (optional): Search in name, description, active ingredient
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `requiresPrescription` (optional): Filter prescription products
- `pageNumber` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Парацетамол 500мг",
      "nameEn": "Paracetamol 500mg",
      "description": "Ефективно обезболяващо средство",
      "price": 2.30,
      "stockQuantity": 150,
      "categoryId": 1,
      "categoryName": "Обезболяващи",
      "requiresPrescription": false,
      "activeIngredient": "Парацетамол",
      "dosage": "500мг",
      "manufacturer": "Актавис",
      "rating": 4.7,
      "reviewCount": 89
    }
  ],
  "totalCount": 12,
  "pageNumber": 1,
  "pageSize": 20,
  "totalPages": 1,
  "hasPreviousPage": false,
  "hasNextPage": false
}
```

### Get Product by ID
```http
GET /api/products/{id}
```

### Search Products
```http
GET /api/products/search?searchTerm=vitamin
```

### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Нов продукт",
  "nameEn": "New Product",
  "description": "Описание на продукта",
  "price": 10.50,
  "stockQuantity": 100,
  "categoryId": 1,
  "requiresPrescription": false,
  "activeIngredient": "Активна съставка",
  "dosage": "100мг",
  "manufacturer": "Производител"
}
```

## 🏷️ Categories API

### Get All Categories
```http
GET /api/categories
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Обезболяващи",
    "description": "Лекарства за облекчаване на болка",
    "icon": "pill",
    "productCount": 3
  }
]
```

## 🛒 Shopping Cart API

### Get Current Cart
```http
GET /api/cart
X-User-Id: demo-user
```

**Response:**
```json
{
  "id": 1,
  "userId": "demo-user",
  "items": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Парацетамол 500мг",
      "imageUrl": "https://example.com/image.jpg",
      "activeIngredient": "Парацетамол",
      "quantity": 2,
      "unitPrice": 2.30,
      "totalPrice": 4.60
    }
  ],
  "total": 4.60,
  "itemCount": 2,
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-01T10:30:00Z"
}
```

### Add to Cart
```http
POST /api/cart/items
X-User-Id: demo-user
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```

### Update Cart Item
```http
PUT /api/cart/items/{cartItemId}
X-User-Id: demo-user
Content-Type: application/json

{
  "quantity": 3
}
```

### Remove from Cart
```http
DELETE /api/cart/items/{cartItemId}
X-User-Id: demo-user
```

### Clear Cart
```http
DELETE /api/cart
X-User-Id: demo-user
```

## 🤖 AI Assistant API

### Ask Question
```http
POST /api/assistant/ask
Content-Type: application/json

{
  "question": "Как се взима парацетамол?",
  "productId": 1
}
```

**Response:**
```json
{
  "question": "Как се взима парацетамол?",
  "answer": "Парацетамолът се взима по 500-1000мг на 4-6 часа, максимум 4г дневно. Не трябва да се комбинира с алкохол.",
  "productId": 1,
  "timestamp": "2025-01-01T10:00:00Z",
  "disclaimer": "⚠️ Това е обща информация. Консултирайте се с лекар."
}
```

### Get Conversation History
```http
GET /api/assistant/history
X-User-Id: demo-user
```

## 🔐 Authentication API

### Login
```http
POST /api/auth/login
Content-Type: application/json

{ 
  "email": "aipharmproject@gmail.com",
  "password": "Admin123!",
  "rememberMe": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Успешен вход",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin-user-id",
    "email": "aipharmproject@gmail.com",
    "fullName": "AIPharm Administrator",
    "isAdmin": true,
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "fullName": "Ново Име",
  "phoneNumber": "+359888123456",
  "address": "ул. Примерна 1, София"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful! A confirmation email has been sent to newuser@example.com.",
  "emailSent": true,
  "destinationEmail": "newuser@example.com"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

## 🏥 Health Check API

### System Health
```http
GET /api/health
```

**Response:**
```json
{
  "status": "Healthy",
  "timestamp": "2025-01-01T10:00:00Z",
  "environment": "Development"
}
```

## ❌ Error Responses

### Standard Error Format
```json
{
  "message": "Error description",
  "error": "Detailed error information"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 📝 Request Headers

### Required Headers
```http
Content-Type: application/json
```

### Optional Headers
```http
Authorization: Bearer <token>    # For authenticated endpoints
X-User-Id: <user-id>            # For cart operations (demo purposes)
Accept-Language: bg-BG          # For localized responses
```

## 🔄 Rate Limiting

- **General API**: 100 requests per minute
- **Authentication**: 10 requests per minute
- **AI Assistant**: 20 requests per minute

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📊 Pagination

All list endpoints support pagination:

**Query Parameters:**
- `pageNumber` (default: 1)
- `pageSize` (default: 20, max: 100)

**Response Format:**
```json
{
  "items": [...],
  "totalCount": 150,
  "pageNumber": 1,
  "pageSize": 20,
  "totalPages": 8,
  "hasPreviousPage": false,
  "hasNextPage": true
}
```

## 🔍 Filtering & Searching

### Product Filters
- **Category**: `categoryId=1`
- **Price Range**: `minPrice=5&maxPrice=50`
- **Search**: `searchTerm=vitamin`
- **Prescription**: `requiresPrescription=true`

### Search Capabilities
- Product name (Bulgarian and English)
- Product description
- Active ingredient
- Manufacturer

## 🌍 Localization

The API supports Bulgarian and English responses. Use the `Accept-Language` header:

```http
Accept-Language: bg-BG    # Bulgarian
Accept-Language: en-US    # English
```

Localized fields:
- Product names (`name` / `nameEn`)
- Descriptions (`description` / `descriptionEn`)
- Active ingredients (`activeIngredient` / `activeIngredientEn`)
- Dosage information (`dosage` / `dosageEn`)
- Manufacturer names (`manufacturer` / `manufacturerEn`)