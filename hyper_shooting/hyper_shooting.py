import pygame
import math
import random
import sys
from grenade import Grenade

pygame.init()
pygame.mixer.pre_init(frequency=22050, size=-16, channels=2, buffer=512)
pygame.mixer.init()

def create_sound_effects():
    try:
        select_sound = pygame.mixer.Sound(buffer=b'\x00\x01' * 1000)
        explosion_sound = pygame.mixer.Sound(buffer=b'\x00\x02' * 2000)
        
        # フリー効果音「爆発３ｍｐ」風の爆発音を作成
        grenade_buffer = bytearray()
        for i in range(4500):
            if i < 100:
                # 初期の鋭いクラック音
                crack = int(120 * math.sin(i * 0.8)) if i % 3 == 0 else 0
                noise = random.randint(-100, 100)
                combined = crack + noise
            elif i < 400:
                # 主要な爆発音 - ドーン
                boom_freq = 50 - (i - 100) * 0.1
                boom = int(boom_freq * math.sin(i * 0.03))
                rumble = random.randint(-80, 80)
                combined = boom + rumble
            elif i < 1200:
                # 持続する轟音
                thunder = int(30 * math.sin(i * 0.02)) 
                echo = int(40 * math.sin(i * 0.015))
                noise = random.randint(-40, 40)
                combined = thunder + echo + noise
            else:
                # 長い残響
                decay = 1.0 - (i - 1200) / 3300
                reverb = int(25 * math.sin(i * 0.01) * decay)
                tail = random.randint(-15, 15)
                combined = int((reverb + tail) * decay)
            
            combined = max(-128, min(127, combined))
            grenade_buffer.append(combined & 0xFF)
        grenade_sound = pygame.mixer.Sound(buffer=bytes(grenade_buffer))
        
        # 波動弾のような投げる音を作成
        throw_buffer = bytearray()
        for i in range(1500):
            # 上昇する音程と「シュー」のような効果
            base_freq = int((i / 1500) * 150 + 50)
            wave = int(base_freq * math.sin(i * 0.2))
            noise = random.randint(-20, 20)
            # フェードアウト効果
            fade = 1.0 - (i / 1500) * 0.7
            combined = int((wave + noise) * fade)
            combined = max(-128, min(127, combined))
            throw_buffer.append(combined & 0xFF)
        throw_sound = pygame.mixer.Sound(buffer=bytes(throw_buffer))
        
        # パワーダウン効果音を作成
        powerdown_buffer = bytearray()
        for i in range(2000):
            # 下降する音程でパワーダウン感を表現
            freq = 200 - (i / 2000) * 150  # 200Hzから50Hzまで下降
            wave = int(80 * math.sin(i * freq * 0.01))
            # フェードアウト効果
            fade = 1.0 - (i / 2000) * 0.8
            combined = int(wave * fade)
            combined = max(-128, min(127, combined))
            powerdown_buffer.append(combined & 0xFF)
        powerdown_sound = pygame.mixer.Sound(buffer=bytes(powerdown_buffer))
        
        return select_sound, explosion_sound, grenade_sound, throw_sound, powerdown_sound
    except:
        return None, None, None, None, None

SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
GAME_WIDTH = int(SCREEN_WIDTH * 0.65)
UI_WIDTH = SCREEN_WIDTH - GAME_WIDTH

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
GREEN = (0, 255, 0)
ORANGE = (255, 165, 0)
YELLOW = (255, 255, 0)
DARK_RED = (128, 0, 0)

class Explosion:
    def __init__(self, x, y, size_multiplier=1, explosion_type='normal'):
        self.x = x
        self.y = y
        self.timer = 0
        self.max_timer = 20 if explosion_type == 'normal' else 40
        self.size_multiplier = size_multiplier
        self.explosion_type = explosion_type
        
    def update(self):
        self.timer += 1
        
    def draw(self, screen):
        if self.timer < self.max_timer:
            if self.explosion_type == 'special':
                size = int(self.timer * 8 * self.size_multiplier)
                colors = [RED, ORANGE, YELLOW, WHITE]
                for i, color in enumerate(colors):
                    pygame.draw.circle(screen, color, (int(self.x), int(self.y)), 
                                     max(1, size - i * 15))
            elif self.explosion_type == 'grenade':
                # グレネード爆発はさらに小さく
                size = int(self.timer * 2 * self.size_multiplier)
                colors = [WHITE, YELLOW, YELLOW, RED]
                for i, color in enumerate(colors):
                    pygame.draw.circle(screen, color, (int(self.x), int(self.y)), 
                                     max(1, size - i * 2))
            else:
                size = int(self.timer * 3 * self.size_multiplier)
                colors = [RED, ORANGE, YELLOW]
                for i, color in enumerate(colors):
                    pygame.draw.circle(screen, color, (int(self.x), int(self.y)), 
                                     max(1, size - i * 5))
    
    def is_finished(self):
        return self.timer >= self.max_timer

class PowerUp:
    def __init__(self, x, y, powerup_type):
        self.x = x
        self.y = y
        self.powerup_type = powerup_type  # 'speed' or 'hp'
        self.width = 20
        self.height = 20
        self.speed = 2
        
    def update(self):
        self.y += self.speed
        
    def draw(self, screen):
        # オレンジ色の丸いアイテム
        pygame.draw.circle(screen, ORANGE, (int(self.x + self.width // 2), int(self.y + self.height // 2)), 10)
        # 中央に小さな白い円
        pygame.draw.circle(screen, WHITE, (int(self.x + self.width // 2), int(self.y + self.height // 2)), 3)

class Player:
    def __init__(self, player_type):
        self.player_type = player_type
        self.x = GAME_WIDTH // 2
        self.y = SCREEN_HEIGHT - 80
        self.width = 30
        self.height = 40
        self.speed = 5
        self.base_speed = 5  # 基本速度
        self.bullets = []
        self.special_bullets = []
        self.defeated_enemies = 0  # 倒した敵の数
        self.last_shot_time = 0  # 最後に弾を撃った時間（プレイヤー2、3用）
        self.invincible_timer = 0  # 無敵時間（120フレーム = 2秒）
        self.is_invincible = False
        if player_type == 3:
            self.max_hp = 1  # プレイヤー3は最初ライフ1
            self.current_hp = 1
        else:
            self.max_hp = 3  # 最大HP
            self.current_hp = 3  # 現在のHP
        
    def update(self, keys):
        if keys[pygame.K_LEFT] and self.x > 0:
            self.x -= self.speed
        if keys[pygame.K_RIGHT] and self.x < GAME_WIDTH - self.width:
            self.x += self.speed
        if keys[pygame.K_UP] and self.y > 0:
            self.y -= self.speed
        if keys[pygame.K_DOWN] and self.y < SCREEN_HEIGHT - self.height:
            self.y += self.speed
            
        for bullet in self.bullets[:]:
            bullet.update()
            if bullet.y < 0 or bullet.x < 0 or bullet.x > GAME_WIDTH:
                self.bullets.remove(bullet)
                
        # 無敵時間の処理
        if self.is_invincible:
            self.invincible_timer -= 1
            if self.invincible_timer <= 0:
                self.is_invincible = False
                
        for bullet in self.special_bullets[:]:
            bullet.update()
            if bullet.y < 0:
                self.special_bullets.remove(bullet)
    
    def shoot(self):
        import pygame
        current_time = pygame.time.get_ticks()
        
        if self.player_type == 1:
            bullet = Bullet(self.x + self.width // 2, self.y, -8, BLUE)
            self.bullets.append(bullet)
        elif self.player_type == 2:
            # プレイヤー2は0.5秒間隔でしか撃てない
            if current_time - self.last_shot_time >= 500:  # 500ms = 0.5秒
                bullet = SpecialBullet(self.x + self.width // 2, self.y, -8, YELLOW)
                self.special_bullets.append(bullet)
                self.last_shot_time = current_time
        elif self.player_type == 3:
            # プレイヤー3は0.2秒間隔で連射可能
            if current_time - self.last_shot_time >= 200:  # 200ms = 0.2秒
                # プレイヤー3の弾数はライフ数と同じ（最大10発）
                bullet_count = min(self.current_hp, 10)
                if bullet_count == 1:
                    # 1発の場合は真上
                    bullet = Bullet(self.x + self.width // 2, self.y, -8, GREEN)
                    bullet.dx = 0
                    self.bullets.append(bullet)
                else:
                    # 複数発の場合は扇状に展開
                    for i in range(bullet_count):
                        angle_offset = (i - (bullet_count - 1) / 2) * 15  # 15度間隔
                        angle_rad = math.radians(angle_offset)
                        bullet = Bullet(self.x + self.width // 2, self.y, -8, GREEN)
                        bullet.dx = 3 * math.sin(angle_rad)
                        bullet.speed = -8 * math.cos(angle_rad)
                        self.bullets.append(bullet)
                self.last_shot_time = current_time
    
    def take_damage(self):
        """被弾処理"""
        if self.is_invincible:
            return False  # 無敵中はダメージを受けない
        
        self.is_invincible = True
        self.invincible_timer = 120  # 2秒間無敵（60fps × 2）
        return True  # ダメージを受けた
    
    def draw(self, screen):
        # 無敵中は点滅効果で描画
        if self.is_invincible and (self.invincible_timer // 5) % 2 == 0:
            return  # 点滅のため描画をスキップ
        
        if self.player_type == 1:
            # メイン船体（青）
            pygame.draw.polygon(screen, BLUE, [
                (self.x + self.width // 2, self.y),
                (self.x + 5, self.y + 15),
                (self.x + self.width - 5, self.y + 15),
            ])
            # 下部船体
            pygame.draw.rect(screen, BLUE, (self.x + 8, self.y + 15, self.width - 16, 20))
            # エンジン（オレンジ）
            pygame.draw.rect(screen, ORANGE, (self.x + 10, self.y + 35, 4, 5))
            pygame.draw.rect(screen, ORANGE, (self.x + self.width - 14, self.y + 35, 4, 5))
            # コックピット
            pygame.draw.circle(screen, WHITE, (self.x + self.width // 2, self.y + 10), 3)
            
        elif self.player_type == 2:
            # メイン船体（黄色）
            pygame.draw.polygon(screen, YELLOW, [
                (self.x + self.width // 2, self.y),
                (self.x + 5, self.y + 15),
                (self.x + self.width - 5, self.y + 15),
            ])
            # 下部船体
            pygame.draw.rect(screen, YELLOW, (self.x + 8, self.y + 15, self.width - 16, 20))
            # エンジン（オレンジ）
            pygame.draw.rect(screen, ORANGE, (self.x + 10, self.y + 35, 4, 5))
            pygame.draw.rect(screen, ORANGE, (self.x + self.width - 14, self.y + 35, 4, 5))
            # コックピット
            pygame.draw.circle(screen, WHITE, (self.x + self.width // 2, self.y + 10), 3)
            
        elif self.player_type == 3:
            # メイン船体（緑）
            pygame.draw.polygon(screen, GREEN, [
                (self.x + self.width // 2, self.y),
                (self.x + 5, self.y + 15),
                (self.x + self.width - 5, self.y + 15),
            ])
            # 下部船体
            pygame.draw.rect(screen, GREEN, (self.x + 8, self.y + 15, self.width - 16, 20))
            # 3つのエンジン（オレンジ）
            pygame.draw.rect(screen, ORANGE, (self.x + 6, self.y + 35, 4, 5))
            pygame.draw.rect(screen, ORANGE, (self.x + 13, self.y + 35, 4, 5))
            pygame.draw.rect(screen, ORANGE, (self.x + 20, self.y + 35, 4, 5))
            # コックピット
            pygame.draw.circle(screen, WHITE, (self.x + self.width // 2, self.y + 10), 3)
        
        for bullet in self.bullets:
            bullet.draw(screen)
        for bullet in self.special_bullets:
            bullet.draw(screen)

class Bullet:
    def __init__(self, x, y, speed, color):
        self.x = x
        self.y = y
        self.speed = speed
        self.color = color
        self.width = 4
        self.height = 8
        self.dx = 0  # 横方向の速度成分
        
    def update(self):
        self.y += self.speed
        self.x += self.dx
        
    def draw(self, screen):
        pygame.draw.rect(screen, self.color, (self.x - self.width // 2, self.y, self.width, self.height))

class SpecialBullet(Bullet):
    def __init__(self, x, y, speed, color):
        super().__init__(x, y, speed, color)
        self.exploded = False
        self.explosion_timer = 0
        
    def update(self):
        super().update()
        if not self.exploded:
            self.explosion_timer += 1
            if self.explosion_timer >= 60:
                self.exploded = True

class Enemy:
    def __init__(self, x, y, enemy_type=1):
        self.x = x
        self.y = y
        self.enemy_type = enemy_type
        self.width = 25 if enemy_type == 1 else 40
        self.height = 25 if enemy_type == 1 else 40
        self.speed = 2 if enemy_type == 1 else 1
        self.bullets = []
        self.shoot_timer = 0
        self.hp = 1 if enemy_type == 1 else 3
        
    def update(self, player_x, player_y, difficulty="ノーマル"):
        self.y += self.speed
        self.shoot_timer += 1
        
        # 難易度に応じて射撃頻度を調整
        if difficulty == "イージー":
            # イージーでは普通の敵は5秒に1回、赤い大型敵は3秒に1回
            shoot_interval_1 = 300  # 5秒 (60fps * 5)
            shoot_interval_2 = 180  # 3秒 (60fps * 3)
        elif difficulty == "ノーマル":
            # ノーマルでは普通の敵は3秒に1回、赤い大型敵は2秒に1回
            shoot_interval_1 = 180  # 3秒 (60fps * 3)
            shoot_interval_2 = 120  # 2秒 (60fps * 2)
        elif difficulty == "ハード":
            # ハードでは少し弾幕を少なくする
            shoot_interval_1 = 80   # 少し長く
            shoot_interval_2 = 60   # 少し長く
        else:
            shoot_interval_1 = 60
            shoot_interval_2 = 45
        
        if self.enemy_type == 1 and self.shoot_timer % shoot_interval_1 == 0:
            angle = math.atan2(player_y - self.y, player_x - self.x)
            bullet = EnemyBullet(self.x + self.width // 2, self.y + self.height, 
                               3 * math.cos(angle), 3 * math.sin(angle))
            self.bullets.append(bullet)
        elif self.enemy_type == 2 and self.shoot_timer % shoot_interval_2 == 0:
            for i in range(16):
                angle = (i * 22.5) * math.pi / 180
                bullet = EnemyBullet(self.x + self.width // 2, self.y + self.height // 2,
                                   2 * math.cos(angle), 2 * math.sin(angle))
                self.bullets.append(bullet)
                
        for bullet in self.bullets[:]:
            bullet.update()
            if (bullet.x < 0 or bullet.x > GAME_WIDTH or 
                bullet.y < 0 or bullet.y > SCREEN_HEIGHT):
                self.bullets.remove(bullet)
    
    def draw(self, screen):
        if self.enemy_type == 1:
            pygame.draw.rect(screen, RED, (self.x, self.y, self.width, self.height))
        else:
            pygame.draw.rect(screen, DARK_RED, (self.x, self.y, self.width, self.height))
            
        for bullet in self.bullets:
            bullet.draw(screen)

class Boss:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.width = 80
        self.height = 80
        self.speed = 1
        self.bullets = []
        self.shoot_timer = 0
        self.hp = 20  # 20発で倒せる
        self.max_hp = 20
        self.is_dying = False
        self.death_timer = 0
        self.explosion_count = 0
        self.explosion_timer = 0
        self.rotation_angle = 0  # ハード用の回転角度
        
    def update(self, player_x, player_y, difficulty="ノーマル"):
        if not self.is_dying:
            # 左右に移動
            self.x += self.speed
            if self.x <= 0 or self.x >= GAME_WIDTH - self.width:
                self.speed = -self.speed
            
            self.shoot_timer += 1
            
            # 難易度に応じた射撃パターン
            if difficulty == "イージー" and self.shoot_timer % 120 == 0:
                # イージー: 3方向弾
                for angle_offset in [-20, 0, 20]:
                    angle = math.atan2(player_y - self.y, player_x - self.x) + math.radians(angle_offset)
                    bullet = EnemyBullet(self.x + self.width // 2, self.y + self.height,
                                       3 * math.cos(angle), 3 * math.sin(angle))
                    self.bullets.append(bullet)
            elif difficulty == "ノーマル" and self.shoot_timer % 90 == 0:
                # ノーマル: 16方向弾（大型敵と同じ）
                for i in range(16):
                    angle = (i * 22.5) * math.pi / 180
                    bullet = EnemyBullet(self.x + self.width // 2, self.y + self.height // 2,
                                       2 * math.cos(angle), 2 * math.sin(angle))
                    self.bullets.append(bullet)
            elif difficulty == "ハード" and self.shoot_timer % 120 == 0:
                # ハード: ボスを中心として32方向弾を回転させて発射
                self.rotation_angle += 5.625  # 5.625度ずつ回転（32分割の半分）
                for i in range(32):
                    base_angle = (i * 11.25) * math.pi / 180  # 11.25度間隔
                    angle = base_angle + math.radians(self.rotation_angle)
                    bullet = EnemyBullet(self.x + self.width // 2, self.y + self.height // 2,
                                       2 * math.cos(angle), 2 * math.sin(angle))
                    self.bullets.append(bullet)
        else:
            # 死亡演出
            self.death_timer += 1
            if self.death_timer % 30 == 0 and self.explosion_count < 5:
                self.explosion_count += 1
                
        for bullet in self.bullets[:]:
            bullet.update()
            if (bullet.x < 0 or bullet.x > GAME_WIDTH or 
                bullet.y < 0 or bullet.y > SCREEN_HEIGHT):
                self.bullets.remove(bullet)
    
    def take_damage(self):
        if not self.is_dying:
            self.hp -= 1
            if self.hp <= 0:
                self.is_dying = True
                self.death_timer = 0
                self.explosion_count = 0
    
    def is_dead(self):
        return self.is_dying and self.explosion_count >= 5
    
    def get_current_explosion_pos(self):
        if self.is_dying and self.death_timer % 30 == 1:
            # 爆発位置をランダムに
            explosion_x = self.x + random.randint(0, self.width)
            explosion_y = self.y + random.randint(0, self.height)
            explosion_size = 2 + self.explosion_count  # だんだん大きくなる
            return explosion_x, explosion_y, explosion_size
        return None
    
    def draw(self, screen):
        if not self.is_dying:
            # ボス本体（紫色で大きく）
            pygame.draw.rect(screen, (128, 0, 128), (self.x, self.y, self.width, self.height))
            # HPバー
            bar_width = self.width
            bar_height = 8
            hp_ratio = self.hp / self.max_hp
            pygame.draw.rect(screen, RED, (self.x, self.y - 15, bar_width, bar_height))
            pygame.draw.rect(screen, GREEN, (self.x, self.y - 15, bar_width * hp_ratio, bar_height))
            
        for bullet in self.bullets:
            bullet.draw(screen)

class EnemyBullet:
    def __init__(self, x, y, dx, dy):
        self.x = x
        self.y = y
        self.dx = dx
        self.dy = dy
        self.width = 6
        self.height = 6
        
    def update(self):
        self.x += self.dx
        self.y += self.dy
        
    def draw(self, screen):
        pygame.draw.circle(screen, WHITE, (int(self.x), int(self.y)), 3)

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("超弾幕シューティングゲーム")
        self.clock = pygame.time.Clock()
        try:
            # 日本語フォントを使用
            self.font = pygame.font.Font("/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc", 36)
            self.large_font = pygame.font.Font("/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc", 48)
        except:
            try:
                # HackGenフォントを試す
                self.font = pygame.font.Font("/usr/share/fonts/TTF/HackGen-Regular.ttf", 36)
                self.large_font = pygame.font.Font("/usr/share/fonts/TTF/HackGen-Regular.ttf", 48)
            except:
                # それでもダメならpygameの日本語対応フォントを使用
                self.font = pygame.font.Font(None, 36)
                self.large_font = pygame.font.Font(None, 48)
        
        self.state = "player_select"
        self.selected_player = 1
        self.difficulty = "ノーマル"  # イージー, ノーマル, ハード
        self.selection_mode = "player"  # player または difficulty
        self.player = None
        self.enemies = []
        self.enemy_spawn_timer = 0
        self.enemy_count = 0
        self.boss = None
        self.defeated_enemy_count = 0  # 倒した敵の総数
        self.grenade_count = 2  # 手榴弾の残り使用回数
        self.explosions = []
        self.powerups = []  # パワーアップアイテム
        self.independent_enemy_bullets = []  # 敵が倒された後も残る弾
        self.grenades = []  # グレネード
        
        # ハード難易度の特殊攻撃システム
        self.hard_attack_timer = 0
        self.warning_timer = 0
        self.warning_side = None  # "left" or "right"
        self.is_warning_active = False
        self.hard_bullets = []  # 特殊攻撃の弾
        
        self.score = 0
        self.high_score = 0
        self.lives = 3
        
        self.game_start_timer = 0
        
        self.select_sound, self.explosion_sound, self.grenade_sound, self.throw_sound, self.powerdown_sound = create_sound_effects()
        
        # BGMファイルを読み込み
        self.bgm = None
        try:
            # bgm.wav, bgm.mp3, bgm.oggのいずれかがあれば読み込む
            bgm_files = ["bgm.wav", "bgm.mp3", "bgm.ogg"]
            for bgm_file in bgm_files:
                try:
                    pygame.mixer.music.load(bgm_file)
                    self.bgm = bgm_file
                    print(f"BGM loaded: {bgm_file}")
                    break
                except Exception as e:
                    print(f"Failed to load {bgm_file}: {e}")
                    continue
            if not self.bgm:
                print("No BGM file found. Place bgm.wav, bgm.mp3, or bgm.ogg in the game folder.")
        except Exception as e:
            print(f"BGM loading error: {e}")
            pass
    
    def draw_heart(self, screen, x, y, size=10):
        points = []
        for angle in range(0, 360, 10):
            rad = math.radians(angle)
            if angle <= 180:
                r = size * (1 + 0.5 * math.cos(rad))
            else:
                r = size * 0.5
            px = x + r * math.cos(rad)
            py = y + r * math.sin(rad)
            points.append((px, py))
        
        if len(points) > 2:
            pygame.draw.polygon(screen, RED, points)
        
    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    return False
                elif self.state == "player_select":
                    if event.key == pygame.K_RIGHT:
                        if self.selection_mode == "player":
                            self.selected_player = (self.selected_player % 3) + 1
                        else:  # difficulty mode
                            difficulties = ["イージー", "ノーマル", "ハード"]
                            current_index = difficulties.index(self.difficulty)
                            self.difficulty = difficulties[(current_index + 1) % 3]
                        if self.select_sound:
                            self.select_sound.play()
                    elif event.key == pygame.K_LEFT:
                        if self.selection_mode == "player":
                            self.selected_player = ((self.selected_player - 2) % 3) + 1
                        else:  # difficulty mode
                            difficulties = ["イージー", "ノーマル", "ハード"]
                            current_index = difficulties.index(self.difficulty)
                            self.difficulty = difficulties[(current_index - 1) % 3]
                        if self.select_sound:
                            self.select_sound.play()
                    elif event.key == pygame.K_DOWN:
                        self.selection_mode = "difficulty"
                        if self.select_sound:
                            self.select_sound.play()
                    elif event.key == pygame.K_UP:
                        self.selection_mode = "player"
                        if self.select_sound:
                            self.select_sound.play()
                    elif event.key == pygame.K_RETURN:
                        self.start_game()
                elif self.state == "playing":
                    if event.key == pygame.K_SPACE:
                        self.player.shoot()
                    elif event.key == pygame.K_g:
                        self.throw_grenades()
                    elif event.key == pygame.K_F6:
                        self.state = "player_select"
                        # BGMを停止
                        pygame.mixer.music.stop()
                elif self.state == "game_over":
                    if event.key == pygame.K_r:
                        self.state = "player_select"
                        # BGMを停止
                        pygame.mixer.music.stop()
        return True
    
    def start_game(self):
        self.state = "playing"
        self.player = Player(self.selected_player)
        self.enemies = []
        self.boss = None
        self.defeated_enemy_count = 0
        self.grenade_count = 2
        self.explosions = []
        self.powerups = []
        self.independent_enemy_bullets = []
        self.grenades = []
        
        # ハード難易度の特殊攻撃をリセット
        self.hard_attack_timer = 0
        self.warning_timer = 0
        self.warning_side = None
        self.is_warning_active = False
        self.hard_bullets = []
        self.enemy_spawn_timer = 0
        self.enemy_count = 0
        self.score = 0
        # 難易度に応じてライフを設定
        if self.difficulty == "イージー":
            self.lives = 5
        elif self.difficulty == "ハード":
            # ハード難易度では各プレイヤーにライフ+3
            if self.selected_player == 3:
                self.lives = 1 + 3  # 4ライフ
            else:
                self.lives = 3 + 3  # 6ライフ
        elif self.selected_player == 3:
            self.lives = 1
        else:
            self.lives = 3
        self.game_start_timer = 180
        
        # BGMを開始
        if self.bgm:
            print(f"Attempting to play BGM: {self.bgm}")
            pygame.mixer.music.set_volume(1.0)  # 音量を100%に設定
            try:
                pygame.mixer.music.play(-1)  # 無限ループで再生
                print(f"BGM started playing: {self.bgm}")
                print(f"BGM volume: {pygame.mixer.music.get_volume()}")
                print(f"Is music playing: {pygame.mixer.music.get_busy()}")
            except Exception as e:
                print(f"Error playing BGM: {e}")
        else:
            print("No BGM file loaded")
    
    def update(self):
        if self.state == "playing":
            if self.game_start_timer > 0:
                self.game_start_timer -= 1
                return
                
            keys = pygame.key.get_pressed()
            self.player.update(keys)
            
            # ボス戦中でなければ通常敵を出現させる
            if not self.boss:
                # 15体倒したらボス出現
                if self.defeated_enemy_count >= 15:
                    self.boss = Boss(GAME_WIDTH // 2 - 40, 50)
                else:
                    self.enemy_spawn_timer += 1
                    if self.enemy_spawn_timer >= 120:
                        self.enemy_spawn_timer = 0
                        self.enemy_count += 1
                        
                        if self.enemy_count % 3 == 0:
                            enemy = Enemy(random.randint(0, GAME_WIDTH - 40), -40, 2)
                        else:
                            enemy = Enemy(random.randint(0, GAME_WIDTH - 25), -25, 1)
                        self.enemies.append(enemy)
            
            for enemy in self.enemies[:]:
                enemy.update(self.player.x + self.player.width // 2, 
                           self.player.y + self.player.height // 2, self.difficulty)
                if enemy.y > SCREEN_HEIGHT:
                    # 敵が画面から出る時、弾を独立したリストに移動
                    for bullet in enemy.bullets:
                        independent_bullet = EnemyBullet(bullet.x, bullet.y, bullet.dx, bullet.dy)
                        self.independent_enemy_bullets.append(independent_bullet)
                    self.enemies.remove(enemy)
            
            # ボスの処理
            if self.boss:
                self.boss.update(self.player.x + self.player.width // 2, 
                               self.player.y + self.player.height // 2, self.difficulty)
                
                # ボスの爆発演出
                explosion_data = self.boss.get_current_explosion_pos()
                if explosion_data:
                    explosion_x, explosion_y, explosion_size = explosion_data
                    explosion = Explosion(explosion_x, explosion_y, explosion_size)
                    self.explosions.append(explosion)
                    if self.explosion_sound:
                        self.explosion_sound.play()
                
                # ボスが死んだら削除
                if self.boss.is_dead():
                    self.score += 2000  # ボス撃破ボーナス
                    self.grenade_count += 2  # 手榴弾を2回追加
                    self.boss = None
                    # 次のボス出現のためのカウンターリセット
                    self.defeated_enemy_count = 0
            
            for explosion in self.explosions[:]:
                explosion.update()
                if explosion.is_finished():
                    self.explosions.remove(explosion)
            
            # パワーアップアイテムの更新
            for powerup in self.powerups[:]:
                powerup.update()
                if powerup.y > SCREEN_HEIGHT:
                    self.powerups.remove(powerup)
            
            # 独立した敵弾の更新
            for bullet in self.independent_enemy_bullets[:]:
                bullet.update()
                if (bullet.x < 0 or bullet.x > GAME_WIDTH or 
                    bullet.y < 0 or bullet.y > SCREEN_HEIGHT):
                    self.independent_enemy_bullets.remove(bullet)
            
            # グレネードの更新
            for grenade in self.grenades[:]:
                grenade.update()
                if grenade.should_explode():
                    # ボスがいる場合はボスのHPの2割を減らす
                    if self.boss and not self.boss.is_dying:
                        boss_damage = int(self.boss.max_hp * 0.2)  # 2割のダメージ
                        for _ in range(boss_damage):
                            self.boss.take_damage()
                        # ボス専用の大爆発エフェクト
                        explosion = Explosion(self.boss.x + self.boss.width // 2, 
                                            self.boss.y + self.boss.height // 2, 8, 'special')
                        self.explosions.append(explosion)
                    
                    # 全ての敵を倒す
                    for enemy in self.enemies[:]:
                        # 敵の弾を独立弾として保存
                        for bullet in enemy.bullets:
                            independent_bullet = EnemyBullet(bullet.x, bullet.y, bullet.dx, bullet.dy)
                            self.independent_enemy_bullets.append(independent_bullet)
                        self.enemies.remove(enemy)
                        self.score += 100
                    
                    # 大爆発エフェクト
                    explosion = Explosion(grenade.target_x, grenade.target_y, 5, 'grenade')
                    self.explosions.append(explosion)
                    if self.grenade_sound:
                        self.grenade_sound.play()
                    
                    self.grenades.remove(grenade)
            
            # ハード難易度の特殊攻撃処理
            if self.difficulty == "ハード":
                self.hard_attack_timer += 1
                
                # 20秒ごとに警告を開始
                if self.hard_attack_timer % 1200 == 0:  # 20秒 (60fps * 20)
                    self.is_warning_active = True
                    self.warning_timer = 0
                    self.warning_side = "left" if random.random() < 0.5 else "right"
                
                # 警告中の処理
                if self.is_warning_active:
                    self.warning_timer += 1
                    # 5秒後に弾幕攻撃開始
                    if self.warning_timer >= 300:  # 5秒 (60fps * 5)
                        self.is_warning_active = False
                        self.launch_hard_attack()
                
                # ハード攻撃の弾を更新
                for bullet in self.hard_bullets[:]:
                    bullet.update()
                    if (bullet.x < -50 or bullet.x > GAME_WIDTH + 50 or 
                        bullet.y < -50 or bullet.y > SCREEN_HEIGHT + 50):
                        self.hard_bullets.remove(bullet)
                    
            self.check_collisions()
    
    def check_collisions(self):
        for bullet in self.player.bullets[:]:
            for enemy in self.enemies[:]:
                if (bullet.x - bullet.width//2 < enemy.x + enemy.width and
                    bullet.x + bullet.width//2 > enemy.x and
                    bullet.y < enemy.y + enemy.height and
                    bullet.y + bullet.height > enemy.y):
                    self.player.bullets.remove(bullet)
                    enemy.hp -= 1
                    if enemy.hp <= 0:
                        explosion = Explosion(enemy.x + enemy.width // 2, enemy.y + enemy.height // 2)
                        self.explosions.append(explosion)
                        if self.explosion_sound:
                            self.explosion_sound.play()
                        # 敵の弾を別のリストに移動（残存させる）
                        for bullet in enemy.bullets:
                            # 敵弾を独立した弾として追加
                            independent_bullet = EnemyBullet(bullet.x, bullet.y, bullet.dx, bullet.dy)
                            self.independent_enemy_bullets.append(independent_bullet)
                        self.enemies.remove(enemy)
                        # 敵タイプに応じてスコア設定
                        if enemy.enemy_type == 2:  # 赤い大型敵
                            self.score += 500
                        else:  # 普通の敵
                            self.score += 100
                        # 倒した敵の総数をカウント
                        self.defeated_enemy_count += 1
                        # プレイヤー3の場合、倒した敵の数をカウント
                        if self.player.player_type == 3:
                            self.player.defeated_enemies += 1
                        # 50%の確率でパワーアップアイテムをドロップ
                        if random.random() < 0.5:
                            powerup_type = random.choice(['speed', 'hp'])
                            powerup = PowerUp(enemy.x + enemy.width // 2 - 10, enemy.y + enemy.height // 2 - 10, powerup_type)
                            self.powerups.append(powerup)
                    break
        
        # ボスとの当たり判定
        if self.boss and not self.boss.is_dying:
            for bullet in self.player.bullets[:]:
                if (bullet.x - bullet.width//2 < self.boss.x + self.boss.width and
                    bullet.x + bullet.width//2 > self.boss.x and
                    bullet.y < self.boss.y + self.boss.height and
                    bullet.y + bullet.height > self.boss.y):
                    self.player.bullets.remove(bullet)
                    self.boss.take_damage()
                    # ダメージエフェクト
                    explosion = Explosion(bullet.x, bullet.y, 0.5)
                    self.explosions.append(explosion)
                    break
            
            # ボスの特殊弾との当たり判定
            for special_bullet in self.player.special_bullets[:]:
                if (special_bullet.x - special_bullet.width//2 < self.boss.x + self.boss.width and
                    special_bullet.x + special_bullet.width//2 > self.boss.x and
                    special_bullet.y < self.boss.y + self.boss.height and
                    special_bullet.y + special_bullet.height > self.boss.y):
                    self.player.special_bullets.remove(special_bullet)
                    # 特殊弾は3ダメージ
                    for _ in range(3):
                        self.boss.take_damage()
                    # 大きなダメージエフェクト
                    explosion = Explosion(special_bullet.x, special_bullet.y, 1.0, 'special')
                    self.explosions.append(explosion)
                    if self.explosion_sound:
                        self.explosion_sound.play()
                    break
                    
        # プレイヤー2の特殊弾と敵の当たり判定
        for special_bullet in self.player.special_bullets[:]:
            for enemy in self.enemies[:]:
                if (special_bullet.x - special_bullet.width//2 < enemy.x + enemy.width and
                    special_bullet.x + special_bullet.width//2 > enemy.x and
                    special_bullet.y < enemy.y + enemy.height and
                    special_bullet.y + special_bullet.height > enemy.y):
                    # 特殊弾が敵に当たった場合、大爆発
                    explosion = Explosion(special_bullet.x, special_bullet.y, 0.8, 'special')
                    self.explosions.append(explosion)
                    if self.explosion_sound:
                        self.explosion_sound.play()
                    # 爆発範囲内の敵を全て倒す
                    for other_enemy in self.enemies[:]:
                        distance = math.sqrt((special_bullet.x - (other_enemy.x + other_enemy.width//2))**2 + 
                                           (special_bullet.y - (other_enemy.y + other_enemy.height//2))**2)
                        if distance < 80:  # 爆発範囲
                            # 敵の弾を独立弾として保存
                            for bullet in other_enemy.bullets:
                                independent_bullet = EnemyBullet(bullet.x, bullet.y, bullet.dx, bullet.dy)
                                self.independent_enemy_bullets.append(independent_bullet)
                            if other_enemy in self.enemies:
                                self.enemies.remove(other_enemy)
                                # 敵タイプに応じてスコア設定
                                if other_enemy.enemy_type == 2:  # 赤い大型敵
                                    self.score += 500
                                else:  # 普通の敵
                                    self.score += 100
                                # 50%の確率でパワーアップアイテムをドロップ
                                if random.random() < 0.5:
                                    powerup_type = random.choice(['speed', 'hp'])
                                    powerup = PowerUp(other_enemy.x + other_enemy.width // 2 - 10, other_enemy.y + other_enemy.height // 2 - 10, powerup_type)
                                    self.powerups.append(powerup)
                    self.player.special_bullets.remove(special_bullet)
                    break
                    
        for special_bullet in self.player.special_bullets[:]:
            if special_bullet.exploded:
                # 時間経過による爆発
                explosion = Explosion(special_bullet.x, special_bullet.y, 0.8, 'special')
                self.explosions.append(explosion)
                if self.explosion_sound:
                    self.explosion_sound.play()
                for enemy in self.enemies[:]:
                    distance = math.sqrt((special_bullet.x - (enemy.x + enemy.width//2))**2 + 
                                       (special_bullet.y - (enemy.y + enemy.height//2))**2)
                    if distance < 80:  # 爆発範囲
                        explosion = Explosion(enemy.x + enemy.width // 2, enemy.y + enemy.height // 2)
                        self.explosions.append(explosion)
                        # 敵の弾を別のリストに移動（残存させる）
                        for bullet in enemy.bullets:
                            independent_bullet = EnemyBullet(bullet.x, bullet.y, bullet.dx, bullet.dy)
                            self.independent_enemy_bullets.append(independent_bullet)
                        if enemy in self.enemies:
                            self.enemies.remove(enemy)
                            # 敵タイプに応じてスコア設定
                            if enemy.enemy_type == 2:  # 赤い大型敵
                                self.score += 500
                            else:  # 普通の敵
                                self.score += 100
                            # 50%の確率でパワーアップアイテムをドロップ
                            if random.random() < 0.5:
                                powerup_type = random.choice(['speed', 'hp'])
                                powerup = PowerUp(enemy.x + enemy.width // 2 - 10, enemy.y + enemy.height // 2 - 10, powerup_type)
                                self.powerups.append(powerup)
                self.player.special_bullets.remove(special_bullet)
        
        for enemy in self.enemies:
            for bullet in enemy.bullets[:]:
                if (bullet.x - bullet.width//2 < self.player.x + self.player.width and
                    bullet.x + bullet.width//2 > self.player.x and
                    bullet.y - bullet.height//2 < self.player.y + self.player.height and
                    bullet.y + bullet.height//2 > self.player.y):
                    enemy.bullets.remove(bullet)
                    # プレイヤーがダメージを受けられる場合のみライフ減少
                    if self.player.take_damage():
                        self.lives -= 1
                        if self.powerdown_sound:
                            self.powerdown_sound.play()
                        if self.lives <= 0:
                            self.state = "game_over"
                    break
        
        # ボスの弾との当たり判定
        if self.boss:
            for bullet in self.boss.bullets[:]:
                if (bullet.x - bullet.width//2 < self.player.x + self.player.width and
                    bullet.x + bullet.width//2 > self.player.x and
                    bullet.y - bullet.height//2 < self.player.y + self.player.height and
                    bullet.y + bullet.height//2 > self.player.y):
                    self.boss.bullets.remove(bullet)
                    # プレイヤーがダメージを受けられる場合のみライフ減少
                    if self.player.take_damage():
                        self.lives -= 1
                        if self.powerdown_sound:
                            self.powerdown_sound.play()
                        if self.lives <= 0:
                            self.state = "game_over"
                    break
        
        # 独立した敵弾との当たり判定
        for bullet in self.independent_enemy_bullets[:]:
            if (bullet.x - bullet.width//2 < self.player.x + self.player.width and
                bullet.x + bullet.width//2 > self.player.x and
                bullet.y - bullet.height//2 < self.player.y + self.player.height and
                bullet.y + bullet.height//2 > self.player.y):
                self.independent_enemy_bullets.remove(bullet)
                # プレイヤーがダメージを受けられる場合のみライフ減少
                if self.player.take_damage():
                    self.lives -= 1
                    if self.powerdown_sound:
                        self.powerdown_sound.play()
                    if self.lives <= 0:
                        self.state = "game_over"
                break
        
        # ハード攻撃の弾との当たり判定
        for bullet in self.hard_bullets[:]:
            if (bullet.x - bullet.width//2 < self.player.x + self.player.width and
                bullet.x + bullet.width//2 > self.player.x and
                bullet.y - bullet.height//2 < self.player.y + self.player.height and
                bullet.y + bullet.height//2 > self.player.y):
                self.hard_bullets.remove(bullet)
                # プレイヤーがダメージを受けられる場合のみライフ減少
                if self.player.take_damage():
                    self.lives -= 1
                    if self.powerdown_sound:
                        self.powerdown_sound.play()
                    if self.lives <= 0:
                        self.state = "game_over"
                break
        
        # パワーアップアイテムとの当たり判定
        for powerup in self.powerups[:]:
            if (powerup.x < self.player.x + self.player.width and
                powerup.x + powerup.width > self.player.x and
                powerup.y < self.player.y + self.player.height and
                powerup.y + powerup.height > self.player.y):
                self.powerups.remove(powerup)
                # パワーアップ効果を適用
                if powerup.powerup_type == 'speed':
                    # 速度を50%アップ
                    self.player.speed = int(self.player.base_speed * 1.5)
                elif powerup.powerup_type == 'hp':
                    # HPを1増加（最大HPも増加）
                    self.player.max_hp += 1
                    self.player.current_hp += 1
                    self.lives += 1
    
    def launch_hard_attack(self):
        # 100個以上の弾を画面外から発射
        for i in range(120):  # 120個の弾
            if self.warning_side == "left":
                # 左側の上下から発射
                if i < 60:
                    # 上から下へ
                    start_x = random.randint(0, GAME_WIDTH // 2)
                    start_y = -20
                    dx = random.uniform(-1, 1)
                    dy = random.uniform(2, 5)
                else:
                    # 下から上へ
                    start_x = random.randint(0, GAME_WIDTH // 2)
                    start_y = SCREEN_HEIGHT + 20
                    dx = random.uniform(-1, 1)
                    dy = random.uniform(-5, -2)
            else:
                # 右側の上下から発射
                if i < 60:
                    # 上から下へ
                    start_x = random.randint(GAME_WIDTH // 2, GAME_WIDTH)
                    start_y = -20
                    dx = random.uniform(-1, 1)
                    dy = random.uniform(2, 5)
                else:
                    # 下から上へ
                    start_x = random.randint(GAME_WIDTH // 2, GAME_WIDTH)
                    start_y = SCREEN_HEIGHT + 20
                    dx = random.uniform(-1, 1)
                    dy = random.uniform(-5, -2)
            
            bullet = EnemyBullet(start_x, start_y, dx, dy)
            self.hard_bullets.append(bullet)
    
    def throw_grenades(self):
        # 手榴弾の残り回数をチェック
        if self.grenade_count <= 0:
            return
        
        # 手榴弾を1つ消費
        self.grenade_count -= 1
        
        # プレイヤーから3箇所にグレネードを投げる
        player_center_x = self.player.x + self.player.width // 2
        player_center_y = self.player.y + self.player.height // 2
        
        # 投げる音を再生
        if self.throw_sound:
            self.throw_sound.play()
        
        # 3つの目標地点
        targets = [
            (GAME_WIDTH // 2 + 100, SCREEN_HEIGHT // 3),      # 中央より少し右上
            (GAME_WIDTH // 2 - 100, SCREEN_HEIGHT // 3),      # 中央より少し左上
            (GAME_WIDTH // 2, SCREEN_HEIGHT // 2 + 100)       # 中央より少し下
        ]
        
        # 3つのグレネードを同時に投げる
        for target_x, target_y in targets:
            grenade = Grenade(player_center_x, player_center_y, target_x, target_y)
            self.grenades.append(grenade)
    
    def draw(self):
        self.screen.fill(BLACK)
        
        if self.state == "player_select":
            title = self.large_font.render("Player Select", True, WHITE)
            self.screen.blit(title, (SCREEN_WIDTH // 2 - title.get_width() // 2, 150))
            
            # プレイヤー選択
            player_color = WHITE if self.selection_mode == "player" else (128, 128, 128)
            player_text = self.font.render(f"Player {self.selected_player}", True, player_color)
            self.screen.blit(player_text, (SCREEN_WIDTH // 2 - player_text.get_width() // 2, 250))
            
            temp_player = Player(self.selected_player)
            temp_player.x = SCREEN_WIDTH // 2 - 15
            temp_player.y = 290
            temp_player.draw(self.screen)
            
            # 難易度選択
            difficulty_color = WHITE if self.selection_mode == "difficulty" else (128, 128, 128)
            difficulty_text = self.font.render(f"難易度: {self.difficulty}", True, difficulty_color)
            self.screen.blit(difficulty_text, (SCREEN_WIDTH // 2 - difficulty_text.get_width() // 2, 380))
            
            # 操作説明
            instruction1 = self.font.render("↑↓: 選択モード切替  ←→: 選択", True, WHITE)
            self.screen.blit(instruction1, (SCREEN_WIDTH // 2 - instruction1.get_width() // 2, 450))
            
            instruction2 = self.font.render("Enter: ゲーム開始", True, WHITE)
            self.screen.blit(instruction2, (SCREEN_WIDTH // 2 - instruction2.get_width() // 2, 480))
            
        elif self.state == "playing":
            pygame.draw.line(self.screen, WHITE, (GAME_WIDTH, 0), (GAME_WIDTH, SCREEN_HEIGHT), 2)
            
            if self.game_start_timer > 0:
                title = self.font.render("超弾幕シューティングゲーム", True, WHITE)
                self.screen.blit(title, (GAME_WIDTH // 2 - title.get_width() // 2, SCREEN_HEIGHT // 2))
            
            self.player.draw(self.screen)
            
            for enemy in self.enemies:
                enemy.draw(self.screen)
            
            # ボスの描画
            if self.boss:
                self.boss.draw(self.screen)
            
            for explosion in self.explosions:
                explosion.draw(self.screen)
            
            for powerup in self.powerups:
                powerup.draw(self.screen)
            
            # 独立した敵弾の描画
            for bullet in self.independent_enemy_bullets:
                bullet.draw(self.screen)
            
            # グレネードの描画
            for grenade in self.grenades:
                grenade.draw(self.screen)
            
            # ハード攻撃の弾の描画
            for bullet in self.hard_bullets:
                bullet.draw(self.screen)
            
            # ハード難易度の警告表示
            if self.difficulty == "ハード" and self.is_warning_active:
                # 半透明の赤い背景
                warning_surface = pygame.Surface((GAME_WIDTH // 2, SCREEN_HEIGHT))
                warning_surface.set_alpha(100)  # 半透明
                warning_surface.fill((255, 0, 0))  # 赤色
                
                if self.warning_side == "left":
                    self.screen.blit(warning_surface, (0, 0))
                    warning_x = GAME_WIDTH // 4
                else:
                    self.screen.blit(warning_surface, (GAME_WIDTH // 2, 0))
                    warning_x = GAME_WIDTH * 3 // 4
                
                # 点滅するビックリマーク
                warning_text = self.large_font.render("！", True, RED)
                if (self.warning_timer // 10) % 2 == 0:
                    self.screen.blit(warning_text, (warning_x - warning_text.get_width() // 2, 
                                                  SCREEN_HEIGHT // 2 - warning_text.get_height() // 2))
            
            score_text = self.font.render(f"Score: {self.score}", True, WHITE)
            self.screen.blit(score_text, (GAME_WIDTH + 10, 50))
            
            high_score_text = self.font.render(f"High: {self.high_score}", True, WHITE)
            self.screen.blit(high_score_text, (GAME_WIDTH + 10, 90))
            
            lives_text = self.font.render("Lives:", True, WHITE)
            self.screen.blit(lives_text, (GAME_WIDTH + 10, 130))
            
            for i in range(self.lives):
                heart_text = self.font.render("♥", True, RED)
                self.screen.blit(heart_text, (GAME_WIDTH + 30 + i * 25, 165))
            
            # 手榴弾の残り回数を表示
            grenade_text = self.font.render(f"Grenades: {self.grenade_count}", True, WHITE)
            self.screen.blit(grenade_text, (GAME_WIDTH + 10, 200))
                
        elif self.state == "game_over":
            game_over_text = self.large_font.render("GAME OVER", True, RED)
            self.screen.blit(game_over_text, (SCREEN_WIDTH // 2 - game_over_text.get_width() // 2, 
                                            SCREEN_HEIGHT // 2 - 50))
            
            restart_text = self.font.render("Press R to restart", True, WHITE)
            self.screen.blit(restart_text, (SCREEN_WIDTH // 2 - restart_text.get_width() // 2, 
                                          SCREEN_HEIGHT // 2 + 20))
        
        pygame.display.flip()
    
    def run(self):
        running = True
        while running:
            running = self.handle_events()
            self.update()
            self.draw()
            self.clock.tick(60)
        
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = Game()
    game.run()