
import asyncio
import sys
import logging
from pathlib import Path
from datetime import datetime

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from config import load_config
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Signal, TelegramChannel

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    config = load_config()
    engine = create_engine(config.database.url)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        signals = session.query(Signal).order_by(Signal.created_at.desc()).all()
        print(f"\n--- Signal Database Dump ({len(signals)} Total) ---\n")
        
        if not signals:
            print("❌ No signals found in database.")
        
        for sig in signals[:10]: # Show last 10
            print(f"ID: {sig.id}")
            print(f"Time: {sig.created_at}")
            print(f"Channel ID: {sig.telegram_channel_id}")
            print(f"Raw: {sig.raw_message}")
            print(f"Parsed: {sig.parsed_data}")
            print(f"Executions: {len(sig.trade_executions)}")
            print("-" * 50)

    finally:
        session.close()

if __name__ == "__main__":
    asyncio.run(main())
