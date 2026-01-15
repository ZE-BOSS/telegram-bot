
import asyncio
import sys
import logging
from pathlib import Path
from unittest.mock import MagicMock, AsyncMock

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from core.telegram_listener import TelegramSignalListener
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import TelegramChannel, User
from config import load_config

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def main():
    config = load_config()
    engine = create_engine(config.database.url)
    Session = sessionmaker(bind=engine)
    db_session = Session()

    try:
        # 1. Setup Mock Components
        mock_listener = MagicMock()
        mock_parser = MagicMock()
        # Mock successful parsing
        mock_parser.parse_signal.return_value = {
            "raw_data": {"action": "BUY"},
            "signal_type": "buy",
            "symbol": "EURUSD",
            "entry_price": 1.1000,
            "stop_loss": 1.0900,
            "take_profit": 1.1200,
            "confidence_score": 0.95
        }
        
        mock_executor = AsyncMock()
        
        # Mock Client for forwarding
        mock_client = MagicMock()
        mock_client.send_message = AsyncMock()
        mock_listener.client = mock_client

        
        # 2. Initialize Signal Listener
        signal_listener = TelegramSignalListener(mock_listener, db_session)
        signal_listener.signal_parser = mock_parser
        signal_listener.execution_handler = mock_executor

        # 3. Get a valid channel from DB
        channel = db_session.query(TelegramChannel).first()
        if not channel:
            logger.error("No channel found in DB to test with!")
            return

        logger.info(f"Testing with Channel: {channel.channel_name} (ID: {channel.channel_id})")

        # 4. Simulate Message
        message_data = {
            "channel_id": channel.channel_id,
            "user_id": channel.user_id,
            "message_text": "BUY EURUSD 1.1000 SL 1.0900 TP 1.1200",
            "message_id": 12345,
            "timestamp": None, # datetime.utcnow()
            "from_user": 12345678,
            "media": False,
        }

        logger.info("--- Starting Signal Processing Simulation ---")
        await signal_listener.handle_signal_message(message_data)
        logger.info("--- Simulation Complete ---")

        # 5. Verify Results
        # Check if executed
        if mock_executor.called:
            logger.info("✅ Execution Handler called")
        else:
            logger.error("❌ Execution Handler NOT called")

        # Check Forwarding
        if mock_client.send_message.called:
             logger.info("✅ Forwarding message sent")
        else:
             logger.error("❌ Forwarding message NOT sent")

        # Check in DB
        # We need to commit in the listener, so we should see it here if we query a fresh session or refresh
        # But since we share the session, we can check directly maybe?
        # The listener commits.
        
        from models import Signal
        latest_signal = db_session.query(Signal).order_by(Signal.created_at.desc()).first()
        if latest_signal and latest_signal.raw_message == message_data["message_text"]:
             logger.info(f"✅ Signal saved to DB: {latest_signal.id}")
        else:
             logger.error("❌ Signal NOT found in DB (or mismatch)")

    except Exception as e:
        logger.error(f"Test failed: {e}", exc_info=True)
    finally:
        db_session.close()

if __name__ == "__main__":
    asyncio.run(main())
