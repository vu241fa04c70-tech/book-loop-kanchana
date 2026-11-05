# BookLoop – REST API Documentation

Base URL: `http://localhost:5000/api` (Development) or `https://bookloop-backend.onrender.com/api` (Production)

---

## 1. Authentication Endpoints

### Register User
- **Route:** `POST /api/auth/register`
- **Access:** Public
- **Body:**
```json
{
  "name": "Alex Rivera",
  "email": "alex@student.edu",
  "password": "password123",
  "phone": "+1 555-0192",
  "college": "Stanford University",
  "registrationNumber": "CS-2023-8821",
  "location": "Palo Alto, CA",
  "role": "student"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "_id": "66a100000000000000000001",
    "name": "Alex Rivera",
    "email": "alex@student.edu",
    "role": "student",
    "college": "Stanford University",
    "location": "Palo Alto, CA"
  }
}
```

### Login User
- **Route:** `POST /api/auth/login`
- **Access:** Public
- **Body:**
```json
{
  "email": "alex@student.edu",
  "password": "password123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": { ... }
}
```

### Get Current User Profile
- **Route:** `GET /api/auth/me`
- **Access:** Private (Bearer token required)
- **Response (200 OK):** Returns authenticated user profile.

### Update Profile
- **Route:** `PUT /api/auth/profile`
- **Access:** Private
- **Body:** `{ "name": "...", "phone": "...", "college": "...", "bio": "..." }`

---

## 2. Book Listings Endpoints

### Get All Books
- **Route:** `GET /api/books`
- **Access:** Public
- **Query Parameters:**
  - `search`: Keyword string (matches title, author, subject, description)
  - `category`: Category name (`Engineering`, `Computer Science`, `Medicine & Health`, etc.)
  - `listingType`: `Sell`, `Exchange`, `Donate`
  - `condition`: `Like New`, `Good`, `Fair`, `Poor`
  - `college`: University campus filter
  - `minPrice` / `maxPrice`: Numerical price boundaries
  - `sort`: `latest`, `price-asc`, `price-desc`, `views`, `oldest`
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 12)
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 12,
  "total": 48,
  "totalPages": 4,
  "currentPage": 1,
  "books": [ ... ]
}
```

### Get Single Book Details
- **Route:** `GET /api/books/:id`
- **Access:** Public
- **Response (200 OK):** Full book object populated with seller profile.

### Create Book Listing
- **Route:** `POST /api/books`
- **Access:** Private (Student/Admin)
- **Body:**
```json
{
  "title": "Introduction to Algorithms (CLRS)",
  "author": "Cormen et al.",
  "ISBN": "978-0262033848",
  "description": "Comprehensive textbook in excellent condition.",
  "category": "Computer Science",
  "subject": "Algorithms",
  "condition": "Like New",
  "price": 45,
  "originalPrice": 120,
  "listingType": "Sell",
  "college": "Stanford University",
  "location": "Gates CS Building",
  "images": ["https://..."]
}
```

### Update Book Listing
- **Route:** `PUT /api/books/:id`
- **Access:** Private (Owner or Admin only)

### Delete Book Listing
- **Route:** `DELETE /api/books/:id`
- **Access:** Private (Owner or Admin only)

### Get My Listings
- **Route:** `GET /api/books/my-listings`
- **Access:** Private

### Upload Image
- **Route:** `POST /api/books/upload`
- **Access:** Private
- **Form Data:** `image` file
- **Response (200 OK):** `{ "success": true, "imageUrl": "/uploads/book-123.jpg" }`

---

## 3. Book Exchange System Endpoints

### Create Exchange Request
- **Route:** `POST /api/exchanges`
- **Access:** Private
- **Body:**
```json
{
  "bookRequestedId": "66b200000000000000000001",
  "bookOfferedId": "66b200000000000000000009",
  "message": "Hi, would love to trade my Organic Chemistry for your CLRS textbook!",
  "meetingLocation": "Campus Library"
}
```

### Get Sent Exchange Requests
- **Route:** `GET /api/exchanges/sent`
- **Access:** Private

### Get Received Exchange Requests
- **Route:** `GET /api/exchanges/received`
- **Access:** Private

### Update Exchange Status
- **Route:** `PUT /api/exchanges/:id/status`
- **Access:** Private
- **Body:** `{ "status": "accepted" | "rejected" | "cancelled" | "completed" }`

---

## 4. Purchase Requests Endpoints

### Create Purchase Request
- **Route:** `POST /api/purchases`
- **Access:** Private
- **Body:**
```json
{
  "bookId": "66b200000000000000000001",
  "offeredPrice": 40,
  "message": "Can meet at the student union tomorrow after 2 PM."
}
```

### Get Sent / Received Purchases
- **Route:** `GET /api/purchases/sent`
- **Route:** `GET /api/purchases/received`
- **Access:** Private

### Update Purchase Status
- **Route:** `PUT /api/purchases/:id/status`
- **Access:** Private
- **Body:** `{ "status": "accepted" | "rejected" | "cancelled" | "completed" }`

---

## 5. Wishlist Endpoints

- `GET /api/wishlist`: Retrieve saved books for the authenticated user.
- `POST /api/wishlist/:bookId`: Add book to wishlist.
- `DELETE /api/wishlist/:bookId`: Remove book from wishlist.
- `GET /api/wishlist/check/:bookId`: Returns `{ isSaved: boolean }`.

---

## 6. Reviews & Ratings Endpoints

### Submit Review
- **Route:** `POST /api/reviews`
- **Access:** Private
- **Validation:** Only permitted for participants of completed transactions.
- **Body:**
```json
{
  "reviewedUserId": "66a100000000000000000001",
  "transactionType": "exchange",
  "transactionId": "66c300000000000000000001",
  "rating": 5,
  "comment": "Prompt meetup and book was in mint condition!"
}
```

### Get User Reviews
- **Route:** `GET /api/reviews/user/:userId`
- **Access:** Public
- **Response:** List of reviews with computed `averageRating`.

---

## 7. Chat & Messaging Endpoints

- `POST /api/messages`: Send message `{ receiverId, message, bookId }`.
- `GET /api/messages/conversations/all`: Retrieve all active chat threads with unread indicators.
- `GET /api/messages/:conversationId`: Retrieve full message history between participants.

---

## 8. Free Donations Endpoints

- `GET /api/donations`: Retrieve all free book donations (`price: 0`) and aggregate impact metrics.
- `POST /api/donations/request`: Submit a request to claim a donated textbook.

---

## 9. Admin Management Endpoints

- `GET /api/admin/statistics`: Overview metrics, savings, category distribution, and listing trends.
- `GET /api/admin/users`: Moderation list of all registered accounts.
- `PUT /api/admin/users/:id`: Toggle roles (`student` ↔ `admin`).
- `GET /api/admin/books`: All active/inactive books for moderation.
- `DELETE /api/admin/books/:id`: Administrative removal of flagged listings.
- `PUT /api/admin/books/:id/feature`: Spotlight toggle.
- `GET /api/admin/transactions`: Real-time purchase and exchange transactions across the platform.
