export default class Calendar {
  constructor(containerSelector, handlePeriodSelect) {
    this._calendar = document.querySelector(containerSelector);
    this._currentDate = new Date();
    this._daysContainer = this._calendar.querySelector('[data-calendar-days]');
    this._monthDisplay = this._calendar.querySelector('[data-calendar-month]');
    this._prevMonthButton = this._calendar.querySelector('[data-calendar-switcher-prev]');
    this._nextMonthButton = this._calendar.querySelector('[data-calendar-switcher-next]');
    this._monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    this._handlePeriodSelect = handlePeriodSelect;
    this._selectedStartDay = null;
    this._selectedEndDay = null;
    this._selectedStartDate = null;
    this._selectedEndDate = null;
  }

  getSelectedStartDate() {
    if (this._selectedStartDate) {
      return this._selectedStartDate.getTime();
    };
  }

  getSelectedEndDate() {
    if (this._selectedEndDate) {
      return this._selectedEndDate.getTime();
    };
  }
  
  _getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  _setEventListeners() {
    this._prevMonthButton.addEventListener('click', () => {
      this._currentDate.setMonth(this._currentDate.getMonth() - 1);
      this._updateCalendar(this._currentDate);
    });
    this._nextMonthButton.addEventListener('click', () => {
      this._currentDate.setMonth(this._currentDate.getMonth() + 1);
      this._updateCalendar(this._currentDate);
    });
  }

  _clearSelection() {
    document.querySelectorAll('.calendar__day.calendar__day_selected').forEach(day => {
      day.classList.remove('.calendar__day_selected');
    });
  }
  
  _highlightRange() {
    if (!this._selectedStartDate) return;
  
    const startTimestamp = this._selectedStartDate.getTime();
    const endTimestamp = this._selectedEndDate ? this._selectedEndDate.getTime() : startTimestamp;
  
    document.querySelectorAll('.calendar__day').forEach(day => {
      const dayTimestamp = parseInt(day.getAttribute('data-date'), 10);
      if (dayTimestamp >= startTimestamp && dayTimestamp <= endTimestamp) {
        day.classList.add('calendar__day_selected');
      } else {
        day.classList.remove('calendar__day_selected');
      }
    });
  }

  _createDayElement(className, textContent, date = null) {
    const dayElement = document.createElement('span');
    dayElement.className = className;
    dayElement.textContent = textContent;
    if (date) {
      const unixDate = date.getTime();
      dayElement.setAttribute('data-date', unixDate);
      dayElement.addEventListener('click', () => {
        const selectedDate = new Date(parseInt(dayElement.getAttribute('data-date'), 10));
        if (!this._selectedStartDate || this._selectedEndDate) {
          this._clearSelection();
          this._selectedStartDate = selectedDate;
          this._selectedEndDate = null;
          dayElement.classList.add('calendar__day_selected');
        } else if (this._selectedStartDate && !this._selectedEndDate) {
          this._selectedEndDate = selectedDate;
          if (this._selectedEndDate < this._selectedStartDate) {
            let temp = this._selectedStartDate;
            this._selectedStartDate = this._selectedEndDate;
            this._selectedEndDate = temp;
          }
          this._highlightRange();
          if (this._selectedEndDate.getTime() === this._selectedStartDate.getTime()) {
            console.log(1)
            const day = ((23 * 60 * 60) + (59 * 60) + 59) * 1000;
            this._selectedEndDate = new Date(this._selectedStartDate.getTime() + day);
          }
          this._handlePeriodSelect(this._selectedStartDate.getTime(), this._selectedEndDate.getTime());
        }
      });
    }
    return dayElement;
  }

  _updateCalendar(date) {
    this._monthDisplay.textContent = `${this._monthNames[date.getMonth()]} ${date.getFullYear()}`;
    while ( this._daysContainer.firstChild) {
      this._daysContainer.removeChild(this._daysContainer.firstChild);
    };
  
    const daysInMonth = this._getDaysInMonth(date.getFullYear(), date.getMonth());
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const adjustedFirstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    for (let i = adjustedFirstDayOfMonth; i > 0; i--) {
      const prevMonthDay = this._getDaysInMonth(date.getFullYear(), date.getMonth() - 1) - i + 1;
      this._daysContainer.appendChild(this._createDayElement('calendar__day calendar__day_not-revitalized', prevMonthDay));
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = new Date(date.getFullYear(), date.getMonth(), day);
      this._daysContainer.appendChild(this._createDayElement('calendar__day', day, fullDate));
    }
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth(), daysInMonth).getDay();
    const adjustedLastDayOfMonth = lastDayOfMonth === 0 ? 6 : lastDayOfMonth - 1;
    for (let i = 1; i < 7 - adjustedLastDayOfMonth; i++) {
      this._daysContainer.appendChild(this._createDayElement('calendar__day calendar__day_not-revitalized', i));
    }
  }

  initializeCalendar() {
    this._updateCalendar(this._currentDate);
    this._setEventListeners();
  }
}