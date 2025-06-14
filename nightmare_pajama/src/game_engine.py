import pygame
from text_display import TextDisplay
from sound_manager import SoundManager
from save_system import SaveSystem
from scenario import Scenario
from choice_system import ChoiceSystem

class GameEngine:
    def __init__(self):
        self.screen_width = 1024
        self.screen_height = 768
        self.screen = pygame.display.set_mode((self.screen_width, self.screen_height))
        pygame.display.set_caption("悪夢のパジャマ 〜 Nightmare Pajama 〜")
        
        self.clock = pygame.time.Clock()
        self.running = True
        
        # システム初期化
        self.text_display = TextDisplay(self.screen)
        self.sound_manager = SoundManager()
        self.save_system = SaveSystem()
        self.scenario = Scenario()
        self.choice_system = ChoiceSystem(self.screen)
        
        # ゲーム状態
        self.game_state = "text"  # "text" or "choice"
        self.current_background = None
        
    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.running = False
                elif self.game_state == "text":
                    if event.key == pygame.K_SPACE:
                        if self.text_display.text_complete:
                            self.advance_story()
                        else:
                            self.text_display.advance_text()
                elif self.game_state == "choice":
                    result = self.choice_system.handle_input(event)
                    if result == "select":
                        choice_index = self.choice_system.get_selected_choice()
                        self.make_choice(choice_index)
    
    def update(self):
        self.text_display.update()
    
    def render(self):
        # 背景描画（現在は黒背景）
        self.screen.fill((10, 10, 20))
        
        if self.game_state == "text":
            self.text_display.render()
        elif self.game_state == "choice":
            self.choice_system.render()
        
        pygame.display.flip()
    
    def advance_story(self):
        current_scene = self.scenario.get_current_scene()
        if current_scene and "choices" in current_scene:
            # 選択肢がある場合
            self.choice_system.set_choices(current_scene["choices"])
            self.game_state = "choice"
        else:
            # 次のシーンに進む
            if self.scenario.advance_scene():
                self.load_current_scene()
    
    def make_choice(self, choice_index):
        if self.scenario.advance_scene(choice_index):
            self.load_current_scene()
    
    def load_current_scene(self):
        current_scene = self.scenario.get_current_scene()
        if current_scene:
            self.text_display.set_text(current_scene["text"])
            self.game_state = "text"
            # 背景やBGMの設定も後で追加
    
    def run(self):
        # 最初のシーンをロード
        self.load_current_scene()
        
        while self.running:
            self.handle_events()
            self.update()
            self.render()
            self.clock.tick(60)