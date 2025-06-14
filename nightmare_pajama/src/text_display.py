import pygame

class TextDisplay:
    def __init__(self, screen):
        self.screen = screen
        self.font_size = 24
        # 明朝体フォントを使用（ホラー風にサイズを調整）
        self.font_size = 26  # 少し大きめでインパクトを
        try:
            self.font = pygame.font.Font("/usr/share/fonts/noto-cjk/NotoSerifCJK-Regular.ttc", self.font_size)
        except:
            try:
                # fallbackとしてシステムフォントを試す
                self.font = pygame.font.SysFont("notoserifcjkjp", self.font_size)
            except:
                self.font = pygame.font.Font(None, self.font_size)
        
        # テキスト表示領域（画面中央）
        self.text_box_rect = pygame.Rect(50, 284, 924, 200)  # 中央に配置
        self.text_margin = 20
        
        # テキスト状態
        self.current_text = ""
        self.displayed_text = ""
        self.text_index = 0
        self.text_speed = 2  # フレームあたりの文字数
        self.text_complete = False
        
        # 色設定
        self.bg_color = (20, 20, 40)
        self.text_color = (255, 255, 255)
        self.border_color = (100, 100, 150)
    
    def set_text(self, text):
        self.current_text = text.replace("\\n", "\n")
        self.displayed_text = ""
        self.text_index = 0
        self.text_complete = False
    
    def update(self):
        if not self.text_complete and self.text_index < len(self.current_text):
            # ホラー風にゆっくりとしたタイプライター効果
            self.text_speed = 1  # より遅く、緊張感を演出
            for _ in range(self.text_speed):
                if self.text_index < len(self.current_text):
                    self.displayed_text += self.current_text[self.text_index]
                    self.text_index += 1
                else:
                    self.text_complete = True
                    break
    
    def advance_text(self):
        if not self.text_complete:
            # 全文を即座に表示
            self.displayed_text = self.current_text
            self.text_index = len(self.current_text)
            self.text_complete = True
        else:
            # 次のテキストがあれば切り替え（今回は同じテキストをリセット）
            self.set_text(self.current_text)
    
    def render(self):
        # 枠なしでテキストのみ表示
        
        # テキストを複数行に分割して描画
        lines = self.displayed_text.split('\n')
        y_offset = 0
        line_height = self.font_size + 5
        
        for line in lines:
            # 行が長すぎる場合は自動改行
            words = line.split(' ')
            current_line = ""
            
            for word in words:
                test_line = current_line + word + " "
                text_width = self.font.size(test_line)[0]
                
                if text_width > self.text_box_rect.width - self.text_margin * 2:
                    if current_line:
                        # 現在の行を描画
                        text_surface = self.font.render(current_line.strip(), True, self.text_color)
                        self.screen.blit(text_surface, 
                                       (self.text_box_rect.x + self.text_margin,
                                        self.text_box_rect.y + self.text_margin + y_offset))
                        y_offset += line_height
                    current_line = word + " "
                else:
                    current_line = test_line
            
            # 残りのテキストを描画
            if current_line:
                text_surface = self.font.render(current_line.strip(), True, self.text_color)
                self.screen.blit(text_surface, 
                               (self.text_box_rect.x + self.text_margin,
                                self.text_box_rect.y + self.text_margin + y_offset))
                y_offset += line_height
        
        # テキスト完了インジケーター
        if self.text_complete:
            indicator_text = "▼ スペースキーで続行"
            indicator_surface = self.font.render(indicator_text, True, (200, 200, 200))
            self.screen.blit(indicator_surface, 
                           (self.text_box_rect.right - 200, 
                            self.text_box_rect.bottom - 30))