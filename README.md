# CurioPath

A full-stack web application designed to help users manage, explore, and organize learning resources into curated learning paths.

## 🚀 Getting Started

Follow these instructions to set up and run the CurioPath application on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/) (or a cloud provider like Neon/Supabase)
- [npm](https://www.npmjs.com/) or yarn

### 1. Backend Setup (Server)

Navigate to the server directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

Set up the database schema and generate the Prisma client:
```bash
npx prisma generate
npx prisma db push
```

Start the backend development server:
```bash
npm run dev
```
The server will run on `http://localhost:5000` by default.

### 2. Frontend Setup (Client)

Open a new terminal and navigate to the client directory:
```bash
cd client
```

Install dependencies (use `--legacy-peer-deps` due to React 19 and `@hello-pangea/dnd`):
```bash
npm install --legacy-peer-deps
```

Start the frontend development server:
```bash
npm run dev
```
The client will run on `http://localhost:5173` by default.

## ⚙️ Environment Variables

You need to create a `.env` file in the `server` directory. Use the following template:

```env
# ─── DATABASE ──────────────────────────────────────────
DATABASE_URL="postgresql://user:password@host:port/database_name?sslmode=require"

# ─── JWT SECRETS ───────────────────────────────────────
JWT_ACCESS_SECRET="your_access_secret_key"
JWT_REFRESH_SECRET="your_refresh_secret_key"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# ─── SERVER ────────────────────────────────────────────
PORT=5000
NODE_ENV="development"

# ─── CORS ──────────────────────────────────────────────
CORS_ORIGIN="http://localhost:5173"
```

*Note: The frontend (`client/`) uses Vite, and its environment variables (if any) would be prefixed with `VITE_` in a `.env` file inside the `client` folder.*

## 🗄️ Database Schema

CurioPath uses Prisma ORM with PostgreSQL. Below is the core database schema required to run the application:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  passwordHash  String
  name          String
  role          String         @default("USER") // USER or ADMIN
  resources     Resource[]
  learningPaths LearningPath[]
  progress      UserProgress[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([email])
}

model Resource {
  id          String        @id @default(uuid())
  title       String
  url         String
  type        String        // VIDEO, ARTICLE, COURSE
  description String?
  authorId    String
  author      User          @relation(fields: [authorId], references: [id], onDelete: Cascade)
  paths       PathResource[]
  tags        ResourceTag[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([authorId])
  @@index([type])
}

model LearningPath {
  id          String         @id @default(uuid())
  title       String
  description String
  creatorId   String
  creator     User           @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  resources   PathResource[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([creatorId])
}

model PathResource {
  id         String       @id @default(uuid())
  pathId     String
  resourceId String
  orderIndex Int
  path       LearningPath @relation(fields: [pathId], references: [id], onDelete: Cascade)
  resource   Resource     @relation(fields: [resourceId], references: [id], onDelete: Cascade)

  @@unique([pathId, resourceId])
  @@index([pathId])
}

model UserProgress {
  id         String   @id @default(uuid())
  userId     String
  resourceId String
  status     String   @default("TODO") // TODO, IN_PROGRESS, COMPLETED
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([userId, resourceId])
  @@index([userId])
}

model Tag {
  id        String        @id @default(uuid())
  name      String        @unique
  resources ResourceTag[]
}

model ResourceTag {
  resourceId String
  tagId      String
  resource   Resource @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  tag        Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([resourceId, tagId])
}
```
