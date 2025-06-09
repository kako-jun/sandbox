import argparse
import sys
import requests
from .ui import TerminalUI


def main():
    parser = argparse.ArgumentParser(description="Python Snake Game CLI")
    parser.add_argument("--play", action="store_true", help="Start the Snake game")
    parser.add_argument("--test-api", action="store_true", help="Test API connection")
    parser.add_argument("--api-url", default="http://localhost:8000", help="API server URL")

    args = parser.parse_args()

    if args.play:
        print("🐍 Starting Snake Game...")
        ui = TerminalUI()
        ui.start_game()
    elif args.test_api:
        test_api_connection(args.api_url)
    else:
        print("🐍 Python Snake Game 🐍")
        print("Use --play to start the game")
        print("Use --test-api to test API connection")
        print("Use --help for more options")


def test_api_connection(api_url):
    try:
        response = requests.get(f"{api_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ API server is running")
        else:
            print(f"❌ API server error: {response.status_code}")
    except Exception as e:
        print(f"❌ Cannot connect to API: {e}")


if __name__ == "__main__":
    main()
