const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: {
    create: function() {
      this.cameras.main.setBackgroundColor('#87CEEB');
      
      // 地面の作成
      this.ground = this.add.rectangle(400, 550, 800, 100, 0xffffff);
      this.physics.add.existing(this.ground, true);
      
      // ブロックの作成
      this.blocks = [];
      const numBlocks = 5; // ブロックの数
      const minX = 100; // 最小X座標
      const maxX = 700; // 最大X座標
      const minY = 200; // 最小Y座標
      const maxY = 400; // 最大Y座標
      
      // 最初のブロックは必ずプレイヤーの近くに配置
      const firstBlock = this.add.rectangle(200, 400, 100, 50, 0xffffff);
      this.physics.add.existing(firstBlock, true);
      this.blocks.push(firstBlock);
      
      // 残りのブロックをランダムに配置
      for (let i = 1; i < numBlocks; i++) {
        let x, y;
        let validPosition = false;
        
        // 有効な位置が見つかるまで繰り返す
        while (!validPosition) {
          x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
          y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
          
          // 他のブロックとの距離をチェック
          validPosition = true;
          for (const block of this.blocks) {
            const dx = x - block.x;
            const dy = y - block.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 150) { // 最小距離
              validPosition = false;
              break;
            }
          }
        }
        
        const block = this.add.rectangle(x, y, 100, 50, 0xffffff);
        this.physics.add.existing(block, true);
        this.blocks.push(block);
      }
      
      // ランダムな坂を作成
      const numSlopes = 3; // 坂の数
      for (let i = 0; i < numSlopes; i++) {
        // 坂の位置をランダムに決定（地面の上）
        const x = Math.random() * 600 + 100; // 100から700の間
        const y = 500; // 地面の高さ
        
        // 坂の長さをランダムに決定（100から300の間）
        const length = Math.random() * 200 + 100;
        
        // 坂の角度をランダムに決定（15度から45度の間）
        const angle = (Math.random() * 30 + 15) * (Math.PI / 180);
        
        // 坂の高さを計算
        const height = length * Math.sin(angle);
        
        // 坂の三角形を作成
        const slope = this.add.triangle(
          x, y,  // 基準点（左下）
          0, 0,  // 左下
          length, 0,  // 右下
          0, -height,  // 左上
          0xffffff
        );
        
        // 物理演算の設定
        this.physics.add.existing(slope, true);
        
        // 当たり判定を白い部分のみに設定
        slope.body.setSize(length, height);
        slope.body.setOffset(0, -height);
        slope.body.immovable = true;
        slope.body.friction = 0.1;
        
        // 当たり判定のデバッグ表示（必要に応じてコメントアウトを解除）
        // slope.body.debugShowBody = true;
        
        this.blocks.push(slope);
      }
      
      // プレイヤーの作成
      this.player = this.add.circle(100, 300, 20, 0xffffff);
      this.physics.add.existing(this.player);
      this.player.body.setCollideWorldBounds(true);
      
      // プレイヤーと地面、ブロックの衝突設定
      this.physics.add.collider(this.player, this.ground);
      this.blocks.forEach(block => {
        this.physics.add.collider(this.player, block);
      });
      
      // キー入力の設定
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      
      // ジャンプ回数のカウント
      this.jumpCount = 0;
      this.maxJumps = 2;
      this.canJump = true;
      
      // ダッシュの設定
      this.isDashing = false;
      this.dashSpeed = 400;
      this.normalSpeed = 200;
    },
    update: function() {
      // プレイヤーの移動制御
      if (this.cursors.left.isDown) {
        this.player.body.setVelocityX(this.isDashing ? -this.dashSpeed : -this.normalSpeed);
      } else if (this.cursors.right.isDown) {
        this.player.body.setVelocityX(this.isDashing ? this.dashSpeed : this.normalSpeed);
      } else {
        this.player.body.setVelocityX(0);
      }
      
      // 地面やブロックに触れている時にジャンプカウントをリセット
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
        this.canJump = true;
      }
      
      // ジャンプ制御（上矢印キーまたはスペースキー）
      if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.canJump && this.jumpCount < this.maxJumps) {
        this.player.body.setVelocityY(-600);
        this.jumpCount++;
        this.canJump = false;
      }
      
      // キーが離されたら次のジャンプを許可
      if (!this.cursors.up.isDown && !this.spaceKey.isDown) {
        this.canJump = true;
      }
      
      // ダッシュ制御
      if (this.shiftKey.isDown) {
        this.isDashing = true;
      } else {
        this.isDashing = false;
      }
    }
  }
};

const game = new Phaser.Game(config); 