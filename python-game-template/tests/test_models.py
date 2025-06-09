import unittest
from src.game.models import (
    GameState, GameConfig, Player, Position, Direction,
    GameAction, Difficulty, GameMode
)


class TestGameState(unittest.TestCase):
    def test_game_state_initialization(self):
        """GameStateの初期化をテスト"""
        state = GameState.model_validate({
            "players": {0: Player.model_validate({
                "name": "test_player",
                "snake_body": [Position.model_validate({"x": 0, "y": 0})]
            })},
            "current_player_id": 0,
            "food_position": Position.model_validate({"x": 5, "y": 5}),
            "score": 0,
            "game_over": False,
            "board_width": 20,
            "board_height": 20,
            "difficulty": Difficulty.NORMAL,
            "game_mode": GameMode.CLASSIC,
            "time_limit": 300,
            "tick_count": 0
        })
        self.assertIsNotNone(state)
        self.assertEqual(state.score, 0)
        self.assertFalse(state.game_over)

    def test_game_state_validation(self):
        """GameStateのバリデーションをテスト"""
        with self.assertRaises(ValueError):
            GameState.model_validate({
                "players": {},
                "current_player_id": 0,
                "food_position": Position.model_validate({"x": 5, "y": 5}),
                "score": 0,
                "game_over": False,
                "board_width": 20,
                "board_height": 20,
                "difficulty": Difficulty.NORMAL,
                "game_mode": GameMode.CLASSIC,
                "time_limit": 300,
                "tick_count": 0
            })


class TestGameConfig(unittest.TestCase):
    def test_game_config_initialization(self):
        """GameConfigの初期化をテスト"""
        config = GameConfig.model_validate({
            "board_width": 20,
            "board_height": 20,
            "difficulty": Difficulty.NORMAL,
            "game_mode": GameMode.CLASSIC,
            "time_limit": 300
        })
        self.assertIsNotNone(config)
        self.assertEqual(config.board_width, 20)
        self.assertEqual(config.board_height, 20)

    def test_game_config_validation(self):
        """GameConfigのバリデーションをテスト"""
        with self.assertRaises(ValueError):
            GameConfig.model_validate({
                "board_width": 0,
                "board_height": 20,
                "difficulty": Difficulty.NORMAL,
                "game_mode": GameMode.CLASSIC,
                "time_limit": 300
            })


class TestPlayer(unittest.TestCase):
    def test_player_initialization(self):
        """Playerの初期化をテスト"""
        player = Player.model_validate({
            "name": "test_player",
            "snake_body": [Position.model_validate({"x": 0, "y": 0})]
        })
        self.assertIsNotNone(player)
        self.assertEqual(player.name, "test_player")
        self.assertEqual(len(player.snake_body), 1)

    def test_player_validation(self):
        """Playerのバリデーションをテスト"""
        with self.assertRaises(ValueError):
            Player.model_validate({
                "name": "",
                "snake_body": [Position.model_validate({"x": 0, "y": 0})]
            })


class TestPosition(unittest.TestCase):
    def test_position_initialization(self):
        """Positionの初期化をテスト"""
        position = Position.model_validate({"x": 0, "y": 0})
        self.assertIsNotNone(position)
        self.assertEqual(position.x, 0)
        self.assertEqual(position.y, 0)

    def test_position_validation(self):
        """Positionのバリデーションをテスト"""
        with self.assertRaises(ValueError):
            Position.model_validate({"x": -1, "y": 0})


class TestDirection(unittest.TestCase):
    def test_direction_values(self):
        """Directionの値をテスト"""
        self.assertEqual(Direction.UP.value, "up")
        self.assertEqual(Direction.DOWN.value, "down")
        self.assertEqual(Direction.LEFT.value, "left")
        self.assertEqual(Direction.RIGHT.value, "right")


class TestGameAction(unittest.TestCase):
    def test_game_action_initialization(self):
        """GameActionの初期化をテスト"""
        action = GameAction.model_validate({
            "player_id": 0,
            "action_type": "move",
            "direction": Direction.UP
        })
        self.assertIsNotNone(action)
        self.assertEqual(action.player_id, 0)
        self.assertEqual(action.action_type, "move")
        self.assertEqual(action.direction, Direction.UP)

    def test_game_action_validation(self):
        """GameActionのバリデーションをテスト"""
        with self.assertRaises(ValueError):
            GameAction.model_validate({
                "player_id": -1,
                "action_type": "move",
                "direction": Direction.UP
            })


class TestDifficulty(unittest.TestCase):
    def test_difficulty_values(self):
        """Difficultyの値をテスト"""
        self.assertEqual(Difficulty.EASY.value, "easy")
        self.assertEqual(Difficulty.NORMAL.value, "normal")
        self.assertEqual(Difficulty.HARD.value, "hard")


class TestGameMode(unittest.TestCase):
    def test_game_mode_values(self):
        """GameModeの値をテスト"""
        self.assertEqual(GameMode.CLASSIC.value, "classic")
        self.assertEqual(GameMode.TIME_ATTACK.value, "time_attack")


if __name__ == '__main__':
    unittest.main() 