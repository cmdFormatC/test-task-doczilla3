export default class Api {
  constructor(options) {
      this._baseUrl = options.baseUrl;
      this._headers = options.headers;
  }

  _checkResponse(res) {
      if (res.ok) {
          return res.json();
      }
      return Promise.reject(`Ошибка: ${res.status}`);
  }

  getTasks(limit, offset) {
    return fetch(`${this._baseUrl}/api/todos?limit=${limit}&offset=${offset}`, {
      headers: this._headers
    })
    .then(this._checkResponse)
  }

  getTasksBySearch(param) {
    return fetch(`${this._baseUrl}/api/todos/find?q=${param}`, {
      headers: this._headers
    })
    .then(this._checkResponse)
  }
  getTasksByDate(startDate, endDate) {
    return fetch(`${this._baseUrl}/api/todos/date?from=${startDate}&to=${endDate}`, {
      headers: this._headers
    })
    .then(this._checkResponse)
  }
}