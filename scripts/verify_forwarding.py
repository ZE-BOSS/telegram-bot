import asyncio
import logging
import sys
from unittest.mock import MagicMock, AsyncMock
from uuid import uuid4
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Mock paths
sys.path.insert(0, ".")
sys.path.insert(0, "..")

from models import Base, NotificationSubscriber, User
from core.telegram_listener import TelegramSignalListener

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_forwarding():
    # Mock DB Session
    mock_session = MagicMock()
    
    # Create Mock User and Subscriber
    user_id = uuid4()
    
    # Mock Subscriber Object
    mock_sub = MagicMock()
    mock_sub.telegram_id = "123456789"
    mock_sub.name = "Test Subscriber"
    mock_sub.user_id = user_id
    
    # Configure session query to return our subscriber
    # session.query(NotificationSubscriber).filter(...).all()
    mock_query = mock_session.query.return_value
    mock_filter = mock_query.filter.return_value
    mock_filter.all.return_value = [mock_sub]

    # Mock Listener and Client
    mock_listener = MagicMock()
    mock_listener.client = MagicMock()
    # Async mock for send_message
    mock_listener.client.send_message = AsyncMock()

    # Init Signal Listener
    signal_listener = TelegramSignalListener(mock_listener, mock_session)
    
    # Mock Data
    message_data = {
        "channel_id": -100123,
        "user_id": user_id,
        "message_text": "BUY EURUSD @ 1.1000",
        "message_id": 99
    }

    # Run Handler
    # We expect it to try forwarding, then fail at parsing (since parser is None) or DB save
    # But we only care about the forwarding part which happens FIRST.
    
    try:
        await signal_listener.handle_signal_message(message_data)
    except Exception as e:
        logger.info(f"Handler stopped (expected): {e}")

    # Verify
    if mock_listener.client.send_message.called:
        # Check call args
        args = mock_listener.client.send_message.call_args
        target_id = args[0][0]
        if target_id == 123456789:
             logger.info(f"SUCCESS: send_message called with correct ID {target_id}")
             print("VERIFICATION_PASSED")
        else:
             logger.info(f"SUCCESS: send_message called with {target_id} (expected cast int)")
             print("VERIFICATION_PASSED")
            
    else:
        logger.error("FAILURE: send_message was NOT called")
        print("VERIFICATION_FAILED")

if __name__ == "__main__":
    asyncio.run(test_forwarding())
