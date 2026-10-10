# Student Marketplace — Backend Integration Checklist for Person 1

**Document Target**: Person 1 (Backend, Database, Authentication & Payment Owner)  
**Author**: Person 2 (Frontend & Android Application Owner)  
**Version**: 1.0.0 — Production Integration Readiness  

---

## 1. Network & Local Android Development Architecture

When testing the Android application against Person 1's local backend:
- **Physical Android Phone**: Cannot reach `localhost:8000`. You must connect both the computer and the phone to the same Wi-Fi network and configure:
  ```env
  EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_LAN_IP>:8000/api/v1
  ```
  *(e.g., `http://192.168.1.15:8000/api/v1`)*
- **Android Emulator**: `localhost` refers to the emulator itself. To connect to the host computer's backend, use:
  ```env
  EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api/v1
  ```
- **Production Mode**: Must use an HTTPS URL with valid TLS certificates:
  ```env
  EXPO_PUBLIC_API_URL=https://api.studentmarketplace.campus.edu/api/v1
  EXPO_PUBLIC_USE_MOCK_API=false
  ```

---

## 2. Authentication & Authorization

All authenticated endpoints must expect the Bearer token in the standard HTTP header:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

### Endpoints Required:

#### `POST /api/v1/auth/register`
- **Request Body**:
  ```json
  {
    "fullName": "Aarav Sharma",
    "email": "aarav.sharma@campus.edu",
    "password": "securePassword123",
    "college": "IIT Delhi",
    "course": "Computer Science & Engineering",
    "yearOfStudy": 3
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "user": {
      "id": "usr_101",
      "fullName": "Aarav Sharma",
      "email": "aarav.sharma@campus.edu",
      "college": "IIT Delhi",
      "course": "Computer Science & Engineering",
      "yearOfStudy": 3,
      "bio": "",
      "skills": ["Algorithms", "Python"],
      "rating": 5.0,
      "reviewCount": 0,
      "completedTasksCount": 0,
      "isVerified": true,
      "createdAt": "2026-10-09T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

#### `POST /api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "aarav.sharma@campus.edu",
    "password": "securePassword123"
  }
  ```
- **Response (200 OK)**: Same payload as register (`{ user, token }`).

#### `POST /api/v1/auth/logout`
- **Response (200 OK)**: `{ "message": "Successfully logged out" }`

#### `GET /api/v1/auth/me`
- **Response (200 OK)**: `StudentProfile` object.

#### `PATCH /api/v1/auth/profile`
- **Request Body**:
  ```json
  {
    "bio": "Specializing in Distributed Systems & Data Structures.",
    "skills": ["Python", "C++", "Calculus"]
  }
  ```
- **Response (200 OK)**: Updated `StudentProfile` object.

### Error Format Standard (HTTP 400, 401, 403, 404, 422, 500):
```json
{
  "message": "Human-readable error explanation",
  "code": "ERROR_CODE_STRING",
  "errors": {
    "field": ["Specific validation error for this field"]
  }
}
```

---

## 3. Tasks & Lifecycle State Machine

### Status Lifecycle:
`OPEN` ➔ `HELPER_SELECTED` ➔ `IN_PROGRESS` ➔ `SUBMITTED` ➔ `COMPLETED`  
*(Permitted early cancellation: `CANCELLED`)*

### Endpoints Required:

#### `GET /api/v1/tasks?category={category}&search={search}&status={status}`
- **Response (200 OK)**: Array of `Task` objects:
  ```json
  [
    {
      "id": "tsk_101",
      "title": "Data Structures Red-Black Tree Review",
      "description": "Need an experienced senior peer to review self-balancing tree rotations.",
      "category": "Coding",
      "budgetInr": 1200,
      "deadline": "2026-10-12T18:00:00Z",
      "requesterId": "usr_101",
      "requesterName": "Aarav Sharma",
      "requesterCollege": "IIT Delhi",
      "requesterRating": 4.9,
      "helperId": null,
      "status": "OPEN",
      "requiredSkills": ["C++", "Data Structures"],
      "createdAt": "2026-10-09T08:00:00Z"
    }
  ]
  ```

#### `GET /api/v1/tasks/:id`
- **Response (200 OK)**: Single `Task` object.

#### `POST /api/v1/tasks`
- **Request Body**:
  ```json
  {
    "title": "Machine Learning Lab 3 Assistance",
    "description": "Assistance understanding gradient descent convergence in PyTorch.",
    "category": "Coding",
    "budgetInr": 800,
    "deadline": "2026-10-11T20:00:00Z",
    "requiredSkills": ["Python", "PyTorch"]
  }
  ```
- **Response (201 Created)**: Created `Task` object.

#### `PATCH /api/v1/tasks/:id/status`
- **Request Body**:
  ```json
  {
    "status": "SUBMITTED",
    "notes": "Code and documentation submitted for review."
  }
  ```
- **Security Rule**: The server must verify that only the assigned helper can transition to `SUBMITTED`, and only the task creator can transition to `COMPLETED`.

---

## 4. Proposals & Offers

#### `GET /api/v1/tasks/:taskId/offers`
- **Response (200 OK)**: Array of `Offer` objects for this task.

#### `POST /api/v1/tasks/:taskId/offers`
- **Request Body**:
  ```json
  {
    "taskId": "tsk_101",
    "offerAmountInr": 1200,
    "estimatedDeliveryHours": 24,
    "proposal": "I achieved an A grade in CS201 and have built multiple AVL and Red-Black trees."
  }
  ```
- **Response (201 Created)**: Created `Offer` object.

#### `POST /api/v1/offers/:offerId/accept`
- **Security Rule**: Only the task creator can accept. Transitions task to `IN_PROGRESS`, sets `task.helperId`, and marks offer as `ACCEPTED`.
- **Response (200 OK)**: `{ "task": Task, "offer": Offer }`

#### `POST /api/v1/offers/:offerId/reject`
- **Response (200 OK)**: `{ "success": true }`

---

## 5. Messaging & Chat

#### `GET /api/v1/chats`
- **Response (200 OK)**: Array of `Conversation` objects.

#### `GET /api/v1/chats/:conversationId/messages`
- **Response (200 OK)**: Array of `Message` objects sorted chronologically:
  ```json
  [
    {
      "id": "msg_01",
      "conversationId": "conv_101",
      "senderId": "usr_101",
      "senderName": "Aarav Sharma",
      "text": "Hi, I've shared the assignment PDF. Let me know when you can start.",
      "timestamp": "2026-10-09T14:30:00Z"
    }
  ]
  ```

#### `POST /api/v1/chats/:conversationId/messages`
- **Request Body**: `{ "text": "Starting on the rotation tests now!" }`
- **Response (201 Created)**: Created `Message` object.

---

## 6. Escrow & Payments Security

#### `GET /api/v1/payments/stats`
- **Response (200 OK)**:
  ```json
  {
    "totalEarnedInr": 4850,
    "pendingEscrowInr": 1200,
    "completedTasksCount": 6
  }
  ```

#### `GET /api/v1/payments/transactions`
- **Response (200 OK)**: Array of financial transactions with `referenceId`, `amountInr`, `status`, and `type`.

#### `POST /api/v1/payments/initiate`
- **Request Body**: `{ "taskId": "tsk_101", "amountInr": 1200 }`
- **Response (200 OK)**: `{ "orderId": "order_xyz123", "keyId": "rzp_test_..." }`

#### `POST /api/v1/payments/verify`
- **Request Body**:
  ```json
  {
    "orderId": "order_xyz123",
    "paymentId": "pay_abc456",
    "signature": "c83f98274a...",
    "taskId": "tsk_101"
  }
  ```
- **CRITICAL SECURITY REQUIREMENT**: The server must verify cryptographic signatures before marking escrow as funded. The frontend never assumes payment success.

---

## 7. Safety, Moderation & Academic Integrity

#### `POST /api/v1/safety/reports`
- **Request Body**:
  ```json
  {
    "targetType": "TASK",
    "targetId": "tsk_101",
    "reason": "Facilitates live examination cheating or proxy submission",
    "explanation": "Task asks for live answers during a mid-term test."
  }
  ```
- **Response (201 Created)**: `{ "success": true, "message": "Report logged for moderation." }`

---

## 8. Outstanding Contract Questions for Person 1

1. **Payment Gateway Provider**:
   - Are we using Razorpay, Cashfree, or UPI Deep Links for the initial campus pilot?
   - What webhook signature algorithm is configured on the backend?

2. **Attachment Storage**:
   - Should task attachments and chat images be uploaded as `multipart/form-data` directly to a `/media/upload` endpoint, or will the backend issue S3/Cloudflare R2 presigned upload URLs?

3. **Real-Time Delivery**:
   - The frontend currently polls the chat endpoint every 4 seconds. Does Person 1 plan to deploy a WebSocket server on the same host, or should we keep the lightweight polling architecture for the pilot release?

4. **College Domain Whitelist**:
   - Will Person 1 enforce an institutional email domain whitelist (e.g. `@*.edu`, `@*.ac.in`), or will any student email be accepted with email verification?
