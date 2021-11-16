const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const pointScoredText = document.getElementById('pointScoredText');

const hitSound = new Audio('../sounds/hitSound.wav');
const scoreSound = new Audio('..//sounds/scoreSound.wav');
const wallHitSound = new Audio('../sounds/wallHitSound.wav');
const rSound = new Audio('../sounds/error.mp3');
const lSound = new Audio('../sounds/oops.mp3');


const netWidth = 4;
const netHeight = canvas.height;

const paddleWidth = 8;
const paddleHeight = 90;

let upArrowPressed = false;
let downArrowPressed = false;

// net
const net = {
  x: canvas.width / 2 - netWidth / 2,
  y: 0,
  width: netWidth,
  height: netHeight,
  color: "#09fc05"
};

// user paddle
const user = {
  x: 10,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  color: '#09fc05',
  score: 0
};

const ai = {
  x: canvas.width - (paddleWidth + 10),
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  color: '#09fc05',
  score: 0
};

// ball
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 7,
  speed: 10,
  velocityX: 5,
  velocityY: 5,
  color: '#fff'
};

function drawNet() {
  ctx.fillStyle = net.color;
  ctx.fillRect(net.x, net.y, net.width, net.height);
}

function drawScore(x, y, score) {
  ctx.fillStyle = '#fff';
  ctx.font = '60px monospace';

  ctx.fillText(score, x, y);
}

function drawPaddle(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawBall(x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  // syntax --> arc(x, y, radius, startAngle, endAngle, antiClockwise_or_not)
  ctx.arc(x, y, radius, 0, Math.PI * 2, true); // π * 2 Radians = 360 degrees
  ctx.closePath();
  ctx.fill();
}


window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', keyUpHandler);


function keyDownHandler(event) {
  switch (event.keyCode) {
    // "up arrow" key
    case 38:
      upArrowPressed = true;
      break;
    // "down arrow" key
    case 40:
      downArrowPressed = true;
      break;
  }
}

function keyUpHandler(event) {
  switch (event.keyCode) {
    // "up arrow" key
    case 38:
      upArrowPressed = false;
      break;
    // "down arrow" key
    case 40:
      downArrowPressed = false;
      break;

    // "left arrow" key
    case 37:
      lSound.play();
      break;

    // "right arrow" key
    case 39:
      rSound.play();
      break;
  }
}

function reset() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 7;

  ball.velocityX = -ball.velocityX;
  ball.velocityY = -ball.velocityY;
}

function collisionDetect(player, ball) {
  player.top = player.y;
  player.right = player.x + player.width;
  player.bottom = player.y + player.height;
  player.left = player.x;

  ball.top = ball.y - ball.radius;
  ball.right = ball.x + ball.radius;
  ball.bottom = ball.y + ball.radius;
  ball.left = ball.x - ball.radius;

  return ball.left < player.right && ball.top < player.bottom && ball.right > player.left && ball.bottom > player.top;
}


function update() {
  // move the paddle
  if (upArrowPressed && user.y > 0) {
    user.y -= 6;
  } else if (downArrowPressed && (user.y < canvas.height - user.height)) {
    user.y += 6;
  }

  // check if ball hits top or bottom wall
  if (ball.y + ball.radius >= canvas.height || ball.y - ball.radius <= 0) {
    // play wallHitSound
    wallHitSound.play();
    ball.velocityY = -ball.velocityY;
  }

   // if ball hit on right wall
   if (ball.x + ball.radius >= canvas.width) {
    scoreSound.play();
    user.score += 1;
    pointScoredText.textContent = "Player Point! :D";
    if (user.score == 20){
      alert("You win! Click OK to play again.")
      location = location;
    }
    reset();
  }

  // if ball hit on left wall
  if (ball.x - ball.radius <= 0) {
    scoreSound.play();
    ai.score += 1;
    pointScoredText.textContent = "AI Point! :O";
    if (ai.score == 20){
      alert("You lose! Click OK to play again.")
      location = location;
    }
    
    reset();
  }

  // move the ball
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  // ai paddle movement
  ai.y += ((ball.y - (ai.y + ai.height / 2))) * 0.09;

  // collision detection on paddles
  let player = (ball.x < canvas.width / 2) ? user : ai;

  if (collisionDetect(player, ball)) {
    // play hitSound
    hitSound.play();
    if (user.score>0 || ai.score>0){
      pointScoredText.textContent = "Ping Pong!";
    }
    
    // default angle is 0deg in Radian
    let angle = 0;

    // if ball hit the top of paddle
    if (ball.y < (player.y + player.height / 2)) {
      // then -1 * Math.PI / 4 = -45deg
      angle = -1 * Math.PI / 4;
    } else if (ball.y > (player.y + player.height / 2)) {
      // if it hit the bottom of paddle
      // then angle will be Math.PI / 4 = 45deg
      angle = Math.PI / 4;
    }

    /* change velocity of ball according to on which paddle the ball hitted */
    ball.velocityX = (player === user ? 1 : -1) * ball.speed * Math.cos(angle);
    ball.velocityY = ball.speed * Math.sin(angle);

    ball.speed += 0.2;
  }
}

function render() {
  // set a style
  ctx.fillStyle = "#000"; /* whatever comes below this acquires black color (#000). */
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawNet();
  drawScore(canvas.width / 4, canvas.height / 2, user.score);
  drawScore(3 * canvas.width / 4, canvas.height / 2, ai.score);
  drawPaddle(user.x, user.y, user.width, user.height, user.color);
  drawPaddle(ai.x, ai.y, ai.width, ai.height, ai.color);
  drawBall(ball.x, ball.y, ball.radius, ball.color);
}

function gameLoop() {
  update();
  render();
}

setInterval(gameLoop, 1000 / 60);