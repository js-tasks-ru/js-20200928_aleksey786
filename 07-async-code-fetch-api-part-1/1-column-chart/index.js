export default class ColumnChart {
  element;
  subElements = {};
  data = [];
  chartHeight = 50;

  constructor({
        url = '',
        range = {
          from: new Date,
          to: new Date,
        },
        label = '',
        link = '',
        value = 0,
      } = {}) {
    this.url = url;
    this.label = label;
    this.range = range;
    this.link = link;
    this.value = value;
    this.render();
  }

  getDataHTML() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;
    return Object.entries(this.data).map(value => {
          return `<div style="--value:${Math.floor(value * scale)}"
                  data-tooltip="${(value / maxValue * 100).toFixed(0)}%">
             </div>`
    }).join("");
  }

  getLinkHTML() {
    return this.link ? `<a class="column-chart__link" href="${this.link}"></a>` : '';
  }

  render() {
    const div = document.createElement('div');

    div.className = "column-chart";
    if (!this.data.length) {
      div.className += " column-chart_loading";
    }

    div.innerHTML = `<div class="column-chart__title">${this.label}${this.getLinkHTML()}</div>
        <div class="column-chart__container">
            <div class="column-chart__header">${this.value}</div>
            <div class="column-chart__chart">
                ${this.getDataHTML()}
            </div>
        </div>
    `;
    this.element = div;
    this.subElements.body = this.element.querySelector('.column-chart__chart');
    this.loadData(this.range.from, this.range.to);
  }

  async loadData(from, to) {
    this.element.classList.add('column-chart_loading');
    const url = `https://course-js.javascript.ru/${this.url}?from=${from.toISOString()}&to=${to.toISOString()}`;
    const response = await fetch(url);
    const data = await response.json();
    //TODO: обработку ошибок сделать
    this.data = Object.values(data);
    this.element.classList.remove("column-chart_loading");
    const dataElement = this.element.querySelector(".column-chart__chart");
    dataElement.innerHTML = this.getDataHTML();
  }

  async update(from, to) {
    return await this.loadData(from, to);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
