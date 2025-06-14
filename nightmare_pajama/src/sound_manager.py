import pygame

class SoundManager:
    def __init__(self):
        pygame.mixer.init()
        self.bgm = None
        self.sound_effects = {}
    
    def load_bgm(self, filepath):
        try:
            pygame.mixer.music.load(filepath)
        except pygame.error:
            print(f"BGMファイルが見つかりません: {filepath}")
    
    def play_bgm(self, loops=-1):
        pygame.mixer.music.play(loops)
    
    def stop_bgm(self):
        pygame.mixer.music.stop()
    
    def load_sound_effect(self, name, filepath):
        try:
            self.sound_effects[name] = pygame.mixer.Sound(filepath)
        except pygame.error:
            print(f"効果音ファイルが見つかりません: {filepath}")
    
    def play_sound_effect(self, name):
        if name in self.sound_effects:
            self.sound_effects[name].play()