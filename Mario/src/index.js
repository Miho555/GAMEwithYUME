// キーボードの入力状態を記録する配列の定義
var input_key_buffer = new Array();

// キーボードの入力イベントをトリガーに配列のフラグ値を更新させる
window.addEventListener("keydown", handleKeydown);
function handleKeydown(e) {
  e.preventDefault();
  input_key_buffer[e.keyCode] = true;
}

window.addEventListener("keyup", handleKeyup);
function handleKeyup(e) {
  e.preventDefault();
  input_key_buffer[e.keyCode] = false;
}

// 音楽再生
document.getElementById("audioPlay").onclick = function(){
  document.getElementById("audioElement").play();
};

// canvas要素の取得
const canvas = document.getElementById("maincanvas");
const ctx = canvas.getContext("2d");

// 画像を表示するの座標の定義 & 初期化
var x = 0;
var y = 268;
var num = 0;
var flag_over = 0;

// 上下方向の速度
var vy = 0;
// ジャンプしたか否かのフラグ値
var isJump = false;
// ゲームオーバーか否かのフラグ値
var isGameOver = false;
// 右向きか否かのフラグ値
var RightWalk = false;
// 右向きか否かのフラグ値
var LeftWalk = false;
// 以前進んでいた方向：0＝右，1＝左
var Before = 0;

// ブロック要素の定義
var blocks = [
  { x: 0, y: 332, w: 200, h: 32 },
  { x: 250, y: 232, w: 200, h: 32 },
  { x: 500, y: 132, w: 530, h: 32 }
];

// ロード時に画面描画の処理が実行されるようにする
window.addEventListener("load", update);
setInterval(slideshow_timer,300); 

// 画面を更新する関数を定義 (繰り返しここの処理が実行される)
function update() {
  if(flag_over == 0){
    game_play();
  }else if(flag_over == 1){
    gop_start();
  }
}

function game_play(){
  // 画面全体をクリア
  ctx.clearRect(0, 0, 640, 480);

  // 更新後の座標
  var updatedX = x;
  var updatedY = y;

  if (isGameOver) {
    // 上下方向は速度分をたす
    updatedY = y + vy;

    // 落下速度はだんだん大きくなる
    vy = vy + 0.5;

    if (y > 500) {
      // ゲームオーバーのキャラが更に下に落ちてきた時にダイアログを表示し、各種変数を初期化する
      //alert("GAME OVER");
      flag_over = 1;
      isGameOver = false;
      isJump = false;
      RightWalk = false;
      LeftWalk = false;
      updatedX = 0;
      updatedY = 268;
      vy = 0;
      Before = 0;
    }
  }else{
      // 入力値の確認と反映

    if (input_key_buffer[37]) {
      // 左が押されていればx座標を1減らす
      updatedX = x - 2;
      LeftWalk = true;
      RightWalk = false;
      Before = 1;
    }else{
      LeftWalk = false;
    }
    
    if (input_key_buffer[39]) {
      // 右が押されていればx座標を1増やす
      updatedX = x + 2;
      RightWalk = true;
      LeftWalk = false;
      Before = 0;
    }else{
      RightWalk = false;
    }

    if (input_key_buffer[38]) {
      // 上が押されていれば、上向きの初期速度を与え、ジャンプ中のフラグを立てる
      vy = -7;
      LeftWalk = false;
      RightWalk = false;
      isJump = true;
    } 
  
    // ジャンプ中である場合のみ落下するように調整する
    if (isJump) {
      // 上下方向は速度分をたす
      updatedY = y + vy;

      // 落下速度はだんだん大きくなる
      vy = vy + 0.5;

      // 主人公が乗っているブロックを取得する
      const blockTargetIsOn = getBlockTargrtIsOn(x, y, updatedX, updatedY);

      // ブロックが取得できた場合には、そのブロックの上に立っているよう見えるように着地させる
      if (blockTargetIsOn !== null) {
        updatedY = blockTargetIsOn.y - 64;
        isJump = false;
      }
    } else {
      // ブロックの上にいなければジャンプ中の扱いとして初期速度0で落下するようにする
      if (getBlockTargrtIsOn(x, y, updatedX, updatedY) === null) {
        isJump = true;
        RightWalk = false;
        LeftWalk = false;
        vy = 0;
      }
    }

    if (y > 500) {
      // 下まで落ちてきたらゲームオーバーとし、上方向の初速度を与える
      isGameOver = true;
      updatedY = 500;
      vy = -15;
    }
  }

  x = updatedX;
  y = updatedY;

  // 主人公の画像を表示
  var image = new Image();
  //image.src = "../images/character-01/image2.png";
  var imageR = new Array("../images/character-01/image1R.png", "../images/character-01/image2R.png","../images/character-01/image1R.png","../images/character-01/image3R.png");
  var imageL = new Array("../images/character-01/image1L.png", "../images/character-01/image2L.png","../images/character-01/image1L.png","../images/character-01/image3L.png");
  var imageJ = new Array("../images/character-01/miku_jpR.png", "../images/character-01/miku_jpL.png");
//<audio controls autoplay　src="../music/music1.mp3" controls autoplay></audio >

  if (isGameOver) {
    // ゲームオーバーの場合にはゲームオーバーの画像が表示する
    image.src = "../images/character-01/miku_gameover.png";
  } else if (LeftWalk){
    image.src = imageL[num];
  } else if (RightWalk){
    image.src = imageR[num];
  } else if (isJump){
    image.src = imageJ[Before];
  } else {
    if (Before == 0){
      image.src = imageR[0];
    }else {
      image.src = imageL[0];
    }
  }
  ctx.drawImage(image, x, y, 64, 64);

  // 地面の画像を表示
  var groundImage = new Image();
  groundImage.src = "../images/ground-01/base.png";
  for (const block of blocks) {
    ctx.drawImage(groundImage, block.x, block.y, block.w, block.h);
  }

  // 再描画
  window.requestAnimationFrame(update);

}

// 変更前後のxy座標を受け取って、ブロック上に存在していればそのブロックの情報を、存在していなければnullを返す
function getBlockTargrtIsOn(x, y, updatedX, updatedY) {
  // 全てのブロックに対して繰り返し処理をする
  for (const block of blocks) {
    if (y + 64 <= block.y && updatedY + 64 >= block.y) {
      if (
        (x + 32 <= block.x || x >= block.x + block.w) &&
        (updatedX + 32 <= block.x || updatedX >= block.x + block.w)
      ) {
        // ブロックの上にいない場合には何もしない
        continue;
      }
      // ブロックの上にいる場合には、そのブロック要素を返す
      return block;
    }
  }
  // 最後までブロック要素を返さなかった場合はブロック要素の上にいないということなのでnullを返却する
  return null;
}

function slideshow_timer(){
    num = num + 1;
    if (num > 3){
        num = 0;
    }
}


function gop_start()
{
	// キャンバスのクリア
	ctx.clearRect(0, 0, 640, 480);
	// タイトルの表示
	ctx.font = "50px 'ＭＳ ゴシック'";
	ctx.textBaseline = "top";
	ctx.textAlign = "center";
	ctx.fillStyle = "rgb(0, 0, 255)";
  //ctx.fillText("Game Over!", mp.canvas.width/2, mp.canvas.height/2);
  ctx.fillText("Game Over!", 350, 100);

  if (input_key_buffer[13]) {
    // 上が押されていれば、上向きの初期速度を与え、ジャンプ中のフラグを立てる
    flag_over = 0;
    alert("RE START");
  }
  
  window.requestAnimationFrame(update);
}