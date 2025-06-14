"""悪夢のパジャマ - サウンドノベルゲーム"""
import sys
import pygame
from game_engine import GameEngine


def main():
    """メイン関数"""
    pygame.init()
    engine = GameEngine()
    engine.run()
    pygame.quit()
    sys.exit()


if __name__ == "__main__":
    main()