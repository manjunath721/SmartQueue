# SMART QUEUE – Production Deployment & Operations Guide

This guide covers deployment options for the **SMART QUEUE** platform, from single-command Docker deployment to cloud hosting platforms (Render, Railway, Fly.io, AWS, and Linux VPS).

---

## 1. Single-Command Docker Compose Deployment (Recommended)

The easiest and most reproducible way to run the entire stack (PostgreSQL + Spring Boot Backend + React Nginx Frontend) is using `docker-compose.yml`.

### Prerequisites
- Docker (version 20+ or Docker Desktop)
- Docker Compose v2+

### Quick Start
```bash
# 1. Clone the repository
git clone <repository-url>
cd Queue

# 2. Start all containers
docker-compose up -d --build

# 3. Verify container status
docker-compose ps
```

### Deployed Services
- **Frontend Web Portal**: `http://localhost:3000` (or Port 80)
- **Backend API**: `http://localhost:8080/api`
- **Health Check**: `http://localhost:8080/api/health`
- **PostgreSQL Database**: `localhost:5433` (`smartqueue_db`)

---

## 2. Cloud Deployment (Render / Railway / Fly.io)

### Option A: Railway (Full Stack in 3 Minutes)
1. Fork or push this repository to GitHub.
2. In Railway, click **New Project** -> **Deploy from GitHub repo**.
3. Add a **PostgreSQL** database service from Railway.
4. Set the following environment variables in the Backend service:
   - `PORT`: `8080`
   - `DB_HOST`: `${{Postgres.PGHOST}}`
   - `DB_PORT`: `${{Postgres.PGPORT}}`
   - `DB_NAME`: `${{Postgres.PGDATABASE}}`
   - `DB_USERNAME`: `${{Postgres.PGUSER}}`
   - `DB_PASSWORD`: `${{Postgres.PGPASSWORD}}`
   - `JWT_SECRET`: Generate a 64-char random string
   - `CORS_ALLOWED_ORIGINS`: Your Railway frontend domain URL
5. In the Frontend service:
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - `VITE_API_URL`: Your Railway backend public URL

### Option B: Render.com
1. **Database**: Create a free PostgreSQL instance on Render (`smartqueue-db`). Copy the internal database URL.
2. **Backend**: Create a Web Service:
   - Runtime: `Docker` (or Java 21)
   - Docker context: `backend`
   - Environment variables:
     - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` from Render Postgres.
     - `JWT_SECRET`: Random 256-bit key.
     - `CORS_ALLOWED_ORIGINS`: `https://smartqueue.onrender.com`
   - Health Check Path: `/api/health`
3. **Frontend**: Create a Static Site:
   - Root directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
   - Rewrite rule: `/*` -> `/index.html` (Status 200)

---

## 3. Ubuntu Linux VPS Deployment (Nginx + Systemd)

### Step 1: Install PostgreSQL 16
```bash
sudo apt update && sudo apt install -y postgresql postgresql-contrib openjdk-21-jdk nginx
sudo -u postgres psql -c "CREATE DATABASE smartqueue_db;"
sudo -u postgres psql -c "CREATE USER smartqueue WITH PASSWORD 'YourStrongPassword';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE smartqueue_db TO smartqueue;"
```

### Step 2: Run Backend as Systemd Service
Build the JAR file:
```bash
cd backend
mvn clean package -DskipTests
sudo cp target/smartqueue-backend-1.0.0.jar /opt/smartqueue/app.jar
```

Create `/etc/systemd/system/smartqueue.service`:
```ini
[Unit]
Description=Smart Queue Spring Boot Backend
After=network.target postgresql.service

[Service]
User=www-data
WorkingDirectory=/opt/smartqueue
ExecStart=/usr/bin/java -jar /opt/smartqueue/app.jar
Environment="PORT=8080"
Environment="DB_HOST=localhost"
Environment="DB_PORT=5432"
Environment="DB_NAME=smartqueue_db"
Environment="DB_USERNAME=smartqueue"
Environment="DB_PASSWORD=YourStrongPassword"
Environment="JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
Restart=always

[Install]
WantedBy=multi-user.target
```
Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now smartqueue
```

### Step 3: Deploy Frontend Build to Nginx
```bash
cd frontend
npm install
npm run build
sudo cp -r dist/* /var/www/smartqueue/
```

Configure Nginx `/etc/nginx/sites-available/smartqueue`:
```nginx
server {
    listen 80;
    server_name queue.yourcompany.com;

    root /var/www/smartqueue;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
Reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/smartqueue /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 4. Production Security Checklist

- [x] Change default demo passwords (`admin`, `staff_sarah`, `staff_david`).
- [x] Rotate `JWT_SECRET` using a cryptographically random 256-bit string (`openssl rand -base64 32`).
- [x] Configure SSL/TLS with Let's Encrypt (`certbot --nginx`).
- [x] Restrict database access to private VPC/localhost.
- [x] Verify `/api/health` reports status `UP`.
