export default class RangePicker {
  element; // HTMLElement

  constructor({
                from = new Date(),
                to = new Date(),
              } = {}) {
    this.from = from;
    this.to = to;
    this.months = new Array(12)
      .fill(1)
      .map((_, index) => {
        return new Date(new Date().setMonth(index))
          .toLocaleString('ru', { month: 'long'})
      });
    this.visibleTo = new Date(to);
    this.render();
    this.initEventListeners();
  }

  initEventListeners() {
    this.input.addEventListener('click', this.onClickInput);
    this.selector.addEventListener('click', this.onClick);
  }

  onClickInput = (event) => {
    if (!event.target.closest('.rangepicker__selector')) {
      if (this.element.classList.contains("rangepicker_open")) {
        this.selectDate();
      } else {
        this.element.classList.add("rangepicker_open");
        this.changeSelector();
        document.addEventListener('click', this.onClickClose, true);
      }
    }
  }

  changeSelector() {
    this.selector.innerHTML = this.selectorHTML();
    this.controlLeft = this.selector.querySelector('.rangepicker__selector-control-left');
    this.controlRight = this.selector.querySelector('.rangepicker__selector-control-right');
    this.controlLeft.addEventListener('click', this.onClickControlLeft);
    this.controlRight.addEventListener('click', this.onClickControlRight);
  }

  onClickControlLeft = (event) => {
    if (event.target.className === "rangepicker__selector-control-left") {
      this.visibleTo.setMonth(this.visibleTo.getMonth() - 1);
      this.changeSelector();
    }
  }
  onClickControlRight = (event) => {
    if (event.target.className === "rangepicker__selector-control-right") {
      this.visibleTo.setMonth(this.visibleTo.getMonth() + 1);
      this.changeSelector();
    }
  }

  onClick = (event) => {
    if (event.target.closest(".rangepicker__cell")) {
      const date = new Date(event.target.dataset.value);
      if (this.firtsDateSelect) {
        if (date > this.to) {
          this.to = date;
        } else {
          this.from = date;
        }
        this.input.innerHTML = this.inputHTML();
        this.firtsDateSelect = false;
        this.selectDate();
      } else {
        this.to = date;
        this.from = date;
        this.firtsDateSelect = true;
      }
      this.changeSelection();
    }
  }

  changeSelection() {
    for (const dayElement of this.selector.querySelectorAll('[data-value]')) {
      let date = new Date(dayElement.dataset.value);
      dayElement.className = this.dateCellStyle(date);
      dayElement.classList.add("rangepicker__cell");
    }
  }

  onClickClose = (event) => {
    if ((event.target.closest('.rangepicker') !== this.element) && this.element.classList.contains("rangepicker_open")) {
      this.selectDate();
    }
  }

  selectDate() {
    this.element.classList.remove("rangepicker_open");
    document.removeEventListener('click', this.onClickClose, true);
    this.element.dispatchEvent(new CustomEvent('date-select', {
      bubbles: true,
      detail: this.getDetail(),
    }));
  }

  getDetail() {
    return {from: this.from, to: this.to};
  }

  render() {
    const rangepicker = document.createElement('div');
    rangepicker.classList.add("rangepicker");
    rangepicker.innerHTML = this.templateInput();
    this.element = rangepicker;
    this.input = rangepicker.querySelector('.rangepicker__input');
    this.selector = rangepicker.querySelector('.rangepicker__selector');
    this.initEventListeners();
  }

  templateInput() {
    return `<div class="rangepicker__input" data-element="input">${this.inputHTML()}</div>
             <div class="rangepicker__selector" data-element="selector"></div>`;
  }

  inputHTML() {
    return `<span data-element="from">${this.formatDate(this.from)}</span> -
      <span data-element="to">${this.formatDate(this.to)}</span>`;
  }

  template() {
    return `<div class="rangepicker__input" data-element="input">
      <span data-element="from">${this.formatDate(this.from)}</span> -
      <span data-element="to">${this.formatDate(this.to)}</span>
    </div>
    <div class="rangepicker__selector" data-element="selector">
        ${this.selectorHTML()}
    </div>`;
  }

  selectorHTML() {
    const visibleFrom = new Date(this.visibleTo);
    visibleFrom.setMonth(this.visibleTo.getMonth() - 1);
    return `<div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      <div class="rangepicker__calendar">
        ${this.monthHTML(visibleFrom.getMonth())}
        ${this.dayOfWeekHTML()}
        <div class="rangepicker__date-grid">
            ${this.monthGridHTML(visibleFrom)}
        </div>
      </div>
      <div class="rangepicker__calendar">
        ${this.monthHTML(this.visibleTo.getMonth())}
        ${this.dayOfWeekHTML()}
        <div class="rangepicker__date-grid">
            ${this.monthGridHTML(this.visibleTo)}
        </div>
      </div>`;
  }

  monthGridHTML(date) {
    return `${this.firstDayHTML(date)}
            ${this.daysHTML(date)}`;
  }

  firstDayHTML(date) {
    const firstDate = new Date(date);
    firstDate.setDate(1);
    return `<button type="button" class="rangepicker__cell ${this.dateCellStyle(firstDate)}"
                   data-value="${firstDate}" style="--start-from: ${firstDate.getDay()}">1
            </button>`
  }

  daysHTML(date) {
    const curDate = new Date(date);
    const curMonth = curDate.getMonth();
    const days = [];
    for (let day = 2; day <= 31; day++) {
      curDate.setDate(day);
      if (curDate.getMonth() !== curMonth) {
        break;
      }
      days.push(`<button type="button" class="rangepicker__cell ${this.dateCellStyle(curDate)}"
                   data-value="${curDate}">${day}
            </button>`)
    }
    return days.join("");
  }

  dateCellStyle(date) {
    if (this.from < date && this.to > date) {
      return "rangepicker__selected-between";
    }

    if (!(date - this.from)) {
      return "rangepicker__selected-from"
    }

    if (!(date - this.to)) {
      return "rangepicker__selected-to"
    }

    return "";
  }

  monthHTML(month) {
    return `<div class="rangepicker__month-indicator">
          <time datetime="${this.monthName(month)}">${this.monthName(month)}</time>
        </div>`;
  }

  monthName(month) {
    return this.months[month]
  }

  // TODO: наверное есть что-то готовое, но в разделе о датах не нашел в учебнике... надо поискать, пока так
  formatDate(date) {
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    return `${day}.${month}.${date.getFullYear()}`;
  }

  dayOfWeekHTML() {
    const weekday = new Array(7)
      .fill(1)
      .map((_, index) => {
          const date = new Date(2020, 9, 26 + index);
          const day = date.toLocaleString('ru', {weekday: 'short'});
          return `<div>${day}</div>`;
      });
    return `<div class="rangepicker__day-of-week">${weekday.join('')}</div>`;
  }

  remove() {
    this.element.remove();
    document.removeEventListener('click', this.onClickClose, true);
  }

  destroy() {
    this.remove();
    this.element = {};
  }
}
