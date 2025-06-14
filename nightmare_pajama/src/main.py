import pygame
import sys
from game_engine import GameEngine

def main():
    pygame.init()
    engine = GameEngine()
    engine.run()
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()