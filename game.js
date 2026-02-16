"use strict";

const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const stateEl = document.getElementById("game-state");
const livesEl = document.getElementById("lives");
const targetTypeEl = document.getElementById("target-type");
const overlayEl = document.getElementById("overlay");
const overlayTextEl = document.getElementById("overlay-text");

const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
const difficultySelect = document.getElementById("difficulty-select");
const themeSelect = document.getElementById("theme-select");
const touchButtons = document.querySelectorAll(".control-btn");

const GRID_SIZE = 20;
const STORAGE_KEY = "snake_best_score";
const DIFFICULTY_KEY = "snake_difficulty";
const THEME_KEY = "snake_theme";
const STARTING_LIVES = 3;

const DIFFICULTY_PROFILES = {
  easy: { label: "简单", baseDelay: 170, minDelay: 95, speedStep: 1.5, scoreFactor: 1.2 },
  normal: { label: "普通", baseDelay: 140, minDelay: 75, speedStep: 2, scoreFactor: 1 },
  hard: { label: "困难", baseDelay: 112, minDelay: 55, speedStep: 2.5, scoreFactor: 0.75 }
};

const ITEM_TYPES = [
  { id: "apple", label: "苹果", points: 10, colorVar: "--apple-color", chance: 55, harmful: false },
  { id: "banana", label: "香蕉", points: 15, colorVar: "--banana-color", chance: 30, harmful: false },
  { id: "bomb", label: "炸弹", points: -20, colorVar: "--bomb-color", chance: 15, harmful: true }
];

const THEMES = ["amber", "ocean", "forest"];

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
let target = { x: 10, y: 10, type: ITEM_TYPES[0] };
let score = 0;
let bestScore = Number(localStorage.getItem(STORAGE_KEY) || 0);
let gameState = "idle";
let loopTimer = null;
let foodsEaten = 0;
let difficulty = localStorage.getItem(DIFFICULTY_KEY) || "normal";
let lives = STARTING_LIVES;
let theme = localStorage.getItem(THEME_KEY) || "amber";

if (!DIFFICULTY_PROFILES[difficulty]) {
  difficulty = "normal";
}

if (!THEMES.includes(theme)) {
  theme = "amber";
}

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

function getOpenCells() {
  const openCells = [];

  for (let x = 0; x < GRID_SIZE; x += 1) {
    for (let y = 0; y < GRID_SIZE; y += 1) {
      const occupied = snake.some((segment) => segment.x === x && segment.y === y);
      if (!occupied) {
        openCells.push({ x, y });
      }
    }
  }

  return openCells;
}

function pickItemType() {
  const totalWeight = ITEM_TYPES.reduce((sum, item) => sum + item.chance, 0);
  let randomWeight = Math.random() * totalWeight;

  for (const item of ITEM_TYPES) {
    randomWeight -= item.chance;
    if (randomWeight <= 0) {
      return item;
    }
  }

  return ITEM_TYPES[0];
}

function placeTarget() {
  const openCells = getOpenCells();
  if (openCells.length === 0) {
    return false;
  }

  const randomCell = openCells[Math.floor(Math.random() * openCells.length)];
  target = { ...randomCell, type: pickItemType() };
  return true;
}

function updateHud() {
  scoreEl.textContent = String(score);
  bestScoreEl.textContent = String(bestScore);
  livesEl.textContent = String(lives);
  targetTypeEl.textContent = target.type.label;

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

function applyTheme(nextTheme) {
  theme = THEMES.includes(nextTheme) ? nextTheme : "amber";
  document.body.dataset.theme = theme;
  themeSelect.value = theme;
  localStorage.setItem(THEME_KEY, theme);
}

function getThemeColor(cssVarName) {
  return getComputedStyle(document.body).getPropertyValue(cssVarName).trim();
}

function getStepDelay() {
  const profile = DIFFICULTY_PROFILES[difficulty];
  return Math.max(profile.minDelay, profile.baseDelay - foodsEaten * profile.speedStep);
}

function getScaledScore(baseScore) {
  const profile = DIFFICULTY_PROFILES[difficulty];
  const scaled = Math.round(baseScore * profile.scoreFactor);
  if (baseScore >= 0) {
    return Math.max(1, scaled);
  }
  return Math.min(-1, scaled);
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
  ctx.strokeStyle = getThemeColor("--grid-line");
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
  const boardFrom = getThemeColor("--board-from");
  const boardTo = getThemeColor("--board-to");
  const snakeHeadColor = getThemeColor("--snake-head");
  const snakeBodyColor = getThemeColor("--snake-body");
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, boardFrom);
  gradient.addColorStop(1, boardTo);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  snake.forEach((segment, index) => {
    const isHead = index === 0;
    drawCell(segment.x, segment.y, isHead ? snakeHeadColor : snakeBodyColor, isHead ? 0.35 : 0.24);
  });

  drawCell(target.x, target.y, getThemeColor(target.type.colorVar), target.type.harmful ? 0.3 : 0.36);
  if (target.type.harmful) {
    drawCell(target.x, target.y, getThemeColor("--bomb-core"), 0.15);
  }
}

function stopLoop() {
  if (loopTimer !== null) {
    clearTimeout(loopTimer);
    loopTimer = null;
  }
}

function endGame(reason) {
  gameState = "over";
  stopLoop();
  updateHud();
  const message = reason || "撞到障碍，回合结束。";
  setOverlay(`游戏结束，得分 ${score}。${message} 点击“重新开始”再来一局。`, true);
}

function refreshBestScore() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem(STORAGE_KEY, String(bestScore));
  }
}

function handleTargetCollision() {
  const points = getScaledScore(target.type.points);

  if (target.type.harmful) {
    lives -= 1;
    score = Math.max(0, score + points);
    snake.pop();

    if (lives <= 0) {
      refreshBestScore();
      endGame("踩中炸弹，生命耗尽。");
      return false;
    }
  } else {
    foodsEaten += 1;
    score += points;
  }

  refreshBestScore();

  if (!placeTarget()) {
    endGame("你已经占满了棋盘，成功通关。");
    return false;
  }

  return true;
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

  const ateTarget = nextHead.x === target.x && nextHead.y === target.y;
  if (ateTarget) {
    if (!handleTargetCollision()) {
      return;
    }
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
  foodsEaten = 0;
  lives = STARTING_LIVES;
  resetSnake();
  placeTarget();
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
  difficultySelect.value = difficulty;
  applyTheme(theme);
  lives = STARTING_LIVES;
  resetSnake();
  placeTarget();
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

difficultySelect.addEventListener("change", () => {
  const nextDifficulty = difficultySelect.value;
  if (!DIFFICULTY_PROFILES[nextDifficulty]) {
    return;
  }
  difficulty = nextDifficulty;
  localStorage.setItem(DIFFICULTY_KEY, difficulty);
});

themeSelect.addEventListener("change", () => {
  applyTheme(themeSelect.value);
  drawGame();
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
