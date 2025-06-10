#!/usr/bin/env python
"""
Tetris Game - Main Entry Point
"""

import argparse
from cli.tetris_cli import main as cli_main

def main():
    """メインエントリーポイント"""
    parser = argparse.ArgumentParser(description='Python Tetris Game')
    parser.add_argument('--mode', choices=['cli', 'web'], default='cli',
                      help='Game mode (cli or web)')
    parser.add_argument('--width', type=int, default=10,
                      help='Board width')
    parser.add_argument('--height', type=int, default=20,
                      help='Board height')
    
    args = parser.parse_args()
    
    if args.mode == 'cli':
        cli_main()
    else:
        print("Web mode is not implemented yet.")
        # TODO: Implement web mode
        # from web.tetris_web import main as web_main
        # web_main()

if __name__ == '__main__':
    main() 