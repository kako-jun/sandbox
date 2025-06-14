import pygame

class ChoiceSystem:
    def __init__(self, screen):
        self.screen = screen
        # 日本語フォントを使用
        try:
            self.font = pygame.font.Font("/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc", 28)
        except:
            try:
                # fallbackとしてシステムフォントを試す
                self.font = pygame.font.SysFont("notosanscjkjp", 28)
            except:
                try:
                    self.font = pygame.font.SysFont("liberation", 28)
                except:
                    self.font = pygame.font.Font(None, 28)
        self.choices = []
        self.selected_choice = 0
        self.choice_rect_height = 50
        self.choice_margin = 10
        
        # 色設定
        self.normal_color = (60, 60, 100)
        self.selected_color = (100, 100, 150)
        self.text_color = (255, 255, 255)
        self.border_color = (150, 150, 200)
    
    def set_choices(self, choices):
        self.choices = choices
        self.selected_choice = 0
    
    def handle_input(self, event):
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_UP:
                self.selected_choice = (self.selected_choice - 1) % len(self.choices)
                return "navigate"
            elif event.key == pygame.K_DOWN:
                self.selected_choice = (self.selected_choice + 1) % len(self.choices)
                return "navigate"
            elif event.key == pygame.K_RETURN or event.key == pygame.K_SPACE:
                return "select"
        return None
    
    def get_selected_choice(self):
        return self.selected_choice
    
    def render(self):
        if not self.choices:
            return
        
        # 選択肢の表示位置を計算
        total_height = len(self.choices) * (self.choice_rect_height + self.choice_margin)
        start_y = (self.screen.get_height() - total_height) // 2
        choice_width = 600
        start_x = (self.screen.get_width() - choice_width) // 2
        
        for i, choice in enumerate(self.choices):
            y = start_y + i * (self.choice_rect_height + self.choice_margin)
            rect = pygame.Rect(start_x, y, choice_width, self.choice_rect_height)
            
            # 選択されているかどうかで色を変える
            bg_color = self.selected_color if i == self.selected_choice else self.normal_color
            
            # 選択肢の背景
            pygame.draw.rect(self.screen, bg_color, rect)
            pygame.draw.rect(self.screen, self.border_color, rect, 2)
            
            # 選択肢のテキスト
            text_surface = self.font.render(choice["text"], True, self.text_color)
            text_rect = text_surface.get_rect(center=rect.center)
            self.screen.blit(text_surface, text_rect)
            
            # 選択インジケーター
            if i == self.selected_choice:
                indicator = "▶"
                indicator_surface = self.font.render(indicator, True, self.text_color)
                self.screen.blit(indicator_surface, (start_x - 30, y + 15))