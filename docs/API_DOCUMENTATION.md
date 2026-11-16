# SMART QUEUE – REST API Specification

The following documentation details all REST endpoints provided by the **SMART QUEUE** platform.

Base URL (Local): `http://localhost:8080`

---

## 1. Authentication Endpoints

### POST `/api/auth/login`
Authenticates an administrator or staff user.

- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "AdminPassword123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "tokenType": "Bearer",
    "userId": 1,
    "username": "admin",
    "email": "admin@smartqueue.com",
    "fullName": "System Administrator",
    "roles": ["ROLE_ADMIN", "ROLE_STAFF"]
  }
  ```
- **Response `401 Unauthorized`**: Bad credentials.

---

### POST `/api/auth/register`
Registers a new staff member or administrator.

- **Request Body**:
  ```json
  {
    "username": "staff_alex",
    "email": "alex@smartqueue.com",
    "password": "StaffPassword123!",
    "fullName": "Alex Rivera",
    "phone": "+1 (555) 012-3456",
    "role": "ROLE_STAFF"
  }
  ```
- **Response `201 Created`**: Returns created user profile.

---

### GET `/api/auth/me`
Fetches authenticated user profile and assigned service desks.

- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**: Returns `UserResponse` object.

---

## 2. Public Customer Endpoints (No Authentication Required)

### GET `/api/services`
Lists all active service desks open for customer registration.

- **Response `200 OK`**:
  ```json
  [
    {
      "id": 1,
      "name": "General Inquiries & Reception",
      "code": "GEN",
      "prefix": "A",
      "description": "General questions and visitor assistance",
      "avgDurationMinutes": 10,
      "active": true,
      "waitingCount": 3,
      "servingCount": 1,
      "currentlyServingToken": "A-101"
    }
  ]
  ```

---

### POST `/api/customer/tokens`
Generates a sequential token and returns a public tracking reference.

- **Request Body**:
  ```json
  {
    "serviceId": 1,
    "customerName": "Emma Watson",
    "customerPhone": "+1 (555) 111-2233",
    "customerEmail": "emma@example.com"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "id": 14,
    "tokenNumber": "A-104",
    "sequenceNumber": 104,
    "trackingId": "tr_8c46f1e29c8e47f781bb38f294028bc1",
    "serviceId": 1,
    "serviceName": "General Inquiries & Reception",
    "status": "WAITING",
    "waitingAhead": 2,
    "estimatedWaitMinutes": 30,
    "createdAt": "2026-11-16T15:20:00"
  }
  ```

---

### GET `/api/customer/tokens/{trackingId}`
Fetches live position, people ahead, estimated wait time, and counter notification.

- **Response `200 OK`**:
  ```json
  {
    "trackingId": "tr_8c46f1e29c8e47f781bb38f294028bc1",
    "tokenNumber": "A-104",
    "customerName": "Emma Watson",
    "serviceName": "General Inquiries & Reception",
    "servicePrefix": "A",
    "status": "WAITING",
    "counterName": null,
    "peopleAhead": 2,
    "currentlyServingToken": "A-101",
    "estimatedWaitMinutes": 30,
    "createdAt": "2026-11-16T15:20:00",
    "calledAt": null,
    "completedAt": null
  }
  ```

---

### GET `/api/customer/display-board`
Fetches current status of all service desks for waiting room monitors/TVs.

- **Response `200 OK`**:
  ```json
  [
    {
      "serviceId": 1,
      "serviceName": "General Inquiries & Reception",
      "servicePrefix": "A",
      "currentlyServingToken": "A-101",
      "counterName": "Counter 1",
      "nextWaitingTokens": ["A-102", "A-103", "A-104"],
      "waitingCount": 3
    }
  ]
  ```

---

## 3. Staff Console Endpoints (`ROLE_STAFF` or `ROLE_ADMIN`)

### GET `/api/staff/dashboard`
Returns assigned queues, currently serving token, and today's completed/cancelled counters.

- **Headers**: `Authorization: Bearer <staffToken>`

---

### POST `/api/staff/queue/call-next`
Calls the next customer in FIFO order with database row locking.

- **Headers**: `Authorization: Bearer <staffToken>`
- **Request Body**:
  ```json
  {
    "serviceId": 1,
    "counterName": "Counter 1"
  }
  ```
- **Response `200 OK`**: Returns updated token with `SERVING` status.

---

### PUT `/api/staff/tokens/{id}/complete`
Marks an active token as `COMPLETED`.

- **Headers**: `Authorization: Bearer <staffToken>`

---

### PUT `/api/staff/tokens/{id}/cancel`
Cancels a waiting or serving token, recording audit reason.

- **Headers**: `Authorization: Bearer <staffToken>`
- **Request Body**:
  ```json
  {
    "reason": "Customer absent when called"
  }
  ```

---

## 4. Admin Management Endpoints (`ROLE_ADMIN`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/dashboard` | Complete summary metrics, charts data, service KPIs |
| `GET` | `/api/admin/customers` | Searchable & paginated customer list |
| `GET` | `/api/admin/tokens` | Searchable & filtered queue tokens list |
| `GET` | `/api/admin/staff` | Staff accounts list |
| `POST` | `/api/admin/staff` | Creates new staff account |
| `PUT` | `/api/admin/staff/{id}/toggle-status` | Enables / disables staff account |
| `POST` | `/api/admin/staff/assign` | Assigns staff member to service desk |
| `DELETE` | `/api/admin/staff/{userId}/assign/{serviceId}` | Unassigns staff member |
| `POST` | `/api/services` | Creates new service desk |
| `PUT` | `/api/services/{id}` | Updates service details |
| `PUT` | `/api/services/{id}/toggle-status` | Activates / deactivates service |

---

## 5. System Health Check

### GET `/api/health`
Public health probe for load balancers and container orchestrators.

- **Response `200 OK`**:
  ```json
  {
    "status": "UP",
    "application": "SMART QUEUE Platform",
    "timestamp": "2026-11-16T15:30:00",
    "version": "1.0.0"
  }
  ```
