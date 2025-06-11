"""
ゲームの共通データモデル

Pydanticを使用してデータの型安全性を確保し、
dictアクセスによる例外を防ぐ
"""
# pylint: disable=E1101,E1120,E1136

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict


class GameMode(str, Enum):
    """ゲームモード"""

    CUI = "cui"
    GUI = "gui"


class Language(str, Enum):
    """言語設定"""

    ENGLISH = "en"
    JAPANESE = "ja"


class LogLevel(str, Enum):
    """ログレベル"""

    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class Position(BaseModel):
    """位置情報"""

    x: int = Field(ge=0, description="X座標")
    y: int = Field(ge=0, description="Y座標")

    def __str__(self) -> str:
        return f"({self.x}, {self.y})"


class Size(BaseModel):
    """サイズ情報"""

    width: int = Field(gt=0, description="幅")
    height: int = Field(gt=0, description="高さ")

    def __str__(self) -> str:
        return f"{self.width}x{self.height}"


class Color(BaseModel):
    """色情報"""

    r: int = Field(ge=0, le=255, description="赤成分")
    g: int = Field(ge=0, le=255, description="緑成分")
    b: int = Field(ge=0, le=255, description="青成分")
    a: int = Field(ge=0, le=255, default=255, description="アルファ成分")

    def to_tuple(self) -> tuple[int, int, int, int]:
        """タプル形式で返す"""
        return (self.r, self.g, self.b, self.a)

    def to_rgb_tuple(self) -> tuple[int, int, int]:
        """RGB タプル形式で返す"""
        return (self.r, self.g, self.b)


class GameConfig(BaseModel):
    """ゲーム設定"""

    model_config = ConfigDict(use_enum_values=True)

    mode: GameMode = GameMode.GUI
    language: Language = Language.ENGLISH
    debug: bool = False
    fullscreen: bool = False
    fps: int = Field(default=60, ge=1, le=120, description="フレームレート")
    window_size: Size = Size(width=800, height=600)
    volume: float = Field(default=0.8, ge=0.0, le=1.0, description="音量")


class GameState(str, Enum):
    """ゲーム状態"""

    MENU = "menu"
    PLAYING = "playing"
    PAUSED = "paused"
    GAME_OVER = "game_over"
    QUIT = "quit"


class InputEvent(BaseModel):
    """入力イベント"""

    event_type: str = Field(description="イベントタイプ")
    key: Optional[str] = Field(default=None, description="押されたキー")
    mouse_pos: Optional[Position] = Field(default=None, description="マウス位置")
    timestamp: float = Field(description="イベント発生時刻")


class GameObject(BaseModel):
    """ゲームオブジェクトの基底クラス"""

    id: str = Field(description="オブジェクトID")
    position: Position = Field(default_factory=lambda: Position(x=0, y=0))
    size: Size = Field(default_factory=lambda: Size(width=32, height=32))
    visible: bool = Field(default=True, description="表示フラグ")
    active: bool = Field(default=True, description="アクティブフラグ")

    def get_bounds(self) -> tuple[int, int, int, int]:
        """境界ボックスを取得 (x, y, width, height)"""
        return (self.position.x, self.position.y, self.size.width, self.size.height)

    def is_colliding_with(self, other: "GameObject") -> bool:
        """他のオブジェクトとの衝突判定"""
        x1, y1, w1, h1 = self.get_bounds()
        x2, y2, w2, h2 = other.get_bounds()

        return x1 < x2 + w2 and x1 + w1 > x2 and y1 < y2 + h2 and y1 + h1 > y2


class Player(GameObject):
    """プレイヤーオブジェクト"""

    name: str = Field(default="Player", description="プレイヤー名")
    score: int = Field(default=0, ge=0, description="スコア")
    lives: int = Field(default=3, ge=0, description="ライフ数")
    level: int = Field(default=1, ge=1, description="レベル")


class GameScene(BaseModel):
    """ゲームシーン"""

    name: str = Field(description="シーン名")
    objects: List[GameObject] = Field(default_factory=list, description="オブジェクトリスト")
    background_color: Color = Field(default_factory=lambda: Color(r=0, g=0, b=0), description="背景色")

    def add_object(self, obj: GameObject) -> None:
        """オブジェクトを追加"""
        self.objects.append(obj)

    def remove_object(self, obj_id: str) -> bool:
        """オブジェクトを削除"""
        for i, obj in enumerate(self.objects):
            if obj.id == obj_id:
                self.objects.pop(i)
                return True
        return False

    def get_object(self, obj_id: str) -> Optional[GameObject]:
        """オブジェクトを取得"""
        for obj in self.objects:
            if obj.id == obj_id:
                return obj
        return None

    def get_active_objects(self) -> List[GameObject]:
        """アクティブなオブジェクトのみを取得"""
        return [obj for obj in self.objects if obj.active]


class GameData(BaseModel):
    """ゲーム全体のデータ"""

    config: GameConfig = Field(default_factory=GameConfig)
    current_state: GameState = GameState.MENU
    current_scene: Optional[GameScene] = None
    player: Optional[Player] = None
    high_scores: List[int] = Field(default_factory=list, description="ハイスコアリスト")
    play_time: float = Field(default=0.0, ge=0.0, description="プレイ時間（秒）")

    def add_high_score(self, score: int) -> None:
        """ハイスコアを追加"""
        self.high_scores.append(score)
        self.high_scores.sort(reverse=True)
        # トップ10のみ保持
        self.high_scores = self.high_scores[:10]

    def is_high_score(self, score: int) -> bool:
        """ハイスコアかどうか判定"""
        return len(self.high_scores) < 10 or score > min(self.high_scores)
