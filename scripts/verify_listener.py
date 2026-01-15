
import asyncio
import sys
import logging
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from core.telegram_listener import TelegramListener
from config import load_config
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import TelegramChannel
from uuid import uuid4

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def dummy_handler(data):
    print(f"Received message: {data}")

async def main():
    config = load_config()
    
    # Initialize listener
    listener = TelegramListener(
        api_id=config.telegram.api_id,
        api_hash=config.telegram.api_hash,
        phone=config.telegram.phone_number,
        session_name=config.telegram.session_name,
    )

    if not await listener.connect():
        print("Failed to connect")
        return

    # Get channel from DB
    engine = create_engine(config.database.url)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        channel = session.query(TelegramChannel).first()
        if not channel:
            print("No channels found in DB to test with.")
            await listener.disconnect()
            return

        print(f"Attempting to register channel: {channel.channel_name} ({channel.channel_id})")
        
        # Test registration
        success = await listener.register_channel(
            channel_id=channel.channel_id,
            user_id=channel.user_id,
            handler=dummy_handler
        )

        if success:
            print(f"Successfully registered channel {channel.channel_id}")
        else:
            print(f"Failed to register channel {channel.channel_id}")

    finally:
        session.close()
        await listener.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
