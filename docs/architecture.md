# BookLoop – System Architecture & Technical Design

**BookLoop: Smart Book Exchange & Marketplace Platform**  
*Tagline: Give Books a Second Life – Read More. Spend Less. Share Knowledge.*

---

## 1. High-Level Architectural Overview

BookLoop follows a decoupled, three-tier MERN stack architecture designed for performance, modularity, and high security.

```mermaid
flowchart TD
    Client["Client Layer (React.js + Vite + Tailwind CSS)"]
    API["API Gateway / Express Server (Node.js)"]
    Auth["Authentication & JWT Middleware"]
    Controllers["Business Logic Controllers"]
    DB[(MongoDB Atlas / ODM Mongoose)]
    Storage["Cloudinary / Local File Storage"]

    Client -->|"REST API / HTTP & JSON"| API
    API --> Auth
    Auth --> Controllers
    Controllers -->|"Mongoose ODM"| DB
    Controllers -->|"Multer Uploads"| Storage
```

---

## 2. Layered Component Breakdown

### A. Presentation Layer (Frontend)
- **Framework:** React.js 18 with Vite for near-instant Hot Module Replacement (HMR).
- **Styling & Design System:** Tailwind CSS with a student-focused palette:
  - Primary Navy Blue (`#243B53`)
  - Warm Cream (`#FFF8ED`)
  - Accent Warm Amber/Coral (`#F4A261`)
  - Neutral Background (`#F8FAFC`)
  - Dark Charcoal Typography (`#263238`)
- **State & Context Management:**
  - `AuthContext`: Centralizes authentication tokens, user state, and profile synchronization.
  - `ToastContext`: Custom notification toast queue for non-blocking visual feedback.
- **Data Analytics:** Recharts for rendering monthly interaction bar charts and portfolio distribution pie charts.
- **Routing:** React Router DOM v6 with route-level protection (`ProtectedRoute`).

### B. Application Layer (Backend)
- **Runtime:** Node.js (v20+) with Express.js REST API framework.
- **Security & Hardening:**
  - `bcrypt.js`: Salted password hashing (cost factor 10).
  - `jsonwebtoken` (JWT): Stateless bearer tokens signed with secret key.
  - `express-rate-limit`: Brute-force mitigation on authentication endpoints.
  - `cors`: Strict origin whitelisting.
- **File Ingestion:** Multer disk storage with MIME-type verification (JPEG, PNG, WEBP) and 5MB size ceiling.
- **Real-Time Engine:** Built-in polling and Socket.IO real-time event broadcasting for buyer-seller conversations.

### C. Data Layer (Persistence)
- **Engine:** MongoDB Atlas cloud cluster with Mongoose Object Data Modeling (ODM).
- **Embedded In-Memory Fallback:** Built-in graceful persistence fallback ensuring 100% operational integrity during sandbox evaluation, testing, or offline development.

---

## 3. Core Business Workflows

### A. Book Exchange Workflow
```mermaid
sequenceDiagram
    autonumber
    actor UserB as Student B (Requester)
    participant Platform as BookLoop Platform
    actor UserA as Student A (Book Owner)

    UserA->>Platform: Lists Textbook 1 (for Exchange)
    UserB->>Platform: Views Textbook 1 & clicks "Request Exchange"
    UserB->>Platform: Selects Textbook 2 from own listings to offer
    Platform->>UserA: Delivers Exchange Request notification
    alt Accept Request
        UserA->>Platform: Accepts Exchange Proposal
        Platform->>UserB: Status updated to "Accepted"
        UserA->>Platform: Coordinates meetup time & library spot via Chat
        UserB->>Platform: Meets at campus library and swaps physical books
        UserA->>Platform: Marks transaction as "Completed"
        Platform->>UserA: Status updated to "Completed", books marked "Exchanged"
        UserA->>Platform: Leaves review for Student B
        UserB->>Platform: Leaves review for Student A
    else Reject Request
        UserA->>Platform: Rejects Exchange Proposal
        Platform->>UserB: Status updated to "Rejected"
    end
```

### B. Student Purchase Request Workflow
```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Student Buyer
    participant Platform as BookLoop Platform
    actor Seller as Student Seller

    Seller->>Platform: Lists Textbook with asking price
    Buyer->>Platform: Clicks "Request to Purchase" (proposes offered price & message)
    Platform->>Seller: Shows new purchase request in Dashboard
    Seller->>Platform: Accepts purchase request
    Buyer->>Seller: Coordinates campus meetup via built-in Chat
    Seller->>Platform: Marks transaction as "Completed"
    Platform->>Seller: Book availability marked "Sold"
    Buyer->>Platform: Submits 1-5 star review and experience rating
```

---

## 4. Security & Role-Based Access Control (RBAC)

| Role | Permissions |
|---|---|
| **Public / Guest** | Browse book listings, search, filter, view details, view donations, read reviews |
| **Student** | Create listings, edit/delete own listings, request exchanges, submit purchase requests, save to wishlist, message users, review completed transactions |
| **Admin** | Full moderation access, inspect all users, change user roles, remove flagged listings, inspect platform transaction history, view real-time platform statistics |

---

## 5. Deployment Topology

```mermaid
flowchart LR
    ClientApp["Client Single-Page App (Hosted on Vercel)"]
    ServerAPI["Express Backend Web Service (Hosted on Render)"]
    MongoCloud[(MongoDB Atlas Cloud DB)]
    CDN["Cloudinary / Static CDN"]

    ClientApp -->|"HTTPS REST API"| ServerAPI
    ServerAPI -->|"Mongoose TLS URI"| MongoCloud
    ServerAPI -->|"Secure Uploads"| CDN
```
