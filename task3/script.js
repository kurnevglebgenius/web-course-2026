// Единственный источник данных — массив. После перезагрузки он снова пуст.
let tasks = [];
let nextId = 1;
let activeFilter = 'all';

const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const formError = document.querySelector('#form-error');
const taskList = document.querySelector('#task-list');
const filterButtons = document.querySelectorAll('[data-filter]');
const remainingCount = document.querySelector('#remaining-count');
const completedCount = document.querySelector('#completed-count');
const emptyState = document.querySelector('#empty-state');
const actionStatus = document.querySelector('#action-status');

function addTask(text) {
  const trimmedText = text.trim();
  if (trimmedText === '') return false;

  tasks.push({ id: nextId, text: trimmedText, completed: false });
  nextId += 1;
  return true;
}

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (task) task.completed = !task.completed;
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
}

function getVisibleTasks() {
  return tasks.filter((task) => {
    if (activeFilter === 'active') return !task.completed;
    if (activeFilter === 'completed') return task.completed;
    return true;
  });
}

// Полностью строим список из массива; пользовательский текст не становится HTML.
function render() {
  taskList.replaceChildren();
  const visibleTasks = getVisibleTasks();

  visibleTasks.forEach((task, index) => {
    const item = document.createElement('li');
    item.className = task.completed ? 'task-item is-completed' : 'task-item';
    item.dataset.id = task.id;

    const label = document.createElement('label');
    label.className = 'task-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => {
      toggleTask(task.id);
      render();
      actionStatus.textContent = task.completed ? 'Задача завершена.' : 'Задача снова активна.';
      // Сохраняем фокус и после полной перерисовки списка.
      const replacement = taskList.querySelector(`[data-id="${task.id}"] input`);
      if (replacement) replacement.focus();
      else document.querySelector(`[data-filter="${activeFilter}"]`).focus();
    });

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;
    label.append(checkbox, text);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-button';
    deleteButton.textContent = 'Удалить';
    deleteButton.setAttribute('aria-label', `Удалить задачу: ${task.text}`);
    deleteButton.addEventListener('click', () => {
      deleteTask(task.id);
      render();
      actionStatus.textContent = 'Задача удалена.';
      const remainingButtons = taskList.querySelectorAll('.delete-button');
      const nextButton = remainingButtons[Math.min(index, remainingButtons.length - 1)];
      if (nextButton) nextButton.focus();
      else taskInput.focus();
    });

    item.append(label, deleteButton);
    taskList.append(item);
  });

  // Счётчики всегда относятся ко всему массиву, независимо от фильтра.
  const completed = tasks.filter((task) => task.completed).length;
  remainingCount.textContent = tasks.length - completed;
  completedCount.textContent = completed;
  filterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter));
  });

  emptyState.hidden = visibleTasks.length > 0;
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!addTask(taskInput.value)) {
    formError.hidden = false;
    taskInput.setAttribute('aria-invalid', 'true');
    taskInput.focus();
    return;
  }

  formError.hidden = true;
  taskInput.removeAttribute('aria-invalid');
  taskInput.value = '';
  render();
  actionStatus.textContent = activeFilter === 'completed' ? 'Задача добавлена. Она доступна в фильтрах «Все» и «Активные».' : 'Задача добавлена.';
  taskInput.focus();
});

taskInput.addEventListener('input', () => {
  formError.hidden = true;
  taskInput.removeAttribute('aria-invalid');
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    render();
  });
});

render();
