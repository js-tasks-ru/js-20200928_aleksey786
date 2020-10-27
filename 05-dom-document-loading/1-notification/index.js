export default class NotificationMessage {
  static activeNotificationElement;
  element; // HTMLElement;

  constructor(message = '',
              {duration = 1000,
               type = 'success',
              } = {}) {
    this.message = message;
    this.duration = duration;
    this.progressValue = duration / 1000;
    this.type = type;
    this.render();
  }

  render() {
    const div = document.createElement('div');
    div.innerHTML = this.template();
    this.element = div.firstElementChild;
  }

  template () {
    return `<div class="notification ${this.type}" style="--value:${this.progressValue}s">
                <div class="timer"></div>
                <div class="inner-wrapper">
                    <div class="notification-header">Notification</div>
                    <div class="notification-body">${this.message}</div>
                </div>
            </div>`;
  }

  show(target = document.body) {
    /* В один момент времени на странице может быть показано только одно сообщение,
       другими словами, если на странице уже присутствовало сообщение - его необходимо скрыть.
       Строка clearTimeout(this.timerId); это реализует.
       Подумал, что если повторно Show вызвать до момента окончания показа, то нужно предыдущее убрать,
       а не когда два разных объекта */
    if (NotificationMessage.activeNotificationElement) {
      NotificationMessage.activeNotificationElement.remove();
    }
    clearTimeout(this.timerId);
    target.append(this.element);
    this.timerId = setTimeout(() => this.remove(), this.duration);
    NotificationMessage.activeNotificationElement = this.element;
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
