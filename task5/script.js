const buttons = document.querySelectorAll('.board button');
const start = document.querySelector('#start');
const level = document.querySelector('#level');
const statusText = document.querySelector('#status');

let sequence = [];
let position = 0;
let waitingForPlayer = false;

function allowInput(allowed) {
  waitingForPlayer = allowed;
  buttons.forEach((button) => { button.disabled = !allowed; });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function nextRound() {
  allowInput(false);
  sequence.push(Math.floor(Math.random() * buttons.length));
  position = 0;
  level.textContent = 'Уровень: ' + sequence.length;
  statusText.textContent = 'Смотрите на кнопки.';

  for (const number of sequence) {
    await delay(250);
    buttons[number].classList.add('active');
    await delay(500);
    buttons[number].classList.remove('active');
  }

  statusText.textContent = 'Повторите последовательность.';
  allowInput(true);
}

start.addEventListener('click', () => {
  start.disabled = true;
  sequence = [];
  nextRound();
});

buttons.forEach((button, number) => {
  button.addEventListener('click', () => {
    if (!waitingForPlayer) return;

    if (number !== sequence[position]) {
      allowInput(false);
      statusText.textContent = 'Вы дошли до уровня ' + sequence.length + '.';
      start.disabled = false;
      return;
    }

    position += 1;
    if (position === sequence.length) nextRound();
  });
});
