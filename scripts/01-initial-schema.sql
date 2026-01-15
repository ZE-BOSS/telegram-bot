-- Multi-tenant trading signal automation platform schema

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Broker configurations (per user)
CREATE TABLE broker_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  broker_name TEXT NOT NULL,
  login TEXT NOT NULL,
  server TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, broker_name)
);

-- Encrypted credentials storage for MT5 and other brokers
CREATE TABLE encrypted_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_type TEXT NOT NULL, -- 'mt5_password', 'api_key', etc.
  broker_config_id UUID REFERENCES broker_configs(id) ON DELETE CASCADE,
  encrypted_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Telegram channel configurations
CREATE TABLE telegram_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_id BIGINT NOT NULL,
  channel_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trading signals received from Telegram
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  telegram_channel_id UUID NOT NULL REFERENCES telegram_channels(id) ON DELETE CASCADE,
  raw_message TEXT NOT NULL,
  parsed_data JSONB, -- Stores parsed signal data: symbol, action, entry, sl, tp, etc.
  signal_type TEXT, -- 'buy', 'sell', 'close', 'modify', etc.
  symbol TEXT,
  entry_price DECIMAL,
  stop_loss DECIMAL,
  take_profit DECIMAL,
  confidence_score DECIMAL, -- LLM confidence in parsing (0-1)
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signal recipients (which channels/signals map to which brokers for execution)
CREATE TABLE signal_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  telegram_channel_id UUID NOT NULL REFERENCES telegram_channels(id) ON DELETE CASCADE,
  broker_config_id UUID NOT NULL REFERENCES broker_configs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trade execution state tracking
CREATE TABLE trade_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
  broker_config_id UUID NOT NULL REFERENCES broker_configs(id) ON DELETE CASCADE,
  order_id TEXT, -- MT5 order ID
  ticket_number BIGINT, -- MT5 ticket number
  execution_status TEXT, -- 'pending', 'executed', 'failed', 'cancelled'
  execution_type TEXT, -- 'market', 'pending', etc.
  symbol TEXT NOT NULL,
  side TEXT NOT NULL, -- 'buy', 'sell'
  volume DECIMAL NOT NULL,
  entry_price DECIMAL,
  stop_loss DECIMAL,
  take_profit DECIMAL,
  actual_entry_price DECIMAL,
  actual_entry_time TIMESTAMPTZ,
  close_price DECIMAL,
  close_time TIMESTAMPTZ,
  profit_loss DECIMAL,
  execution_error TEXT,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Execution logs for audit trail
CREATE TABLE execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  execution_id UUID NOT NULL REFERENCES trade_executions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for all user actions
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT, -- 'signal', 'execution', 'config', etc.
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_broker_configs_user_id ON broker_configs(user_id);
CREATE INDEX idx_encrypted_credentials_user_id ON encrypted_credentials(user_id);
CREATE INDEX idx_telegram_channels_user_id ON telegram_channels(user_id);
CREATE INDEX idx_signals_user_id ON signals(user_id);
CREATE INDEX idx_signals_telegram_channel_id ON signals(telegram_channel_id);
CREATE INDEX idx_signals_received_at ON signals(received_at);
CREATE INDEX idx_trade_executions_user_id ON trade_executions(user_id);
CREATE INDEX idx_trade_executions_signal_id ON trade_executions(signal_id);
CREATE INDEX idx_execution_logs_execution_id ON execution_logs(execution_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable RLS for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see their own data
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view their own broker configs" ON broker_configs
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own credentials" ON encrypted_credentials
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own telegram channels" ON telegram_channels
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own signals" ON signals
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own signal recipients" ON signal_recipients
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own trade executions" ON trade_executions
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own execution logs" ON execution_logs
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR ALL USING (auth.uid()::text = user_id::text);
