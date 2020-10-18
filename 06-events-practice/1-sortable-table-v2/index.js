export default class SortableTable {
  element; // HTMLElement
  subElements = {}; // {body: HTMLElement, header: HTMLElement}
  header = []; // [{id: '', title: '', sortable: false, sortType: 'string', template: (data = []) => {} }]
  data = [];
  currentSortedElement; // HTMLElement
  sortArrowElement; // значок сортировки на колонке
  defaultSorted = {}; // {filed, order}

  constructor(header = []
    , {data = []} = {}
    , defaultSorted = {field: header.find(item => item.sortable).id,
      order: 'asc'}) {
    this.header = header;
    this.data = data;
    this.defaultSorted = defaultSorted;
    this.createSortArrowElement();
    this.render();
  }

  createSortArrowElement () {
    this.sortArrowElement = document.createElement('span');
    this.sortArrowElement.dataset.element = "arrow";
    this.sortArrowElement.classList.add("sortable-table__sort-arrow");
    this.sortArrowElement.innerHTML = `<span class="sort-arrow"></span>`;
  }

  render() {
    const table = document.createElement('div');
    table.innerHTML = this.template(this.sortData(this.defaultSorted.field, this.defaultSorted.order));
    this.element = table;
    this.subElements = {body: table.querySelector('.sortable-table__body'),
      header: table.querySelector('.sortable-table__header'),
    };
    this.setCurrentSortedElement(this.subElements.header.querySelector(`[data-field="${this.defaultSorted.field}"]`), this.defaultSorted.order);
    this.initEventListeners();
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
  }

  onHeaderClick = event => {
    const headElement = event.target.closest(".sortable-table__cell");//parentElement;

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

    this.sort(this.currentSortedElement.dataset.field, this.currentSortedElement.dataset.order);
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
        `;
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
      const cellValue = (value.template) ? value.template(row[value.id]) : row[value.id];
      return `<div class="sortable-table__cell">${cellValue}</div>`;}).join("");
  }

  sort(field, order) {
    const sortedData = this.sortData(field, order);
    this.subElements.body.innerHTML = this.getTableData(sortedData);
  }

  sortData(field, order) {
    const copyData = [...this.data];
    const column = this.header.find(item => item.id === field);
    const {sortType, customSorting} = column;
    const direction = order === 'asc' ? 1 : -1;

    return copyData.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[field] - b[field]);
        case 'string':
          return direction * a[field].localeCompare(b[field], 'ru');
        case 'custom':
          return direction * customSorting(a, b);
        default:
          return direction * (a[field] - b[field]);
      }
    });
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointerdown', this.onHeaderClick);
  }
}
