import Api from './tools/Api'
import Task from './components/Task';
import Calendar from './components/Calendar';
import { throttleDebounce } from './utils'

import 'normalize.css';
import './index.css';

class TodoApp {
  constructor() {
    this.taskContainer = document.querySelector('[data-tasks]');
    this.directionSortButton = document.querySelector('[data-sort-direction]');
    this.directionSortIcon = document.querySelector('[data-sort-icon]');
    this.unfulfilledCheckBox = document.querySelector('[data-unfulfilled-filter]');
    this.todayTasksButton = document.querySelector('[button-today-tasks]');
    this.weekTasksButton = document.querySelector('[button-week-tasks]');
    this.appState = {
      isSortIncreasing: false,
      limit: 10,
      offset: 0,
      isLoading: false,
      tasks: [],
      isOnlyUnfulfilled: false,
    };

    this.api = new Api({
      baseUrl: 'https://todo.doczilla.pro',
      'Content-Type': 'application/json'
    });

    this.calendar = new Calendar('[data-calendar]', this.handlePeriodSelect.bind(this));
    this.requestState = {
      lastStartDate: null,
      lastEndDate: null,
    };
  }

  async init() {
    this._addEventListeners();
    this.calendar.initializeCalendar();
    await this.loadTasks();
    this.observeLastTask();
  }

  _addEventListeners() {
    this.directionSortButton.addEventListener('click', this.handleSortClick.bind(this));
    this.unfulfilledCheckBox.addEventListener('change', this.handleUnfulfilledChange.bind(this));
    this.todayTasksButton.addEventListener('click', this.handleTodayTasksClick.bind(this));
    this.weekTasksButton.addEventListener('click', this.handleWeekTasksClick.bind(this));
  }

  handlePeriodSelect(startDate, endDate) {
    this.appState.tasks = [];
    this.unMountTasks();
    this.appState.limit = 10;
    this.appState.offset = 0;
    this.api.getTasksByDate(startDate, endDate, this.appState.isOnlyUnfulfilled, this.appState.limit, this.appState.offset)
      .then(res => {
        this.appState.tasks.push(...res);
        this.mountTasks();
      });
  }

  handleSortClick() {
    this.directionSortIcon.classList.toggle('sort__direction-arrow_reverse');
    this.appState.isSortIncreasing = !this.appState.isSortIncreasing;
    this.sortTasks();
    this.unMountTasks();
    this.mountTasks();
  }

  handleUnfulfilledChange() {
    this.appState.isOnlyUnfulfilled = this.unfulfilledCheckBox.checked;
    console.log(this.appState.isOnlyUnfulfilled);
  }

  handleTodayTasksClick() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    this.handlePeriodSelect(startOfDay.getTime(), endOfDay.getTime());
  }

  handleWeekTasksClick() {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    this.handlePeriodSelect(startOfWeek.getTime(), endOfWeek.getTime());
  }

  async loadTasks(startDate, endDate) {
    const onSuccess = (result) => {
      this.appState.tasks.push(...result);
      this.sortTasks();
      this.unMountTasks();
      this.mountTasks();
      this.appState.offset += this.appState.limit;
    };

    if (!!startDate && !!endDate) {
      this.api.getTasksByDate(startDate, endDate, this.appState.isOnlyUnfulfilled, this.appState.limit, this.appState.offset)
        .then(onSuccess)
    } else {
      this.api.getTasks(this.appState.limit, this.appState.offset)
        .then(onSuccess)
    }
  }

  createTask(item) {
    const task = new Task(item, '[data-task-template]', () => console.log(1), (isCheked) => console.log(isCheked));
    this.taskContainer.append(task.generateTask())
  }

  mountTasks() {
    this.appState.tasks.forEach(task => this.createTask(task));
    this.observeLastTask();
  }

  unMountTasks() {
    while (this.taskContainer.firstChild) {
      this.taskContainer.removeChild(this.taskContainer.firstChild);
    }
  }

  sortTasks() {
    this.appState.tasks.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return this.appState.isSortIncreasing ? dateA - dateB : dateB - dateA;
    });
  }

  observeLastTask() {
    const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentSelectedStartDate = this.calendar.getSelectedStartDate();
          const currentSelectedEndDate = this.calendar.getSelectedEndDate();
          if (!!currentSelectedStartDate && !!currentSelectedEndDate) {
            throttleDebounce(() => {
              this.loadTasks(currentSelectedStartDate, currentSelectedEndDate);
            }, 500)();
          } else {
            throttleDebounce(this.loadTasks.bind(this), 500)();
          }

          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px',
      threshold: 1.0
    });

    const newLastTask = this.taskContainer.querySelector('.task:last-child');
    if (newLastTask) {
      observer.observe(newLastTask);
    }
  }
}

const todoApp = new TodoApp();
document.addEventListener("DOMContentLoaded", () => todoApp.init());
