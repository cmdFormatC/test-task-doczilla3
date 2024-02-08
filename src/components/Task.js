export default class Task {
  constructor(item, templateSelector, handleTaskClick, handleChek) {
    this._item = item;
    this._itemName = this._item.name;
    this._itemId = this._item.id;
    this._itemShortDesc = this._item.shortDesc;
    this._itemFullDesc = this._item.fullDesc;
    this._itemStatus = this._item.status;
    this._itemDate = this._formatDate(this._item.date);
    this._templateSelector = templateSelector;
    this._handleTaskClick = handleTaskClick;
    this._handleChek = handleChek;
    this._taskElement = this._getTemplate();
    this._taskCheckbox = this._taskElement.querySelector('[data-task-checkbox]');
    this._taskContainer = this._taskElement.querySelector('[data-task-container]');
    this._taskName = this._taskElement.querySelector('[data-task-title]');
    this._taskDesc = this._taskElement.querySelector('[data-task-description]');
    this._taskStatus = this._taskElement.querySelector('[data-task-checkbox]');
    this._taskLable = this._taskElement.querySelector('[data-task-lable]');
    this._taskDate = this._taskElement.querySelector('[data-task-date]');
  }

  _getTemplate() {
    const taskElement = document.querySelector(this._templateSelector).content.cloneNode(true);
    return taskElement
  };

  _formatDate(dateStr) {
    const date = new Date(dateStr.slice(0, -2) + ':' + dateStr.slice(-2));

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  _setEventListeners() {
    this._taskLable.addEventListener('click', (e) => {
      e.stopPropagation();
      this._handleChek(this._taskStatus.checked);
    })
    this._taskContainer.addEventListener('click', (e) => {
      if (e.target !== this._taskCheckbox) {
        this._handleTaskClick();
      }
    })
  }

  generateTask() {
    this._taskName.textContent = this._itemName;
    console.log()
    this._taskDesc.textContent = this._itemShortDesc;
    this._taskStatus.checked = this._itemStatus;
    this._taskCheckbox.id = this._itemId;
    this._taskLable.htmlFor = this._itemId;
    this._taskDate.textContent = this._itemDate;
    this._setEventListeners();
    return this._taskElement;
  }
}