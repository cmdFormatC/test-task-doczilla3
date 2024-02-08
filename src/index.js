import Api from './tools/Api'
import Task from './components/Task';

import 'normalize.css';
import './index.css';

const taskContainer = document.querySelector('[data-tasks]');
const directionSortButton = document.querySelector('[data-sort-direction]');
const directionSortIcon = document.querySelector('[data-sort-icon]');

const appState = {
  isSortIncreasing: false,
  limit: 10,
  offset: 0,
  isLoading: false,
  tasks: [],
}

const api = new Api({
  baseUrl: 'https://todo.doczilla.pro',
  'Content-Type': 'application/json'
});

function handleTaskClick() {
  console.log(1)
};

function handleChek(isCheked) {
  console.log(isCheked)
};

function createTask(item) {
  const task = new Task(item, '[data-task-template]', handleTaskClick, handleChek);
  taskContainer.append(task.generateTask())
};

function mountTasks() {
  appState.tasks.forEach(element => {
    createTask(element);
  });
}

function unMountTasks() {
  while (taskContainer.firstChild) {
    taskContainer.removeChild(taskContainer.firstChild);
  };
}

function sortTasks() {
  appState.tasks.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return appState.isSortIncreasing ? dateA - dateB : dateB - dateA;
  });
}

const loadTasks = () => {
  api.getTasks(appState.limit, appState.offset)
  .then((result) => {
    appState.tasks.push(...result);
    sortTasks();
    unMountTasks();
    mountTasks();
    appState.offset += appState.limit;
  })
};

taskContainer.addEventListener('scroll', () => {
  if (taskContainer.scrollTop + taskContainer.clientHeight >= taskContainer.scrollHeight) {
    loadTasks();
  }
});

directionSortButton.addEventListener('click', () => {
  directionSortIcon.classList.toggle('sort__direction-arrow_reverse');
  appState.isSortIncreasing = !appState.isSortIncreasing;
  sortTasks();
  unMountTasks();
  mountTasks();
});


loadTasks();
