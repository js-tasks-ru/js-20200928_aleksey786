import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const PREFIX_URL = 'api/dashboard/';

export default class Page {
  element; // HTMLElement
  subElements = {};

  constructor () {
    this.to = new Date();
    this.from = new Date();
    this.from.setMonth(this.to.getMonth()-1);
  }

  async render () {
    const range = {from: this.from, to: this.to};
    const rangePicker = new RangePicker(range);
    this.sortableTable = new SortableTable(header, {
      url: PREFIX_URL + 'bestsellers',
      range: range,
    });
    this.ordersChart = new ColumnChart({label: 'Заказы',
      link: '/sales',
      url: PREFIX_URL + 'orders',
      range: range,
    });
    this.salesChart = new ColumnChart({label: 'Продажи',
      link: '',
      url: PREFIX_URL + 'sales',
      range: range,
    });
    this.customersChart = new ColumnChart({label: 'Клиенты',
      link: '',
      url: PREFIX_URL + 'customers',
      range: range,
    });

    const div = document.createElement('div');
    div.innerHTML = this.template();
    this.element = div;
    this.element.append(this.sortableTable.element);

    this.installComponent(rangePicker.element,'rangepicker');
    this.installComponent(this.ordersChart.element,'dashboard__chart_orders');
    this.installComponent(this.salesChart.element,'dashboard__chart_sales');
    this.installComponent(this.customersChart.element,'dashboard__chart_customers');

    this.subElements = {
      sortableTable: this.sortableTable.element,
      rangePicker: rangePicker.element,
      ordersChart: this.ordersChart.element,
      salesChart: this.salesChart.element,
      customersChart: this.customersChart.element,
    };

    this.initEventListeners();
    return this.element;
  }

  installComponent (element, className) {
    const place = this.element.querySelector(`.${className}`);
    place.after(element);
    place.remove();
    element.classList.add(className);
  }

  template () {
    return `<div class="dashboard full-height flex-column">
      <div class="content__top-panel"><h2 class="page-title">Панель управления</h2>
      <div class="rangepicker">Вместо этого встанет rangePicker</div>
    </div></div>
    <div class="dashboard__charts">
        <div class="column-chart dashboard__chart_orders">Вместо этого встанет ordersChart</div>
        <div class="column-chart dashboard__chart_sales">Вместо этого встанет salesChart</div>
        <div class="column-chart dashboard__chart_customers">Вместо этого встанет customersChart</div>
    </div>
    <h3 class="block-title">Лидеры продаж</h3>`;
  }

  initEventListeners () {
    document.addEventListener('date-select', this.onDateSelect);
  }

  onDateSelect = (event) => {
    this.ordersChart.update(event.detail.from, event.detail.to);
    this.customersChart.update(event.detail.from, event.detail.to);
    this.salesChart.update(event.detail.from, event.detail.to);
    this.sortableTable.updateRange({from: event.detail.from, to: event.detail.to});
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('date-select', this.onDateSelect);
  }

}
