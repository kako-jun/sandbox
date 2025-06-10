import numpy as np
from typing import List, Tuple, Optional

class Tetris:
    # テトリミノの形状定義
    SHAPES = {
        'I': [(0, 0), (0, 1), (0, 2), (0, 3)],
        'O': [(0, 0), (0, 1), (1, 0), (1, 1)],
        'T': [(0, 1), (1, 0), (1, 1), (1, 2)],
        'S': [(0, 1), (0, 2), (1, 0), (1, 1)],
        'Z': [(0, 0), (0, 1), (1, 1), (1, 2)],
        'J': [(0, 0), (1, 0), (1, 1), (1, 2)],
        'L': [(0, 2), (1, 0), (1, 1), (1, 2)]
    }

    def __init__(self, width: int = 10, height: int = 20):
        self.width = width
        self.height = height
        self.board = np.zeros((height, width), dtype=int)
        self.current_piece = None
        self.current_pos = None
        self.game_over = False
        self.score = 0
        self.spawn_piece()

    def spawn_piece(self) -> None:
        """新しいテトリミノを生成"""
        shape_name = np.random.choice(list(self.SHAPES.keys()))
        self.current_piece = self.SHAPES[shape_name]
        self.current_pos = [0, self.width // 2 - 2]
        
        if not self.is_valid_position():
            self.game_over = True

    def is_valid_position(self) -> bool:
        """現在の位置が有効かチェック"""
        for y, x in self.current_piece:
            board_y = self.current_pos[0] + y
            board_x = self.current_pos[1] + x
            
            if (board_x < 0 or board_x >= self.width or
                board_y >= self.height or
                (board_y >= 0 and self.board[board_y][board_x] != 0)):
                return False
        return True

    def rotate_piece(self) -> None:
        """テトリミノを回転"""
        if self.current_piece is None:
            return

        # 回転行列を使用して90度回転
        rotated = [(-x, y) for y, x in self.current_piece]
        old_piece = self.current_piece
        self.current_piece = rotated
        
        if not self.is_valid_position():
            self.current_piece = old_piece

    def move(self, dx: int, dy: int) -> bool:
        """テトリミノを移動"""
        if self.current_piece is None:
            return False

        self.current_pos[0] += dy
        self.current_pos[1] += dx
        
        if not self.is_valid_position():
            self.current_pos[0] -= dy
            self.current_pos[1] -= dx
            if dy > 0:  # 下に移動できなかった場合
                self.lock_piece()
                self.clear_lines()
                self.spawn_piece()
            return False
        return True

    def lock_piece(self) -> None:
        """テトリミノを固定"""
        for y, x in self.current_piece:
            board_y = self.current_pos[0] + y
            board_x = self.current_pos[1] + x
            if 0 <= board_y < self.height and 0 <= board_x < self.width:
                self.board[board_y][board_x] = 1

    def clear_lines(self) -> None:
        """完成した行を消去"""
        lines_cleared = 0
        y = self.height - 1
        while y >= 0:
            if np.all(self.board[y] != 0):
                self.board = np.vstack((np.zeros((1, self.width)), self.board[:y], self.board[y+1:]))
                lines_cleared += 1
            else:
                y -= 1
        
        # スコア計算
        self.score += lines_cleared * 100

    def get_board_state(self) -> np.ndarray:
        """現在のボード状態を取得（テトリミノを含む）"""
        board_copy = self.board.copy()
        if self.current_piece is not None:
            for y, x in self.current_piece:
                board_y = self.current_pos[0] + y
                board_x = self.current_pos[1] + x
                if 0 <= board_y < self.height and 0 <= board_x < self.width:
                    board_copy[board_y][board_x] = 2
        return board_copy

    def get_score(self) -> int:
        """現在のスコアを取得"""
        return self.score 