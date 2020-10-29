export default class SortableList {
  element; // HTMLElement;

  constructor({items = []} = {}) {
    this.items = items;
    this.render();
    this.initEventListeners();
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.onMouseDown);
  }

  onMouseDown= (event) => {

    if (event.target.dataset.deleteHandle!==undefined) {
      event.target.closest('.sortable-list__item').remove();
      return;
    }

    this.currentDroppable = event.target.closest('.sortable-list__item');

    this.createPlaceHolder(this.currentDroppable);

    this.prepareDroppable();

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  prepareDroppable () {
    this.currentDroppable.style.width = this.currentDroppable.offsetWidth + 'px';
    this.currentDroppable.style.height = this.currentDroppable.offsetHeight + 'px';
    this.currentDroppable.style.left = this.currentDroppable.offsetLeft + 'px';
    this.currentDroppable.style.top = this.currentDroppable.offsetTop + 'px';
    this.currentDroppable.classList.add("sortable-list__item_dragging");
    this.element.append(this.currentDroppable);
  }

  createPlaceHolder (element) {
    this.placeholder = document.createElement('div');
    this.placeholder.className = "sortable-list__placeholder";
    this.placeholder.style.width = this.currentDroppable.offsetWidth + 'px';
    this.placeholder.style.height = this.currentDroppable.offsetHeight + 'px';
    element.before(this.placeholder);
  }

  moveAt(pageX, pageY) {
    this.currentDroppable.style.left = pageX + 'px';
    this.currentDroppable.style.top = pageY + 'px';
  }

  onMouseMove = (event) => {
    this.moveAt(event.pageX, event.pageY);

    const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    if (!elemBelow) return;

    const droppableBelow = elemBelow.closest('.sortable-list__item');
    if (!droppableBelow) return;

    if (this.placeholder !== droppableBelow) {
      if (droppableBelow.offsetTop > this.placeholder.offsetTop) {
        this.placeholder.before(droppableBelow);
      } else {
        this.placeholder.after(droppableBelow);
      }
    }
  }

  onMouseUp = (event) => {
    this.placeholder.after(this.currentDroppable);
    this.placeholder.remove();
    this.currentDroppable.classList.remove("sortable-list__item_dragging");
    this.currentDroppable.style = '';

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }


  render() {
    const div = document.createElement('div');
    div.className = "sortable-list";
    const items = this.items.map(item => {
        item.classList.add("sortable-list__item");
        return item;
        })
    div.append(...items);
    this.element = div;
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointerdown', this.onMouseDown);
  }
}
