import json
import os

class SaveSystem:
    def __init__(self):
        self.save_dir = "data"
        if not os.path.exists(self.save_dir):
            os.makedirs(self.save_dir)
    
    def save_game(self, save_data, slot=1):
        filename = f"{self.save_dir}/save_{slot}.json"
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(save_data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"セーブに失敗しました: {e}")
            return False
    
    def load_game(self, slot=1):
        filename = f"{self.save_dir}/save_{slot}.json"
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"セーブファイルが見つかりません: {filename}")
            return None
        except Exception as e:
            print(f"ロードに失敗しました: {e}")
            return None
    
    def save_exists(self, slot=1):
        filename = f"{self.save_dir}/save_{slot}.json"
        return os.path.exists(filename)