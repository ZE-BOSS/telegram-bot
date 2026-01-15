# Complete Local Setup Guide - Trading Signal Automation Platform

A complete step-by-step guide to set up and run the trading signal automation platform on your local machine.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Prerequisites Installation](#prerequisites-installation)
3. [Project Structure](#project-structure)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Database Setup](#database-setup)
7. [Environment Configuration](#environment-configuration)
8. [Running the Application](#running-the-application)
9. [First Time Usage](#first-time-usage)
10. [Troubleshooting](#troubleshooting)

---

## System Requirements

- **OS**: Windows, macOS, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk**: 2GB free space
- **Network**: Internet connection required (for Telegram API and LLM)

## Prerequisites Installation

### 1. Install Python (Backend)

#### Windows
1. Download Python 3.11+ from [python.org](https://www.python.org/downloads/)
2. Run the installer
3. **Important**: Check "Add Python to PATH"
4. Click "Install Now"
5. Verify installation:
   ```cmd
   python --version
   pip --version
   ```

#### macOS
```bash
# Using Homebrew (recommended)
brew install python@3.11
python3 --version
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip
python3 --version
```

### 2. Install Node.js (Frontend)

#### Windows & macOS
1. Download from [nodejs.org](https://nodejs.org/) (LTS version)
2. Run installer and follow prompts
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

### 3. Install PostgreSQL

#### Windows
1. Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Remember the password you set for the `postgres` user
4. Install pgAdmin (included in installer) for database management
5. Verify:
   ```cmd
   psql --version
   ```

#### macOS
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15
psql --version
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
psql --version
```

### 4. Install Git (Optional but Recommended)

Download from [git-scm.com](https://git-scm.com/download/)

---

## Project Structure

```
trading-platform/
├── backend/                          # Python FastAPI backend
│   ├── core/
│   │   ├── telegram_listener.py      # Telegram signal receiver
│   │   ├── signal_parser.py          # LLM-based signal parsing
│   │   ├── mt5_executor.py           # MT5 trade execution
│   │   ├── credential_manager.py     # Encrypted credential storage
│   │   └── execution_state_manager.py # Trade state tracking
│   ├── api/
│   │   ├── main.py                   # FastAPI app
│   │   ├── routes.py                 # API endpoints
│   │   └── auth_routes.py            # Authentication endpoints
│   ├── models.py                     # SQLAlchemy ORM models
│   ├── config.py                     # Configuration
│   ├── database.py                   # Database connection
│   ├── requirements.txt              # Python dependencies
│   ├── .env.example                  # Environment template
│   └── main.py                       # Backend entry point
├── app/                              # Next.js frontend
│   ├── page.tsx                      # Login page
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles
│   └── dashboard/
│       ├── page.tsx                  # Dashboard home
│       ├── brokers/page.tsx          # Broker management
│       ├── channels/page.tsx         # Telegram channels
│       ├── positions/page.tsx        # Active positions
│       ├── signals/page.tsx          # Signal history
│       └── settings/page.tsx         # User settings
├── components/                       # React components
│   └── dashboard-layout.tsx          # Main layout wrapper
├── lib/
│   ├── api-client.ts                 # API communication
│   └── utils.ts                      # Utility functions
├── hooks/
│   └── useAuth.ts                    # Authentication hook
├── scripts/
│   └── 01-initial-schema.sql         # Database schema
├── package.json                      # Frontend dependencies
├── next.config.mjs                   # Next.js configuration
├── .env.local.example                # Frontend env template
├── tsconfig.json                     # TypeScript config
└── README.md                         # Main README

```

---

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Create Python Virtual Environment

**Windows (Command Prompt)**
```cmd
python -m venv venv
venv\Scripts\activate
```

**Windows (PowerShell)**
```powershell
python -m venv venv
venv\Scripts\Activate.ps1
```

**macOS & Linux**
```bash
python3 -m venv venv
source venv/bin/activate
```

Your terminal should now show `(venv)` at the beginning of the line.

### Step 3: Upgrade pip

```bash
pip install --upgrade pip
```

### Step 4: Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- FastAPI & Uvicorn (web framework)
- SQLAlchemy (database ORM)
- Telethon (Telegram library)
- Cryptography (encryption)
- JWT & bcrypt (authentication)
- And other dependencies

**Note**: MetaTrader5 library is commented out by default. Uncomment it only if you have MT5 installed on your system.

### Step 5: Verify Installation

```bash
python -c "import fastapi; print(f'FastAPI version: {fastapi.__version__}')"
python -c "import sqlalchemy; print(f'SQLAlchemy version: {sqlalchemy.__version__}')"
```

---

## Frontend Setup

### Step 1: Navigate to Project Root

```bash
# From backend directory
cd ..

# Or from anywhere
cd path/to/trading-platform
```

### Step 2: Install Node Dependencies

```bash
npm install
```

This will install:
- Next.js 16
- React 19
- Tailwind CSS
- shadcn/ui components
- And other dependencies

**First time installation may take 2-3 minutes.**

### Step 3: Verify Installation

```bash
npm --version
npx next --version
```

---

## Database Setup

### Step 1: Create PostgreSQL Database

Open a terminal/command prompt and connect to PostgreSQL:

**Windows (using pgAdmin)**
1. Open pgAdmin (installed with PostgreSQL)
2. Create a new database: Right-click Databases → Create → Database
3. Name: `trading_platform`
4. Click Save

**Command Line (all platforms)**
```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt, create database:
CREATE DATABASE trading_platform;

# Verify creation:
\l

# Exit psql:
\q
```

### Step 2: Get Database Connection Details

You'll need:
- **Host**: `localhost` (default)
- **Port**: `5432` (default)
- **Database**: `trading_platform`
- **User**: `postgres` (default)
- **Password**: Your PostgreSQL password

### Step 3: Create Database Schema

Navigate to backend directory and run the SQL schema:

```bash
# From backend directory
psql -U postgres -d trading_platform -f scripts/01-initial-schema.sql
```

Or manually:

```bash
psql -U postgres -d trading_platform

# Paste the contents of scripts/01-initial-schema.sql
```

Verify tables were created:

```bash
psql -U postgres -d trading_platform -c "\dt"
```

---

## Environment Configuration

### Step 1: Backend Environment Variables

Create `.env` file in `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your details:

```env
# ============== DATABASE ==============
# PostgreSQL connection string
# Format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/trading_platform
POSTGRES_URL=postgresql://postgres:your_password@localhost:5432/trading_platform

# ============== SECURITY ==============
# Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
JWT_SECRET_KEY=your_random_32_char_jwt_secret_here_generated_above
MASTER_ENCRYPTION_KEY=your_random_32_char_encryption_key_here_generated_above

# ============== TELEGRAM ==============
# Get from https://my.telegram.org/apps
TELEGRAM_API_ID=123456789
TELEGRAM_API_HASH=your_telegram_api_hash_here_abcdef123456
TELEGRAM_PHONE=+1234567890

# ============== LLM (OPTIONAL) ==============
# For AI signal parsing. Get from https://platform.openai.com/api-keys
LLM_API_KEY=sk-your_openai_api_key_here
LLM_MODEL=gpt-4

# ============== LOGGING ==============
LOG_LEVEL=INFO
DEBUG=false

# ============== MT5 (OPTIONAL) ==============
MT5_PATH=/path/to/terminal64.exe  # Windows: C:\Program Files\MetaTrader5\terminal64.exe
```

**Generate Secure Keys**:
```bash
# Generate JWT_SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate MASTER_ENCRYPTION_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 2: Frontend Environment Variables

Create `.env.local` file in project root:

```bash
# From project root directory
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# API endpoint
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# App configuration
NEXT_PUBLIC_APP_NAME=Trading Signals Platform
NEXT_PUBLIC_DEBUG=false
```

---

## Running the Application

### Option 1: Run Both Backend and Frontend (Recommended)

**Terminal 1 - Backend**:
```bash
cd backend
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**Terminal 2 - Frontend**:
```bash
# From project root in a NEW terminal
npm run dev
```

Expected output:
```
> next dev
▲ Next.js 16.0.10
- Local: http://localhost:3000
```

### Option 2: Run with Docker (Optional)

```bash
# Ensure Docker is installed and running
docker-compose -f docker-compose.dev.yml up
```

### Verify Everything is Running

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Backend Health**: http://localhost:8000/api/health

---

## First Time Usage

### 1. Create Your Account

1. Open http://localhost:3000
2. Click "Sign up"
3. Enter:
   - Email: `your@email.com`
   - Password: Create a strong password
4. Click "Create Account"
5. You'll be redirected to the login page
6. Login with your credentials

### 2. Add Your First Broker

1. Go to **Dashboard** → **Brokers**
2. Click "Add Broker"
3. Fill in:
   - **Broker Name**: e.g., "IC Markets" or "Exness"
   - **Server**: e.g., "ICMarkets-Live" or "ExnessReal"
   - **Login**: Your MT5 account number
   - **Password**: Your MT5 password
4. Click "Connect Broker"
5. You'll see a success message if credentials are valid

### 3. Subscribe to a Telegram Channel

1. Go to **Dashboard** → **Channels**
2. Click "Add Channel"
3. Enter:
   - **Channel Name**: e.g., "Trading Signals"
   - **Channel ID**: Get this from Telegram (numeric ID)
4. Click "Add Channel"
5. The system will start listening for signals

### 4. Monitor Signals and Positions

1. **Signals**: Go to **Signals** page to see parsed trading signals
2. **Positions**: Go to **Positions** page to see open trades
3. **Dashboard**: View overview with stats and recent activity

---

## Troubleshooting

### Database Connection Issues

**Error**: `could not connect to server: Connection refused`

**Solution**:
```bash
# Check if PostgreSQL is running

# macOS
brew services list  # Look for postgresql service
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
systemctl status postgresql

# Windows
# Open Services (services.msc) and start PostgreSQL service
```

### Backend Won't Start

**Error**: `Address already in use: ('0.0.0.0', 8000)`

**Solution**:
```bash
# macOS/Linux: Kill process on port 8000
lsof -i :8000
kill -9 <PID>

# Windows: Find and kill process
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Frontend Won't Start

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Kill process on port 3000
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or start on different port
npm run dev -- -p 3001
```

### JWT Token Expired

**Error**: `Token has expired` or `401 Unauthorized`

**Solution**:
1. Open browser DevTools (F12)
2. Go to **Application** → **Local Storage**
3. Delete `auth_token` and `user` entries
4. Refresh page and login again

### Cannot Access API

**Error**: `Failed to fetch from http://localhost:8000`

**Solution**:
1. Verify backend is running on port 8000:
   ```bash
   curl http://localhost:8000/api/health
   ```
2. Check `NEXT_PUBLIC_API_URL` in `.env.local` is correct
3. Ensure CORS is enabled in backend

### Python Virtual Environment Issues

**Error**: `Command 'python' not found` or `No module named ...`

**Solution**:
```bash
# Always activate virtual environment first
cd backend

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

# Should see (venv) in terminal prompt
```

### PostgreSQL Connection Issues

**Error**: `FATAL: password authentication failed`

**Solution**:
1. Reset PostgreSQL password:
   ```bash
   # macOS/Linux
   sudo -u postgres psql
   ALTER USER postgres WITH PASSWORD 'new_password';
   \q
   
   # Update .env with new password
   ```

### Missing Dependencies

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
# Ensure virtual environment is activated
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Reinstall dependencies
pip install -r requirements.txt --upgrade
```

### Telegram Authentication Failed

**Error**: `Telegram authentication failed` or `Invalid phone number`

**Solution**:
1. Verify `TELEGRAM_PHONE` is correct format: `+1234567890`
2. Check `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` from https://my.telegram.org/apps
3. First run requires phone verification via SMS
4. Check backend logs for authentication errors

### API Returns 404

**Error**: `GET /api/brokers 404 Not Found`

**Solution**:
1. Verify backend API documentation: http://localhost:8000/docs
2. Check endpoint exists and is spelled correctly
3. Verify you're sending correct HTTP method (GET, POST, etc)
4. Check authentication token is included in request

---

## Next Steps

1. **Explore Dashboard**: Get familiar with the interface
2. **Add Multiple Brokers**: Support multiple trading accounts
3. **Customize Signal Parsing**: Adjust LLM prompts for your signals
4. **Enable Notifications**: Set up email or webhook alerts
5. **Deploy to Production**: Use Docker and cloud hosting
6. **Set up CI/CD**: Automate testing and deployment

---

## Support & Resources

- **Backend Logs**: Check console output from `uvicorn`
- **Frontend Logs**: Open browser DevTools (F12) → Console tab
- **API Documentation**: http://localhost:8000/docs (when backend is running)
- **Database Admin**: pgAdmin at http://localhost:5050
- **GitHub Issues**: Report bugs on GitHub

---

## Safety & Security Tips

1. **Never commit `.env` files** to version control
2. **Use strong passwords** for all accounts
3. **Keep encryption keys secret** and backed up
4. **Rotate tokens regularly** in production
5. **Use HTTPS in production** (not HTTP)
6. **Enable 2FA** when available
7. **Review audit logs** for suspicious activity

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Support**: For issues, check logs and browser console first
