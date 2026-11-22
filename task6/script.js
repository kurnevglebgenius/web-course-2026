const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const scoreText = document.querySelector('#score');
const statusText = document.querySelector('#status');
const start = document.querySelector('#start');

const size = 20;
const cell = 20;
const moveInterval = 150;
const directions = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
};

let snake, direction, nextDirection, apple, score, lastMoveTime;
let running = false;

function reset() {
  snake = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
  direction = directions.ArrowRight;
  nextDirection = direction;
  score = 0;
  scoreText.textContent = 'Счёт: 0';
  apple = spawnApple();
}

function spawnApple() {
  const free = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!snake.some((part) => part.x === x && part.y === y)) free.push({ x, y });
    }
  }
  return free[Math.floor(Math.random() * free.length)];
}

function checkCollision(head, body) {
  return head.x < 0 || head.x >= size || head.y < 0 || head.y >= size
    || body.some((part) => part.x === head.x && part.y === head.y);
}

function finish(message) {
  running = false;
  statusText.textContent = message + ' Итоговый счёт: ' + score + '.';
  start.textContent = 'Начать заново';
  start.disabled = false;
}

function update() {
  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  const eats = head.x === apple.x && head.y === apple.y;
  // Если роста нет, последняя клетка хвоста успевает освободиться.
  const body = eats ? snake : snake.slice(0, -1);

  if (checkCollision(head, body)) {
    finish('Игра окончена.');
    return;
  }

  snake.unshift(head);
  if (eats) {
    score += 1;
    scoreText.textContent = 'Счёт: ' + score;
    apple = spawnApple();
    if (!apple) finish('Игра окончена. Поле заполнено!');
  } else {
    snake.pop();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#236144';
  snake.forEach((part) => ctx.fillRect(part.x * cell, part.y * cell, cell - 1, cell - 1));
  ctx.fillStyle = '#ad2942';
  if (apple) ctx.fillRect(apple.x * cell, apple.y * cell, cell - 1, cell - 1);
}

function frame(time) {
  if (time - lastMoveTime >= moveInterval) {
    lastMoveTime = time - (time - lastMoveTime) % moveInterval;
    update();
    draw();
  }
  if (running) requestAnimationFrame(frame);
}

document.addEventListener('keydown', (event) => {
  const turn = directions[event.key];
  if (!running || !turn) return;
  event.preventDefault();
  if (turn.x + direction.x === 0 && turn.y + direction.y === 0) return;
  nextDirection = turn;
});

start.addEventListener('click', () => {
  reset();
  draw();
  running = true;
  start.disabled = true;
  statusText.textContent = 'Игра идёт.';
  lastMoveTime = performance.now();
  requestAnimationFrame(frame);
});

reset();
draw();
