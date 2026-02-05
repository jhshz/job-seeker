# Job Seeker - MERN Stack Monorepo

A full-stack job seeker application built with MongoDB, Express, React, and Node.js, organized as a monorepo.

## 📁 Project Structure

```
job-seeker/
├── packages/
│   ├── backend/          # Express.js + TypeScript backend API
│   └── frontend/         # React + Vite frontend application
├── package.json          # Root workspace configuration
└── .husky/              # Git hooks configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (for backend)

### Installation

1. Install dependencies for all packages:
```bash
npm install
```

This will install dependencies for the root workspace and all packages.

### Development

Run all packages in development mode:
```bash
npm run dev
```

Run specific packages:
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### Building

Build all packages:
```bash
npm run build
```

Build specific packages:
```bash
npm run build:backend
npm run build:frontend
```

### Linting

Lint all packages:
```bash
npm run lint
```

Lint specific packages:
```bash
npm run lint:backend
npm run lint:frontend
```

## 📦 Workspace Packages

### @job-seeker/backend

Express.js backend API with TypeScript.

- **Port**: Configured via environment variables
- **Scripts**:
  - `npm run dev` - Start development server with nodemon
  - `npm run build` - Compile TypeScript to JavaScript
  - `npm run start` - Run production server
  - `npm run lint` - Run ESLint

### @job-seeker/frontend

React frontend application with Vite and Chakra UI.

- **Port**: 5173 (default Vite port)
- **Scripts**:
  - `npm run dev` - Start development server
  - `npm run build` - Build for production
  - `npm run preview` - Preview production build
  - `npm run lint` - Run ESLint

## 🛠️ Monorepo Features

This project uses npm workspaces to manage multiple packages:

- **Shared dependencies**: Common dependencies are hoisted to the root `node_modules`
- **Independent packages**: Each package can have its own dependencies
- **Unified scripts**: Run commands across all packages from the root
- **Git hooks**: Husky is configured for pre-commit linting

## 📝 Environment Variables

### Backend

Create a `.env` file in `packages/backend/`:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
```

### Frontend

Create a `.env` file in `packages/frontend/` if needed for API endpoints:

```env
VITE_API_URL=http://localhost:3000
```

## 🧹 Cleanup

Remove all `node_modules` and build artifacts:

```bash
npm run clean
```

## 📄 License

ISC
