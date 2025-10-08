🔐 Authentication & Authorization Microservice

A secure, scalable authentication microservice designed to serve as a centralized auth provider for distributed systems and microservice architectures.

Built with Node.js, Express, TypeScript, and Prisma, this service provides JWT-based authentication, a role-permission access control system, and robust CI/CD pipelines for production-grade deployment.

🚀 Features

✅ JWT-based Auth Flow — Access & refresh token strategy with auto-refresh support

🧩 Role & Permission Model — Hierarchical RBAC (Roles → Permissions) with middleware guards

🧠 Type-safe ORM — Powered by Prisma for schema management and database migrations

🐳 Dockerized Setup — Fully containerized for local development and production environments

📘 OpenAPI / Swagger Docs — Auto-generated API documentation for easy integration

🧪 Comprehensive Testing — Unit & integration tests using Jest + Supertest

🔄 CI/CD Ready — GitHub Actions workflow for linting, testing, building, and migrations

🧰 Extensible Architecture — Easily integrable with other microservices (e.g., user, billing, OTA)

🧱 Tech Stack

Language: TypeScript

Framework: Express.js

ORM: Prisma

Database: PostgreSQL

Containerization: Docker & Docker Compose

Testing: Jest + Supertest

CI/CD: GitHub Actions

API Docs: Swagger / OpenAPI

📦 Setup

# Clone the repository

git clone https://github.com/nazmul-devs/auth_rbac_server.git

# Navigate to the project

cd auth-microservice

# Copy environment variables

cp .env.example .env

# Run migrations

npx prisma migrate deploy

# Start development server

docker-compose up --build

🧩 Integration Example

Other microservices can verify JWT tokens and user roles by calling the /verify endpoint or using shared public keys for offline verification.

🧠 Future Enhancements

OAuth2 / SSO integration

Redis-based session blacklisting

Multi-tenant user management

Audit logging

💡 Designed for scalability, security, and reusability across modern backend ecosystems.

git clone https://github.com/your-org/auth-service.git
cd auth-service
pnpm install
cp .env.example .env
pnpm docker:up
pnpm prisma:migrate\pnpm dev
Access Swagger Docs → http://localhost:4000/docs
