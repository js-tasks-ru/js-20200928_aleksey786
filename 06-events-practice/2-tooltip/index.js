class Tooltip {
  static instance;

  element; // HTMLElement;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  initialize() {
    this.initEventListeners();
  }

  initEventListeners() {
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  onPointerOver = event => {
    const element = event.target.closest('[data-tooltip]');
    if (element) {
      this.render(element.dataset.tooltip, event.clientX, event.clientY);
      document.addEventListener('pointermove', this.onPointerMove);
    }
  };

  onPointerMove = event => {
    this.element.style.left = event.clientX + "px";
    this.element.style.top = event.clientY + "px";
  };

  onPointerOut = () => {
    this.remove();
  };

  render(tooltipData, left, top) {
    this.element = document.createElement('div');
    this.element.classList.add('tooltip');
    this.element.innerHTML = tooltipData;
    this.element.style.left = left + "px";
    this.element.style.top = top + "px";
    document.body.append(this.element);
  }

  remove () {
    if (this.element) this.element.remove();
    document.removeEventListener('pointermove', this.onPointerMove);
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerout', this.onPointerOut);
  }
}

const tooltip = new Tooltip();

export default tooltip;
