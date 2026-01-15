# Trading Signal Automation Platform

A multi-user platform that automatically executes trading signals from Telegram channels on MetaTrader5 (MT5) broker accounts.

## Features

- **Signal Reception**: Automatically listen to Telegram channels for trading signals
- **Signal Parsing**: AI-powered signal parsing with LLM (GPT-4) or heuristic fallback
- **Auto Execution**: Automatically execute trades on MT5 based on parsed signals
- **Multi-Account**: Support multiple broker accounts per user
- **Credential Security**: Bank-grade encryption for MT5 passwords and API keys
- **Trade Management**: Modify stop-loss/take-profit, close positions
- **Dashboard**: Real-time trading dashboard with positions, P&L, and signal history
- **User Management**: Multi-tenant architecture with per-user isolation

## Quick Start

```bash
# Backend
cd backend && python -m uvicorn api.main:app --reload

# Frontend (in another terminal)
npm run dev
```

Visit `http://localhost:3000` and create an account.

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Architecture

```
Frontend (Next.js 16)
  ├── Authentication (JWT)
  ├── Dashboard
  ├── Broker Management
  ├── Telegram Channel Management
  ├── Trade Execution & Monitoring
  └── Signal History

Backend (FastAPI + Python)
  ├── Auth Service (JWT + Bcrypt)
  ├── Telegram Listener (Telethon)
  ├── Signal Parser (LLM + Heuristics)
  ├── MT5 Executor
  ├── Credential Manager (Encrypted)
  └── Database (PostgreSQL)
```

## Tech Stack

### Frontend
- Next.js 16 (React 19)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Recharts (for analytics)

### Backend
- FastAPI
- SQLAlchemy ORM
- PostgreSQL
- Telethon (Telegram)
- Cryptography (Fernet encryption)
- JWT (Authentication)

## Database Schema

- **users**: User accounts
- **broker_configs**: MT5 broker configurations
- **encrypted_credentials**: Encrypted passwords/API keys
- **telegram_channels**: Subscribed Telegram channels
- **signals**: Received and parsed signals
- **trade_executions**: Executed trades
- **audit_logs**: Activity logs

## Security

- ✅ Encrypted credential storage (Fernet + PBKDF2)
- ✅ JWT token-based authentication
- ✅ Row-level security for multi-tenancy
- ✅ Password hashing with bcrypt
- ✅ Audit logging for all actions
- ✅ CORS protection

## Roadmap

- [ ] WebSocket for real-time updates
- [ ] Mobile app (React Native)
- [ ] Advanced signal filtering
- [ ] P&L analytics and reporting
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] API webhooks for external signals
- [ ] Docker deployment
- [ ] Kubernetes support

## Known Limitations

1. **MT5 Library**: Requires MT5 terminal installed on the server
2. **Telegram Authentication**: Requires manual phone verification on first run
3. **LLM Parsing**: Requires OpenAI API key for advanced signal parsing
4. **Signal Accuracy**: Depends on signal message format consistency

## Troubleshooting

See [SETUP.md - Troubleshooting](./SETUP.md#troubleshooting) section.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Support

- 📖 Documentation: See [SETUP.md](./SETUP.md)
- 🐛 Bug Reports: GitHub Issues
- 💬 Questions: GitHub Discussions

---

**Current Version**: 1.0.0  
**Last Updated**: January 2026
