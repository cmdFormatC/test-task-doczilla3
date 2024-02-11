import Api from './tools/Api'
import Task from './components/Task';
import Calendar from './components/Calendar';
import { throttleDebounce } from './utils'

import 'normalize.css';
import './index.css';
import Popup from './components/Popup';

class TodoApp {
  constructor() {
    this.taskContainer = document.querySelector('[data-tasks]');
    this.directionSortButton = document.querySelector('[data-sort-direction]');
    this.directionSortIcon = document.querySelector('[data-sort-icon]');
    this.unfulfilledCheckBox = document.querySelector('[data-unfulfilled-filter]');
    this.todayTasksButton = document.querySelector('[data-button-today-tasks]');
    this.weekTasksButton = document.querySelector('[data-button-week-tasks]');
    this.searchInput = document.querySelector('[data-search-input]');
    this.searchSubmitButton = document.querySelector('[data-search-submit-button]');
    this.appState = {
      isSortIncreasing: false,
      limit: 10,
      offset: 0,
      isLoading: false,
      tasks: [],
      isOnlyUnfulfilled: false,
      searchText: '',
      isLoadingComplete: false,
    };

    this.api = new Api({
      baseUrl: 'http://localhost:3000/',
      'Content-Type': 'application/json'
    });

    this.calendar = new Calendar('[data-calendar]', this.handlePeriodSelect.bind(this));
    this.requestState = {
      lastStartDate: null,
      lastEndDate: null,
    };
    this.popup = new Popup('[data-popup]');
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
    this.searchSubmitButton.addEventListener('click',(e) => this.handleSearchTasks(e));
  }

  clearTasksState() {
    this.appState.isLoadingComplete = false
    this.appState.tasks = [];
    this.appState.offset = 0;
  }

  handlePeriodSelect(startDate, endDate) {
    this.clearTasksState()
    this.loadTasks(startDate, endDate, null)
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
  
  handleSearchTasks(e) {
    e.preventDefault();
    this.clearTasksState()
    this.searchText = this.searchInput.value;
    throttleDebounce(() => {
      this.loadTasks(null, null, this.searchText);
    }, 500)();
  }

  async loadTasks(startDate, endDate, searchText) {
    const onSuccess = (result) => {
      if (result.length === 0) {
        this.appState.isLoadingComplete = true;
      }
      this.appState.tasks.push(...result);
      this.sortTasks();
      this.unMountTasks();
      this.mountTasks();
      this.appState.offset += this.appState.limit;
    };
    
    if (this.appState.isLoadingComplete) {
      return;
    }

    if (!!startDate && !!endDate) {
      this.api.getTasksByDate(startDate, endDate, this.appState.isOnlyUnfulfilled, this.appState.limit, this.appState.offset)
        .then(onSuccess)
    } else if (!!searchText) {
      this.api.getTasksBySearch(this.searchText, this.appState.limit, this.appState.offset)
      .then(onSuccess)
    }
    else {
      this.api.getTasks(this.appState.limit, this.appState.offset)
      .then(onSuccess)
    }
  }

  createTask(item) {
    const task = new Task(item, '[data-task-template]', 
    (title, date, desc, status) => this.popup.open(title, date, desc, status), 
    (isCheked) => console.log(isCheked));
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
        if (entry.isIntersecting && !this.appState.isLoadingComplete) {
          const currentSelectedStartDate = this.calendar.getSelectedStartDate();
          const currentSelectedEndDate = this.calendar.getSelectedEndDate();
          throttleDebounce(() => {
            this.loadTasks(currentSelectedStartDate, currentSelectedEndDate, this.searchText);
          }, 500)();

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
