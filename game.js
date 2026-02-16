"use strict";

const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const stateEl = document.getElementById("game-state");
const overlayEl = document.getElementById("overlay");
const overlayTextEl = document.getElementById("overlay-text");

const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
const touchButtons = document.querySelectorAll(".control-btn");

const GRID_SIZE = 20;
const BASE_SPEED = 140;
const MIN_SPEED = 70;
const STORAGE_KEY = "snake_best_score";

const DIRECTION_MAP = {
  ArrowUp: { x: 0, y: -1, name: "up" },
  ArrowDown: { x: 0, y: 1, name: "down" },
  ArrowLeft: { x: -1, y: 0, name: "left" },
  ArrowRight: { x: 1, y: 0, name: "right" },
  w: { x: 0, y: -1, name: "up" },
  s: { x: 0, y: 1, name: "down" },
  a: { x: -1, y: 0, name: "left" },
  d: { x: 1, y: 0, name: "right" }
};

const DIRECT_BY_NAME = {
  up: DIRECTION_MAP.ArrowUp,
  down: DIRECTION_MAP.ArrowDown,
  left: DIRECTION_MAP.ArrowLeft,
  right: DIRECTION_MAP.ArrowRight
};

let snake = [];
let direction = DIRECTION_MAP.ArrowRight;
let pendingDirection = direction;
let food = { x: 10, y: 10 };
let score = 0;
let bestScore = Number(localStorage.getItem(STORAGE_KEY) || 0);
let gameState = "idle";
let loopTimer = null;

function resetSnake() {
  const mid = Math.floor(GRID_SIZE / 2);
  snake = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid }
  ];
  direction = DIRECTION_MAP.ArrowRight;
  pendingDirection = direction;
}

function placeFood() {
  const openCells = [];

  for (let x = 0; x < GRID_SIZE; x += 1) {
    for (let y = 0; y < GRID_SIZE; y += 1) {
      const occupied = snake.some((segment) => segment.x === x && segment.y === y);
      if (!occupied) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) {
    return;
  }

  const randomIndex = Math.floor(Math.random() * openCells.length);
  food = openCells[randomIndex];
}

function updateHud() {
  scoreEl.textContent = String(score);
  bestScoreEl.textContent = String(bestScore);

  const labels = {
    idle: "等待开始",
    running: "进行中",
    paused: "已暂停",
    over: "已结束"
  };

  stateEl.textContent = labels[gameState];
}

function setOverlay(message, visible) {
  overlayTextEl.textContent = message;
  overlayEl.classList.toggle("hidden", !visible);
}

function getStepDelay() {
  return Math.max(MIN_SPEED, BASE_SPEED - score * 2);
}

function isOppositeDirection(next, current) {
  return next.x + current.x === 0 && next.y + current.y === 0;
}

function setDirection(nextDirection) {
  if (!nextDirection || gameState === "over" || gameState === "idle") {
    return;
  }

  if (isOppositeDirection(nextDirection, direction)) {
    return;
  }

  pendingDirection = nextDirection;
}

function drawGrid() {
  const cell = canvas.width / GRID_SIZE;
  ctx.strokeStyle = "rgba(104, 71, 42, 0.18)";
  ctx.lineWidth = 1;

  for (let i = 0; i <= GRID_SIZE; i += 1) {
    const pos = i * cell;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }
}

function drawCell(x, y, fillStyle, radius = 0.24) {
  const cell = canvas.width / GRID_SIZE;
  const px = x * cell;
  const py = y * cell;
  const r = cell * radius;

  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(px + r, py);
  ctx.lineTo(px + cell - r, py);
  ctx.quadraticCurveTo(px + cell, py, px + cell, py + r);
  ctx.lineTo(px + cell, py + cell - r);
  ctx.quadraticCurveTo(px + cell, py + cell, px + cell - r, py + cell);
  ctx.lineTo(px + r, py + cell);
  ctx.quadraticCurveTo(px, py + cell, px, py + cell - r);
  ctx.lineTo(px, py + r);
  ctx.quadraticCurveTo(px, py, px + r, py);
  ctx.fill();
}

function drawGame() {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#fff4de");
  gradient.addColorStop(1, "#f2d7a7");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  snake.forEach((segment, index) => {
    const isHead = index === 0;
    drawCell(segment.x, segment.y, isHead ? "#2d6f3b" : "#3f9b47", isHead ? 0.35 : 0.24);
  });

  drawCell(food.x, food.y, "#d7382f", 0.36);
}

function stopLoop() {
  if (loopTimer !== null) {
    clearTimeout(loopTimer);
    loopTimer = null;
  }
}

function endGame() {
  gameState = "over";
  stopLoop();
  updateHud();
  setOverlay(`游戏结束，得分 ${score}。点击“重新开始”再来一局。`, true);
}

function tick() {
  if (gameState !== "running") {
    return;
  }

  direction = pendingDirection;
  const nextHead = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  const hitWall =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= GRID_SIZE ||
    nextHead.y >= GRID_SIZE;
  const hitSelf = snake.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  snake.unshift(nextHead);

  const ateFood = nextHead.x === food.x && nextHead.y === food.y;
  if (ateFood) {
    score += 10;
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem(STORAGE_KEY, String(bestScore));
    }
    placeFood();
  } else {
    snake.pop();
  }

  updateHud();
  drawGame();
  loopTimer = setTimeout(tick, getStepDelay());
}

function startRound() {
  stopLoop();
  gameState = "running";
  score = 0;
  resetSnake();
  placeFood();
  updateHud();
  setOverlay("", false);
  drawGame();
  loopTimer = setTimeout(tick, getStepDelay());
}

function togglePause() {
  if (gameState === "running") {
    gameState = "paused";
    stopLoop();
    updateHud();
    setOverlay("已暂停，按空格或点击“暂停”继续。", true);
    return;
  }

  if (gameState === "paused") {
    gameState = "running";
    updateHud();
    setOverlay("", false);
    loopTimer = setTimeout(tick, getStepDelay());
  }
}

function init() {
  bestScoreEl.textContent = String(bestScore);
  resetSnake();
  placeFood();
  drawGame();
  updateHud();
  setOverlay("点击“开始游戏”开始挑战", true);
}

startBtn.addEventListener("click", () => {
  if (gameState === "running") {
    return;
  }
  startRound();
});

pauseBtn.addEventListener("click", () => {
  if (gameState === "idle" || gameState === "over") {
    return;
  }
  togglePause();
});

restartBtn.addEventListener("click", () => {
  startRound();
});

window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const next = DIRECTION_MAP[key];

  if (next) {
    event.preventDefault();
    setDirection(next);
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    if (gameState === "idle" || gameState === "over") {
      startRound();
    } else {
      togglePause();
    }
  }
});

touchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const dir = button.dataset.dir;
    setDirection(DIRECT_BY_NAME[dir]);
  });
});

init();
