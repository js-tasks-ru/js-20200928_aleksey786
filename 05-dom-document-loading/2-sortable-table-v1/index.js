export default class SortableTable {
  element;
  subElements = {};
  header = [];
  data = [];

  constructor(header = [], {data = []} = {}) {
    this.header = header;
    this.data = data;
    this.render();
  }

  render() {
    const table = document.createElement('div');
    table.innerHTML = this.template(this.data);
    this.element = table;
    this.subElements = {body: table.querySelector('.sortable-table__body')};
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
        return `<div class="sortable-table__cell">${value.title}</div>`;
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
  }
}

