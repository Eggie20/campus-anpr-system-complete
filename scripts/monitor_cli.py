import asyncio
import json
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(message)s')

try:
    import websockets
    import colorama
    from colorama import Fore, Style
    colorama.init()
except ImportError:
    print("Missing requirements. Run: pip install websockets colorama")
    exit(1)

WS_URL = "ws://127.0.0.1:8000/ws/alerts"

def get_color_for_kind(kind):
    if kind.startswith('access'):
        return Fore.GREEN
    elif kind.startswith('breach'):
        return Fore.RED
    elif kind.startswith('anomaly'):
        return Fore.YELLOW
    return Fore.CYAN

async def monitor():
    print(f"{Fore.CYAN}{Style.BRIGHT}\n=======================================================")
    print("   SMART-PLATE LIVE CAPTURE MONITOR (BACKGROUND)")
    print(f"======================================================={Style.RESET_ALL}\n")
    print(f"{Fore.WHITE}Connecting to Campus ANPR WebSocket ({WS_URL})...{Style.RESET_ALL}")
    
    while True:
        try:
            async with websockets.connect(WS_URL) as websocket:
                print(f"{Fore.GREEN}✔ Connected successfully. Listening for live captures...{Style.RESET_ALL}\n")
                
                while True:
                    message = await websocket.recv()
                    data = json.loads(message)
                    
                    if data.get("type") == "anomaly.created":
                        plate = data.get("plate_display", "UNKNOWN")
                        kind = data.get("kind", "unknown")
                        owner = data.get("owner_name_masked", "Unknown")
                        conf = data.get("confidence_score", "0.0")
                        
                        color = get_color_for_kind(kind)
                        time_str = datetime.now().strftime("%H:%M:%S")
                        
                        output = f"{Style.DIM}[{time_str}]{Style.RESET_ALL} "
                        output += f"{color}{Style.BRIGHT}► SCAN TRIGGER:{Style.RESET_ALL} "
                        output += f"{Fore.WHITE}[ PLATE: {plate} ]{Style.RESET_ALL} | "
                        output += f"{color}TYPE:{Style.RESET_ALL} {kind.upper():<15} | "
                        output += f"{color}OWNER:{Style.RESET_ALL} {owner[:15].ljust(15)} | "
                        
                        if conf is not None:
                            try:
                                output += f"CONF: {float(conf):.1f}%"
                            except Exception:
                                pass
                        
                        print(output)
                        
        except Exception as e:
            print(f"{Fore.RED}Connection lost. Retrying in 3 seconds... ({e}){Style.RESET_ALL}")
            await asyncio.sleep(3)

if __name__ == "__main__":
    try:
        asyncio.run(monitor())
    except KeyboardInterrupt:
        print("\nMonitor stopped.")
