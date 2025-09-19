# TipLink - Ethereum Wallet & TipLinks

A tiplink-like application on Ethereum that allows users to sign up via Google authentication, generates Ethereum keypairs in the backend, and stores user data securely in a database.

## Features

- 🔐 **Google OAuth Authentication** - Secure sign-in with Google accounts
- 🔑 **Ethereum Wallet Generation** - Automatic keypair generation for new users
- 🗄️ **Secure Storage** - Encrypted private key storage in PostgreSQL
- 🎨 **Modern UI** - Clean, responsive interface built with Next.js and Tailwind CSS
- ⚡ **Fast Backend** - High-performance API built with Hono and Bun runtime

## Project Structure

```
tiplink-temp-mono/
├── apps/
│   ├── backend/          # Hono API server with authentication
│   └── web/              # Next.js frontend application
├── packages/
│   ├── db/               # Prisma database schema and client
│   ├── eslint-config/    # Shared ESLint configuration
│   ├── typescript-config/# Shared TypeScript configuration
│   └── ui/               # Shared UI components
└── turbo.json           # Turborepo configuration
```

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://postgresql.org/) database
- Google Cloud Console project with OAuth credentials

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd tiplink-temp-mono
bun install
```

### 2. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/auth/callback`
5. Copy the Client ID and Client Secret

### 3. Configure Environment Variables

#### Backend Environment (apps/backend/.env)
```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env`:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tiplink_dev"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"
GOOGLE_REDIRECT_URI="http://localhost:3000/auth/callback"

# JWT & Encryption
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
ENCRYPTION_KEY="your-32-character-encryption-key-here"

# Server
PORT=3001
```

#### Frontend Environment (apps/web/.env.local)
```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Database Environment (packages/db/.env)
```bash
cp packages/db/.env.example packages/db/.env
```

Edit `packages/db/.env` with the same DATABASE_URL as backend.

### 4. Set Up Database

```bash
# Navigate to the db package
cd packages/db

# Run Prisma migration
bunx prisma migrate dev --name init

# Generate Prisma client
bunx prisma generate
```

### 5. Start Development Servers

Open two terminal windows:

#### Terminal 1 - Backend
```bash
cd apps/backend
bun run dev
```

#### Terminal 2 - Frontend
```bash
cd apps/web
bun run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## How It Works

### Authentication Flow

1. **User clicks "Sign in with Google"** on the frontend
2. **Frontend requests auth URL** from backend `/auth/google` endpoint
3. **User is redirected to Google OAuth** consent screen
4. **Google redirects back** to `/auth/callback` with authorization code
5. **Frontend sends code to backend** `/auth/google/callback` endpoint
6. **Backend exchanges code for user info** with Google APIs
7. **Backend generates Ethereum keypair** if user is new
8. **Backend stores encrypted private key** and user data in database
9. **Backend returns JWT token** and user info to frontend
10. **Frontend stores token** and shows user dashboard

### Security Features

- Private keys are encrypted using AES encryption before database storage
- JWT tokens for session management with expiration
- Secure HTTP-only approach (no sensitive data in localStorage except tokens)
- CORS protection for API endpoints
- Input validation and error handling

### Database Schema

The simplified schema focuses on authentication and wallet management:

```sql
-- Users table with encrypted Ethereum wallet
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  google_id TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  encrypted_private_key TEXT NOT NULL,
  public_address TEXT UNIQUE NOT NULL,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TipLinks table for future functionality
CREATE TABLE tiplinks (
  id TEXT PRIMARY KEY,
  creator_id TEXT REFERENCES users(id),
  token_address TEXT NOT NULL,
  amount TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  claimed_by TEXT,
  claimed_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Public Endpoints

- `GET /health` - Health check
- `GET /auth/google` - Get Google OAuth URL
- `POST /auth/google/callback` - Handle OAuth callback

### Protected Endpoints (require Bearer token)

- `GET /user/profile` - Get current user profile
- `GET /user/wallet` - Get user's wallet information (including decrypted private key)

## Development Commands

```bash
# Install dependencies
bun install

# Start all development servers
bun run dev

# Build all applications
bun run build

# Run linting
bun run lint

# Check types
bun run check-types

# Database commands
cd packages/db
bunx prisma studio          # Open Prisma Studio
bunx prisma migrate dev     # Run migrations
bunx prisma generate        # Generate client
bunx prisma db seed         # Run seeds (if configured)
```

## Technology Stack

### Backend
- **Runtime**: Bun
- **Framework**: Hono (lightweight web framework)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Google OAuth 2.0 + JWT
- **Encryption**: CryptoJS for private key encryption
- **Blockchain**: Ethers.js for Ethereum wallet generation

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Icons**: Heroicons

### Infrastructure
- **Monorepo**: Turborepo
- **Package Manager**: Bun
- **Database**: PostgreSQL
- **Type Safety**: TypeScript throughout

## Security Considerations

⚠️ **Important Security Notes for Production:**

1. **Private Key Exposure**: The current implementation returns decrypted private keys to the frontend. In production, consider:
   - Server-side transaction signing
   - Hardware security modules
   - Multi-signature wallets
   - Key derivation functions

2. **Environment Variables**: 
   - Use strong, unique values for JWT_SECRET and ENCRYPTION_KEY
   - Store secrets in secure environment variable services
   - Rotate keys regularly

3. **Database Security**:
   - Use connection pooling
   - Enable SSL/TLS for database connections
   - Regular backups and encryption at rest

4. **API Security**:
   - Rate limiting
   - Request validation
   - HTTPS in production
   - Content Security Policy headers

## Deployment

### Environment Setup

1. Set up PostgreSQL database (AWS RDS, Supabase, etc.)
2. Configure Google OAuth with production domain
3. Set up environment variables in your hosting platform
4. Update CORS origins in backend for production domains

### Backend Deployment

The backend can be deployed to:
- **Vercel** (with Bun runtime support)
- **Railway** 
- **Fly.io**
- **DigitalOcean App Platform**

### Frontend Deployment

The Next.js app can be deployed to:
- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues, please:
1. Check the GitHub issues
2. Create a new issue with detailed information
3. Include environment details and error logs

---

Built with ❤️ using modern web technologies