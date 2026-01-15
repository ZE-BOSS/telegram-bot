# Trading Signal Automation Platform - Setup Guide

## Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Telegram API credentials
- MT5 installation (optional, for trade execution)

## Backend Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/trading_platform

# Telegram
TELEGRAM_API_ID=your_telegram_api_id
TELEGRAM_API_HASH=your_telegram_api_hash
TELEGRAM_PHONE=+1234567890

# LLM (OpenAI)
LLM_API_KEY=sk-your-openai-api-key
LLM_MODEL=gpt-4

# Security
MASTER_ENCRYPTION_KEY=generate_a_random_32_char_string_here
JWT_SECRET_KEY=generate_another_random_32_char_string_here

# Logging
LOG_LEVEL=INFO
DEBUG=false
```

### 3. Initialize Database

```bash
# Ensure PostgreSQL is running, then run migrations
python -m alembic upgrade head

# Or manually create schema:
psql -U postgres -d trading_platform -f scripts/01-initial-schema.sql
```

### 4. Run Backend Server

```bash
uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

## Frontend Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=Trading Signals Platform
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## First Time Usage

### 1. Create an Account

- Navigate to `http://localhost:3000`
- Click "Sign up"
- Fill in email, username, and password
- Click "Create Account"

### 2. Add a Broker

- Go to Dashboard → Brokers
- Click "Add Broker"
- Enter your MT5 broker details:
  - **Broker Name**: e.g., "IC Markets"
  - **Server**: e.g., "ICMarkets-Live"
  - **Login**: Your MT5 account number
  - **Password**: Your MT5 password
- Click "Connect Broker"

### 3. Add Telegram Channels

- Go to Dashboard → Channels
- Click "Add Channel"
- Enter Telegram channel details:
  - **Channel Name**: Display name
  - **Channel ID**: Telegram channel ID (numeric)
- Click "Add Channel"

### 4. Start Trading

- Signals will appear in the **Signals** page as they're received
- Execute signals manually or set up automation
- Monitor positions in the **Positions** page

## Important Notes

### 1. MT5 Library

The `MetaTrader5` library is commented out in `requirements.txt` because it requires MT5 installation.

To enable MT5 functionality:

1. Install MetaTrader5 on your system
2. Uncomment this line in `backend/requirements.txt`:
   ```
   MetaTrader5==5.0.45
   ```
3. Reinstall dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### 2. Telegram Setup

To receive signals from Telegram:

1. Get your `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` from https://my.telegram.org/apps
2. Get your phone number associated with Telegram
3. First run will require manual phone verification

### 3. LLM Signal Parsing

Signal parsing uses OpenAI's GPT-4 API:

1. Get your API key from https://platform.openai.com/api-keys
2. Set it in `backend/.env` as `LLM_API_KEY`
3. If LLM is not available, the system falls back to heuristic parsing

### 4. Security Best Practices

- **Never commit `.env` files** to version control
- **Generate strong encryption keys**: 
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
- **Use HTTPS in production**
- **Rotate encryption keys regularly**
- **Use strong passwords for broker accounts**

## Troubleshooting

### Database Connection Error

```
Error: could not connect to server: Connection refused
```

**Solution**: Ensure PostgreSQL is running
```bash
# On Mac
brew services start postgresql

# On Linux
sudo systemctl start postgresql

# On Windows
# Start PostgreSQL from Services
```

### JWT Token Expired

**Solution**: Clear localStorage and log in again
```javascript
localStorage.removeItem('auth_token')
localStorage.removeItem('user')
```

### Signal Parsing Failing

**Solution**: Check LLM API key and model availability
- Verify `LLM_API_KEY` is set correctly
- Ensure OpenAI account has GPT-4 access
- Check system falls back to heuristic parsing

### MT5 Connection Failed

**Solution**: 
1. Ensure MT5 terminal is running
2. Verify credentials are correct
3. Check server is accessible
4. Try connecting manually from MT5 first

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Brokers
- `GET /api/broker-configs` - Get user's brokers
- `POST /api/broker-configs` - Add new broker
- `DELETE /api/broker-configs/{id}` - Delete broker

### Telegram Channels
- `GET /api/telegram-channels` - Get subscribed channels
- `POST /api/telegram-channels` - Subscribe to channel
- `DELETE /api/telegram-channels/{id}` - Unsubscribe

### Signals
- `GET /api/signals` - Get all signals
- `GET /api/signals/{id}` - Get specific signal

### Executions (Trades)
- `GET /api/executions` - Get all executions
- `POST /api/executions` - Execute a signal
- `POST /api/executions/{id}/close` - Close position
- `POST /api/executions/{id}/modify` - Modify position

### Account
- `GET /api/account/info` - Get account information

## Next Steps

1. **Set up automation**: Configure automatic signal execution
2. **Add more brokers**: Support multiple accounts
3. **Implement webhooks**: Receive signals via API instead of Telegram
4. **Deploy to production**: Use Docker and production database
5. **Enable 2FA**: Add two-factor authentication

## Support

For issues or questions:
1. Check logs: `tail -f backend/logs/app.log`
2. Check browser console: Open DevTools (F12)
3. Check API docs: `http://localhost:8000/docs`

---

**Last Updated**: January 2026
**Version**: 1.0.0
