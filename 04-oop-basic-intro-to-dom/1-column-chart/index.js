export default class ColumnChart {
  element;
  data;
  label;
  value;
  link;
  chartHeight = 50;

  constructor(param = {}) {
    this.data = param.data || [];
    this.label = param.label || '';
    this.value = param.value || '';
    this.link = param.link || '';
    this.render();
  }

  getDataHTML() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;
    return this.data.reduce(function (dataHTML, value) {
        return dataHTML +
          `<div style="--value:${Math.floor(value * scale)}"
                data-tooltip="${(value / maxValue * 100).toFixed(0)}%">
           </div>`
      }
      , '');
  }

  getLinkHTML() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">Посмотреть все</a>` : '';
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
  }

  update(data) {
    if (this.data.length && (data || !data.length)) {
      this.element.className += " column-chart_loading";
    }

    this.data = data || [];
    const dataElement = this.element.querySelector(".column-chart__chart");
    dataElement.innerHTML = this.getDataHTML();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
