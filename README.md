# Mini Compete

A full-stack competition management platform built with Next.js, NestJS, PostgreSQL, and Redis.

## Quick Start with Docker (Recommended)

The easiest way to run the entire application is using Docker:

```bash
./start-docker.sh
```

This single command will start:
- Frontend (Next.js) on http://localhost:3000
- Backend API (NestJS) on http://localhost:4000/api
- PostgreSQL database on localhost:5432
- Redis cache on localhost:6379

For detailed Docker setup instructions, see [DOCKER_SETUP.md](./DOCKER_SETUP.md).

## What's inside?

This monorepo includes the following packages/apps:

### Apps

- `frontend`: A [Next.js](https://nextjs.org/) application for the competition management UI
- `backend`: A [NestJS](https://nestjs.com/) API server with PostgreSQL and Redis integration

### Packages

- `@repo/ui`: Shared React component library
- `@repo/eslint-config`: ESLint configurations
- `@repo/typescript-config`: TypeScript configurations

### Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, TypeScript
- **Backend**: NestJS, Prisma ORM, PostgreSQL, Redis, Bull Queue
- **Database**: PostgreSQL with Prisma migrations
- **Cache**: Redis for sessions and job queues
- **Authentication**: JWT-based authentication
- **Deployment**: Docker & Docker Compose

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Development

#### Option 1: Docker Development (Recommended)
```bash
# Start database and Redis only
docker-compose up postgres redis -d

# Run backend in development mode
cd apps/backend
npm run start:dev

# Run frontend in development mode (in another terminal)
cd apps/frontend
npm run dev
```

#### Option 2: Full Local Development
```bash
# Install dependencies
pnpm install

# Start all services
pnpm dev

# Or start specific services
pnpm dev --filter=backend
pnpm dev --filter=frontend
```

#### Database Setup
```bash
# Generate Prisma client
cd apps/backend
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
