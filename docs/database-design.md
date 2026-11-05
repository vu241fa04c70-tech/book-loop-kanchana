# BookLoop – Database Design & Schema Specification

**Database Engine:** MongoDB Atlas (Mongoose ODM)

---

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ BOOK : lists
    USER ||--o{ EXCHANGEREQUEST : initiates
    USER ||--o{ EXCHANGEREQUEST : receives
    USER ||--o{ PURCHASEREQUEST : buys
    USER ||--o{ PURCHASEREQUEST : sells
    USER ||--o{ WISHLIST : saves
    USER ||--o{ REVIEW : writes
    USER ||--o{ REVIEW : receives
    USER ||--o{ MESSAGE : sends
    BOOK ||--o{ EXCHANGEREQUEST : requested
    BOOK ||--o{ EXCHANGEREQUEST : offered
    BOOK ||--o{ PURCHASEREQUEST : subject_of
    BOOK ||--o{ WISHLIST : item_in

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string phone
        string college
        string registrationNumber
        string location
        string profileImage
        string role
        date createdAt
    }

    BOOK {
        ObjectId _id PK
        string title
        string author
        string ISBN
        string description
        string category
        string subject
        string condition
        number price
        number originalPrice
        array images
        string listingType
        ObjectId seller FK
        string college
        string location
        string availability
        boolean featured
        number viewsCount
        date createdAt
    }

    EXCHANGEREQUEST {
        ObjectId _id PK
        ObjectId requestedBy FK
        ObjectId owner FK
        ObjectId bookOffered FK
        ObjectId bookRequested FK
        string message
        string status
        string meetingLocation
        date completedAt
        date createdAt
    }

    PURCHASEREQUEST {
        ObjectId _id PK
        ObjectId buyer FK
        ObjectId seller FK
        ObjectId book FK
        number offeredPrice
        string message
        string status
        string meetingLocation
        date completedAt
        date createdAt
    }

    WISHLIST {
        ObjectId _id PK
        ObjectId user FK
        ObjectId book FK
        date createdAt
    }

    REVIEW {
        ObjectId _id PK
        ObjectId reviewer FK
        ObjectId reviewedUser FK
        string transactionType
        ObjectId transactionId
        number rating
        string comment
        date createdAt
    }

    MESSAGE {
        ObjectId _id PK
        string conversationId
        ObjectId sender FK
        ObjectId receiver FK
        string message
        ObjectId book FK
        boolean read
        date createdAt
    }
```

---

## 2. Collections & Field Specifications

### 2.1 User Collection (`users`)
- **Indexes:**
  - `{ email: 1 }` (Unique, Lowercase)
  - `{ college: 1 }`
- **Security:**
  - Password hashed using bcrypt before insertion (`pre('save')`).
  - Passwords excluded by default from queries (`select: false`).

### 2.2 Book Collection (`books`)
- **Indexes:**
  - Text Search: `{ title: 'text', author: 'text', subject: 'text', description: 'text' }`
  - Filter Index: `{ category: 1, listingType: 1, college: 1, availability: 1 }`
- **Validation:**
  - `listingType`: enum `['Sell', 'Exchange', 'Donate']`
  - `condition`: enum `['Like New', 'Good', 'Fair', 'Poor']`
  - `availability`: enum `['available', 'pending', 'exchanged', 'sold', 'donated']`
  - `price`: min 0 (auto-enforced as 0 when `listingType === 'Donate'`).

### 2.3 ExchangeRequest Collection (`exchangerequests`)
- **Indexes:**
  - `{ requestedBy: 1, bookRequested: 1, status: 1 }`
  - `{ owner: 1, status: 1 }`
- **Integrity Rule:**
  - Prevent duplicate requests for the same book pair while previous is pending.
  - Reject requests where `requestedBy === owner`.

### 2.4 PurchaseRequest Collection (`purchaserequests`)
- **Indexes:**
  - `{ buyer: 1, book: 1, status: 1 }`
  - `{ seller: 1, status: 1 }`
- **Integrity Rule:**
  - Reject purchases where `buyer === seller`.

### 2.5 Wishlist Collection (`wishlists`)
- **Indexes:**
  - `{ user: 1, book: 1 }` (Unique compound index preventing duplicates).

### 2.6 Review Collection (`reviews`)
- **Indexes:**
  - `{ reviewer: 1, transactionId: 1 }` (Unique: prevents duplicate reviews per transaction).
  - `{ reviewedUser: 1, rating: 1 }` (Fast rating aggregation).
- **Integrity Rule:**
  - `rating`: min 1, max 5.
  - Review only created after matching transaction has `status === 'completed'`.
