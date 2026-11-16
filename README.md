# SMART QUEUE – Digital Customer Queue & Service Platform

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot 3.3.5](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**SMART QUEUE** is a production-grade, enterprise digital queue management platform that eliminates physical queues, paper tickets, and manual token handling. Customers generate digital tickets on their smartphones, track their live position in line with accurate wait-time estimates, and receive instant visual and audible notifications when called. Staff manage queues with strict FIFO ordering, and administrators govern services, monitor KPIs, and inspect real-time throughput metrics.

---

## 🌟 Key Platform Features

### 📱 1. Public Customer Experience (Zero Login Required)
- **Instant Digital Token Generation**: Browse active service desks, check estimated wait times, and join the queue in two taps.
- **Real-Time Live Ticket**: Displays formatted sequential token (e.g. `A-104`), real-time status pill, position in line (`#3 in line`), people ahead (`2 ahead`), and target wait time.
- **Audible & Visual Calling Alerts**: Automatic Web Audio chime and alert banner direct customers to their assigned counter (e.g. `Proceed to Counter 1`).
- **Unguessable Tracking References**: Secure 128-bit UUID references (`/track/tr_8c46f1...`) prevent unauthorized enumeration of tickets.
- **Printable Mobile Pass**: One-click printable receipt format with timestamp and service details.

### 📺 2. Live Waiting Room TV Display Board (`/display`)
- High-contrast, dark-mode display optimized for large television monitors and waiting room displays.
- Shows all active service zones, currently called tokens with glowing alerts, and next upcoming tokens in FIFO order.
- Chimes automatically whenever any counter calls the next customer.

### 🎧 3. Staff Operator Console (`/staff`)
- **Station Configuration**: Select assigned service desk and station identifier (e.g. `Counter 1`, `Desk A`).
- **One-Click "Call Next"**: Strict FIFO algorithm with database row locking (`FOR UPDATE`) selects earliest waiting customer.
- **Serving Desk Controls**: Real-time timer elapsed, customer contact details, "Complete Service", and "Cancel Token" with mandatory audit reason.
- **Auto-Poll Toggle**: Background polling keeps queue counters updated without manual page reloads.

### 📊 4. Executive Admin Dashboard (`/admin`)
- **Live KPI Summary**: Real-time counters for Total Customers, Generated Tokens, Currently Waiting, Currently Serving, Completed Today, and Cancelled Today.
- **Interactive Chart.js Visualizations**: Token status distribution doughnut charts and service volume bar graphs.
- **Service Management**: Create, edit, toggle active status, adjust prefix, and calibrate average duration per person.
- **Staff Accounts Governance**: Create operator logins, inspect assigned desks, and enable/disable account privileges.
- **Customer & Queue Auditing**: Paginated tables with keyword search across token numbers, customer names, and contact phones.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 21, Spring Boot 3.3.5, Spring Security, JWT (JJWT 0.12.6), Spring Data JPA / Hibernate, HikariCP, PostgreSQL Driver, Maven |
| **Frontend** | React 18, Vite 5, Bootstrap 5.3, Bootstrap Icons, Axios, React Router v6, Chart.js, React-Chartjs-2 |
| **Database** | PostgreSQL 16 (Relational schema, `SELECT ... FOR UPDATE` row locks, composite unique constraints, indexes) |
| **DevOps & Containers** | Docker, Docker Compose, Multi-stage Dockerfiles, Nginx Reverse Proxy |

---

## 🔐 Default Demo Credentials

Pre-seeded out-of-the-box in both local and Docker environments:

| Role | Username | Password | Purpose |
|---|---|---|---|
| **Administrator** | `admin` | `AdminPassword123!` | Full governance, services, staff, analytics |
| **Staff Operator** | `staff_sarah` | `StaffPassword123!` | Counter 1 (General Inquiries, Billing) |
| **Staff Operator** | `staff_david` | `StaffPassword123!` | Desk 2 (Loan Advisory, Tech Support) |

*(The login screen also features 1-click credential buttons for immediate evaluation).*

---

## 🚀 Quick Start: Running with Docker (Recommended)

Run the full platform (Postgres + Spring Boot + React + Nginx) with one command:

```bash
# Clone the repository
git clone https://github.com/your-org/smart-queue.git
cd smart-queue

# Start all containers
docker-compose up -d --build
```

Access the applications:
- **Public Customer Portal**: [http://localhost:3000](http://localhost:3000)
- **Waiting Room TV Board**: [http://localhost:3000/display](http://localhost:3000/display)
- **Staff & Admin Portal**: [http://localhost:3000/login](http://localhost:3000/login)
- **Backend REST API**: [http://localhost:8080/api](http://localhost:8080/api)
- **Health Check Probe**: [http://localhost:8080/api/health](http://localhost:8080/api/health)

---

## 💻 Manual Local Development Setup

### 1. Prerequisites
- Java 21+ (`java -version`)
- Maven 3.9+ (`mvn -version`)
- Node.js 18+ and npm (`node -v`)
- PostgreSQL 16+ running locally or in Docker

### 2. Database Setup
Start a PostgreSQL container on port 5433 (or standard 5432):
```bash
docker run -d --name smartqueue-postgres \
  -e POSTGRES_DB=smartqueue_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5433:5432 \
  postgres:16-alpine
```

### 3. Backend Setup
```bash
cd backend

# Build and run tests
mvn clean test

# Run Spring Boot backend
mvn spring-boot:run
```
The backend starts on `http://localhost:8080`.

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend starts on `http://localhost:5173`.

---

## 🧪 Automated Testing

The backend includes a comprehensive test suite covering authentication, FIFO queue semantics, concurrency safety, and service lifecycle.

Run automated tests:
```bash
cd backend
mvn clean test
```

### Test Coverage Results:
- `AuthControllerTest`: Admin authentication, invalid credential rejection, new staff registration, protected endpoint guards.
- `QueueServiceTest`: Token creation, sequential numbering, FIFO calling order, position calculation, completion, cancellation, and duplicate prevention.
- `ConcurrencyQueueTest`: 10 simultaneous customer registrations executing on separate threads; verified unique gapless token allocation without collisions.
- `SmartQueueApplicationTests`: Full Spring Boot context initialization.
- **Result**: `13 tests run, 0 failures, 0 errors` (100% passing).

---

## 📁 Repository Directory Structure

```text
Queue/
├── backend/
│   ├── src/main/java/com/smartqueue/
│   │   ├── config/            # SecurityConfig, DataInitializer
│   │   ├── controller/        # Auth, Admin, Staff, Customer, Service, Health
│   │   ├── dto/               # Request & Response Transfer Objects
│   │   ├── entity/            # JPA Entities (QueueToken, Service, Customer...)
│   │   ├── enums/             # TokenStatus, RoleType
│   │   ├── exception/         # GlobalExceptionHandler, Custom Exceptions
│   │   ├── repository/        # Spring Data Repositories with row locks
│   │   ├── security/          # JWT TokenProvider, UserDetailsService, Filters
│   │   └── service/           # QueueService, AuthService, AnalyticsService...
│   ├── src/main/resources/    # application.yml, schema.sql
│   ├── src/test/              # JUnit 5 integration & concurrency tests
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/               # Axios client & typed REST modules
│   │   ├── context/           # AuthContext (JWT, user state)
│   │   ├── components/        # Navbar, Sidebar, Footer, StatusBadge...
│   │   ├── pages/             # Landing, TakeToken, Tracking, Display, Staff, Admin...
│   │   └── styles/            # custom.css
│   ├── nginx.conf             # Production Nginx reverse-proxy configuration
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── database/
│   ├── schema.sql             # Full DDL schema creation script
│   └── seed_data.sql          # Seed data script
├── docs/
│   ├── ARCHITECTURE.md        # Technical architecture & sequence diagrams
│   ├── ER_DIAGRAM.md          # Database schema & entity relationships
│   ├── API_DOCUMENTATION.md   # Complete REST API specification
│   └── DEPLOYMENT_GUIDE.md    # Production deployment on Render, Railway, VPS
├── postman/
│   └── SmartQueue_Postman_Collection.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📬 Postman Collection

Import `postman/SmartQueue_Postman_Collection.json` into Postman. It includes pre-configured collection variables, JWT token auto-extraction scripts, and sample payloads for all 20+ REST endpoints.

---

## 📄 License
This project is licensed under the MIT License.
