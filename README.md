# Job Seeker - MERN Stack Monorepo

A full-stack job seeker application built with MongoDB, Express, React, and Node.js, organized as a monorepo with Yarn Workspaces.

## 📁 Project Structure

```
job-seeker/
├── packages/
│   ├── backend/          # Express.js + TypeScript backend API
│   └── frontend/         # React + Vite frontend application
├── .husky/              # Git hooks configuration
├── tsconfig.base.json   # Base TypeScript configuration
├── .eslintrc.base.js    # Base ESLint configuration
└── package.json         # Root workspace configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Yarn >= 1.22.0 (or use Corepack: `corepack enable`)
- MongoDB (for backend)

### Installation

1. **Install Yarn** (if not already installed):
   ```bash
   npm install -g yarn
   ```
   Or use Corepack (recommended):
   ```bash
   corepack enable
   corepack prepare yarn@4.5.0 --activate
   ```

2. **Install dependencies** for all packages:
   ```bash
   yarn install
   ```

   This will install dependencies for the root workspace and all packages.

### Development

Run all packages in development mode:
```bash
yarn dev
```

Run specific packages:
```bash
# Backend only
yarn dev:backend

# Frontend only
yarn dev:frontend
```

### Building

Build all packages:
```bash
yarn build
```

Build specific packages:
```bash
yarn build:backend
yarn build:frontend
```

### Linting

Lint all packages:
```bash
yarn lint
```

Lint specific packages:
```bash
yarn lint:backend
yarn lint:frontend
```

## 📦 Workspace Packages

### @job-seeker/backend

Express.js backend API with TypeScript.

- **Port**: Configured via environment variables
- **Scripts**:
  - `yarn dev` - Start development server with nodemon
  - `yarn build` - Compile TypeScript to JavaScript
  - `yarn start` - Run production server
  - `yarn lint` - Run ESLint
### @job-seeker/frontend

React frontend application with Vite and Chakra UI.

- **Port**: 5173 (default Vite port)
- **Scripts**:
  - `yarn dev` - Start development server
  - `yarn build` - Build for production
  - `yarn preview` - Preview production build
  - `yarn lint` - Run ESLint
## 🛠️ Monorepo Features

This project uses **Yarn Workspaces** to manage multiple packages:

- ✅ **Yarn Workspaces**: Centralized dependency management with hoisting
- ✅ **Shared TypeScript Config**: Base `tsconfig.base.json` extended by all packages
- ✅ **Shared ESLint Config**: Base `.eslintrc.base.js` with consistent linting rules
- ✅ **Git Hooks**: Husky configured for pre-commit
- ✅ **Dependency Management**: Scripts for checking outdated packages and security audits

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

## 🔧 Dependency Management

Check for outdated dependencies:
```bash
yarn outdated
```

Audit for security vulnerabilities:
```bash
yarn audit
```

Fix security vulnerabilities (when possible):
```bash
yarn audit:fix
```

## 🧹 Cleanup

Remove all `node_modules` and build artifacts:

```bash
yarn clean
```

## 📚 Additional Documentation

- **[MONOREPO_SETUP.md](./MONOREPO_SETUP.md)** - Detailed monorepo setup guide
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Guide for migrating from npm to Yarn

## 🎯 Key Improvements

This monorepo includes the following improvements:

1. ✅ **Yarn Workspaces** - Better dependency management and performance
2. ✅ **Base TypeScript Config** - Consistent TypeScript settings across packages
3. ✅ **Base ESLint Config** - Unified linting rules
4. ✅ **Pre-commit Hooks** - Husky Git hooks
5. ✅ **Dependency Management Scripts** - Easy checking and updating

## 📄 License

ISC
