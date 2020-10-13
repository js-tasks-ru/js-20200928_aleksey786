export default class NotificationMessage {
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
    this.initEventListeners();
  }

  initEventListeners() {}


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
    clearTimeout(this.timerId);
    target.append(this.element);
    this.timerId = setTimeout(() => this.remove(), this.duration);
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
