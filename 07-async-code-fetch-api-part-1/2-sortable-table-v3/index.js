import fetchJson from './utils/fetch-json.js';
const BACKEND_URL = 'https://course-js.javascript.ru';
const MAX_LOAD_RECORD = 30;

export default class SortableTable {
  element; // HTMLElement
  subElements = {}; // {body: HTMLElement, header: HTMLElement}
  data = [];

  constructor(header = [], {url = ''} = {}) {
    this.header = header; // [{id: '', title: '', sortable: false, sortType: 'string', template: (data = []) => {} }]
    this.url = new URL(url, BACKEND_URL);
    this.startLoadRecord = 0;
    this.endLoadRecord = MAX_LOAD_RECORD;
    this.sortField = this.header.find(item => item.sortable).id;
    this.sortOrder = 'asc';
    this.createSortArrowElement();
    this.render();
  }

  async loadData() {
    this.url.searchParams.set("_sort", this.sortField);
    this.url.searchParams.set("_order", this.sortOrder);
    this.url.searchParams.set("_start", this.startLoadRecord);
    this.url.searchParams.set("_end", this.endLoadRecord);
    this.element.classList.add("sortable-table_loading");
    const response = await fetch(this.url.toString());
    const data = await response.json();
    //TODO: обработку ошибок сделать
    this.element.classList.remove("sortable-table_loading");
    this.subElements.empty.className = "sortable-table__empty-placeholder";
    if (!data.length) {
       this.subElements.empty.classList.remove("sortable-table__empty-placeholder");
    }
    return data;
  }

  addRecords(data) {
    const tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = this.getTableData(data);
    this.subElements.body.append(...tmpDiv.childNodes);
  }

  updateRecords(data) {
    this.subElements.body.innerHTML = this.getTableData(data);
  }

  createSortArrowElement () {
    this.sortArrowElement = document.createElement('span');
    this.sortArrowElement.dataset.element = "arrow";
    this.sortArrowElement.classList.add("sortable-table__sort-arrow");
    this.sortArrowElement.innerHTML = `<span class="sort-arrow"></span>`;
  }

  async render() {
    const table = document.createElement('div');
    table.className = "sortable-table";
    table.innerHTML = this.template(this.data);
    this.element = table;
    this.subElements = {body: table.querySelector('.sortable-table__body'),
      header: table.querySelector('.sortable-table__header'),
      empty: table.querySelector('.sortable-table__empty-placeholder'),
    };
    this.setCurrentSortedElement(this.subElements.header.querySelector(`[data-field="${this.sortField}"]`), this.sortOrder);
    const data = await this.loadData();
    this.data = data;
    this.updateRecords(data);

    this.initEventListeners();
  }

  async sortOnServer(field, order) {
    this.sortField = field;
    this.sortOrder = order;
    this.data = [];
    this.startLoadRecord = 0;
    this.endLoadRecord = MAX_LOAD_RECORD;
    const data = await this.loadData();
    this.data = data;
    this.updateRecords(data);
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
    document.addEventListener('scroll', this.onScroll);
  }

  onHeaderClick = event => {
    const headElement = event.target.closest(".sortable-table__cell");

    if (headElement.dataset.sortable===undefined) {
      return;
    }

    if (this.currentSortedElement === headElement) {
      switch (this.currentSortedElement.dataset.order) {
        case 'desc': this.currentSortedElement.dataset.order = 'asc'; break;
        case 'asc':
        default:
          this.currentSortedElement.dataset.order = 'desc';
      }
    } else {
      this.setCurrentSortedElement(headElement, 'desc')
    }

    this.sortOnServer(this.currentSortedElement.dataset.field, this.currentSortedElement.dataset.order);
  }

  onScroll = async (event) => {
    this.loaded
    if (!this.isLoading && document.documentElement.clientHeight > this.element.getBoundingClientRect().bottom) {
        this.startLoadRecord = this.endLoadRecord;
       this.endLoadRecord += MAX_LOAD_RECORD;
       this.isLoading = true;
       const data = await this.loadData();
       this.isLoading = false;
       this.data = data;
       this.addRecords(data);
       this.data.concat(data);
    }
  }

  setCurrentSortedElement (element, order) {
    this.currentSortedElement = element;
    element.append(this.sortArrowElement);
    element.dataset.order = order;
  }

  template (tableData) {
    return `<div class="sortable-table__header sortable-table__row">
                ${this.getTableHead()}
             </div>
             <div data-element="body" class="sortable-table__body">
                ${this.getTableData(tableData)}
             </div>
             <div class="loading-line sortable-table__loading-line"></div>
             <div class="sortable-table__empty-placeholder">
                <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
             <div>`;
  }

  getTableHead () {
    return this.header.map(value => {
      return `<div class="sortable-table__cell"
                   data-field="${value.id}"
                   data-id="${value.id}"
                   ${value.sortable ? "data-sortable" : ""}
                   >
                   <span>${value.title}</span>
             </div>`;
    }).join("");
  }

  getTableData (tableData) {
    const rows = [];
    for (const item of tableData) {
      rows.push(`<div class="sortable-table__row">${this.getCellValue(item)}</div>`)
    }
    return rows.join("");
  }

  getCellValue (row) {
    return this.header.map(value => {
      return (value.template) ? value.template(row[value.id])
                                : `<div class="sortable-table__cell">${row[value.id]}</div>`;
        }).join("");
  }

  sort(field, order) {
    const sortedData = this.sortData(field, order);
    this.subElements.body.innerHTML = this.getTableData(sortedData);
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointerdown', this.onHeaderClick);
    document.removeEventListener('scroll', this.onScroll);
  }
}
