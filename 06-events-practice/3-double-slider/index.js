export default class DoubleSlider {
  element; // HTMLElement
  leftSlider; // HTMLElement
  rightSlider; // HTMLElement
  innerElement; // HTMLElement
  from; // HTMLElement
  to; // HTMLElement
  min; // number
  max; // number
  range; // number = max - min
  formatValue; // function
  selected; // default slider position

  downElement = {};

  constructor({
                min = 100,
                max = 200,
                formatValue = value => '$' + value,
                selected = {
                  from: min,
                  to: max
                }} = {}) {
    this.min = min;
    this.max = max;
    this.range = max - min;
    this.formatValue = formatValue;
    this.selected = selected;
    this.render();
    this.initEventListeners();
  }

  initEventListeners() {
    this.leftSlider.addEventListener('pointerdown', this.onPointerDown);
    this.rightSlider.addEventListener('pointerdown', this.onPointerDown);
  }

  onPointerDown = (event) => {
    if (event.target === this.leftSlider) {
      this.downElement.slider = this.leftSlider;
      this.downElement.style = "left";
      this.downElement.sliderX = event.clientX;
      this.downElement.offset = event.target.getBoundingClientRect().right - event.clientX;
      this.downElement.border = parseFloat(this.rightSlider.style.right);
    }

    if (event.target === this.rightSlider) {
      this.downElement.slider = this.rightSlider;
      this.downElement.style = "right";
      this.downElement.sliderX = event.clientX;
      this.downElement.offset = event.target.getBoundingClientRect().left - event.clientX;
      this.downElement.border = parseFloat(this.leftSlider.style.left);
    }

    this.element.classList.add('range-slider_dragging');

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerUp = () => {
    this.element.classList.remove('range-slider_dragging');

    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);

    this.element.dispatchEvent(new CustomEvent('range-select', {
      bubbles: true,
      detail: this.getDetail(),
    }));
  };

  getDetail() {
    const from = this.getFromValue();
    const to = this.getToValue();
    return {from, to};
  }

  getFromValue () {
    return Math.round(this.min + parseFloat(this.leftSlider.style.left) * 0.01 * this.range);
  }

  getToValue () {
    return Math.round(this.max - parseFloat(this.rightSlider.style.right) * 0.01 * this.range);
  }

  onPointerMove = (event) => {
    const slider = this.downElement.slider;
    const style = this.downElement.style; // left or right
    const sliderX = this.downElement.sliderX;
    const border = this.downElement.border;
    let newPosition;

    if (slider === this.leftSlider) {
      newPosition = (event.clientX
        - this.innerElement.getBoundingClientRect()[style]
        + this.downElement.offset);
    } else {
      newPosition = (this.innerElement.getBoundingClientRect()[style]
       - event.clientX
       - this.downElement.offset);
    }

    newPosition /= this.innerElement.getBoundingClientRect().width;

    if (newPosition < 0)
      newPosition = 0;

    newPosition *= 100;

    if (newPosition + border > 100) {
      newPosition = 100 - border;
    }

    slider.style[style] = newPosition + "%";

    if (slider === this.leftSlider) {
        this.from.innerHTML = this.formatValue(this.getFromValue());
    } else {
        this.to.innerHTML = this.formatValue(this.getToValue());
    }
  };

  render() {
    const table = document.createElement('div');
    table.classList.add("range-slider");
    table.innerHTML = this.template();
    this.element = table;
    this.leftSlider = table.querySelector('.range-slider__thumb-left');
    this.rightSlider = table.querySelector('.range-slider__thumb-right');
    this.innerElement= table.querySelector('.range-slider__inner');
    this.from = table.querySelector('[data-element="from"]');
    this.to = table.querySelector('[data-element="to"]');
    this.initEventListeners();
  }

  template () {
    return `<span data-element="from">${this.formatValue(this.selected.from)}</span>
      <div  class="range-slider__inner">
        <span class="range-slider__progress"></span>
        <span class="range-slider__thumb-left" style="left: ${this.getLeftValue(this.selected.from)};"></span>
        <span class="range-slider__thumb-right" style="right: ${this.getRightValue(this.selected.to)};"></span>
      </div>
      <span data-element="to">${this.formatValue(this.selected.to)}</span>
    `;
  }

  getLeftValue (value) {
     return Math.round((value - this.min) / this.range * 100) + '%';
  }


  getRightValue (value) {
    return Math.round((this.max - value) / this.range * 100) + '%';
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }
}
