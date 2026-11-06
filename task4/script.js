function generateSecret() {
  const digits = '0123456789'.split('');
  let secret = '';

  // Убираем выбранную цифру, чтобы она больше не выпала.
  for (let i = 0; i < 4; i += 1) {
    const index = Math.floor(Math.random() * digits.length);
    secret += digits[index];
    digits.splice(index, 1);
  }

  return secret;
}

function validateGuess(guess) {
  if (guess.length !== 4) return 'Введите ровно 4 цифры.';
  if (!/^[0-9]{4}$/.test(guess)) return 'Используйте только цифры от 0 до 9.';
  if (new Set(guess).size !== 4) return 'Все четыре цифры должны быть разными.';
  return '';
}

function countBullsAndCows(secret, guess) {
  let bulls = 0;
  let cows = 0;

  for (let i = 0; i < guess.length; i += 1) {
    if (guess[i] === secret[i]) {
      bulls += 1;
    } else if (secret.includes(guess[i])) {
      cows += 1;
    }
  }

  return { bulls, cows };
}

const game = { secret: '', history: [], won: false };
const form = document.querySelector('#guess-form');
const input = document.querySelector('#guess-input');
const checkButton = document.querySelector('#check-button');
const restartButton = document.querySelector('#restart-button');
const historyList = document.querySelector('#history');
const attempts = document.querySelector('#attempt-count');
const message = document.querySelector('#message');
const emptyHistory = document.querySelector('#empty-history');

function render() {
  historyList.replaceChildren();

  for (const attempt of game.history) {
    const row = document.createElement('li');
    row.textContent = `${attempt.guess} — Быки: ${attempt.bulls} · Коровы: ${attempt.cows}`;
    historyList.append(row);
  }

  attempts.textContent = game.history.length;
  emptyHistory.hidden = game.history.length > 0;
  input.disabled = game.won;
  checkButton.disabled = game.won;
}

function startNewGame() {
  game.secret = generateSecret();
  game.history = [];
  game.won = false;
  input.value = '';
  input.removeAttribute('aria-invalid');
  message.className = 'message';
  message.textContent = 'Число загадано. Сделайте первую попытку.';
  render();
  input.focus();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (game.won) return;

  const guess = input.value;
  const error = validateGuess(guess);

  if (error) {
    message.textContent = error;
    message.className = 'message error';
    input.setAttribute('aria-invalid', 'true');
    input.focus();
    return;
  }

  const { bulls, cows } = countBullsAndCows(game.secret, guess);
  game.history.push({ guess, bulls, cows });
  game.won = bulls === 4;

  input.removeAttribute('aria-invalid');
  input.value = '';
  message.className = game.won ? 'message success' : 'message';
  message.textContent = game.won
    ? `Победа! Угадано за ${game.history.length} попыток`
    : `Быки: ${bulls}. Коровы: ${cows}. Попробуйте ещё.`;

  render();

  if (game.won) {
    restartButton.focus();
  } else {
    input.focus();
  }
});

input.addEventListener('input', () => {
  if (input.hasAttribute('aria-invalid')) {
    input.removeAttribute('aria-invalid');
    message.className = 'message';
    message.textContent = 'Четыре разные цифры. Начальный ноль допустим.';
  }
});

restartButton.addEventListener('click', startNewGame);
startNewGame();
