
 // ============================================================
 // 可愛垃圾分類連連看｜動態完整版
 // 功能：隨機排列、注音、拖曳配對、答對翻牌、答錯震動、彩帶
 // 新增：有害廢棄物電池 GIF、答錯哭哭、全對開心跳躍
 // ============================================================

const BG = "#BDE0FE";
const INK = "#34495E";
const BLUE = "#5B91B5";
const WHITE = "#FFFFFF";
const GREEN = "#DDF3E4";
const RED = "#FBE0E0";

// 電池 GIF：使用你提供的網址
let batteryGif;
const BATTERY_GIF_URL = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTg5ZzRkN3N2azJlZXZzdjBoNDJlbnY2ZDE5aHpidG9zMzdtM3l3diZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3ohhwGIssJMuuEUqxq/giphy.gif";

const ITEMS = [
  {
    name:"廚餘", en:"Food Waste",
    description:"果皮、菜葉等天然廚餘，可依所在地規定分類回收，減少一般垃圾。",
    tip:"瀝乾水分，避免混入塑膠袋。",
    color:"#FFE9AA", object:0,
    chars:[
      {char:"廚",zh:["ㄔ","ㄨ"],tone:"ˊ"},
      {char:"餘",zh:["ㄩ"],tone:"ˊ"}
    ]
  },
  {
    name:"資源回收", en:"Recycling",
    description:"乾淨的塑膠容器通常可以回收，回收前先倒空裡面的內容物。",
    tip:"依當地規定清潔、分類與回收。",
    color:"#D0F0E0", object:1,
    chars:[
      {char:"資",zh:["ㄗ"],tone:""},
      {char:"源",zh:["ㄩ","ㄢ"],tone:"ˊ"},
      {char:"回",zh:["ㄏ","ㄨ","ㄟ"],tone:"ˊ"},
      {char:"收",zh:["ㄕ","ㄡ"],tone:""}
    ]
  },
  {
    name:"一般垃圾", en:"General Waste",
    description:"使用過的衛生紙通常不屬於紙類回收，應依當地規定丟棄。",
    tip:"不要和乾淨紙張混在一起。",
    color:"#DFECFA", object:2,
    chars:[
      {char:"一",zh:["ㄧ"],tone:""},
      {char:"般",zh:["ㄅ","ㄢ"],tone:""},
      {char:"垃",zh:["ㄌ","ㄚ"],tone:""},
      {char:"圾",zh:["ㄐ","ㄧ"],tone:""}
    ]
  },
  {
    name:"有害廢棄物", en:"Hazardous Waste",
    description:"廢電池可能含有害物質，不應直接丟進一般垃圾。",
    tip:"交給指定回收點或依地方規定回收。",
    color:"#F9DCE0", object:3,
    chars:[
      {char:"有",zh:["ㄧ","ㄡ"],tone:"ˇ"},
      {char:"害",zh:["ㄏ","ㄞ"],tone:"ˋ"},
      {char:"廢",zh:["ㄈ","ㄟ"],tone:"ˋ"},
      {char:"棄",zh:["ㄑ","ㄧ"],tone:"ˋ"},
      {char:"物",zh:["ㄨ"],tone:"ˋ"}
    ]
  },
  {
    name:"玻璃與陶瓷", en:"Glass & Ceramics",
    description:"玻璃與陶瓷的回收方式可能不同，需依所在地分類規定處理。",
    tip:"破損物品請妥善包好並標示，避免割傷。",
    color:"#E8E0FA", object:4,
    chars:[
      {char:"玻",zh:["ㄅ","ㄛ"],tone:""},
      {char:"璃",zh:["ㄌ","ㄧ"],tone:"ˊ"},
      {char:"與",zh:["ㄩ"],tone:"ˇ"},
      {char:"陶",zh:["ㄊ","ㄠ"],tone:"ˊ"},
      {char:"瓷",zh:["ㄘ"],tone:"ˊ"}
    ]
  },
  {
    name:"舊衣物與紡織品", en:"Textiles",
    description:"乾淨、可再利用的衣物可捐贈，或交給合適的舊衣回收管道。",
    tip:"潮濕、發霉或嚴重髒污衣物要先確認處理方式。",
    color:"#F8DFED", object:5,
    chars:[
      {char:"舊",zh:["ㄐ","ㄧ","ㄡ"],tone:"ˋ"},
      {char:"衣",zh:["ㄧ"],tone:""},
      {char:"物",zh:["ㄨ"],tone:"ˋ"},
      {char:"與",zh:["ㄩ"],tone:"ˇ"},
      {char:"紡",zh:["ㄈ","ㄤ"],tone:"ˇ"},
      {char:"織",zh:["ㄓ"],tone:""},
      {char:"品",zh:["ㄆ","ㄧ","ㄣ"],tone:"ˇ"}
    ]
  }
];

// -------------------- 遊戲狀態 --------------------

let cards = [];
let pictureOrder = [0,1,2,3,4,5];
let draggingIndex = -1;
let dragOffsetX = 0;
let dragOffsetY = 0;
let score = 0;
let finished = false;
let flipProgress = Array(6).fill(0);
let message = "把下方文字卡拖到正確的圖片下方。";
let messageColor = INK;

let shakeStartedAt = 0;
const SHAKE_DURATION = 350;

let confetti = [];
let confettiStartedAt = 0;
const CONFETTI_DURATION = 2000;

let panelX, panelY, panelW, panelH;
let gridX, gridY, cardW, cardH, imageH, gap;
let columns = 3;
let trayColumns = 3;
let restartButton = {x:0,y:0,w:140,h:40};

// 動畫專用狀態
let animationOffsets = [];
let blinkTimers = [];
let blinkStates = [];

// 記錄每張圖片是否因為放錯答案而哭哭
let cryingPictures = Array(6).fill(false);

// -------------------- 載入 GIF --------------------

function preload() {
  // 載入有害廢棄物的電池 GIF
  batteryGif = loadImage(
    BATTERY_GIF_URL,
    () => {},
    () => {
      console.warn("電池 GIF 載入失敗，請確認網路或網址是否可用。");
    }
  );
}

// -------------------- 初始化 --------------------

function setup() {
  createCanvas(windowWidth,windowHeight);
  textFont("Arial");
  initializeAnimations();
  restartGame();
}

function initializeAnimations() {
  animationOffsets = [];
  blinkTimers = [];
  blinkStates = [];

  for (let i=0;i<ITEMS.length;i++) {
    animationOffsets.push(random(TWO_PI));
    blinkTimers.push(random(1000,4500));
    blinkStates.push(0);
  }
}

// 隨機排列
function shuffle(array) {
  for (let i=array.length-1;i>0;i--) {
    const j=floor(random(i+1));
    [array[i],array[j]]=[array[j],array[i]];
  }
  return array;
}

// 重新開始
function restartGame() {
  pictureOrder=shuffle([0,1,2,3,4,5]);

  cards=shuffle(ITEMS.map((item,index)=>({
    itemIndex:index,
    placedTarget:-1,
    x:0,y:0,w:0,h:64
  })));

  draggingIndex=-1;
  score=0;
  finished=false;
  flipProgress=Array(6).fill(0);
  cryingPictures=Array(6).fill(false);

  message="把下方文字卡拖到正確的圖片下方。";
  messageColor=INK;

  shakeStartedAt=0;
  confettiStartedAt=0;
  confetti=[];

  initializeAnimations();
  calculateLayout();
  resizeCanvas(windowWidth,max(windowHeight,panelY+panelH+24));
  calculateLayout();
}

// -------------------- 排版 --------------------

function calculateLayout() {
  const mobile=width<600;
  const margin=mobile?8:26;

  panelW=min(1040,width-margin*2);
  panelX=(width-panelW)/2;
  panelY=14;

  columns=mobile?2:3;
  trayColumns=mobile?2:3;
  gap=mobile?9:15;

  const rows=ceil(ITEMS.length/columns);

  cardW=(panelW-36-gap*(columns-1))/columns;
  imageH=cardW*0.68;
  cardH=imageH+64;

  gridX=panelX+18;
  gridY=panelY+112;

  restartButton.x=panelX+panelW-restartButton.w-16;
  restartButton.y=panelY+43;

  const pictureBottom=gridY+rows*(cardH+gap)-gap;
  const trayH=mobile?70:72;
  const trayRows=ceil(ITEMS.length/trayColumns);
  const trayHeight=trayRows*(trayH+10)-10;

  panelH=pictureBottom-panelY+24+trayHeight+108;
  positionUnplacedCards();
}

function positionUnplacedCards() {
  if (!cards.length) return;

  const mobile=width<600;
  const trayGap=10;
  const trayW=(panelW-44-trayGap*(trayColumns-1))/trayColumns;
  const trayH=mobile?70:72;
  const totalW=trayW*trayColumns+trayGap*(trayColumns-1);
  const startX=panelX+(panelW-totalW)/2;

  const pictureRows=ceil(ITEMS.length/columns);
  const pictureBottom=gridY+pictureRows*(cardH+gap)-gap;
  const startY=pictureBottom+24;

  let count=0;

  for (let i=0;i<cards.length;i++) {
    const card=cards[i];
    if (card.placedTarget!==-1 || i===draggingIndex) continue;

    const col=count%trayColumns;
    const row=floor(count/trayColumns);

    card.x=startX+col*(trayW+trayGap);
    card.y=startY+row*(trayH+trayGap);
    card.w=trayW;
    card.h=trayH;
    count++;
  }

  for (const card of cards) {
    if (card.placedTarget===-1) continue;

    const position=card.placedTarget;
    const col=position%columns;
    const row=floor(position/columns);
    const x=gridX+col*(cardW+gap);
    const y=gridY+row*(cardH+gap);

    card.x=x+7;
    card.y=y+imageH+8;
    card.w=cardW-14;
    card.h=42;
  }
}

function itemAtPosition(position) {
  return pictureOrder[position];
}

// -------------------- 主畫面 --------------------

function draw() {
  background(BG);

  let shakeX=0;
  let shakeY=0;

  if (shakeStartedAt>0) {
    const elapsed=millis()-shakeStartedAt;

    if (elapsed<SHAKE_DURATION) {
      const strength=8*(1-elapsed/SHAKE_DURATION);
      shakeX=random(-strength,strength);
      shakeY=random(-strength,strength);
    } else {
      shakeStartedAt=0;
    }
  }

  push();
  translate(shakeX,shakeY);

  noStroke();
  fill(WHITE);
  rect(panelX,panelY,panelW,panelH,22);

  fill(INK);
  textAlign(LEFT,CENTER);
  textStyle(BOLD);
  textSize(width<600?15:22);
  text("CUTE WASTE SORTING",panelX+18,panelY+24);

  fill(BLUE);
  textStyle(NORMAL);
  textSize(width<600?10:13);
  text("可愛垃圾分類連連看｜看圖找答案",panelX+18,panelY+47);

  drawButton(restartButton,"重新開始 ↻",BLUE,WHITE);

  fill(INK);
  textAlign(LEFT,CENTER);
  textSize(width<600?11:13);
  text("把正確的分類文字拖到圖片下方",panelX+18,panelY+78);

  // 每張圖片都會持續播放動畫
  for (let position=0;position<pictureOrder.length;position++) {
    drawPicture(pictureOrder[position],position);
  }

  for (let i=0;i<cards.length;i++) {
    if (i!==draggingIndex && cards[i].placedTarget===-1) {
      drawAnswerCard(cards[i]);
    }
  }

  if (draggingIndex!==-1) drawAnswerCard(cards[draggingIndex]);

  drawFooter();
  pop();

  drawConfetti();

  let overUnlockedPicture=false;

  if (draggingIndex===-1) {
    for (let position=0;position<pictureOrder.length;position++) {
      const col=position%columns;
      const row=floor(position/columns);
      const x=gridX+col*(cardW+gap);
      const y=gridY+row*(cardH+gap);
      const itemIndex=pictureOrder[position];

      const unlocked=cards.some(
        card=>card.placedTarget===position && card.itemIndex===itemIndex
      );

      if (unlocked && inside(mouseX,mouseY,x,y,cardW,imageH)) {
        overUnlockedPicture=true;
        break;
      }
    }
  }

  cursor(overUnlockedPicture?HAND:ARROW);
}

function drawButton(button,label,color,textColor) {
  noStroke();
  fill(color);
  rect(button.x,button.y,button.w,button.h,20);

  fill(textColor);
  textAlign(CENTER,CENTER);
  textStyle(BOLD);
  textSize(12);
  text(label,button.x+button.w/2,button.y+button.h/2);
  textStyle(NORMAL);
}

// -------------------- 圖片卡和動畫 --------------------

function drawPicture(index,position) {
  const col=position%columns;
  const row=floor(position/columns);
  const x=gridX+col*(cardW+gap);
  const y=gridY+row*(cardH+gap);

  stroke("#D8E5ED");
  strokeWeight(1);
  fill(WHITE);
  rect(x,y,cardW,cardH,13);

  const item=ITEMS[index];

  noStroke();
  fill(item.color);
  rect(x+1,y+1,cardW-2,imageH,12);

  const matchedCorrectly=cards.some(
    card=>card.placedTarget===position && card.itemIndex===index
  );

  const hoverUnlocked=
    matchedCorrectly &&
    draggingIndex===-1 &&
    inside(mouseX,mouseY,x,y,cardW,imageH);

  const targetFlip=hoverUnlocked?1:0;
  flipProgress[index]+=(targetFlip-flipProgress[index])*0.22;

  if (abs(targetFlip-flipProgress[index])<0.01) {
    flipProgress[index]=targetFlip;
  }

  const progress=flipProgress[index];
  const flipScale=max(0.06,abs(cos(progress*PI)));

  push();
  translate(x+cardW/2,y+imageH/2);
  scale(flipScale,1);
  translate(-(x+cardW/2),-(y+imageH/2));

  if (progress<0.5) {
    drawObject(index,x,y,cardW,imageH);
  } else {
    drawCardBack(index,x,y,cardW,imageH);
  }

  pop();

  if (matchedCorrectly && progress<0.5) {
    noStroke();
    fill("#FFFFFFDD");
    circle(x+cardW-16,y+16,22);
    fill("#26734D");
    textAlign(CENTER,CENTER);
    textStyle(BOLD);
    textSize(12);
    text("✓",x+cardW-16,y+16);
    textStyle(NORMAL);
  }

  const placedCard=cards.find(card=>card.placedTarget===position);
  let slotColor="#F5F8FA";

  if (placedCard) {
    slotColor=placedCard.itemIndex===index?GREEN:RED;
  }

  fill(slotColor);
  stroke("#BED1DE");
  strokeWeight(1.2);
  rect(x+7,y+imageH+8,cardW-14,42,5);

  if (!placedCard) {
    noStroke();
    fill("#8499A8");
    textAlign(CENTER,CENTER);
    textSize(width<600?9:10);
    text("放在這裡 ♡",x+cardW/2,y+imageH+29);
  } else {
    noStroke();
    fill(INK);
    textAlign(CENTER,CENTER);
    textStyle(BOLD);
    textSize(cardW<150?10:12);
    text(ITEMS[placedCard.itemIndex].name,x+cardW/2,y+imageH+29);
    textStyle(NORMAL);
  }
}

// 每種圖片使用不同的動作曲線
function getMotion(index) {
  const t=millis()/1000+animationOffsets[index];

  let jump=0;
  let tilt=0;
  let squash=1;

  if (finished) {
    // 全部答對：大家更興奮地連續大跳、開心搖擺
    jump=abs(sin(t*7.5+index*0.8))*19;
    tilt=sin(t*6.2+index)*0.24;
    squash=1+sin(t*7.5+index*0.8)*0.07;
  } else if (index===0) {
    jump=abs(sin(t*2.8))*7;
    tilt=sin(t*2.1)*0.12;
    squash=1+sin(t*5.6)*0.025;
  } else if (index===1) {
    jump=max(0,sin(t*2.2-0.7))*5;
    tilt=sin(t*2.6)*0.14;
    squash=1+sin(t*4.4)*0.018;
  } else if (index===2) {
    jump=(sin(t*2.4)+1)*4;
    tilt=sin(t*1.7)*0.08;
  } else if (index===3) {
    jump=pow(max(0,sin(t*3.4)),2)*8;
    tilt=sin(t*2.0)*0.06;
    squash=1+pow(max(0,cos(t*3.4)),8)*0.035;
  } else if (index===4) {
    jump=sin(t*2.1)*4;
    tilt=sin(t*1.8)*0.07;
  } else {
    jump=sin(t*2.3)*3;
    tilt=sin(t*2.7)*0.13;
    squash=1+sin(t*2.3)*0.018;
  }

  return {jump,tilt,squash};
}

// 偶爾眨眼
function isBlinking(index) {
  const cycle=(millis()+index*733)%3700;
  return cycle<130;
}

// -------------------- 卡通插畫 --------------------

function drawObject(index,x,y,w,h) {
  const motion=getMotion(index);

  const cx=x+w/2;
  const cy=y+h/2+3;
  const s=min(w/170,h/120);

  push();
  translate(cx,cy-motion.jump);
  rotate(motion.tilt);
  scale(s*motion.squash,s/motion.squash);

  noStroke();
  fill("#66788A20");
  ellipse(0,43+motion.jump/s,80,12);

  // 香蕉皮
  if (index===0) {
    stroke("#D9A743");
    strokeWeight(2.2);
    fill("#FFD95B");
    beginShape();
    vertex(-8,-32);
    bezierVertex(-31,-22,-40,2,-27,24);
    bezierVertex(-23,31,-15,34,-9,33);
    bezierVertex(-21,13,-17,-12,-8,-32);
    endShape(CLOSE);

    fill("#FFE77C");
    beginShape();
    vertex(-7,-34);
    bezierVertex(1,-15,14,5,13,31);
    bezierVertex(1,28,-8,16,-7,-1);
    endShape(CLOSE);

    fill("#FFD34C");
    beginShape();
    vertex(-3,-32);
    bezierVertex(19,-16,34,7,28,28);
    bezierVertex(17,21,9,14,6,3);
    endShape(CLOSE);

    noStroke();
    fill("#FFF0A6");
    ellipse(-20,5,4,27);
    ellipse(4,5,4,24);
    ellipse(20,8,4,18);
    fill("#9A7448");
    ellipse(-7,-33,9,7);
  }

  // 寶特瓶
  if (index===1) {
    noStroke();
    fill("#8ECDB9");
    rect(-24,-19,48,59,11);
    fill("#83C7B0");
    beginShape();
    vertex(-24,-18);
    vertex(-18,-29);
    vertex(-10,-34);
    vertex(10,-34);
    vertex(18,-29);
    vertex(24,-18);
    endShape(CLOSE);

    fill("#4E9B84");
    rect(-9,-41,18,11,3);
    fill("#36866F");
    rect(-12,-51,24,12,4);

    stroke("#26745F");
    strokeWeight(1);
    for (let i=-8;i<=8;i+=4) line(i,-49,i,-41);

    noStroke();
    fill("#E7FFF5");
    rect(-17,-14,6,37,3);
    fill("#F3FFF9");
    rect(-19,1,38,19,4);
    fill("#57A68F");
    textAlign(CENTER,CENTER);
    textStyle(BOLD);
    textSize(13);
    text("♻",0,10);
  }

  // 衛生紙
  if (index===2) {
    stroke("#C5D5E2");
    strokeWeight(1.5);
    fill(WHITE);
    beginShape();
    vertex(-29,-6);
    bezierVertex(-36,-20,-21,-31,-11,-23);
    bezierVertex(-3,-34,11,-27,13,-18);
    bezierVertex(29,-20,37,-6,29,6);
    bezierVertex(34,18,19,27,10,20);
    bezierVertex(-1,32,-16,24,-18,17);
    bezierVertex(-33,17,-37,4,-29,-6);
    endShape(CLOSE);

    noFill();
    stroke("#D6E1EA");
    strokeWeight(1.3);
    bezier(-22,-6,-13,-13,-9,-2,-6,7);
    bezier(-5,-18,3,-10,1,-4,8,1);
    bezier(18,-9,12,-2,18,4,12,13);
    bezier(-15,13,-8,8,-2,16,3,20);
  }

  // 有害廢棄物：使用提供的電池 GIF
  if (index===3) {
    if (batteryGif) {
      imageMode(CENTER);
      image(batteryGif,0,0,76,86);
      imageMode(CORNER);
    } else {
      // GIF 載入失敗時的備用電池圖案
      noStroke();
      fill("#E7A1B2");
      rect(-23,-29,46,68,10);
      fill("#D8A2AA");
      rect(-8,-39,16,9,2);
      fill("#FFF2F4");
      rect(-15,-14,30,24,4);
      fill("#C95170");
      textAlign(CENTER,CENTER);
      textStyle(BOLD);
      textSize(13);
      text("+",0,-8);
      text("−",0,1);
    }
  }

  // 玻璃杯
  if (index===4) {
    stroke("#9588CF");
    strokeWeight(2.4);
    fill("#FFFFFFCC");
    beginShape();
    vertex(-24,-35);
    vertex(24,-35);
    vertex(19,30);
    bezierVertex(16,39,-16,39,-19,30);
    endShape(CLOSE);

    noFill();
    stroke("#B8AFE8");
    strokeWeight(3);
    ellipse(0,-34,47,7);

    noStroke();
    fill("#B6A9EC");
    beginShape();
    vertex(-19,1);
    bezierVertex(-9,-3,8,4,20,0);
    vertex(17,29);
    bezierVertex(12,35,-12,35,-17,29);
    endShape(CLOSE);

    fill("#D8D0FA");
    ellipse(0,1,36,5);

    stroke(WHITE);
    strokeWeight(2.2);
    line(-17,-25,-14,-3);
    line(17,-24,15,-12);
  }

  // 舊 T 恤
  if (index===5) {
    noStroke();
    fill("#EAA1CC");
    beginShape();
    vertex(-12,-28);
    vertex(-27,-20);
    vertex(-38,-2);
    vertex(-25,7);
    vertex(-17,-4);
    vertex(-17,31);
    vertex(17,31);
    vertex(17,-4);
    vertex(25,7);
    vertex(38,-2);
    vertex(27,-20);
    vertex(12,-28);
    bezierVertex(7,-14,-7,-14,-12,-28);
    endShape(CLOSE);

    fill("#F8DFED");
    beginShape();
    vertex(-12,-28);
    bezierVertex(-9,-14,9,-14,12,-28);
    bezierVertex(7,-34,-7,-34,-12,-28);
    endShape(CLOSE);

    noFill();
    stroke("#D982B4");
    strokeWeight(1.4);
    arc(0,-28,19,11,0,PI);
    stroke("#D982B4");
    strokeWeight(1.2);
    line(-34,1,-24,7);
    line(34,1,24,7);
    line(-15,27,15,27);
    stroke("#F7C9E4");
    strokeWeight(1.5);
    line(-8,-3,-5,10);
    line(9,2,6,15);
  }

  // 表情：只有被放錯答案的目標圖片會哭哭
  const isCrying=cryingPictures[index];

  if (isCrying) {
    // 哭哭眉毛
    stroke(INK);
    strokeWeight(2);
    line(-12,12,-5,15);
    line(5,15,12,12);

    // 哭哭眼睛
    noStroke();
    fill(INK);
    circle(-7,18,4);
    circle(7,18,4);

    // 藍色淚珠
    fill("#63BDF2");
    ellipse(-13,23,4,7);
    ellipse(13,23,4,7);

    // 難過的嘴巴
    noFill();
    stroke(INK);
    strokeWeight(1.8);
    arc(0,29,11,7,PI,TWO_PI);
  } else if (finished) {
    // 全部答對：開心笑眼
    noFill();
    stroke(INK);
    strokeWeight(2.5);
    arc(-7,18,8,7,PI,TWO_PI);
    arc(7,18,8,7,PI,TWO_PI);

    // 開心腮紅
    noStroke();
    fill("#FF9AA2");
    ellipse(-16,27,9,5);
    ellipse(16,27,9,5);

    // 開心大笑的嘴巴
    fill("#8E4A62");
    arc(0,23,17,13,0,PI,CHORD);
    fill(WHITE);
    arc(0,23,11,5,0,PI,CHORD);
  } else {
    // 平常的表情，保留原本偶爾眨眼
    noStroke();
    fill(INK);

    if (isBlinking(index)) {
      stroke(INK);
      strokeWeight(2);
      line(-10,18,-4,18);
      line(4,18,10,18);
      noStroke();
    } else {
      circle(-7,18,3);
      circle(7,18,3);
    }

    noFill();
    stroke(INK);
    strokeWeight(1.5);
    arc(0,22,10,6,0,PI);
  }

  pop();
}

// -------------------- 翻牌背面 --------------------

function wrappedLines(content,maxWidth,fontSize) {
  textSize(fontSize);
  const lines=[];
  let line="";

  for (const ch of Array.from(content)) {
    if (line && textWidth(line+ch)>maxWidth) {
      lines.push(line);
      line=ch;
    } else {
      line+=ch;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function drawCenteredLines(lines,cx,startY,lineHeight,fontSize,color,bold=false) {
  textAlign(CENTER,CENTER);
  textSize(fontSize);
  textStyle(bold?BOLD:NORMAL);
  fill(color);
  noStroke();

  for (let i=0;i<lines.length;i++) {
    text(lines[i],cx,startY+i*lineHeight);
  }
}

function drawCardBack(index,x,y,w,h) {
  const item=ITEMS[index];
  const mobile=width<600;

  noStroke();
  fill(item.color);
  rect(x+1,y+1,w-2,h-2,12);

  noFill();
  stroke(WHITE);
  strokeWeight(2);
  rect(x+7,y+7,w-14,h-14,9);

  const padding=mobile?13:20;
  const maxW=w-padding*2;
  const cx=x+w/2;

  let titleSize=mobile?15:20;
  while (titleSize>10) {
    textSize(titleSize);
    if (textWidth(item.name)<=maxW) break;
    titleSize--;
  }

  drawCenteredLines([item.name],cx,y+h*0.20,0,titleSize,INK,true);

  const descSize=mobile?12:15;
  const descGap=mobile?17:21;
  let desc=wrappedLines(item.description,maxW,descSize);

  if (desc.length>3) {
    desc=desc.slice(0,3);
    while (desc[2].length>0 && textWidth(desc[2]+"…")>maxW) {
      desc[2]=desc[2].slice(0,-1);
    }
    desc[2]+="…";
  }

  const descStart=y+h*0.43-(desc.length-1)*descGap/2;
  drawCenteredLines(desc,cx,descStart,descGap,descSize,INK);

  const tipSize=mobile?10:12;
  const tipGap=mobile?14:17;
  let tips=wrappedLines("小知識："+item.tip,maxW,tipSize);

  if (tips.length>2) {
    tips=tips.slice(0,2);
    while (tips[1].length>0 && textWidth(tips[1]+"…")>maxW) {
      tips[1]=tips[1].slice(0,-1);
    }
    tips[1]+="…";
  }

  const tipStart=y+h*0.80-(tips.length-1)*tipGap/2;
  drawCenteredLines(tips,cx,tipStart,tipGap,tipSize,"#426B7D",true);
}

// -------------------- 答案卡與注音 --------------------

function drawAnswerCard(card) {
  const item=ITEMS[card.itemIndex];
  const x=card.x,y=card.y,w=card.w,h=card.h;
  const isDragging=cards.indexOf(card)===draggingIndex;

  push();

  if (isDragging) {
    translate(x+w/2,y+h/2);
    scale(1.03);
    translate(-(x+w/2),-(y+h/2));
  }

  noStroke();
  fill(WHITE);
  rect(x,y,w,h,12);

  stroke("#C5D8E5");
  strokeWeight(1.2);
  noFill();
  rect(x,y,w,h,12);

  const count=item.chars.length;
  const charW=min(width<600?24:29,(w-12)/count);
  const totalW=count*charW;
  const startX=x+(w-totalW)/2;
  const topY=y+4;

  for (let i=0;i<count;i++) {
    const info=item.chars[i];
    const gx=startX+i*charW;

    fill(INK);
    noStroke();
    textAlign(CENTER,CENTER);
    textStyle(BOLD);
    textSize(width<600?15:19);
    text(info.char,gx+charW*0.38,topY+23);

    const zyX=gx+charW*0.78;
    const zyStartY=topY+5;
    const zyGap=width<600?9:10;

    fill(BLUE);
    textStyle(NORMAL);
    textSize(width<600?8:10);

    for (let j=0;j<info.zh.length;j++) {
      text(info.zh[j],zyX,zyStartY+j*zyGap);
    }

    if (info.tone) {
      text(info.tone,zyX+(width<600?5:6),zyStartY+1);
    }
  }

  fill(BLUE);
  textStyle(NORMAL);
  textAlign(CENTER,CENTER);
  textSize(width<600?8:10);
  text(item.en,x+w/2,y+h-12);

  pop();
}

// -------------------- 分數與提示 --------------------

function drawFooter() {
  const pictureRows=ceil(ITEMS.length/columns);
  const pictureBottom=gridY+pictureRows*(cardH+gap)-gap;
  const footerY=pictureBottom+24+
    ceil(ITEMS.length/trayColumns)*((width<600?70:72)+10)+6;

  score=cards.filter(
    card=>card.placedTarget!==-1 &&
    card.itemIndex===itemAtPosition(card.placedTarget)
  ).length;

  const placed=cards.filter(card=>card.placedTarget!==-1).length;

  fill(INK);
  textAlign(CENTER,CENTER);
  textSize(width<600?11:13);
  text("得分："+score+" / 6　｜　已放置："+placed+" / 6",width/2,footerY);

  fill(messageColor);
  textSize(width<600?10:11);
  text(message,width/2,footerY+24);

  if (finished) {
    fill(BLUE);
    textStyle(BOLD);
    textSize(width<600?15:18);
    text("太棒了！全部配對完成 ♡",width/2,footerY+49);
    textStyle(NORMAL);
  }
}

// -------------------- 彩帶 --------------------

function startConfetti() {
  confetti=[];

  for (let i=0;i<180;i++) {
    const fromLeft=i%2===0;

    confetti.push({
      x:fromLeft?random(-20,width*0.15):random(width*0.85,width+20),
      y:random(height*0.15,height*0.8),
      vx:fromLeft?random(2,8):random(-8,-2),
      vy:random(-8,3),
      gravity:random(0.12,0.28),
      size:random(5,11),
      rotation:random(TWO_PI),
      rotationSpeed:random(-0.18,0.18),
      color:random(["#FF5C8A","#FFD166","#06D6A0","#4D96FF","#C77DFF","#FF8C42"])
    });
  }

  confettiStartedAt=millis();
}

function drawConfetti() {
  if (!confetti.length) return;

  if (millis()-confettiStartedAt>=CONFETTI_DURATION) {
    confetti=[];
    confettiStartedAt=0;
    return;
  }

  push();
  rectMode(CENTER);
  noStroke();

  for (const p of confetti) {
    p.x+=p.vx;
    p.y+=p.vy;
    p.vy+=p.gravity;
    p.rotation+=p.rotationSpeed;

    push();
    translate(p.x,p.y);
    rotate(p.rotation);
    fill(p.color);
    rect(0,0,p.size,p.size*0.55,1);
    pop();
  }

  pop();
}

// -------------------- 滑鼠與拖曳 --------------------

function inside(px,py,x,y,w,h) {
  return px>=x && px<=x+w && py>=y && py<=y+h;
}

function mousePressed() {
  if (inside(mouseX,mouseY,restartButton.x,restartButton.y,restartButton.w,restartButton.h)) {
    restartGame();
    return false;
  }

  if (finished) return false;

  for (let i=cards.length-1;i>=0;i--) {
    const card=cards[i];

    if (inside(mouseX,mouseY,card.x,card.y,card.w,card.h)) {
      draggingIndex=i;
      dragOffsetX=mouseX-card.x;
      dragOffsetY=mouseY-card.y;

      // 拿起已放置的文字卡時，清除原目標圖片的哭哭狀態
      if (card.placedTarget!==-1) {
        cryingPictures[itemAtPosition(card.placedTarget)]=false;
      }

      card.placedTarget=-1;
      positionUnplacedCards();
      return false;
    }
  }

  return false;
}

function mouseDragged() {
  if (draggingIndex!==-1) {
    const card=cards[draggingIndex];
    card.x=mouseX-dragOffsetX;
    card.y=mouseY-dragOffsetY;
  }

  return false;
}

function mouseReleased() {
  if (draggingIndex===-1) return false;

  const card=cards[draggingIndex];
  let targetPosition=-1;

  for (let position=0;position<ITEMS.length;position++) {
    const col=position%columns;
    const row=floor(position/columns);
    const x=gridX+col*(cardW+gap);
    const y=gridY+row*(cardH+gap);

    if (inside(mouseX,mouseY,x+7,y+imageH+8,cardW-14,42)) {
      targetPosition=position;
      break;
    }
  }

  let answeredWrong=false;

  if (targetPosition!==-1) {
    const oldCard=cards.find(
      other=>other!==card && other.placedTarget===targetPosition
    );

    // 如果有其他文字卡原本放在這個位置，先清除目標圖片的哭哭
    if (oldCard) {
      cryingPictures[itemAtPosition(targetPosition)]=false;
      oldCard.placedTarget=-1;
    }

    card.placedTarget=targetPosition;
    const targetItemIndex=itemAtPosition(targetPosition);

    if (card.itemIndex===targetItemIndex) {
      cryingPictures[targetItemIndex]=false;
      message="答對了！很棒！ ♡";
      messageColor="#26734D";
    } else {
      // 只有被放錯文字卡的目標圖片會哭
      cryingPictures[targetItemIndex]=true;
      message="答錯了！再試一次！";
      messageColor="#B84C4C";
      answeredWrong=true;
    }
  } else {
    card.placedTarget=-1;
    message="可以繼續調整答案，直到配對正確。";
    messageColor=INK;
  }

  draggingIndex=-1;
  positionUnplacedCards();

  score=cards.filter(
    c=>c.placedTarget!==-1 &&
    c.itemIndex===itemAtPosition(c.placedTarget)
  ).length;

  const placed=cards.filter(c=>c.placedTarget!==-1).length;

  if (answeredWrong) shakeStartedAt=millis();

  if (placed===ITEMS.length && score===ITEMS.length) {
    if (!finished) startConfetti();

    finished=true;
    cryingPictures=Array(6).fill(false);
    message="全部答對了！你真棒！";
    messageColor="#26734D";
  } else {
    finished=false;
  }

  return false;
}

// 視窗改變時重新排版
function windowResized() {
  calculateLayout();
  resizeCanvas(windowWidth,max(windowHeight,panelY+panelH+24));
  calculateLayout();
}

