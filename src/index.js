import Api from './tools/Api'
import Task from './components/Task';

import 'normalize.css';
import './index.css';

const taskContainer = document.querySelector('[data-tasks]');

let limit = 10;
let offset = 0;

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

function loadTasks() {
  api.getTasks(limit, offset)
  .then((result) => {
    console.log(result)
    result.forEach(element => {
      createTask(element);
    });
    offset += limit;
  })
};

taskContainer.addEventListener('scroll', () => {
  if (taskContainer.scrollTop + taskContainer.clientHeight >= taskContainer.scrollHeight) {
    loadTasks();
  }
})

loadTasks();
