const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function createTransparentDevTo() {
  const canvas = createCanvas(24, 24);
  const ctx = canvas.getContext('2d');
  
  // 背景を透明に
  ctx.clearRect(0, 0, 24, 24);
  
  // Dev.toのロゴを手動で描画
  ctx.fillStyle = 'currentColor'; // これはSVGでの色参照用、実際は後で置き換え
  
  // 外枠（角丸四角形）
  ctx.beginPath();
  ctx.roundRect(2, 7.5, 20, 9, 4);
  ctx.fill();
  
  // 文字部分を透明にするためにcomposite操作を使用
  ctx.globalCompositeOperation = 'destination-out';
  
  // D文字
  ctx.font = 'bold 6px Arial';
  ctx.fillText('D', 4, 13.5);
  
  // E文字  
  ctx.fillText('E', 11.5, 13.5);
  
  // V文字
  ctx.fillText('V', 18.5, 13.5);
  
  // PNGとして保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('/home/kako-jun/repos/sandbox/llll-ll/public/icons/dev-to-transparent-manual.png', buffer);
  
  console.log('Transparent Dev.to icon created!');
}

// Node.jsのCanvasが利用できない場合の代替手段
console.log('Canvas library might not be available. Using alternative approach...');