# Fast Grocery E-Commerce Platform (Blinkit-Style)

A production-ready full-stack grocery quick-commerce platform built with Spring Boot 3 (Java 21) REST API and React 19 + TypeScript + Tailwind CSS frontends (Customer Web App & Admin Dashboard).

## Architecture

- **Backend**: Java 21, Spring Boot 3.3.4, Spring Security, Spring Data JPA, JWT Authentication, Flyway Migrations, MySQL, Swagger / OpenAPI 3.
- **Customer Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, Axios, Lucide Icons.
- **Admin Dashboard**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, Axios, Recharts.
- **Database**: Single MySQL relational database (`ecommerce_grocery`).

## Project Layout

```text
ecommerce/
├── backend/            # Spring Boot REST API
├── frontend/           # Customer Web Application
├── admin/              # Admin Management Panel
├── .env.example        # Environment variables template
└── README.md
```

## Running Locally

### Prerequisites
- Java 21 LTS (`brew install openjdk@21`)
- Maven 3.9+
- MySQL Server (running on localhost:3306)
- Node.js 20+ and npm

### 1. Database Setup
```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS ecommerce_grocery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 2. Backend
```bash
cd backend
JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home mvn spring-boot:run
```
API Documentation / Swagger: `http://localhost:8080/swagger-ui/index.html`

### 3. Customer Frontend
```bash
cd frontend
npm install
npm run dev # Starts on http://localhost:3000
```

### 4. Admin Panel
```bash
cd admin
npm install
npm run dev # Starts on http://localhost:3001
```
