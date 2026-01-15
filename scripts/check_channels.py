
import asyncio
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import TelegramChannel
from config import load_config

async def main():
    config = load_config()
    engine = create_engine(config.database.url)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        channels = session.query(TelegramChannel).all()
        print(f"Found {len(channels)} channels in database:")
        for channel in channels:
            print(f"- ID: {channel.channel_id} | Name: {channel.channel_name} | Active: {channel.is_active} | User: {channel.user_id}")
    except Exception as e:
        print(f"Error checking channels: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    asyncio.run(main())
