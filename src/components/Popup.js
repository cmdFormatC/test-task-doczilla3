export default class Popup {
  constructor(popupSelector) {
    this._popup = document.querySelector(popupSelector);
    this._confirmButton = this._popup.querySelector('[data-popup-confirm]');
    this._title = this._popup.querySelector('[data-popup-title]');
    this._date = this._popup.querySelector('[data-popup-date]');
    this._desc = this._popup.querySelector('[data-popup-desc]');
    this._checkbox = this._popup.querySelector('[data-popup-checkbox]');
    this.close = this.close.bind(this);
  }
  open(title, date, desc, status) {
    this._title.textContent = title;
    this._date.textContent = date;
    this._desc.textContent = desc;
    this._checkbox.checked = status;
    this._popup.classList.add("popup_open");
    this._confirmButton.addEventListener("click", this.close);
  }

  close() {
    this._popup.classList.remove("popup_open");
    this._confirmButton.removeEventListener("click", this.close);
}
}