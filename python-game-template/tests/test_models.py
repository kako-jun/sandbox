"""
モデルクラスのテスト
"""

import sys
from pathlib import Path

import pytest
from pydantic import ValidationError

src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

from game.models import (
    Color,
    GameConfig,
    GameData,
    GameMode,
    GameObject,
    GameScene,
    GameState,
    Language,
    Player,
    Position,
    Size,
)


class TestPosition:
    """Position クラスのテスト"""

    def test_正常な位置作成(self):
        """正常な位置を作成できる"""
        pos = Position(x=10, y=20)
        assert pos.x == 10
        assert pos.y == 20

    def test_負の座標はエラー(self):
        """負の座標はバリデーションエラー"""
        with pytest.raises(ValidationError):
            Position(x=-1, y=10)

    def test_文字列表現(self):
        """文字列表現が正しい"""
        pos = Position(x=5, y=15)
        assert str(pos) == "(5, 15)"


class TestSize:
    """Size クラスのテスト"""

    def test_正常なサイズ作成(self):
        """正常なサイズを作成できる"""
        size = Size(width=100, height=200)
        assert size.width == 100
        assert size.height == 200

    def test_ゼロ以下のサイズはエラー(self):
        """ゼロ以下のサイズはバリデーションエラー"""
        with pytest.raises(ValidationError):
            Size(width=0, height=100)

        with pytest.raises(ValidationError):
            Size(width=100, height=-10)

    def test_文字列表現(self):
        """文字列表現が正しい"""
        size = Size(width=80, height=60)
        assert str(size) == "80x60"


class TestColor:
    """Color クラスのテスト"""

    def test_正常な色作成(self):
        """正常な色を作成できる"""
        color = Color(r=255, g=128, b=64)
        assert color.r == 255
        assert color.g == 128
        assert color.b == 64
        assert color.a == 255  # デフォルト値

    def test_アルファ値指定(self):
        """アルファ値を指定できる"""
        color = Color(r=100, g=150, b=200, a=128)
        assert color.a == 128

    def test_範囲外の値はエラー(self):
        """範囲外の値はバリデーションエラー"""
        with pytest.raises(ValidationError):
            Color(r=256, g=100, b=100)

        with pytest.raises(ValidationError):
            Color(r=100, g=-1, b=100)

    def test_タプル変換(self):
        """タプル変換が正しい"""
        color = Color(r=10, g=20, b=30, a=40)
        assert color.to_tuple() == (10, 20, 30, 40)
        assert color.to_rgb_tuple() == (10, 20, 30)


class TestGameConfig:
    """GameConfig クラスのテスト"""

    def test_デフォルト設定(self):
        """デフォルト設定が正しい"""
        config = GameConfig()
        assert config.mode == GameMode.GUI
        assert config.language == Language.EN
        assert config.debug is False
        assert config.fps == 60

    def test_設定変更(self):
        """設定を変更できる"""
        config = GameConfig(mode=GameMode.CUI, language=Language.JA, debug=True, fps=30)
        assert config.mode == GameMode.CUI
        assert config.language == Language.JA
        assert config.debug is True
        assert config.fps == 30

    def test_FPS範囲チェック(self):
        """FPS の範囲チェック"""
        with pytest.raises(ValidationError):
            GameConfig(fps=0)

        with pytest.raises(ValidationError):
            GameConfig(fps=121)


class TestGameObject:
    """GameObject クラスのテスト"""

    def test_正常なオブジェクト作成(self):
        """正常なゲームオブジェクトを作成できる"""
        obj = GameObject(id="test_obj")
        assert obj.id == "test_obj"
        assert obj.position.x == 0
        assert obj.position.y == 0
        assert obj.visible is True
        assert obj.active is True

    def test_境界ボックス取得(self):
        """境界ボックスを正しく取得できる"""
        obj = GameObject(id="test", position=Position(x=10, y=20), size=Size(width=30, height=40))
        bounds = obj.get_bounds()
        assert bounds == (10, 20, 30, 40)

    def test_衝突判定(self):
        """衝突判定が正しく動作する"""
        obj1 = GameObject(id="obj1", position=Position(x=0, y=0), size=Size(width=10, height=10))

        obj2 = GameObject(id="obj2", position=Position(x=5, y=5), size=Size(width=10, height=10))

        obj3 = GameObject(id="obj3", position=Position(x=20, y=20), size=Size(width=10, height=10))

        # obj1 と obj2 は衝突している
        assert obj1.is_colliding_with(obj2) is True
        assert obj2.is_colliding_with(obj1) is True

        # obj1 と obj3 は衝突していない
        assert obj1.is_colliding_with(obj3) is False
        assert obj3.is_colliding_with(obj1) is False


class TestPlayer:
    """Player クラスのテスト"""

    def test_正常なプレイヤー作成(self):
        """正常なプレイヤーを作成できる"""
        player = Player(id="player1", name="テストプレイヤー")
        assert player.id == "player1"
        assert player.name == "テストプレイヤー"
        assert player.score == 0
        assert player.lives == 3
        assert player.level == 1

    def test_プレイヤー情報変更(self):
        """プレイヤー情報を変更できる"""
        player = Player(id="player2", name="Player2", score=1000, lives=5, level=3)
        assert player.score == 1000
        assert player.lives == 5
        assert player.level == 3


class TestGameScene:
    """GameScene クラスのテスト"""

    def test_正常なシーン作成(self):
        """正常なゲームシーンを作成できる"""
        scene = GameScene(name="test_scene")
        assert scene.name == "test_scene"
        assert len(scene.objects) == 0

    def test_オブジェクト追加と削除(self):
        """オブジェクトの追加と削除ができる"""
        scene = GameScene(name="test")
        obj = GameObject(id="test_obj")

        # 追加
        scene.add_object(obj)
        assert len(scene.objects) == 1
        assert scene.get_object("test_obj") is not None

        # 削除
        result = scene.remove_object("test_obj")
        assert result is True
        assert len(scene.objects) == 0
        assert scene.get_object("test_obj") is None

    def test_存在しないオブジェクト削除(self):
        """存在しないオブジェクトの削除は失敗する"""
        scene = GameScene(name="test")
        result = scene.remove_object("non_existent")
        assert result is False

    def test_アクティブオブジェクト取得(self):
        """アクティブなオブジェクトのみ取得できる"""
        scene = GameScene(name="test")

        active_obj = GameObject(id="active", active=True)
        inactive_obj = GameObject(id="inactive", active=False)

        scene.add_object(active_obj)
        scene.add_object(inactive_obj)

        active_objects = scene.get_active_objects()
        assert len(active_objects) == 1
        assert active_objects[0].id == "active"


class TestGameData:
    """GameData クラスのテスト"""

    def test_正常なゲームデータ作成(self):
        """正常なゲームデータを作成できる"""
        data = GameData()
        assert data.current_state == GameState.MENU
        assert data.current_scene is None
        assert data.player is None
        assert len(data.high_scores) == 0
        assert data.play_time == 0.0

    def test_ハイスコア追加(self):
        """ハイスコアを追加できる"""
        data = GameData()

        data.add_high_score(1000)
        data.add_high_score(1500)
        data.add_high_score(800)

        assert len(data.high_scores) == 3
        assert data.high_scores == [1500, 1000, 800]  # 降順ソート

    def test_ハイスコア上限(self):
        """ハイスコアは10個まで保持される"""
        data = GameData()

        # 15個のスコアを追加
        for i in range(15):
            data.add_high_score(i * 100)

        assert len(data.high_scores) == 10
        # 上位10個が保持される
        expected = [1400, 1300, 1200, 1100, 1000, 900, 800, 700, 600, 500]
        assert data.high_scores == expected

    def test_ハイスコア判定(self):
        """ハイスコア判定が正しい"""
        data = GameData()

        # 10個のスコアを追加（100, 200, ..., 1000）
        for i in range(1, 11):
            data.add_high_score(i * 100)

        # 1100 はハイスコア
        assert data.is_high_score(1100) is True

        # 50 はハイスコアではない
        assert data.is_high_score(50) is False

        # 空の状態では何でもハイスコア
        empty_data = GameData()
        assert empty_data.is_high_score(10) is True
