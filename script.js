// Align Grounds
const grounds = document.querySelectorAll(".ground");
//getting the current css property state
const getCustomProperty = (elem, prop) => {
  return parseFloat(getComputedStyle(elem).getPropertyValue(prop)) || 0;
};

const setProp = (elem, prop, value) => {
  return elem.style.setProperty(prop, value);
};

const incProp = (elem, prop, incVal) => {
  setProp(elem, prop, getCustomProperty(elem, prop) + incVal);
};

// Align Ground
setProp(grounds[0], "--left", 0);
setProp(grounds[1], "--left", 35);
setProp(grounds[2], "--left", 70);
setProp(grounds[3], "--left", 105);

// Make Ground Move Constantly
let BASE_SPEED = 0.5;
const run = (DELTA) => {
  grounds.forEach((base) => {
    incProp(base, "--left", DELTA * BASE_SPEED);
    if (getCustomProperty(base, "--left") >= 35) {
      incProp(base, "--left", -135);
    }
  });
};
let delta = 0;
let SPEED = 0.1;
let lastTime;
function update(time) {
  if (lastTime == null) {
    lastTime = 0;
    window.requestAnimationFrame(update);
    return;
  }
  const delta = time - lastTime - 10;
  lastTime = time;
  if (gameStats) {
    window.requestAnimationFrame(update);
  } else return;
  let speedScale = delta * SPEED;
  run(speedScale);
}

window.requestAnimationFrame(update);
// Game Starts
let birdStatus = true;
let gameStats = true;
document.addEventListener(
  "keypress",
  (e) => {
    if (e.code === "Space") {
      bird.classList.remove("bird-hover");
      window.requestAnimationFrame(updateBird);
    }
  },
  { once: true }
);

// Add Bird Motion

const setBird = {
  yVelocity: 0,
  fall: delta,
};
let birdLastTime;
let lift = false;
let num;
const bird = document.querySelector(".bird");
const blueBird = document.querySelectorAll(".blue-bird");
setProp(bird, "--top", 180);
const updateBird = (time) => {
  if (birdLastTime == null) {
    createPipe();
    birdLastTime = 0;
    window.requestAnimationFrame(updateBird);
    return;
  }
  const BIRD_DELTA = time - birdLastTime + 40;
  birdLastTime = time;
  let BIRD_SPEED_SCALE = BIRD_DELTA * SPEED;
  window.requestAnimationFrame(updateBird);

  BIRD_SPEED_SCALE > 8 ? (BIRD_SPEED_SCALE = 0) : "";
  runUpdate(BIRD_SPEED_SCALE);
  if (gameStats) {
    movePipes(BIRD_SPEED_SCALE);
    // document.removeEventListener("keypress", e);
  } else return;
  delta = BIRD_SPEED_SCALE;
  checkCollision();
  checkScore()

  if (getCustomProperty(bird, "--top") > 470) {
    gameOver();
  }
};

const runUpdate = (BIRD_SPEED_SCALE) => {
  if (getCustomProperty(bird, "--top") <= 470) {
    //change
    setBird.fall = delta;
    incProp(bird, "--top", setBird.fall * num);
    if (getCustomProperty(bird, "--fall") < 90) {
      incProp(bird, "--fall", BIRD_SPEED_SCALE * 0.2);
    }
  }
  num = 1;
};

// Lift Bird
let gravity = 9.8;
let yVelocity = 0; // fall of bird
document.addEventListener("keypress", function (e) {
  if (gameStats) {
    if (e.code === "Space") {
      if (getCustomProperty(bird, "--top") > 0) {
        // decrement the top value
        setBird.fall = -delta;
        incProp(bird, "--top", setBird.fall * 10); //BUG!!
        if (getCustomProperty(bird, "--fall") > 0) {
          setProp(bird, "--fall", -delta * 0.05);
        }
        num = -1;
      }
    }
  }
});

// Bird Flapping
const birdPositions = [
  "images/bluebird-upflap.png",
  "images/bluebird-midflap.png",
  "images/bluebird-downflap.png",
];
const setUp = () => {
  if (gameStats) {
    blueBird[0].src = `${birdPositions[0]}`;
  }
};
const setMid = () => {
  if (gameStats) {
    blueBird[0].src = `${birdPositions[1]}`;
  }
};
const setDown = () => {
  if (gameStats) {
    blueBird[0].src = `${birdPositions[2]}`;
  }
};

setInterval(setUp, 200);
setInterval(setMid, 300);
setInterval(setDown, 400);

// Pipes
let PIPE_DISTANCE;
const MIN_INTERVAL = 200;
const MAX_INTERVAL = 1500;
const MIN_HOLE = 50;
const MAX_HOLE = 150;
let INTERVAL = 0; // craete a random num between 200 and 1000
let TIMING = 0;
const pipes = [];
const pipeArr = [];
let PipeCnt = "";
const gameCont = document.querySelector(".game-container");
const createPipe = (RANDOM_HOLE) => {
  const pipeContainer = document.createElement("div");
  pipes.push(pipeContainer);
  pipeContainer.classList.add("pipe-container");
  const pipeTop = document.createElement("img");
  const pipeBottom = document.createElement("img");
  pipeTop.setAttribute("src", "images/pipe-green.png");
  pipeBottom.setAttribute("src", "images/pipe-green.png");
  pipeTop.classList.add("pipeTop", "pipe");
  pipeBottom.classList.add("pipeBottom", "pipe");
  gameCont.append(pipeContainer);
  setProp(pipeTop, "--pipe-top", 70 + RANDOM_HOLE);
  setProp(pipeBottom, "--pipe-bottom", 350 - RANDOM_HOLE);
  setProp(pipeContainer, "--left", 100);
  pipeContainer.append(pipeTop, pipeBottom);
  pipes[0].style.display = "none";
  pipeArr.push(pipeTop);
  pipeArr.push(pipeBottom);
};

const movePipes = () => {
  const RANDOM_HOLE = Math.floor(
    Math.random() * (MAX_HOLE - MIN_HOLE + 1) + MIN_HOLE
  );
  INTERVAL = Math.floor(
    Math.random() * (MAX_INTERVAL - MIN_INTERVAL + 1) + MIN_INTERVAL
  );
  TIMING += delta * 0.5;
  if (TIMING > INTERVAL) {
    createPipe(RANDOM_HOLE);
    TIMING -= INTERVAL;
  }
  pipes.forEach((pipe) => {
    incProp(pipe, "--left", -delta * 0.09);
    if (getCustomProperty(pipe, "--left") < -20) {
      // pipes.shift();
    }
  });
};

// Check Lose
// Detection for bird, ground and pipe collision...
const checkCollision = () => {
  const BIRD = document.querySelector(".blue-bird");
  const rect1 = BIRD.getBoundingClientRect();
  grounds.forEach((ground) => {
    let rect2 = ground.getBoundingClientRect();
    if (
      rect1.left < rect2.right &&
      rect1.right > rect2.left &&
      rect1.top < rect2.bottom &&
      rect1.bottom > rect2.top
    ) {
      gameStats = false;
    }
  });
  pipeArr.forEach((pipe) => {
    let rect3 = pipe.getBoundingClientRect();
    if (
      rect3.left < rect1.right &&
      rect3.right > rect1.left &&
      rect3.top < rect1.bottom &&
      rect3.bottom > rect1.top
      ) {
        gameStats = false;
      }
    });
  };
  const gameOver = () => {}; 
  
// Check Score
const checkScore = () => {};
