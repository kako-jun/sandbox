import pygame
import math
import random
import sys

pygame.init()
pygame.mixer.init()

def create_sound_effects():
    try:
        select_sound = pygame.mixer.Sound(buffer=b'\x00\x01' * 1000)
        explosion_sound = pygame.mixer.Sound(buffer=b'\x00\x02' * 2000)
        return select_sound, explosion_sound
    except:
        return None, None

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
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.timer = 0
        self.max_timer = 20
        
    def update(self):
        self.timer += 1
        
    def draw(self, screen):
        if self.timer < self.max_timer:
            size = int(self.timer * 3)
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
                
        for bullet in self.special_bullets[:]:
            bullet.update()
            if bullet.y < 0:
                self.special_bullets.remove(bullet)
    
    def shoot(self):
        if self.player_type == 1:
            bullet = Bullet(self.x + self.width // 2, self.y, -8, BLUE)
            self.bullets.append(bullet)
        elif self.player_type == 2:
            bullet = SpecialBullet(self.x + self.width // 2, self.y, -8, YELLOW)
            self.special_bullets.append(bullet)
        elif self.player_type == 3:
            if self.defeated_enemies < 9:
                # 9体倒すまでは3方向弾
                # 左上方向
                bullet1 = Bullet(self.x + self.width // 2 - 15, self.y, -8, GREEN)
                bullet1.dx = -3  # 左方向の速度成分
                self.bullets.append(bullet1)
                # 真上方向
                bullet2 = Bullet(self.x + self.width // 2, self.y, -8, GREEN)
                bullet2.dx = 0   # 真上
                self.bullets.append(bullet2)
                # 右上方向  
                bullet3 = Bullet(self.x + self.width // 2 + 15, self.y, -8, GREEN)
                bullet3.dx = 3   # 右方向の速度成分
                self.bullets.append(bullet3)
            else:
                # 9体倒した後は5方向弾
                for i in range(5):
                    angle_offset = (i - 2) * 20  # -40, -20, 0, 20, 40度
                    angle_rad = math.radians(angle_offset)
                    bullet = Bullet(self.x + self.width // 2, self.y, -8, GREEN)
                    bullet.dx = 3 * math.sin(angle_rad)
                    bullet.speed = -8 * math.cos(angle_rad)
                    self.bullets.append(bullet)
    
    def draw(self, screen):
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
        
    def update(self, player_x, player_y):
        self.y += self.speed
        self.shoot_timer += 1
        
        if self.enemy_type == 1 and self.shoot_timer % 60 == 0:
            angle = math.atan2(player_y - self.y, player_x - self.x)
            bullet = EnemyBullet(self.x + self.width // 2, self.y + self.height, 
                               3 * math.cos(angle), 3 * math.sin(angle))
            self.bullets.append(bullet)
        elif self.enemy_type == 2 and self.shoot_timer % 45 == 0:
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
        pygame.draw.circle(screen, RED, (int(self.x), int(self.y)), 3)

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("超弾幕シューティングゲーム")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 36)
        self.large_font = pygame.font.Font(None, 72)
        
        self.state = "player_select"
        self.selected_player = 1
        self.player = None
        self.enemies = []
        self.enemy_spawn_timer = 0
        self.enemy_count = 0
        self.explosions = []
        self.powerups = []  # パワーアップアイテム
        
        self.score = 0
        self.high_score = 0
        self.lives = 3
        
        self.game_start_timer = 0
        
        self.select_sound, self.explosion_sound = create_sound_effects()
    
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
                if self.state == "player_select":
                    if event.key == pygame.K_RIGHT:
                        self.selected_player = (self.selected_player % 3) + 1
                        if self.select_sound:
                            self.select_sound.play()
                    elif event.key == pygame.K_LEFT:
                        self.selected_player = ((self.selected_player - 2) % 3) + 1
                        if self.select_sound:
                            self.select_sound.play()
                    elif event.key == pygame.K_RETURN:
                        self.start_game()
                elif self.state == "playing":
                    if event.key == pygame.K_SPACE:
                        self.player.shoot()
                    elif event.key == pygame.K_F6:
                        self.state = "player_select"
        return True
    
    def start_game(self):
        self.state = "playing"
        self.player = Player(self.selected_player)
        self.enemies = []
        self.explosions = []
        self.powerups = []
        self.enemy_spawn_timer = 0
        self.enemy_count = 0
        self.score = 0
        self.lives = 3
        self.game_start_timer = 180
    
    def update(self):
        if self.state == "playing":
            if self.game_start_timer > 0:
                self.game_start_timer -= 1
                return
                
            keys = pygame.key.get_pressed()
            self.player.update(keys)
            
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
                           self.player.y + self.player.height // 2)
                if enemy.y > SCREEN_HEIGHT:
                    self.enemies.remove(enemy)
            
            for explosion in self.explosions[:]:
                explosion.update()
                if explosion.is_finished():
                    self.explosions.remove(explosion)
            
            # パワーアップアイテムの更新
            for powerup in self.powerups[:]:
                powerup.update()
                if powerup.y > SCREEN_HEIGHT:
                    self.powerups.remove(powerup)
                    
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
                        self.enemies.remove(enemy)
                        self.score += 100
                        # プレイヤー3の場合、倒した敵の数をカウント
                        if self.player.player_type == 3:
                            self.player.defeated_enemies += 1
                        # 50%の確率でパワーアップアイテムをドロップ
                        if random.random() < 0.5:
                            powerup_type = random.choice(['speed', 'hp'])
                            powerup = PowerUp(enemy.x + enemy.width // 2 - 10, enemy.y + enemy.height // 2 - 10, powerup_type)
                            self.powerups.append(powerup)
                    break
                    
        for special_bullet in self.player.special_bullets[:]:
            if special_bullet.exploded:
                explosion = Explosion(special_bullet.x, special_bullet.y)
                self.explosions.append(explosion)
                if self.explosion_sound:
                    self.explosion_sound.play()
                for enemy in self.enemies[:]:
                    distance = math.sqrt((special_bullet.x - (enemy.x + enemy.width//2))**2 + 
                                       (special_bullet.y - (enemy.y + enemy.height//2))**2)
                    if distance < 80:
                        explosion = Explosion(enemy.x + enemy.width // 2, enemy.y + enemy.height // 2)
                        self.explosions.append(explosion)
                        self.enemies.remove(enemy)
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
                    self.lives -= 1
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
    
    def draw(self):
        self.screen.fill(BLACK)
        
        if self.state == "player_select":
            title = self.large_font.render("Player Select", True, WHITE)
            self.screen.blit(title, (SCREEN_WIDTH // 2 - title.get_width() // 2, 200))
            
            player_text = self.font.render(f"Player {self.selected_player}", True, WHITE)
            self.screen.blit(player_text, (SCREEN_WIDTH // 2 - player_text.get_width() // 2, 300))
            
            temp_player = Player(self.selected_player)
            temp_player.x = SCREEN_WIDTH // 2 - 15
            temp_player.y = 350
            temp_player.draw(self.screen)
            
            instruction = self.font.render("Use ← → to select, Enter to start", True, WHITE)
            self.screen.blit(instruction, (SCREEN_WIDTH // 2 - instruction.get_width() // 2, 450))
            
        elif self.state == "playing":
            pygame.draw.line(self.screen, WHITE, (GAME_WIDTH, 0), (GAME_WIDTH, SCREEN_HEIGHT), 2)
            
            if self.game_start_timer > 0:
                title = self.large_font.render("超弾幕シューティングゲーム", True, WHITE)
                self.screen.blit(title, (GAME_WIDTH // 2 - title.get_width() // 2, SCREEN_HEIGHT // 2))
            
            self.player.draw(self.screen)
            
            for enemy in self.enemies:
                enemy.draw(self.screen)
            
            for explosion in self.explosions:
                explosion.draw(self.screen)
            
            for powerup in self.powerups:
                powerup.draw(self.screen)
            
            score_text = self.font.render(f"Score: {self.score}", True, WHITE)
            self.screen.blit(score_text, (GAME_WIDTH + 10, 50))
            
            high_score_text = self.font.render(f"High: {self.high_score}", True, WHITE)
            self.screen.blit(high_score_text, (GAME_WIDTH + 10, 90))
            
            lives_text = self.font.render("Lives:", True, WHITE)
            self.screen.blit(lives_text, (GAME_WIDTH + 10, 130))
            
            for i in range(self.lives):
                self.draw_heart(self.screen, GAME_WIDTH + 30 + i * 30, 165, 8)
                
        elif self.state == "game_over":
            game_over_text = self.large_font.render("GAME OVER", True, RED)
            self.screen.blit(game_over_text, (SCREEN_WIDTH // 2 - game_over_text.get_width() // 2, 
                                            SCREEN_HEIGHT // 2))
            
            restart_text = self.font.render("Press R to restart", True, WHITE)
            self.screen.blit(restart_text, (SCREEN_WIDTH // 2 - restart_text.get_width() // 2, 
                                          SCREEN_HEIGHT // 2 + 60))
        
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