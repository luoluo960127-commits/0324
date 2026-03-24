let grasses = []; // 儲存所有水草物件的陣列
let bubbles = []; // 氣泡陣列
let fishes = [];  // 小魚陣列
let popSound;     // 音效變數
let soundEnabled = true; // 音效開關，預設開啟

function preload() {
  popSound = loadSound('pop.mp3'); // 預先載入音效
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  let colors = ['#E9F5DB', '#CFE1B9', '#B5C99A', '#97A97C', '#87986A'];

  // 產生 80 條水草
  for (let i = 0; i < 80; i++) {
    grasses.push({
      x: random(width),                     // 位置
      hFactor: random(0.3, 0.45),           // 高度 (以視窗比例設定)
      w: random(40, 50),                    // 粗細
      c: random(colors),                    // 顏色
      speed: random(0.005, 0.02),           // 搖晃頻率
      noiseOffset: random(1000)             // 雜訊偏移 (讓擺動起始點不同)
    });
  }

  // 產生 50 個氣泡
  for (let i = 0; i < 50; i++) {
    bubbles.push(new Bubble());
  }

  // 產生 10 條小魚
  for (let i = 0; i < 10; i++) {
    fishes.push(new Fish());
  }
}

function draw() {
  clear(); // 清除畫布以支援透明背景
  background('rgba(0, 119, 182, 0.3)'); // 背景顏色改為 0.3 透明度
  noStroke();

  // 繪製與更新氣泡
  for (let b of bubbles) {
    b.move();
    b.display();
  }

  // 繪製與更新小魚
  for (let f of fishes) {
    f.move();
    f.display();
  }

  let startY = height;         // 起始 Y 座標（畫面底部）
  let segments = 60;           // 切分段數

  // 遍歷每一條水草並繪製
  for (let g of grasses) {
    let startX = g.x;
    let grassHeight = height * g.hFactor; // 根據視窗高度計算當前高度
    
    let c = color(g.c);
    c.setAlpha(178); // 透明度 70%
    fill(c);
    beginShape();

    // 1. 繪製左側邊緣
    for (let i = 0; i <= segments; i++) {
      let p = i / segments;
      let y = startY - p * grassHeight;
      // 加入 g.noiseOffset 讓每條草的擺動不同步，速度使用 g.speed
      let n = noise(frameCount * g.speed + g.noiseOffset, p * 3);
      let offsetX = map(n, 0, 1, -200, 200) * p;
      let w = map(p, 0, 1, g.w, 8); // 底部寬，頂部窄

      curveVertex(startX + offsetX - w, y);
    }

    // 繪製頂部圓弧尖端
    let pTop = 1;
    let yTop = startY - grassHeight;
    let nTop = noise(frameCount * g.speed + g.noiseOffset, 3);
    let offsetXTop = map(nTop, 0, 1, -200, 200);
    curveVertex(startX + offsetXTop, yTop - 15);

    // 2. 繪製右側邊緣
    for (let i = segments; i >= 0; i--) {
      let p = i / segments;
      let y = startY - p * grassHeight;
      let n = noise(frameCount * g.speed + g.noiseOffset, p * 3);
      let offsetX = map(n, 0, 1, -200, 200) * p;
      let w = map(p, 0, 1, g.w, 8);
      curveVertex(startX + offsetX + w, y);
    }
    endShape(CLOSE);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (mouseButton === LEFT) {
    soundEnabled = !soundEnabled; // 切換音效開關
    userStartAudio(); // 確保瀏覽器音訊環境已啟動
  }
}

// 定義氣泡類別
class Bubble {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(5, 15);
    this.speed = random(1, 3);
    this.popY = random(0, height * 0.7); // 設定隨機破裂的高度
    this.popping = false; // 是否正在破裂
    this.popTimer = 0;    // 破裂動畫計時
  }
  move() {
    if (this.popping) {
      this.popTimer++;
      if (this.popTimer > 10) { // 動畫播放約 10 禎後重置
        this.y = height + this.size;
        this.x = random(width);
        this.popping = false;
        this.popTimer = 0;
        this.popY = random(0, height * 0.7);
      }
    } else {
      this.y -= this.speed;
      this.x += random(-0.5, 0.5); // 輕微左右搖晃
      
      // 到達破裂高度或超出畫面
      if (this.y < this.popY || this.y < -this.size) {
        this.popping = true;
        if (soundEnabled) {
          popSound.play(); // 只有在開關開啟時才播放
        }
      }
    }
  }
  display() {
    if (this.popping) {
      // 破裂效果：擴散的圓圈
      noFill();
      stroke(255, map(this.popTimer, 0, 10, 255, 0)); // 隨時間變淡
      circle(this.x, this.y, this.size + this.popTimer * 2);
      noStroke(); 
    } else {
      // 氣泡本體：白色，透明度 0.5 (約 127)
      fill(255, 127);
      circle(this.x, this.y, this.size);
      
      // 左上方高光：白色，透明度 0.8 (約 204)
      fill(255, 204);
      circle(this.x - this.size * 0.25, this.y - this.size * 0.25, this.size * 0.3);
    }
  }
}

// 定義小魚類別
class Fish {
  constructor() {
    this.x = random(width);
    this.y = random(height * 0.1, height * 0.8); // 不要在太底部，以免被水草完全擋住
    this.speed = random(2, 4);
    this.c = color(random(200, 255), random(100, 200), random(50, 100)); // 橘黃色系
  }
  move() {
    this.x -= this.speed; // 向左游
    if (this.x < -50) this.x = width + 50;
  }
  display() {
    fill(this.c);
    ellipse(this.x, this.y, 30, 20); // 魚身
    triangle(this.x + 10, this.y, this.x + 25, this.y - 10, this.x + 25, this.y + 10); // 魚尾
  }
}