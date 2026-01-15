import sys
import os
import logging

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.core.signal_parser import SignalParser

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_parsing():
    try:
        parser = SignalParser(api_key=None) # Force heuristics
        
        # Message simulaton based on user description/logs
        # "Buy Gold 4307.5 - 4311.5"
        messages = [
            "Buy Gold 4307.5 - 4311.5",
            "BUY GOLD 2300.50 SL 2290 TP 2320",
            "Gold Buy 2300",
            "XAUUSD BUY NOW",
            "Buy USOIL 75.50",
        ]
        
        with open("test_output.txt", "w") as f:
            for msg in messages:
                logger.info(f"Testing message: '{msg}'")
                result = parser.parse_signal(msg)
                logger.info(f"Parsed Result: {result}")
                f.write(f"MSG: {msg}\nRESULT: {result}\n")
                
                if not result.get('symbol'):
                    logger.error(f"FAILED to extract symbol for: {msg}")
                    f.write(f"FAILED symbol extraction\n")
                else:
                    logger.info(f"SUCCESS: Symbol={result['symbol']}")
                    f.write(f"SUCCESS: {result['symbol']}\n")

                if result.get('symbol') == 'GOLD':
                     logger.warning("Returned GOLD instead of XAUUSD (Mapping failed?)")
                     f.write("WARNING: Returned GOLD\n")
        
        print("Test completed successfully.")
    except Exception as e:
        print(f"Test failed with error: {e}")
        with open("test_output.txt", "a") as f:
             f.write(f"ERROR: {e}\n")

if __name__ == "__main__":
    test_parsing()
