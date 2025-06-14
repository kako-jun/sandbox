class Scenario:
    def __init__(self):
        self.current_scene = "start"
        self.scene_data = self.load_scenario()
        self.variables = {}  # ゲーム内変数（フラグなど）
    
    def load_scenario(self):
        # 悪夢のパジャマのシナリオデータ
        return {
            "start": {
                "text": "深夜、ベッドで目を覚ました。\\n見慣れた部屋なのに、何かが違う...",
                "background": "bedroom_night",
                "choices": [
                    {"text": "電気をつけてみる", "next": "light_on"},
                    {"text": "そのまま様子を見る", "next": "watch_darkness"}
                ]
            },
            "light_on": {
                "text": "電気のスイッチを押したが、明かりがつかない。\\n停電なのか、それとも...？",
                "background": "bedroom_dark",
                "choices": [
                    {"text": "窓の外を確認する", "next": "window_check"},
                    {"text": "部屋から出る", "next": "leave_room"}
                ]
            },
            "watch_darkness": {
                "text": "暗闇の中で静かに耳を澄ます。\\n微かに聞こえるのは、自分の心臓の音だけ...いや、違う。",
                "background": "bedroom_dark",
                "next": "strange_sound"
            },
            "window_check": {
                "text": "窓の外を見ると、いつもの街並みが消えている。\\n真っ暗な虚無が広がっているだけだった。",
                "background": "void_window",
                "choices": [
                    {"text": "窓を開けてみる", "next": "open_window"},
                    {"text": "後ずさりする", "next": "back_away"}
                ]
            },
            "leave_room": {
                "text": "ドアノブを回そうとするが、なぜか動かない。\\n鍵はかかっていないはずなのに...",
                "background": "bedroom_door",
                "choices": [
                    {"text": "力ずくで開けようとする", "next": "force_door"},
                    {"text": "諦めて部屋に戻る", "next": "give_up"}
                ]
            },
            "strange_sound": {
                "text": "ベッドの下から、何かが這いずる音が聞こえてくる。\\nゆっくりと、確実に、こちらに近づいている。",
                "background": "bedroom_dark",
                "choices": [
                    {"text": "ベッドの下を覗く", "next": "peek_under_bed"},
                    {"text": "ベッドから飛び起きる", "next": "jump_up"}
                ]
            },
            "open_window": {
                "text": "窓を開けた瞬間、冷たい虚無が部屋に流れ込む。\\n何かが自分を呼んでいる声が聞こえる...",
                "background": "void_window",
                "next": "void_calling"
            },
            "peek_under_bed": {
                "text": "恐る恐るベッドの下を覗くと...\\n何十もの目玉がこちらを見つめていた。",
                "background": "eyes_under_bed",
                "next": "eyes_staring"
            },
            "void_calling": {
                "text": "虚無からの呼び声は次第に大きくなり、\\n自分の意識が薄れていく...これは本当に夢なのか？",
                "background": "void_window",
                "choices": [
                    {"text": "声に従う", "next": "follow_voice"},
                    {"text": "必死に抵抗する", "next": "resist"}
                ]
            }
        }
    
    def get_current_scene(self):
        return self.scene_data.get(self.current_scene, None)
    
    def advance_scene(self, choice_index=None):
        current = self.get_current_scene()
        if not current:
            return False
        
        if "choices" in current and choice_index is not None:
            if 0 <= choice_index < len(current["choices"]):
                next_scene = current["choices"][choice_index]["next"]
                self.current_scene = next_scene
                return True
        elif "next" in current:
            self.current_scene = current["next"]
            return True
        
        return False
    
    def set_variable(self, name, value):
        self.variables[name] = value
    
    def get_variable(self, name, default=None):
        return self.variables.get(name, default)